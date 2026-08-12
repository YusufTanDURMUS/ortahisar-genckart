using System;
using System.Drawing;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace OrtahisarEsnafAgent
{
    internal static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new AgentTrayContext());
        }
    }

    public class AgentTrayContext : ApplicationContext
    {
        private readonly NotifyIcon _notifyIcon;
        private readonly StringBuilder _barcodeBuffer = new();
        private DateTime _lastKeyTime = DateTime.Now;
        private static readonly HttpClient _httpClient = new();

        // Esnaf Sabit Bilgileri (Giriş yaptıktan sonra local config'e yazılır)
        private string _merchantToken = "ESNAF_JWT_TOKEN_HERE";
        private string _apiBaseUrl = "http://localhost:3000/api/v1/discount/verify";

        public AgentTrayContext()
        {
            // System Tray İkonu Oluşturma
            _notifyIcon = new NotifyIcon
            {
                Icon = SystemIcons.Shield,
                Text = "Ortahisar Genç Kart Esnaf Ajanı (Aktif)",
                Visible = true
            };

            // Sağ Tık Menüsü
            ContextMenuStrip contextMenu = new();
            contextMenu.Items.Add("Durum: Aktif (Dinliyor)", null, (s, e) => { })!.Enabled = false;
            contextMenu.Items.Add("-");
            contextMenu.Items.Add("Ajan Ayarları", null, ShowSettings);
            contextMenu.Items.Add("Çıkış Yap", null, Exit);

            _notifyIcon.ContextMenuStrip = contextMenu;

            // Global Klavye Dinleyicisini Başlat
            InterceptKeys.SetHook(OnKeyPressed);
        }

        // Barkod Okuyucu Klavye Vuruşlarını Yakalayan Mantık
        private bool OnKeyPressed(int vkCode, char character)
        {
            TimeSpan timeDiff = DateTime.Now - _lastKeyTime;
            _lastKeyTime = DateTime.Now;

            // Barkod okuyucular harfleri çok hızlı basar (genelde < 50ms)
            if (timeDiff.TotalMilliseconds > 100)
            {
                _barcodeBuffer.Clear(); // İnsan elle yazıyorsa tamponu temizle
            }

            // Enter tuşuna basıldıysa tamponu değerlendir
            if (vkCode == 13 || vkCode == 10) // Enter / Return
            {
                string scannedData = _barcodeBuffer.ToString().Trim();
                _barcodeBuffer.Clear();

                if (scannedData.StartsWith("ORT-GK-"))
                {
                    // Genç Kart Barkodu Yakalandı!
                    Task.Run(() => ProcessGencKartBarcodeAsync(scannedData));
                    return true; // Tuşu engelle (Kasa yazılımı doğrudan ham barkodu görmesin)
                }
            }
            else if (!char.IsControl(character))
            {
                _barcodeBuffer.Append(character);
            }

            return false; // Normal klavye vuruşlarına dokunma, sisteme geçsin
        }

        private async Task ProcessGencKartBarcodeAsync(string barcodeData)
        {
            try
            {
                // Tray balonu göster
                _notifyIcon.ShowBalloonTip(2000, "Ortahisar Genç Kart", "Barkod doğrulama isteği gönderiliyor...", ToolTipIcon.Info);

                // API İsteği Hazırla
                var payload = new
                {
                    qrData = barcodeData,
                    originalAmount = 100.00, // Kasa yazılımından alınan tutar veya sabit indirim
                    integrationType = "KEYBOARD_WEDGE"
                };

                var requestContent = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _merchantToken);

                var response = await _httpClient.PostAsync(_apiBaseUrl, requestContent);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    using JsonDocument doc = JsonDocument.Parse(responseContent);
                    var data = doc.RootElement.GetProperty("data");
                    string verificationCode = data.GetProperty("verificationCode").GetString() ?? "ONAY";
                    double savedAmount = data.GetProperty("financials").GetProperty("savedAmount").GetDouble();

                    _notifyIcon.ShowBalloonTip(3000, "İndirim Onaylandı!", $"Düşülecek İndirim: {savedAmount} TL\nKod: {verificationCode}", ToolTipIcon.Info);

                    // SİMÜLASYON: Aktif kasa penceresindeki alana tutarı otomatiğe yaz ve ENTER bas!
                    System.Threading.Thread.Sleep(200); // Pencere odağı için minik gecikme
                    SendKeys.SendWait($"{savedAmount:F2}");
                    SendKeys.SendWait("{ENTER}");
                }
                else
                {
                    _notifyIcon.ShowBalloonTip(4000, "Genç Kart Hata", "Geçersiz veya süresi dolmuş barkod!", ToolTipIcon.Error);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine(ex.Message);
                _notifyIcon.ShowBalloonTip(4000, "Sistem Hatası", "Belediye sunucusuyla iletişim kurulamadı.", ToolTipIcon.Error);
            }
        }

        private void ShowSettings(object? sender, EventArgs e)
        {
            MessageBox.Show("Ortahisar Belediyesi Esnaf Ajanı v1.0\nDurum: Bağlı\nLisanslı İşletme: Akbuz Sahaf", "Ajan Bilgileri", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }

        private void Exit(object? sender, EventArgs e)
        {
            InterceptKeys.UnHook();
            _notifyIcon.Visible = false;
            Application.Exit();
        }
    }
}
