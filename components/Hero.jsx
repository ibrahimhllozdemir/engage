'use client';
import { motion } from 'framer-motion';

export default function Hero() {
  const scrollToUpload = () => {
    document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero-section">
      <div className="hero-blob hero-blob-1" />
      <div className="hero-blob hero-blob-2" />

      <div className="hero-inner">
        {/* LEFT — Polaroid */}
        <motion.div
          className="hero-photo-col"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          <motion.div
            className="polaroid"
            animate={{ x: [0, 14, 0, -14, 0], rotate: [-3, -1, -3, -5, -3] }}
            transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop', delay: 1.2 }}
          >
            <img
              src="https://fikirsanatrotary.com/wp-content/uploads/2026/04/we2.jpg"
              alt="Ezgi & İbrahim"
            />
            <div className="polaroid-caption">Ezgi & İbrahim</div>
          </motion.div>
        </motion.div>

        {/* RIGHT — Text */}
        <motion.div
          className="hero-text-col"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.25 }}
        >
          <span className="hero-eyebrow">✦ Nişan Törenimiz ✦</span>
          <h1 className="hero-names">Ezgi & İbrahim</h1>
          <div className="hero-divider">
            <div className="hero-divider-line" />
            <span className="hero-divider-icon">◆</span>
            <div className="hero-divider-line hero-divider-line-rev" />
          </div>
          <p className="hero-message">
            Sevginin, sadakatin ve birlikte yaşlanmanın ilk adımını atarken,
            bu özel günümüzü siz değerli sevdiklerimizle paylaşmaktan büyük mutluluk duyuyoruz.
          </p>
          <div className="hero-meta">
            <span className="hero-date-badge">
              <span>2 Mayıs 2026</span>
              <span className="hero-meta-dot">·</span>
              <span>19:00</span>
              <span className="hero-meta-dot">·</span>
              <span>İstanbul</span>
            </span>
          </div>
          <motion.button
            className="hero-upload-btn"
            onClick={scrollToUpload}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <span className="hero-upload-btn-icon">📷</span>
            Fotoğraf Yükle
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
