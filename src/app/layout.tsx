import { AuthProvider } from '@/contexts/auth';
import { jetBrainsMono } from '@/fonts/jet-brains-mono';

import 'react-toastify/dist/ReactToastify.css';
import '../styles/global.scss';

export const metadata = {
  title: 'Translations App',
  description: 'This app help us to translating everything',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html className={jetBrainsMono.className} lang="pt-BR">
      <AuthProvider>
        <body>{children}</body>
      </AuthProvider>
    </html>
  )
}
