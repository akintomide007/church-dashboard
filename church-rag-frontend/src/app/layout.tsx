import type { Metadata } from 'next';
import ThemeRegistry from '@/theme/ThemeRegistry';
import MainLayout from '@/components/layout/MainLayout';

export const metadata: Metadata = {
  title: 'Church RAG System',
  description: 'AI-Powered Ministry Assistant for Sermon Preparation and Live Projection',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <MainLayout>{children}</MainLayout>
        </ThemeRegistry>
      </body>
    </html>
  );
}
