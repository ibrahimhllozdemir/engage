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
    }));
    setFiles(prev => [...prev, ...mapped]);
    setUploadStatus(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.heic'] },
  });

  const handleUpload = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    setUploadStatus(null);

    try {
      for (let i = 0; i < files.length; i++) {
        if (files[i].status === 'success') continue;

        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'uploading' } : f));

        const reader = new FileReader();
        const base64Data = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(files[i].file);
        });

        const base64Clean = base64Data.split(',')[1];

        // Next.js API route — no CORS, no no-cors hack needed
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: files[i].file.name,
            mimeType: files[i].file.type,
            data: base64Clean,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Yükleme başarısız');
        }

        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'success' } : f));
      }

      setUploadStatus('success');
      setTimeout(() => setFiles([]), 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
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
          Bu özel gecemizde çektiğiniz en güzel kareleri bizimle paylaşırsanız çok mutlu oluruz.
        </p>

        <div {...getRootProps()} className={`dropzone-container ${isDragActive ? 'active' : ''}`}>
          <input {...getInputProps()} />
          <FiCamera className="dropzone-icon" />
          <h3 className="dropzone-text">
            {isDragActive ? 'Fotoğrafları buraya bırakın' : 'Fotoğraf Seç veya Sürükle Bırak'}
          </h3>
          <p className="dropzone-hint">Sadece görseller kabul edilmektedir (PNG, JPG, HEIC)</p>
        </div>

        {files.length > 0 && (
          <div className="upload-status">
            <ul className="file-list">
              <AnimatePresence>
                {files.map((fItem) => (
                  <motion.li
                    key={fItem.id}
                    className="file-item"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="file-info">
                      <FiUploadCloud />
                      <span className="file-name">{fItem.file.name}</span>
                      <span className="file-size">{(fItem.file.size / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                    <div>
                      {fItem.status === 'uploading' && <FiLoader className="spinner" />}
                      {fItem.status === 'success' && <FiCheckCircle className="success-icon" />}
                      {fItem.status === 'error' && <FiXCircle className="error-icon" />}
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
            <div style={{ textAlign: 'center' }}>
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
            <strong>Teşekkürler!</strong> Fotoğraflarınız Drive'a başarıyla yüklendi 🎉
          </motion.div>
        )}

        {uploadStatus === 'error' && (
          <motion.div
            className="custom-alert alert-error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            Yükleme hatası. Lütfen tekrar deneyin.
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
