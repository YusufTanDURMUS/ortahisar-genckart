using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace EsnafAgent.Services
{
    public class ApiService
    {
        private readonly HttpClient _httpClient;
        private string _baseUrl = "http://localhost:3000/api";

        public ApiService()
        {
            _httpClient = new HttpClient();
        }

        public async Task<bool> CheckBackendHealthAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync($"{_baseUrl}/health");
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }

        public async Task<string> ProcessTransactionAsync(string qrCode, double amount)
        {
            try
            {
                var payload = new { qrCode, amount, source = "WindowsAgent" };
                var json = JsonSerializer.Serialize(payload);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync($"{_baseUrl}/qr/process", content);
                return await response.Content.ReadAsStringAsync();
            }
            catch (Exception ex)
            {
                return $"API Baglanti Hatasi: {ex.Message}";
            }
        }
    }
}
