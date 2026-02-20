import React, { useState, useEffect } from 'react';
import { X, CreditCard, Lock, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';

const DummyPaymentModal = ({ isOpen, onClose, fineAmount, onPaymentComplete }) => {
    const [step, setStep] = useState('input'); // input, processing, success
    const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '', name: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setStep('input');
            setCardData({ number: '', expiry: '', cvv: '', name: '' });
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const parts = [];
        for (let i = 0; i < v.length; i += 4) {
            parts.push(v.substring(i, i + 4));
        }
        return parts.length > 1 ? parts.join(' ') : value;
    };

    const formatExpiry = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'number') formattedValue = formatCardNumber(value);
        if (name === 'expiry') formattedValue = formatExpiry(value);
        if (name === 'cvv') formattedValue = value.replace(/[^0-9]/g, '').slice(0, 3);

        setCardData(prev => ({ ...prev, [name]: formattedValue }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (cardData.number.length < 16) {
            setError('Invalid card number');
            return;
        }
        if (cardData.cvv.length < 3) {
            setError('Invalid CVV');
            return;
        }

        setStep('processing');

        // Simulate API delay
        setTimeout(() => {
            setStep('success');
            setTimeout(() => {
                onPaymentComplete();
            }, 2000);
        }, 2500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-scale-up">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <h3 className="text-lg font-bold text-slate-800 tracking-tight">Secure Payment</h3>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={step === 'processing' || step === 'success'}
                        className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8">
                    {step === 'input' && (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-600">Total Amount</span>
                                <span className="text-2xl font-bold text-slate-900 font-mono">₹{fineAmount}</span>
                            </div>

                            {error && (
                                <div className="text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg text-center font-medium">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Card Number</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="number"
                                            placeholder="0000 0000 0000 0000"
                                            value={cardData.number}
                                            onChange={handleChange}
                                            maxLength="19"
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-slate-700"
                                            required
                                        />
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Expiry</label>
                                        <input
                                            type="text"
                                            name="expiry"
                                            placeholder="MM/YY"
                                            value={cardData.expiry}
                                            onChange={handleChange}
                                            maxLength="5"
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-slate-700 text-center"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">CVV</label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                name="cvv"
                                                placeholder="123"
                                                value={cardData.cvv}
                                                onChange={handleChange}
                                                maxLength="3"
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-slate-700 text-center"
                                                required
                                            />
                                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Cardholder Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="JOHN DOE"
                                        value={cardData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700 uppercase"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Lock className="w-4 h-4" /> Pay Securely
                            </button>

                            <p className="text-center text-xs text-slate-400 mt-2">
                                This is a secure 256-bit encrypted transaction being simulated.
                            </p>
                        </form>
                    )}

                    {step === 'processing' && (
                        <div className="text-center py-10 space-y-4 animate-fade-in">
                            <div className="relative inline-flex">
                                <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Lock className="w-6 h-6 text-slate-300" />
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Processing Payment...</h3>
                            <p className="text-slate-500 text-sm">Please do not close this window.</p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center py-8 space-y-4 animate-scale-up">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-emerald-600">Payment Successful!</h3>
                            <p className="text-slate-500">
                                Your fine has been cleared. Redirecting...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DummyPaymentModal;
