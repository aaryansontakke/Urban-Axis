
import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { Plus, Pencil, Trash2, X, Save, Upload, Loader2, Image as ImageIcon } from 'lucide-react';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dt69gyvun/image/upload';
const UPLOAD_PRESET = 'Urban Axis'; 

const EMPTY = { title: '', subtitle: '', image_url: '', display_order: 0 };

const AdminHeroSlider = () => {
  const [slides, setSlides]       = useState([]);
  const [form, setForm]           = useState(EMPTY);
  const [editing, setEditing]     = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg]             = useState('');

  const load = async () => {
    try {
      const q = query(collection(db, 'hero_slides'), orderBy('display_order'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSlides(data);
    } catch (err) {
      console.error("Error loading slides:", err);
    }
  };
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setForm({ ...EMPTY, display_order: slides.length });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (slide) => {
    setForm(slide);
    setEditing(slide.id);
    setShowForm(true);
  };

  const handleImageUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
      setUploading(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', 'hero_slides');

      const response = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setForm(prev => ({ ...prev, image_url: data.secure_url }));
      setMsg('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading:', error.message);
      setMsg('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { 
      ...form, 
      display_order: Number(form.display_order),
      updated_at: serverTimestamp() 
    };

    try {
      if (editing) {
        const docRef = doc(db, 'hero_slides', editing);
        await updateDoc(docRef, payload);
      } else {
        payload.created_at = serverTimestamp();
        await addDoc(collection(db, 'hero_slides'), payload);
      }

      setMsg(editing ? 'Slide updated!' : 'Slide added!');
      setShowForm(false);
      setEditing(null);
      load();
    } catch (err) {
      setMsg('Error: ' + err.message);
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this slide?')) return;
    try {
      await deleteDoc(doc(db, 'hero_slides', id));
      load();
    } catch (err) {
      console.error("Error deleting slide:", err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-black uppercase tracking-tight">Hero Slider</h1>
          <p className="text-slate-400 text-sm mt-1">Manage homepage banner slides</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-colors">
          <Plus size={16}/> Add Slide
        </button>
      </div>

      {msg && <div className="mb-4 bg-emerald-900/40 border border-emerald-700 text-emerald-300 text-sm px-4 py-3 rounded-lg">{msg}</div>}

      <div className="grid md:grid-cols-2 gap-6">
        {slides.map(slide => (
          <div key={slide.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden group flex flex-col">
            <div className="aspect-video relative overflow-hidden bg-slate-800">
              {slide.image_url ? (
                <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"/>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={48} className="text-slate-700"/>
                </div>
              )}
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded border border-white/10 uppercase tracking-widest">
                Order: {slide.display_order}
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-white font-black text-lg uppercase tracking-tight mb-1">{slide.title || 'Untitled Slide'}</h3>
              <p className="text-slate-400 text-xs mb-6 line-clamp-2 leading-relaxed">{slide.subtitle || 'No description provided.'}</p>
              
              <div className="mt-auto flex gap-3">
                <button onClick={() => openEdit(slide)}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white text-xs py-2.5 rounded-lg transition-all font-bold uppercase tracking-wider">
                  <Pencil size={14}/> Edit Slide
                </button>
                <button onClick={() => handleDelete(slide.id)}
                  className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white text-xs px-4 py-2.5 rounded-lg transition-all">
                  <Trash2 size={14}/>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {slides.length === 0 && (
        <div className="text-center py-20 bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl">
          <ImageIcon size={48} className="mx-auto text-slate-700 mb-4"/>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No slides found. Add your first slide to get started.</p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={e => e.target===e.currentTarget && setShowForm(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
              <h2 className="text-white font-black uppercase tracking-tight">{editing ? 'Edit Slide' : 'Add New Slide'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white transition-colors"><X size={20}/></button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              {/* Image Upload */}
              <div>
                <label className="label">Slide Background Image</label>
                <div className="mt-1 relative aspect-video rounded-xl overflow-hidden bg-slate-800 border-2 border-dashed border-slate-700 group hover:border-blue-500 transition-colors">
                  {form.image_url ? (
                    <>
                      <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer hover:bg-blue-500 transition-colors shadow-xl">
                          Change Image
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                        </label>
                      </div>
                    </>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                      {uploading ? (
                        <Loader2 size={32} className="text-blue-500 animate-spin" />
                      ) : (
                        <>
                          <Upload size={32} className="text-slate-500 mb-2" />
                          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Click to upload image</span>
                        </>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">Main Title</label>
                  <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                    className="field" placeholder="e.g. EXPLORE AGRA"/>
                </div>
                <div>
                  <label className="label">Subtitle / Description</label>
                  <textarea rows={3} value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})}
                    className="field resize-none" placeholder="Enter a compelling description..."/>
                </div>
                <div>
                  <label className="label">Display Order</label>
                  <input type="number" value={form.display_order} onChange={e => setForm({...form, display_order: e.target.value})}
                    className="field w-32" min="0"/>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-800">
                <button type="submit" disabled={saving || uploading}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 text-white py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-blue-600/20 active:scale-95">
                  <Save size={16}/> {saving ? 'Saving...' : 'Save Slide'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .label { display:block; color:#64748b; font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.15em; margin-bottom:8px; }
        .field { width:100%; background:#0f172a; border:1px solid #1e293b; color:#f1f5f9; padding:12px 16px; border-radius:12px; font-size:14px; outline:none; transition:all .2s; }
        .field:focus { border-color:#3b82f6; background:#1e293b; box-shadow:0 0 0 4px rgba(59,130,246,0.1); }
        .field::placeholder { color:#475569; }
      `}</style>
    </div>
  );
};

export default AdminHeroSlider;
