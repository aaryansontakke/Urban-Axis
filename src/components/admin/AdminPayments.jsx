
import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig';
import { collection, query, getDocs, orderBy, limit, where } from 'firebase/firestore';
import { Search, IndianRupee, Calendar, Hash, CheckCircle, RefreshCcw, Filter, ExternalLink, Loader2 } from 'lucide-react';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('ALL');

  const load = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'payments'), orderBy('created_at', 'desc'), limit(100));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate() || new Date()
      }));
      setPayments(data);
    } catch (err) {
      console.error("Error loading payments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = payments.filter(p => {
    const matchSearch = !search || 
      p.order_id?.toLowerCase().includes(search.toLowerCase()) || 
      p.payment_id?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' || p.status === filter.toLowerCase();
    return matchSearch && matchFilter;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-black uppercase tracking-tight">Payment History</h1>
          <p className="text-slate-400 text-sm mt-1">Review and track all incoming transactions</p>
        </div>
        <button onClick={load} className="p-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors border border-slate-700">
          <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Revenue</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-white">₹{payments.reduce((acc, p) => acc + (p.amount || 0), 0).toLocaleString()}</span>
            <span className="text-emerald-500 text-xs font-bold mb-1.5">Live</span>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Successful Payments</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-white">{payments.length}</span>
            <span className="text-blue-500 text-xs font-bold mb-1.5">Orders</span>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Average Ticket</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-white">₹{payments.length ? Math.round(payments.reduce((acc, p) => acc + (p.amount || 0), 0) / payments.length).toLocaleString() : 0}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[280px]">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by Order ID or Payment ID..." 
            className="w-full bg-slate-900 border border-slate-800 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-blue-600 transition-all text-sm"
          />
        </div>
        <div className="flex gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {['ALL', 'SUCCESS'].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Date & Time</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Amount</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">IDs</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Status</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <Loader2 size={32} className="text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Fetching Transactions...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No transactions found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-800/20 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-white font-bold text-sm">{p.created_at.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <span className="text-slate-500 text-[10px] font-medium">{p.created_at.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1 text-emerald-400 font-black text-lg">
                        <IndianRupee size={14} strokeWidth={3} />
                        <span>{p.amount?.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-800 px-1.5 py-0.5 rounded">Order</span>
                          <span className="text-slate-300 font-mono text-xs">{p.order_id}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-800 px-1.5 py-0.5 rounded">Pay ID</span>
                          <span className="text-slate-300 font-mono text-xs">{p.payment_id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                        <CheckCircle size={10} />
                        Success
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => window.open(`https://dashboard.razorpay.com/app/payments/${p.payment_id}`, '_blank')}
                        className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                        title="View in Razorpay"
                      >
                        <ExternalLink size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
