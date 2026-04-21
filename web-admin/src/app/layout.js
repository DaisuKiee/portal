import { Inter } from 'next/font/google';
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import ConfirmDialog from '@/components/ConfirmDialog';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'CTU Admin Portal',
  description: 'CTU Daanbantayan Campus Admission Portal - Admin Panel',
  icons: {
    icon: '/ctu.png',
    shortcut: '/ctu.png',
    apple: '/ctu.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/ctu.png" type="image/png" />
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              // Scary console messages
              const styles = {
                danger: 'color: #ff0000; font-size: 60px; font-weight: bold; text-shadow: 3px 3px 6px rgba(255,0,0,0.8); animation: blink 1s infinite;',
                warning: 'color: #ff4444; font-size: 30px; font-weight: bold; background: #000; padding: 10px;',
                alert: 'color: #ffff00; font-size: 25px; font-weight: bold; background: #ff0000; padding: 5px;',
                message: 'color: #ff6666; font-size: 18px; font-weight: bold;',
                info: 'color: #999; font-size: 14px;',
                skull: 'font-size: 120px;',
                eyes: 'font-size: 80px;'
              };

              const scaryMessages = [
                '⚠️ WE CAN SEE YOU ⚠️',
                '👁️ YOU ARE BEING WATCHED 👁️',
                '🚨 UNAUTHORIZED ACCESS DETECTED 🚨',
                '⛔ SECURITY BREACH LOGGED ⛔',
                '🔴 YOUR IP IS BEING TRACKED 🔴',
                '⚡ SYSTEM ALERT ⚡',
                '🚫 ACCESS DENIED 🚫',
                '👮 AUTHORITIES NOTIFIED 👮',
                '📹 RECORDING IN PROGRESS 📹',
                '🔒 INTRUSION DETECTED 🔒',
                '💀 STOP WHAT YOU ARE DOING 💀',
                '⚠️ THIS ACTIVITY IS ILLEGAL ⚠️'
              ];

              const emojis = ['☠️', '👁️', '🚨', '⚠️', '🔴', '💀', '👮', '📹', '🔒', '⛔'];

              let messageIndex = 0;
              let spamCount = 0;

              // Initial scary display
              console.clear();
              console.log('%c☠️ ☠️ ☠️', styles.skull);
              console.log('%c⚠️ SECURITY SYSTEM ACTIVATED ⚠️', styles.danger);
              console.log('%c', 'font-size: 10px;');

              // Spam random messages with delays
              function spamWarnings() {
                const randomMessage = scaryMessages[Math.floor(Math.random() * scaryMessages.length)];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                
                console.log('%c' + randomEmoji + ' ' + randomMessage + ' ' + randomEmoji, styles.warning);
                
                spamCount++;
                
                // Random additional scary messages
                if (Math.random() > 0.5) {
                  console.log('%c🚨 IP ADDRESS LOGGED: ' + (Math.floor(Math.random() * 255) + 1) + '.' + 
                    (Math.floor(Math.random() * 255) + 1) + '.' + 
                    (Math.floor(Math.random() * 255) + 1) + '.' + 
                    (Math.floor(Math.random() * 255) + 1), styles.alert);
                }
                
                if (Math.random() > 0.7) {
                  console.log('%c⏰ TIMESTAMP: ' + new Date().toLocaleString(), styles.message);
                }
                
                if (Math.random() > 0.6) {
                  console.log('%c👁️👁️👁️ WATCHING YOU 👁️👁️👁️', styles.eyes);
                }

                // Spam faster initially, then slow down
                if (spamCount < 10) {
                  setTimeout(spamWarnings, Math.random() * 1000 + 500);
                } else if (spamCount < 20) {
                  setTimeout(spamWarnings, Math.random() * 2000 + 1000);
                } else {
                  // Continue with slower interval
                  setTimeout(spamWarnings, Math.random() * 5000 + 3000);
                }
              }

              // Start spamming after initial delay
              setTimeout(spamWarnings, 1000);

              // Periodic big warnings
              setInterval(() => {
                console.clear();
                console.log('%c☠️', 'font-size: 150px;');
                console.log('%c⚠️ WE ARE WATCHING YOU ⚠️', styles.danger);
                console.log('%c👁️ EVERY ACTION IS MONITORED 👁️', styles.warning);
                console.log('%c🚨 CTU SECURITY SYSTEM 🚨', styles.alert);
                console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #ff0000; font-size: 20px;');
              }, 15000);

              // Random eye spam
              setInterval(() => {
                if (Math.random() > 0.5) {
                  console.log('%c👁️', 'font-size: ' + (Math.random() * 100 + 50) + 'px;');
                }
              }, 3000);

              // Warning about self-XSS
              setTimeout(() => {
                console.log('%c', 'font-size: 10px;');
                console.log('%c⚠️ DEVELOPER WARNING ⚠️', styles.warning);
                console.log('%cIf someone told you to paste code here, DO NOT DO IT!', styles.info);
                console.log('%cThis is a Self-XSS scam that can compromise your account.', styles.info);
                console.log('%c', 'font-size: 10px;');
              }, 5000);

              // Detect if console is opened (attempt)
              let devtoolsOpen = false;
              const threshold = 160;
              
              setInterval(() => {
                if (window.outerWidth - window.innerWidth > threshold || 
                    window.outerHeight - window.innerHeight > threshold) {
                  if (!devtoolsOpen) {
                    devtoolsOpen = true;
                    console.log('%c🚨🚨🚨 DEVELOPER TOOLS DETECTED 🚨🚨🚨', styles.danger);
                    console.log('%c⚠️ SECURITY ALERT: Console opened at ' + new Date().toLocaleString(), styles.alert);
                  }
                }
              }, 1000);
            })();
          `
        }} />
      </head>
      <body className={inter.className}>
        {children}
        <ToastContainer />
        <ConfirmDialog />
      </body>
    </html>
  );
}
