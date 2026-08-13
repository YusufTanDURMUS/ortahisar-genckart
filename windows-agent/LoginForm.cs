using System;
using System.Drawing;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Windows.Forms;

namespace OrtahisarEsnafAgent
{
    public partial class LoginForm : Form
    {
        private static readonly HttpClient client = new HttpClient();
        
        // UI Controls
        private TextBox txtEmail;
        private TextBox txtPassword;
        private Button btnLogin;
        private Label lblEmail;
        private Label lblPassword;
        private Label lblTitle;

        public LoginForm()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            this.txtEmail = new TextBox();
            this.txtPassword = new TextBox();
            this.btnLogin = new Button();
            this.lblEmail = new Label();
            this.lblPassword = new Label();
            this.lblTitle = new Label();
            this.SuspendLayout();
            
            // lblTitle
            this.lblTitle.AutoSize = true;
            this.lblTitle.Font = new Font("Segoe UI", 12F, FontStyle.Bold, GraphicsUnit.Point);
            this.lblTitle.Location = new Point(30, 20);
            this.lblTitle.Name = "lblTitle";
            this.lblTitle.Size = new Size(250, 21);
            this.lblTitle.Text = "Ortahisar Esnaf Ajanı Girişi";
            
            // lblEmail
            this.lblEmail.AutoSize = true;
            this.lblEmail.Location = new Point(30, 70);
            this.lblEmail.Name = "lblEmail";
            this.lblEmail.Size = new Size(50, 15);
            this.lblEmail.Text = "E-Posta:";
            
            // txtEmail
            this.txtEmail.Location = new Point(30, 90);
            this.txtEmail.Name = "txtEmail";
            this.txtEmail.Size = new Size(250, 23);
            
            // lblPassword
            this.lblPassword.AutoSize = true;
            this.lblPassword.Location = new Point(30, 130);
            this.lblPassword.Name = "lblPassword";
            this.lblPassword.Size = new Size(33, 15);
            this.lblPassword.Text = "Şifre:";
            
            // txtPassword
            this.txtPassword.Location = new Point(30, 150);
            this.txtPassword.Name = "txtPassword";
            this.txtPassword.PasswordChar = '*';
            this.txtPassword.Size = new Size(250, 23);
            
            // btnLogin
            this.btnLogin.BackColor = Color.SteelBlue;
            this.btnLogin.ForeColor = Color.White;
            this.btnLogin.FlatStyle = FlatStyle.Flat;
            this.btnLogin.Location = new Point(30, 200);
            this.btnLogin.Name = "btnLogin";
            this.btnLogin.Size = new Size(250, 35);
            this.btnLogin.Text = "Giriş Yap ve Başlat";
            this.btnLogin.UseVisualStyleBackColor = false;
            this.btnLogin.Click += new EventHandler(this.btnLogin_Click);
            
            // LoginForm
            this.ClientSize = new Size(320, 280);
            this.Controls.Add(this.btnLogin);
            this.Controls.Add(this.txtPassword);
            this.Controls.Add(this.lblPassword);
            this.Controls.Add(this.txtEmail);
            this.Controls.Add(this.lblEmail);
            this.Controls.Add(this.lblTitle);
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.Name = "LoginForm";
            this.StartPosition = FormStartPosition.CenterScreen;
            this.Text = "Esnaf Ajanı";
            this.ResumeLayout(false);
            this.PerformLayout();
        }

        private async void btnLogin_Click(object sender, EventArgs e)
        {
            string email = txtEmail.Text.Trim();
            string password = txtPassword.Text.Trim();

            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
            {
                MessageBox.Show("Lütfen e-posta ve şifrenizi girin.", "Uyarı", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }
            
            btnLogin.Enabled = false;
            btnLogin.Text = "Giriş yapılıyor...";

            try
            {
                var payload = new { email, password };
                var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

                // Backend API Giriş İsteği
                var response = await client.PostAsync("http://localhost:3000/api/v1/auth/merchant-login", content);
                var jsonString = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    using JsonDocument doc = JsonDocument.Parse(jsonString);
                    string token = doc.RootElement.GetProperty("data").GetProperty("token").GetString();
                    string businessName = doc.RootElement.GetProperty("data").GetProperty("merchant").GetProperty("businessName").GetString();

                    // Oturum Başarılı -> Tray Ajanını Başlat ve Formu Gizle
                    this.Hide();
                    AgentTrayContext.StartAgent(token, businessName);
                }
                else
                {
                    MessageBox.Show("E-posta veya şifre hatalı!", "Hata", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    btnLogin.Enabled = true;
                    btnLogin.Text = "Giriş Yap ve Başlat";
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("API sunucusuna bağlanılamadı: " + ex.Message, "Bağlantı Hatası", MessageBoxButtons.OK, MessageBoxIcon.Error);
                btnLogin.Enabled = true;
                btnLogin.Text = "Giriş Yap ve Başlat";
            }
        }
    }
}
