import '@/app/ui/global.css'
import { inter } from '@/app/ui/fonts';
import { Toaster } from '@/components/ui/sonner';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
        {/* sonner 的渲染出口：toast.error() 等调用最终画在这；不挂它，toast 全部静默 */}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
