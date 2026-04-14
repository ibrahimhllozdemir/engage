'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnilarPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/files');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setImages(data.files || []);
    } catch (err) {
      console.error('Gallery fetch error:', err);
      setError('Görseller yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gallery-page">
      <motion.div
        className="gallery-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="hero-eyebrow" style={{ display: 'block', textAlign: 'center', marginBottom: '1rem' }}>
          ✦ Paylaşılan Anlar ✦
        </span>
        <h1 className="gallery-title">Anılar</h1>
        <p className="gallery-subtitle">Sevdiklerimizin bu özel gece paylaştığı en güzel kareler</p>
        <div className="hero-divider" style={{ margin: '1.5rem auto 0', maxWidth: '200px' }}>
          <div className="hero-divider-line" />
          <span className="hero-divider-icon">◆</span>
          <div className="hero-divider-line hero-divider-line-rev" />
        </div>
      </motion.div>

      <div className="gallery-content">
        {loading && (
          <div className="gallery-loading">
            <div className="gallery-spinner" />
            <p>Anılar yükleniyor...</p>
          </div>
        )}

        {error && !loading && (
          <div className="gallery-empty">
            <span className="gallery-empty-icon">⚠️</span>
            <p>{error}</p>
            <button className="gallery-retry-btn" onClick={fetchImages}>Tekrar Dene</button>
          </div>
        )}

        {!loading && !error && images.length === 0 && (
          <motion.div
            className="gallery-empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="gallery-empty-icon">📷</span>
            <h3 className="gallery-empty-title">Henüz görsel yüklenmedi</h3>
            <p className="gallery-empty-text">Sevdikleriniz fotoğraflarını paylaştığında burada görünecek.</p>
          </motion.div>
        )}

        {!loading && !error && images.length > 0 && (
          <motion.div className="gallery-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {images.map((img, i) => (
              <motion.div
                key={img.id || i}
                className={`gallery-item${img.isVideo ? ' gallery-item-video' : ''}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setLightbox(img)}
                whileHover={{ scale: 1.02 }}
              >
                {img.isVideo ? (
                  <div className="video-thumb-placeholder">
                    <img src="/video-thumbnail.png" alt="Video" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                ) : (
                  <img src={img.thumbnailUrl} alt={img.name || `Anı ${i + 1}`} loading="lazy" />
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <motion.div
              className="lightbox-content"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="lightbox-actions">
                <button 
                  className="lightbox-download" 
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    try {
                      const res = await fetch(lightbox.imageUrl || lightbox.downloadUrl);
                      if (!res.ok) throw new Error('Network error');
                      const blob = await res.blob();
                      
                      // Telefondaki "Paylaş/Galeriye Kaydet" menüsünü (Share Sheet) açmayı dener
                      const file = new File([blob], lightbox.name || 'foto.jpg', { type: blob.type || 'image/jpeg' });
                      if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        await navigator.share({
                          files: [file],
                          title: 'Anıyı Kaydet',
                        });
                      } else {
                        // Eğer telefon desteklemiyorsa (eski cihaz/PC) eski indirme mantığına döner
                        const blobUrl = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = blobUrl;
                        a.download = lightbox.name || 'foto.jpg';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(blobUrl);
                      }
                    } catch (err) {
                      // Fetch veya Share patlarsa Google'ın indirme sayfasına atar
                      window.open(lightbox.downloadUrl, '_blank');
                    }
                  }}
                >
                  İndir 📥
                </button>
                <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
              </div>
              {lightbox.isVideo ? (
                <iframe
                  src={lightbox.previewUrl}
                  width="100%"
                  height="480"
                  allow="autoplay"
                  style={{ border: 'none', borderRadius: '8px' }}
                />
              ) : (
                <img src={lightbox.imageUrl} alt={lightbox.name} />
              )}
              {lightbox.name && <p className="lightbox-caption">{lightbox.name}</p>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
