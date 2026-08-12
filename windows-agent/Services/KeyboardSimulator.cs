using System;
using System.Runtime.InteropServices;
using System.Threading;
using System.Windows.Forms;

namespace EsnafAgent.Services
{
    public static class KeyboardSimulator
    {
        // Windows API Native Imports for low-level keyboard simulation
        [DllImport("user32.dll", SetLastError = true)]
        private static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);

        private const uint KEYEVENTF_KEYUP = 0x0002;

        /// <summary>
        /// Simulates SendKeys typing into active POS / Barcode / Cash Register window
        /// </summary>
        public static void SendTextToActiveWindow(string text)
        {
            try
            {
                // Ensure focus has shifted to the target window
                Thread.Sleep(300);

                // Use System.Windows.Forms.SendKeys for reliable character sequence insertion
                SendKeys.SendWait(text);
                
                // Press Enter to complete input in POS system
                SendKeys.SendWait("{ENTER}");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"SendKeys Hata: {ex.Message}");
            }
        }
    }
}
