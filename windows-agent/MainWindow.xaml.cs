using System;
using System.Windows;
using EsnafAgent.Services;

namespace EsnafAgent
{
    public partial class MainWindow : Window
    {
        private readonly ApiService _apiService;

        public MainWindow()
        {
            InitializeComponent();
            _apiService = new ApiService();
            LogMessage("C# Windows Esnaf Ajanı Başlatıldı.");
            LogMessage(".NET 8 Windows API & SendKeys hazır.");
            CheckConnection();
        }

        private async void CheckConnection()
        {
            bool isOnline = await _apiService.CheckBackendHealthAsync();
            if (isOnline)
            {
                StatusText.Text = "● Express API Bağlı";
                LogMessage("Node.js Express Backend sunucusuna bağlantı doğrulandı.");
            }
            else
            {
                StatusText.Text = "○ API Çevrimdışı (Demo)";
                LogMessage("API bağlantısı kurulamadı. Yerel offline simülasyon modunda çalışılıyor.");
            }
        }

        private void BtnSendKeys_Click(object sender, RoutedEventArgs e)
        {
            string code = TxtInput.Text;
            if (string.IsNullOrWhiteSpace(code)) return;

            LogMessage($"[SendKeys] İşlem başlatılıyor: {code}");
            LogMessage("Hedef yazar kasa penceresine simülasyon gönderiliyor...");

            // Execute SendKeys in background
            KeyboardSimulator.SendTextToActiveWindow(code);

            LogMessage("✅ SendKeys işlemi başarıyla tamamlandı!");
        }

        private void BtnTray_Click(object sender, RoutedEventArgs e)
        {
            this.WindowState = WindowState.Minimized;
            LogMessage("Uygulama sistem tepsisine küçültüldü.");
        }

        private void LogMessage(string msg)
        {
            string time = DateTime.Now.ToString("HH:mm:ss");
            LstLogs.Items.Insert(0, $"[{time}] {msg}");
        }
    }
}
