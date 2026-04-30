import React, { useState, useEffect } from 'react';
import { X, CreditCard, ShieldCheck, IndianRupee, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadRazorpayScript } from '../utils/razorpayLoader';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const PaymentModal = ({ isOpen, onClose }) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Reset success state when modal is closed
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => setShowSuccess(false), 500);
        }
    }, [isOpen]);
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const quickAmounts = [500, 1000, 2000, 5000];

    const handlePayment = async (e) => {
        e.preventDefault();
        if (!amount || isNaN(amount) || amount <= 0) {
            alert("Please enter a valid amount");
            return;
        }

        setLoading(true);
        const res = await loadRazorpayScript();

        if (!res) {
            alert("Razorpay SDK failed to load. Are you online?");
            setLoading(false);
            return;
        }

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
            const orderRes = await fetch(`${backendUrl}/api/payment/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount: Number(amount) }),
            });

            if (!orderRes.ok) {
                throw new Error("Failed to create order");
            }

            const orderData = await orderRes.json();

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                order_id: orderData.id,
                handler: async function (response) {
                    const data = {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                    };

                    const verifyRes = await fetch(`${backendUrl}/api/payment/verify`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data),
                    });

                    if (verifyRes.ok) {
                        // Save to Firestore
                        try {
                            await addDoc(collection(db, 'payments'), {
                                amount: Number(amount),
                                order_id: response.razorpay_order_id,
                                payment_id: response.razorpay_payment_id,
                                status: 'success',
                                created_at: serverTimestamp()
                            });
                        } catch (firestoreErr) {
                            console.error("Error saving payment to Firestore:", firestoreErr);
                        }

                        setShowSuccess(true);
                        // Auto close after 4 seconds and redirect to home
                        setTimeout(() => {
                            window.location.href = '/';
                        }, 4000);
                    } else {
                        const resData = await verifyRes.json();
                        alert("Payment Verification Failed: " + resData.message);
                    }
                },
                prefill: {
                    name: "",
                    email: "",
                    contact: "",
                },
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error) {
            console.error("Payment error:", error);
            alert("An error occurred during payment. Please make sure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    {/* Backdrop: Semi-transparent, no blur, no fade */}
                    <div
                        onClick={onClose}
                        className="absolute inset-0 bg-blue-900/40"
                    />

                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{
                            duration: 0.3,
                            ease: [0.32, 0, 0.67, 0]
                        }}
                        className="bg-white w-full max-w-md rounded-2xl shadow-[0_30px_60px_-12px_rgba(0,0,0,0.25)] overflow-hidden relative z-10"
                    >
                        {!showSuccess ? (
                            <>
                                {/* Header Section */}
                                <div className="bg-white p-6 border-b border-gray-100 relative">
                                    <button
                                        onClick={onClose}
                                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-all"
                                    >
                                        <X size={20} />
                                    </button>

                                    <div className="flex items-center gap-4">
                                        <img src="/LOGO.jpg" alt="Logo" className="h-12 w-auto object-contain" />
                                        <div className="h-10 w-[1px] bg-blue-600/20"></div>
                                        <div className="flex flex-col">
                                            <h2 className="text-[18px] font-black text-blue-900 uppercase tracking-tighter leading-none">
                                                URBAN AXIS
                                            </h2>
                                            <p className="text-[8px] font-bold text-blue-600 uppercase tracking-widest mt-1">
                                                Secure Payment Gateway
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Body Section */}
                                <div className="p-8">
                                    <form onSubmit={handlePayment} className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">
                                                Enter Amount (INR)
                                            </label>

                                            <div className="relative group">
                                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-600">
                                                    <IndianRupee size={22} strokeWidth={3} />
                                                </div>
                                                <input
                                                    type="number"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-5 pl-14 pr-6 text-2xl font-black text-blue-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
                                                    required
                                                />
                                            </div>

                                            {/* Quick Select Buttons */}
                                            <div className="grid grid-cols-4 gap-2 mt-4">
                                                {quickAmounts.map((amt) => (
                                                    <button
                                                        key={amt}
                                                        type="button"
                                                        onClick={() => setAmount(amt.toString())}
                                                        className={`py-2 rounded-lg text-[10px] font-black transition-all border-2
                                                            ${amount === amt.toString()
                                                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20'
                                                                : 'bg-white border-gray-100 text-gray-500 hover:border-blue-100 hover:text-blue-600'}`}
                                                    >
                                                        ₹{amt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className={`w-full bg-blue-600 text-white font-black uppercase tracking-widest text-[12px] py-5 rounded-xl shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3
                                                ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700 active:scale-[0.98]'}`}
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    <span>Processing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Proceed to Pay</span>
                                                    <ArrowRight size={18} />
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    {/* Trust Indicators */}
                                    <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                                                <ShieldCheck size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-blue-900 uppercase">Verified</span>
                                                <span className="text-[8px] font-bold text-gray-400 uppercase">Secure SSL</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end">
                                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Powered by</span>
                                            <img src="/Certification/3.png" alt="Razorpay" className="h-4 opacity-70" />
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Message */}
                                <div className="bg-gray-50 p-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <CheckCircle2 size={12} className="text-blue-600" />
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                            Official Payment Portal • URBAN AXIS
                                        </p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Success Animation View */
                            <div className="p-12 text-center flex flex-col items-center justify-center">
                                <motion.div
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                                    className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white shadow-2xl mb-8 shadow-green-500/20"
                                >
                                    <CheckCircle2 size={48} strokeWidth={3} />
                                </motion.div>

                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tighter mb-2">
                                        Payment Successful
                                    </h2>
                                    <p className="text-gray-500 font-bold text-sm leading-relaxed max-w-[240px] mx-auto uppercase tracking-wider">
                                        Your transaction of <span className="text-blue-600">₹{amount}</span> has been confirmed.
                                    </p>

                                    <div className="mt-8 pt-8 border-t border-gray-100 w-full">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">
                                            Redirecting you back...
                                        </p>
                                        <button
                                            onClick={() => window.location.href = '/'}
                                            className="px-8 py-3 bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                                        >
                                            Done
                                        </button>
                                    </div>
                                </motion.div>

                                {/* Confetti Effect */}
                                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                    {[...Array(12)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ y: "100%", opacity: 1 }}
                                            animate={{
                                                y: "-100%",
                                                x: (Math.random() - 0.5) * 400,
                                                rotate: Math.random() * 360,
                                                opacity: 0
                                            }}
                                            transition={{ duration: 1.5, delay: 0.2 + (Math.random() * 0.5) }}
                                            className="absolute bottom-0 left-1/2 w-2 h-4 rounded-sm"
                                            style={{ backgroundColor: i % 2 === 0 ? '#3b82f6' : '#22c55e' }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PaymentModal;




