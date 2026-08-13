using System;
using System.Drawing;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace OrtahisarEsnafAgent
{
    public class AgentTrayContext : ApplicationContext
    {
        private readonly NotifyIcon _notifyIcon;
        private readonly StringBuilder _barcodeBuffer = new();
        private DateTime _lastKeyTime = DateTime.Now;
        private static readonly HttpClient _httpClient = new();

        private string _merchantToken;
        private string _businessName;
        private const string ApiBaseUrl = "http://localhost:3000/api/v1/discount/verify";

        public AgentTrayContext(string token, string businessName)
        {
            _merchantToken = token;
            _businessName = businessName;

            // System Tray İkonu
            _notifyIcon = new NotifyIcon
            {
                Icon = SystemIcons.Shield,
                Text = $"Ortahisar Esnaf Ajanı ({_businessName})",
                Visible = true
            };

            // Sağ Tık Menüsü
            ContextMenuStrip contextMenu = new();
            contextMenu.Items.Add($"İşletme: {_businessName}", null, (s, e) => { })!.Enabled = false;
            contextMenu.Items.Add("Durum: Barkod Dinleniyor...", null, (s, e) => { })!.Enabled = false;
            contextMenu.Items.Add("-");
            contextMenu.Items.Add("Çıkış Yap", null, Exit);

            _notifyIcon.ContextMenuStrip = contextMenu;
            _notifyIcon.ShowBalloonTip(3000, "Ortahisar Esnaf Ajanı Aktif", $"{_businessName} için Genç Kart barkodları dinleniyor.", ToolTipIcon.Info);

            // Global Keyboard Hook Başlat
            InterceptKeys.SetHook(OnKeyPressed);
        }

        public static void StartAgent(string token, string businessName)
        {
            new AgentTrayContext(token, businessName);
        }

        // Barkod Okuyucu Tuş Vuruşlarını Yakalayan Mantık
        private bool OnKeyPressed(int vkCode, char character)
        {
            TimeSpan timeDiff = DateTime.Now - _lastKeyTime;
            _lastKeyTime = DateTime.Now;

            // İnsan klavye vuruşlarından ayırmak için (Barkod okuyucular harfleri <50ms basar)
            if (timeDiff.TotalMilliseconds > 100)
            {
                _barcodeBuffer.Clear();
            }

            // Enter tuşuna basıldığında
            if (vkCode == 13 || vkCode == 10)
            {
                string scannedData = _barcodeBuffer.ToString().Trim();
                _barcodeBuffer.Clear();

                if (scannedData.StartsWith("ORT-GK-"))
                {
                    // Genç Kart Barkodu Yakalandı!
                    Task.Run(() => ProcessGencKartBarcodeAsync(scannedData));
                    return true; // Tuşu engelle (Kasa yazılımı ham barkodu görmesin)
                }
            }
            else if (!char.IsControl(character))
            {
                _barcodeBuffer.Append(character);
            }

            return false;
        }

        private async Task ProcessGencKartBarcodeAsync(string barcodeData)
        {
            try
            {
                _notifyIcon.ShowBalloonTip(2000, "Genç Kart Okundu", "Sistemden indirim doğrulanıyor...", ToolTipIcon.Info);

                var payload = new
                {
                    qrData = barcodeData,
                    originalAmount = 100.00, // Sabit test veya kasa tutarı
                    integrationType = "KEYBOARD_WEDGE"
                };

                var requestContent = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _merchantToken);

                var response = await _httpClient.PostAsync(ApiBaseUrl, requestContent);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    using JsonDocument doc = JsonDocument.Parse(responseContent);
                    var data = doc.RootElement.GetProperty("data");
                    string verificationCode = data.GetProperty("verificationCode").GetString() ?? "ONAY";
                    double savedAmount = data.GetProperty("financials").GetProperty("savedAmount").GetDouble();

                    _notifyIcon.ShowBalloonTip(3000, "İndirim Onaylandı!", $"Düşülecek İndirim: {savedAmount} TL\nKod: {verificationCode}", ToolTipIcon.Info);

                    // SİMÜLASYON: Aktif kasa penceresindeki alana tutarı otomatiğe yaz ve ENTER bas!
                    System.Threading.Thread.Sleep(200);
                    SendKeys.SendWait($"{savedAmount:F2}");
                    SendKeys.SendWait("{ENTER}");
                }
                else
                {
                    _notifyIcon.ShowBalloonTip(4000, "Geçersiz Barkod", "QR kodun süresi dolmuş veya geçersiz!", ToolTipIcon.Error);
                }
            }
            catch (Exception)
            {
                _notifyIcon.ShowBalloonTip(4000, "Sistem Hatası", "Belediye sunucusuyla iletişim kurulamadı.", ToolTipIcon.Error);
            }
        }

        private void Exit(object? sender, EventArgs e)
        {
            InterceptKeys.UnHook();
            _notifyIcon.Visible = false;
            Application.Exit();
        }
    }
}
