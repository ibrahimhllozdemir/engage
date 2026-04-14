'use client';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiCheckCircle, FiXCircle, FiLoader, FiCamera } from 'react-icons/fi';

export default function Upload() {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const mapped = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      status: 'pending',
      progress: 0,
    }));
    setFiles(prev => [...prev, ...mapped]);
    setUploadStatus(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      'image/*': ['.png', '.jpg', '.jpeg', '.heic'],
      'video/*': ['.mp4', '.mov', '.webm', '.avi'] 
    },
  });

  const uploadFile = (fItem, index) => {
    return new Promise(async (resolve, reject) => {
      try {
        setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'uploading', progress: 5 } : f));

        // 1. Vercel'den (Google vasıtasıyla) tek kullanımlık bir yükleme bileti al
        const initRes = await fetch('/api/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: fItem.file.name,
            mimeType: fItem.file.type || 'application/octet-stream',
          }),
        });

        if (!initRes.ok) {
          throw new Error('Upload URL alınamadı');
        }

        const { uploadUrl } = await initRes.json();

        // 2. Videoyu/Fotoğrafı doğrudan Google'a fırlat (XHR ile, yüzdelik ilerleme için)
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl, true);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            // İlk %5 URL alma süreci, kalanı dosya upload (5 -> 95)
            const percentComplete = 5 + Math.round((e.loaded / e.total) * 90);
            setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: percentComplete } : f));
          }
        };

        xhr.onload = async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const responseData = JSON.parse(xhr.responseText);
            const fileId = responseData.id;

            // 3. Dosya yüklendikten sonra Vercel'e dönüp izinleri verdirt
            setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: 98 } : f));

            const permRes = await fetch('/api/permissions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fileId }),
            });

            if (!permRes.ok) throw new Error('İzin ayarlanamadı');

            setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'success', progress: 100 } : f));
            resolve();
          } else {
            reject(new Error('Google upload hatası'));
          }
        };

        xhr.onerror = () => reject(new Error('Ağ hatası'));
        
        xhr.send(fItem.file);

      } catch (err) {
        setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'error' } : f));
        reject(err);
      }
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    setUploadStatus(null);

    let hasError = false;

    // Her dosyayı sırayla yükle (istersen Promise.all(files.map(...)) ile paralele çevirebilirsin)
    for (let i = 0; i < files.length; i++) {
        if (files[i].status === 'success') continue;
        try {
            await uploadFile(files[i], i);
        } catch(e) {
            console.error('Yükleme hatası:', files[i].file.name, e);
            hasError = true;
        }
    }

    if (!hasError) {
        setUploadStatus('success');
        setTimeout(() => setFiles([]), 3000);
    } else {
        setUploadStatus('error');
    }
    
    setIsUploading(false);
  };

  return (
    <section id="upload-section" className="upload-section">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <h2 className="section-title">Anıları Paylaşın</h2>
        <p className="section-subtitle">
          Bu özel gecemizde çektiğiniz en güzel kareleri ve <strong style={{ color: "var(--accent)"}}>videoları</strong> bizimle paylaşırsanız çok mutlu oluruz. Uzun videoları bile rahatça yükleyebilirsiniz!
        </p>

        <div {...getRootProps()} className={`dropzone-container ${isDragActive ? 'active' : ''}`}>
          <input {...getInputProps()} />
          <FiCamera className="dropzone-icon" />
          <h3 className="dropzone-text">
            {isDragActive ? 'Dosyaları buraya bırakın' : 'Fotoğraf / Video Seç veya Sürükle Bırak'}
          </h3>
          <p className="dropzone-hint">Sınırsız Büyüklükte (MP4, MOV, PNG, JPG, vb.)</p>
        </div>

        {files.length > 0 && (
          <div className="upload-status" style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
            <ul className="file-list">
              <AnimatePresence>
                {files.map((fItem) => (
                  <motion.li
                    key={fItem.id}
                    className="file-item"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ position: 'relative', overflow: 'hidden' }}
                  >
                    {/* Progress Bar Arkaplanı */}
                    {(fItem.status === 'uploading' || fItem.status === 'success') && (
                        <div style={{
                            position: 'absolute',
                            left: 0, top: 0, bottom: 0,
                            width: `${fItem.progress}%`,
                            backgroundColor: 'rgba(196, 160, 114, 0.15)', // light accent color
                            transition: 'width 0.3s ease',
                            zIndex: 0
                        }}></div>
                    )}
                    
                    <div className="file-info" style={{ zIndex: 1 }}>
                      <FiUploadCloud />
                      <span className="file-name">{fItem.file.name.substring(0, 30)}{fItem.file.name.length > 30 ? '...' : ''}</span>
                      <span className="file-size">{(fItem.file.size / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                    <div style={{ zIndex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {fItem.status === 'uploading' && <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)'}}>%{fItem.progress}</span>}
                      {fItem.status === 'uploading' && <FiLoader className="spinner" />}
                      {fItem.status === 'success' && <FiCheckCircle className="success-icon" />}
                      {fItem.status === 'error' && <FiXCircle className="error-icon" />}
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                className="btn-upload-all"
                onClick={handleUpload}
                disabled={isUploading || files.every(f => f.status === 'success')}
              >
                {isUploading ? 'Yükleniyor...' : 'Tümünü Yükle'}
              </button>
            </div>
          </div>
        )}

        {uploadStatus === 'success' && (
          <motion.div
            className="custom-alert alert-success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <strong>Teşekkürler!</strong> Anılarınız sisteme başarıyla yüklendi 🤍
          </motion.div>
        )}

        {uploadStatus === 'error' && (
          <motion.div
            className="custom-alert alert-error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            Yükleme tamamlanamadı. Bir hata oluştu.
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
