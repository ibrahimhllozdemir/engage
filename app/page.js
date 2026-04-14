import Hero from '@/components/Hero';
import Upload from '@/components/Upload';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Upload />
      <footer className="footer">
        <h2 className="footer-text">Ezgi & İbrahim</h2>
        <p className="footer-sub">Bizimle olduğunuz için teşekkür ederiz.</p>
      </footer>
    </>
  );
}
