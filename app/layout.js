import { Cormorant_Garamond, Lato, Great_Vibes } from 'next/font/google';
import Navbar from '@/components/Navbar';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
});
const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-lato',
});
const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-great-vibes',
});

export const metadata = {
  title: 'Ezgi & İbrahim - Nişan Töreni',
  description: 'Ezgi ve İbrahim\'in nişan törenine hoş geldiniz. Anılarınızı bizimle paylaşın.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className={`${cormorant.variable} ${lato.variable} ${greatVibes.variable}`}>
        <div className="app-container">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}
