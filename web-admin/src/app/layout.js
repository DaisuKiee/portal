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
      </head>
      <body className={inter.className}>
        {children}
        <ToastContainer />
        <ConfirmDialog />
      </body>
    </html>
  );
}
