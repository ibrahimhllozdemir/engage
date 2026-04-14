'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">Ezgi & İbrahim</Link>
      <div className="navbar-links">
        <Link href="/" className={`navbar-link ${pathname === '/' ? 'active' : ''}`}>Ana Sayfa</Link>
        <Link href="/anilar" className={`navbar-link ${pathname === '/anilar' ? 'active' : ''}`}>Anılar</Link>
      </div>
    </nav>
  );
}
