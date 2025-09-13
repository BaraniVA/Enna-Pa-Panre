import React, { useEffect } from 'react';

interface ImageModalProps {
  src: string;
  alt?: string;
  open: boolean;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ src, alt = 'Image', open, onClose }) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={onClose}>
      <div className="max-w-[90vw] max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
        <button
          aria-label="Close image"
          onClick={onClose}
          className="absolute top-6 right-6 text-white bg-black bg-opacity-30 rounded-full p-2"
        >
          ✕
        </button>
        <img src={src} alt={alt} className="w-auto h-auto max-w-full max-h-[80vh] rounded-lg object-contain shadow-2xl" />
      </div>
    </div>
  );
};

export default ImageModal;
