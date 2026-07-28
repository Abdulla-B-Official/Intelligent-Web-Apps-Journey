import React, { useState, useRef } from 'react';
import { UploadCloud, FileImage, X, AlertCircle } from 'lucide-react';

export default function ImageUpload({ onImageSubmit, isProcessing }) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');
  const fileInputRef = useRef(null);

  const validateAndProcessFile = (file) => {
    setError('');
    
    // Validate File Type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload PNG, JPG, or JPEG.');
      return;
    }

    // Validate File Size (Max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      setError('File size too large. Maximum size is 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setPreview(dataUrl);
      onImageSubmit(dataUrl);
    };
    reader.onerror = () => {
      setError('Error reading file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setPreview('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Upload Zone or Preview */}
      {!preview ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
          className={`w-full max-w-[280px] h-[280px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-primary bg-primary/10 shadow-glow-primary scale-98'
              : 'border-white/10 hover:border-primary/50 hover:bg-white/5 bg-slate-900/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".png, .jpg, .jpeg"
            onChange={handleChange}
          />
          <div className="p-4 rounded-full bg-white/5 border border-white/5 text-slate-400 mb-4 group-hover:text-white transition-all">
            <UploadCloud className="w-8 h-8 text-primary" />
          </div>
          <span className="text-sm font-semibold text-slate-200 block mb-1">
            Drag & Drop Image
          </span>
          <span className="text-xs text-slate-400 block mb-3">
            PNG, JPG, or JPEG up to 2MB
          </span>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-primary-light font-medium transition-all">
            Browse files
          </span>
        </div>
      ) : (
        <div className="relative w-full max-w-[280px] h-[280px] rounded-2xl overflow-hidden border border-white/10 bg-slate-950/40 flex items-center justify-center">
          <img
            src={preview}
            alt="Uploaded Preview"
            className="max-w-full max-h-full object-contain p-2"
          />
          
          {/* Overlay loading state */}
          {isProcessing && (
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-slate-400 font-medium">Reconstructing...</span>
              </div>
            </div>
          )}

          {/* Remove Button */}
          {!isProcessing && (
            <button
              onClick={removeImage}
              className="absolute top-3 right-3 p-2 bg-slate-950/80 border border-white/10 hover:bg-rose-950/65 text-slate-400 hover:text-rose-400 rounded-xl transition-all shadow-md"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="w-full max-w-[280px] flex items-start gap-2 p-3 rounded-xl border border-rose-500/20 bg-rose-950/30 text-rose-200">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span className="text-xs font-medium leading-relaxed">{error}</span>
        </div>
      )}
    </div>
  );
}
