
import React, { useState, useRef } from 'react';
import { Upload, Link, Copy, Check, X, Image, Loader, AlertCircle } from 'lucide-react';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dt69gyvun/image/upload';
const UPLOAD_PRESET = 'Urban Axis'; 

const ImageUploader = ({
  onUpload,
  folder = 'uploads',
  accept = 'image/*',
  maxMB = 5,
  label = 'Upload Image',
  currentUrl = '',
}) => {
  const [mode, setMode]       = useState('upload'); // 'upload' | 'url'
  const [urlInput, setUrlInput] = useState(currentUrl || '');
  const [preview, setPreview] = useState(currentUrl || null);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied]   = useState(false);
  const [error, setError]     = useState('');
  const [finalUrl, setFinalUrl] = useState(currentUrl || '');
  const inputRef = useRef(null);

  /* ── Upload file to Cloudinary ── */
  const handleFile = async (file) => {
    if (!file) return;
    setError('');

    // Validate type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WebP, etc.)');
      return;
    }

    // Validate size
    if (file.size > maxMB * 1024 * 1024) {
      setError(`File too large. Maximum size is ${maxMB}MB.`);
      return;
    }

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', folder);

      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || 'Upload failed');
      }

      const data = await response.json();
      const publicUrl = data.secure_url;

      setFinalUrl(publicUrl);
      setUrlInput(publicUrl);
      setPreview(publicUrl);
      onUpload && onUpload(publicUrl);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed. Check your Cloudinary settings.');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  /* ── Drag and drop ── */
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  /* ── Paste URL manually ── */
  const handleUrlSubmit = () => {
    const url = urlInput.trim();
    if (!url) return;
    setPreview(url);
    setFinalUrl(url);
    onUpload && onUpload(url);
    setError('');
  };

  /* ── Copy URL to clipboard ── */
  const copyUrl = async () => {
    if (!finalUrl) return;
    await navigator.clipboard.writeText(finalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Clear ── */
  const clear = () => {
    setPreview(null);
    setFinalUrl('');
    setUrlInput('');
    setError('');
    if (inputRef.current) inputRef.current.value = '';
    onUpload && onUpload('');
  };

  return (
    <div className="w-full space-y-3">
      {/* Label */}
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>

      {/* Mode toggle */}
      <div className="flex rounded-lg overflow-hidden border border-slate-200 w-fit">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all ${
            mode === 'upload' ? 'bg-[#0a1628] text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Upload size={13} /> Upload File
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all border-l border-slate-200 ${
            mode === 'url' ? 'bg-[#0a1628] text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Link size={13} /> Paste URL
        </button>
      </div>

      {/* Upload mode */}
      {mode === 'upload' && (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            uploading
              ? 'border-blue-300 bg-blue-50'
              : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 bg-slate-50'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={e => handleFile(e.target.files?.[0])}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader size={28} className="text-blue-600 animate-spin" />
              <p className="text-sm font-semibold text-blue-600">Uploading to Supabase…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm">
                <Image size={22} className="text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">Drop image here or click to browse</p>
                <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP — max {maxMB}MB</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* URL mode */}
      {mode === 'url' && (
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleUrlSubmit()}
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="px-5 py-3 bg-blue-600 text-white font-bold text-xs uppercase tracking-wide rounded-xl hover:bg-[#0a1628] transition-all whitespace-nowrap"
          >
            Use URL
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold text-red-600">{error}</p>
        </div>
      )}

      {/* Preview */}
      {preview && !uploading && (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-h-48 object-cover"
            onError={() => { setPreview(null); setError('Could not load image from this URL.'); }}
          />
          {/* Overlay controls */}
          <div className="absolute top-2 right-2 flex gap-2">
            {finalUrl && (
              <button
                type="button"
                onClick={copyUrl}
                title="Copy URL"
                className="w-8 h-8 bg-white/90 hover:bg-white rounded-lg flex items-center justify-center shadow-sm transition-all border border-slate-200"
              >
                {copied ? <Check size={14} className="text-blue-600" /> : <Copy size={14} className="text-slate-600" />}
              </button>
            )}
            <button
              type="button"
              onClick={clear}
              title="Remove"
              className="w-8 h-8 bg-white/90 hover:bg-white rounded-lg flex items-center justify-center shadow-sm transition-all border border-slate-200"
            >
              <X size={14} className="text-slate-600" />
            </button>
          </div>
        </div>
      )}

      {/* Final URL display */}
      {finalUrl && (
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          <Link size={12} className="text-blue-600 shrink-0" />
          <p className="text-[11px] text-slate-500 font-medium truncate flex-1">{finalUrl}</p>
          <button type="button" onClick={copyUrl} className="shrink-0 text-[11px] font-bold text-blue-600 hover:underline">
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;