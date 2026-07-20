import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import '../frontend/src/index.css';

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host') ?? 'localhost';
  const protocol = requestHeaders.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  const origin = `${protocol}://${host}`;

  return {
    title: 'JR 셀프 스튜디오',
    description: '사진이 기기 밖으로 나가지 않는 개인용 iPad 네컷 포토부스',
    applicationName: 'JR 네컷',
    appleWebApp: { capable: true, statusBarStyle: 'default', title: 'JR 네컷' },
    icons: { icon: '/icon-192.png', apple: '/icon-192.png' },
    manifest: '/manifest.webmanifest',
    openGraph: {
      title: 'JR 셀프 스튜디오',
      description: 'Four moments, one frame.',
      images: [{ url: `${origin}/og.png`, width: 1200, height: 630, alt: 'JR self studio' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'JR 셀프 스튜디오',
      description: 'Four moments, one frame.',
      images: [`${origin}/og.png`],
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
