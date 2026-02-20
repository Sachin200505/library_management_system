import React from 'react';
import { X } from 'lucide-react';

const AuthModal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-scale-up">
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight font-heading">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-full"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-8">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
