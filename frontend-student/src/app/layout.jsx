import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/providers/Providers';
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'APTIS Master - Luyện thi APTIS trực tuyến',
  description: 'Nền tảng luyện thi APTIS hàng đầu với kho đề thi phong phú, giáo viên chuyên nghiệp và công cụ học tập hiện đại',
  keywords: ['APTIS', 'luyện thi', 'tiếng Anh', 'thi thử'],
  openGraph: {
    title: 'APTIS Master',
    description: 'Luyện thi APTIS trực tuyến chuyên nghiệp',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" style={{ height: '100%' }}>
      <body className={inter.className} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', margin: 0, padding: 0 }}>
        <Providers>
          {children}
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}