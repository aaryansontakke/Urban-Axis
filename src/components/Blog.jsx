import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Compass } from 'lucide-react';

import { db } from '../firebaseConfig';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const q = query(collection(db, 'blogs'), orderBy('display_order'));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBlogs(data);
      } catch (err) {
        console.error("Error fetching blogs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedBlog]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#0f172a]">
       <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const scrollToLocation = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-[#fcfdfe] min-h-screen font-sans text-slate-700 selection:bg-blue-100">
      <AnimatePresence mode="wait">
        {!selectedBlog ? (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            
            {/* --- HERO SECTION FIXED TO FULL SCREEN --- */}
            <div className="relative w-full h-screen bg-[#0f172a] overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105"
                style={{ backgroundImage: "url('/heroblog.jpeg')" }}></div>
              
              {/* Overlay for readability */}
              <div className="absolute inset-0 z-10 bg-black/40"></div>
              <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#0f172a]/60 via-transparent to-[#0f172a]/40"></div>

              <div className="relative z-20 text-center max-w-4xl mx-auto px-4 md:px-6">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex flex-col items-center mb-6 mt-8 px-6 py-2 border border-white/10 backdrop-blur-md bg-white/5">
                  <span className="text-white font-serif text-xl md:text-2xl font-bold tracking-tight italic text-center leading-tight">Incredible <span className="text-blue-500 font-sans not-italic font-black">!</span>ndia</span>
                  <span className="text-[7px] md:text-[8px] text-blue-400 font-black uppercase tracking-[0.3em] mt-1 text-center">Travel Chronicles & Insights</span>
                </motion.div>
                <motion.h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter uppercase italic leading-none drop-shadow-2xl">BLOG</motion.h1>
              </div>
            </div>

            {/* --- BLOG LISTING --- */}
            <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-20 space-y-12 md:space-y-16">
              {blogs.map((blog, idx) => (
                <motion.div key={blog.id} className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-6 md:gap-10`}>
                  <div className="w-full md:w-1/2 overflow-hidden shadow-lg aspect-[4/3]">
                    <img src={blog.image_url} alt={blog.title} className="w-full h-full object-cover opacity-100" />
                  </div>
                  <div className={`w-full md:w-1/2 relative ${idx % 2 === 0 ? 'text-left' : 'text-right'}`}>
                    <div className={`absolute top-0 ${idx % 2 === 0 ? 'left-0' : 'right-0'} w-8 md:w-12 h-8 md:h-12 border-t-2 ${idx % 2 === 0 ? 'border-l-2' : 'border-r-2'} border-blue-600`}></div>
                    <div className="pt-5 md:pt-6 px-4 md:px-6">
                      <p className="text-blue-600 font-bold text-[8px] md:text-[9px] tracking-widest uppercase mb-1">{blog.category}</p>
                      <h2 className="text-lg md:text-2xl font-black text-slate-900 uppercase mb-2 md:mb-3 leading-tight">{blog.title}</h2>
                      <p className="text-[11px] md:text-xs font-medium text-slate-500 leading-relaxed mb-4">{blog.description}</p>
                      <button onClick={() => blog.fullContent && setSelectedBlog(blog)} className={`flex items-center gap-2 text-slate-900 font-black text-[9px] md:text-[10px] uppercase border-b border-slate-900 pb-1 hover:text-blue-600 hover:border-blue-600 transition-all ${idx % 2 !== 0 ? 'ml-auto' : ''}`}>
                        Read More <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white min-h-screen relative">
            <div className="max-w-6xl mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-24 md:pb-32">
              <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
                <div className="lg:w-1/3 lg:sticky lg:top-32 h-fit bg-slate-50/50 p-4 md:p-6 border-r border-slate-100">
                  <div className="border-l-4 border-blue-600 pl-4 md:pl-6 mb-8 md:mb-10">
                    <p className="text-[8px] md:text-[9px] font-black text-blue-600 uppercase tracking-widest mb-2">{selectedBlog.category}</p>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase italic leading-tight mb-4 md:mb-6">{selectedBlog.title}</h1>
                  </div>
                  
                  <nav className="space-y-3 md:space-y-4 max-h-48 lg:max-h-full overflow-y-auto custom-scrollbar pr-2">
                    <p className="text-[7px] md:text-[8px] font-black text-slate-300 uppercase tracking-widest mb-4">Explore the Story</p>
                    {selectedBlog.fullContent.list.map((item, i) => (
                      <div key={i} onClick={() => scrollToLocation(`location-${i}`)} className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase hover:text-blue-600 cursor-pointer flex items-center gap-2 md:gap-3 transition-all group">
                        <span className="text-blue-600/20 font-black italic group-hover:text-blue-600 transition-colors">0{i+1}</span> {item.name}
                      </div>
                    ))}
                  </nav>
                  
                  <div className="mt-8 md:mt-20 pt-6 md:pt-10 border-t border-slate-200">
                    <button onClick={() => setSelectedBlog(null)} className="flex items-center gap-3 text-slate-400 font-black uppercase text-[8px] md:text-[9px] tracking-[0.2em] md:tracking-[0.3em] hover:text-blue-600 transition-colors">
                      <ArrowLeft size={16} /> Return to Index
                    </button>
                  </div>
                </div>

                <div className="lg:w-2/3">
                  <div className="mb-10 md:mb-16 overflow-hidden shadow-2xl rounded-sm">
                    <img src={selectedBlog.image} className="w-full aspect-[16/9] object-cover" alt="Blog cover" />
                  </div>

                  <div className="prose prose-slate max-w-none px-2 md:px-0">
                    <p className="text-base md:text-lg font-bold text-slate-800 leading-relaxed mb-8 md:mb-12 border-l-4 border-blue-600 pl-4 md:pl-6 italic">{selectedBlog.fullContent.intro}</p>
                    
                    <div className="my-8 md:my-12 py-4 md:py-6 border-y border-slate-100 bg-slate-50/30 px-4 md:px-6 text-center lg:text-left">
                      <h4 className="text-[10px] md:text-xs font-black text-blue-600 uppercase tracking-[0.3em] md:tracking-[0.4em] mb-2">{selectedBlog.fullContent.motto}</h4>
                      <p className="text-[11px] md:text-sm font-medium text-slate-400 uppercase">{selectedBlog.fullContent.subIntro}</p>
                    </div>

                    <div className="space-y-12 md:space-y-20">
                      {selectedBlog.fullContent.list.map((item, i) => (
                        <div key={i} id={`location-${i}`} className="scroll-mt-32 group">
                          <h3 className="text-lg md:text-xl font-black text-slate-900 uppercase italic mb-3 md:mb-4 flex items-center gap-3 md:gap-4">
                            <span className="text-blue-600 font-black italic text-base md:text-lg">0{i+1}.</span> {item.name}
                          </h3>
                          <p className="text-[13px] md:text-sm text-slate-500 font-bold leading-relaxed pl-8 md:pl-10">
                            {item.details}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-16 md:mt-32 p-6 md:p-8 bg-blue-600 text-white relative overflow-hidden shadow-2xl">
                      <Compass size={120} className="absolute -right-5 -bottom-5 text-white opacity-10" />
                      <div className="relative z-10">
                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-2 italic opacity-60 text-white">Traveler's Safety Note</p>
                        <p className="text-sm md:text-base font-bold italic leading-relaxed text-white">
                          {selectedBlog.fullContent.note}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2563eb; }
      `}</style>
    </div>
  );
};

export default BlogPage;