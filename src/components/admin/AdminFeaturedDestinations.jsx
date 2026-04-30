
import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { Plus, Pencil, Trash2, X, Save, Upload, Loader2, MapPin } from 'lucide-react';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dt69gyvun/image/upload';
const UPLOAD_PRESET = 'Urban Axis'; 

const EMPTY = { title: '', subtitle: '', image_url: '', link: '', display_order: 0 };

const AdminFeaturedDestinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [form, setForm]                 = useState(EMPTY);
  const [editing, setEditing]           = useState(null);
  const [showForm, setShowForm]         = useState(false);
  const [saving, setSaving]             = useState(false);
  const [uploading, setUploading]       = useState(false);
  const [msg, setMsg]                   = useState('');

  const load = async () => {
    try {
      const q = query(collection(db, 'featured_destinations'), orderBy('display_order'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDestinations(data);
    } catch (err) {
      console.error("Error loading destinations:", err);
    }
  };
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setForm({ ...EMPTY, display_order: destinations.length });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (dest) => {
    setForm(dest);
    setEditing(dest.id);
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
      formData.append('folder', 'featured_destinations');

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
        const docRef = doc(db, 'featured_destinations', editing);
        await updateDoc(docRef, payload);
      } else {
        payload.created_at = serverTimestamp();
        await addDoc(collection(db, 'featured_destinations'), payload);
      }

      setMsg(editing ? 'Destination updated!' : 'Destination added!');
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
    if (!confirm('Delete this destination?')) return;
    try {
      await deleteDoc(doc(db, 'featured_destinations', id));
      load();
    } catch (err) {
      console.error("Error deleting destination:", err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-black uppercase tracking-tight">Featured Tours</h1>
          <p className="text-slate-400 text-sm mt-1">Manage the "Favourite Destination" slider</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-colors">
          <Plus size={16}/> Add Destination
        </button>
      </div>

      {msg && <div className="mb-4 bg-emerald-900/40 border border-emerald-700 text-emerald-300 text-sm px-4 py-3 rounded-lg">{msg}</div>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map(dest => (
          <div key={dest.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden group flex flex-col shadow-lg hover:shadow-blue-900/10 transition-all duration-300">
            <div className="aspect-[4/5] relative overflow-hidden bg-slate-800">
              {dest.image_url ? (
                <img src={dest.image_url} alt={dest.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105"/>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <MapPin size={48} className="text-slate-700"/>
                </div>
              )}
              <div className="absolute top-4 right-4 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-xl uppercase tracking-widest">
                Order: {dest.display_order}
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-white font-black text-xl uppercase tracking-tight mb-2">{dest.title || 'Untitled'}</h3>
              <p className="text-slate-400 text-xs mb-6 line-clamp-2 leading-relaxed flex-1">{dest.subtitle || 'No description provided.'}</p>
              
              <div className="flex gap-3">
                <button onClick={() => openEdit(dest)}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white text-[10px] py-3 rounded-xl transition-all font-black uppercase tracking-widest shadow-sm">
                  <Pencil size={14}/> Edit
                </button>
                <button onClick={() => handleDelete(dest.id)}
                  className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white text-xs px-4 py-3 rounded-xl transition-all">
                  <Trash2 size={14}/>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {destinations.length === 0 && (
        <div className="text-center py-24 bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl">
          <MapPin size={48} className="mx-auto text-slate-700 mb-4 opacity-50"/>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No destinations found.</p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md" onClick={e => e.target===e.currentTarget && setShowForm(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
              <h2 className="text-white font-black uppercase tracking-tight text-lg">{editing ? 'Edit Destination' : 'Add Destination'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-800"><X size={20}/></button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-6">
              {/* Image Upload */}
              <div>
                <label className="label">Destination Image</label>
                <div className="mt-1 relative aspect-[4/5] max-h-64 rounded-2xl overflow-hidden bg-slate-800 border-2 border-dashed border-slate-700 group hover:border-blue-500 transition-all">
                  {form.image_url ? (
                    <>
                      <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-blue-500 transition-colors shadow-2xl">
                          Replace Image
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                        </label>
                      </div>
                    </>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-slate-800/50 transition-colors">
                      {uploading ? (
                        <Loader2 size={32} className="text-blue-500 animate-spin" />
                      ) : (
                        <>
                          <Upload size={32} className="text-slate-500 mb-3" />
                          <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Upload Portrait Image</span>
                        </>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="label">Location Name</label>
                  <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                    className="field" placeholder="e.g. NEPAL"/>
                </div>
                <div>
                  <label className="label">Short Description</label>
                  <textarea rows={2} value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})}
                    className="field resize-none" placeholder="e.g. Majestic Himalayan peaks..."/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Link URL</label>
                    <input value={form.link} onChange={e => setForm({...form, link: e.target.value})}
                      className="field" placeholder="/tours/india/kashmir"/>
                  </div>
                  <div>
                    <label className="label">Display Order</label>
                    <input type="number" value={form.display_order} onChange={e => setForm({...form, display_order: e.target.value})}
                      className="field" min="0"/>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-800">
                <button type="submit" disabled={saving || uploading}
                  className="flex-1 flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-2xl shadow-blue-600/30 active:scale-[0.98]">
                  <Save size={18}/> {saving ? 'Saving...' : 'Save Destination'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .label { display:block; color:#475569; font-size:9px; font-weight:900; text-transform:uppercase; letter-spacing:.2em; margin-bottom:10px; }
        .field { width:100%; background:#0f172a; border:1px solid #1e293b; color:#f1f5f9; padding:14px 18px; border-radius:16px; font-size:14px; font-weight:500; outline:none; transition:all .3s ease; }
        .field:focus { border-color:#2563eb; background:#111827; box-shadow:0 0 0 1px #2563eb; }
        .field::placeholder { color:#334155; }
      `}</style>
    </div>
  );
};

export default AdminFeaturedDestinations;
