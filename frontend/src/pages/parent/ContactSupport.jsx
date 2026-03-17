import React, { useState, useRef } from 'react';
import { Send, CheckCircle, AlertCircle, Phone, Mail, User, MessageSquare } from 'lucide-react';
import emailjs from '@emailjs/browser';

const ContactSupport = () => {
    const form = useRef();
    const [status, setStatus] = useState('idle'); // idle, sending, success, error
    const [formData, setFormData] = useState({
        user_name: '',
        user_email: '',
        user_phone: '',
        message: ''
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.user_name.trim()) newErrors.user_name = 'Name is required';

        if (!formData.user_email.trim()) {
            newErrors.user_email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.user_email)) {
            newErrors.user_email = 'Invalid email format';
        }

        if (!formData.user_phone.trim()) {
            newErrors.user_phone = 'Phone number is required';
        } else if (!/^\d+$/.test(formData.user_phone)) {
            newErrors.user_phone = 'Numbers only';
        }

        if (!formData.message.trim()) newErrors.message = 'Message is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const sendEmail = (e) => {
        e.preventDefault();

        if (!validate()) return;

        setStatus('sending');

        // Note: These are placeholders. You need to replace them with your actual EmailJS credentials.
        const SERVICE_ID = 'service_6bf26ng'; // Placeholder
        const TEMPLATE_ID = 'template_zg4atvh'; // Placeholder
        const PUBLIC_KEY = 'Uy4PiP4ePzWoFNqUz'; // Placeholder

        emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form.current, {
            publicKey: PUBLIC_KEY,
        })
            .then((result) => {
                console.log('SUCCESS!', result.status, result.text);
                setStatus('success');
                setFormData({
                    user_name: '',
                    user_email: '',
                    user_phone: '',
                    message: ''
                });
            }, (error) => {
                console.error('FAILED...', error);
                setStatus('error');
            });
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="bg-white rounded-3xl shadow-soft border border-slate-100 overflow-hidden animate-fadeIn">
                <div className="p-8 border-b border-slate-50 bg-slate-50/50">
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight-premium">Contact Support</h2>
                    <p className="text-slate-500 mt-2 font-medium">Have a question or need assistance? We're here to help.</p>
                </div>

                <div className="p-8">
                    {status === 'success' && (
                        <div className="mb-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700 animate-slideUp">
                            <CheckCircle size={20} className="flex-shrink-0" />
                            <p className="font-semibold text-sm">Your message has been sent to support successfully.</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 animate-slideUp">
                            <AlertCircle size={20} className="flex-shrink-0" />
                            <p className="font-semibold text-sm">Something went wrong. Please try again later.</p>
                        </div>
                    )}

                    <form ref={form} onSubmit={sendEmail} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <User size={14} className="text-blue-500" />
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="user_name"
                                    value={formData.user_name}
                                    onChange={handleChange}
                                    placeholder="Enter your name"
                                    className={`w-full bg-slate-50 border ${errors.user_name ? 'border-red-300' : 'border-slate-100'} focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none rounded-xl px-4 py-3 text-sm transition-premium placeholder-slate-400 font-medium`}
                                />
                                {errors.user_name && <p className="text-xs font-bold text-red-500 mt-1">{errors.user_name}</p>}
                            </div>

                            {/* Email Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <Mail size={14} className="text-blue-500" />
                                    Email ID
                                </label>
                                <input
                                    type="email"
                                    name="user_email"
                                    value={formData.user_email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    className={`w-full bg-slate-50 border ${errors.user_email ? 'border-red-300' : 'border-slate-100'} focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none rounded-xl px-4 py-3 text-sm transition-premium placeholder-slate-400 font-medium`}
                                />
                                {errors.user_email && <p className="text-xs font-bold text-red-500 mt-1">{errors.user_email}</p>}
                            </div>
                        </div>

                        {/* Phone Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <Phone size={14} className="text-blue-500" />
                                Phone Number
                            </label>
                            <input
                                type="text"
                                name="user_phone"
                                value={formData.user_phone}
                                onChange={handleChange}
                                placeholder="Enter your phone number (numbers only)"
                                className={`w-full bg-slate-50 border ${errors.user_phone ? 'border-red-300' : 'border-slate-100'} focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none rounded-xl px-4 py-3 text-sm transition-premium placeholder-slate-400 font-medium`}
                            />
                            {errors.user_phone && <p className="text-xs font-bold text-red-500 mt-1">{errors.user_phone}</p>}
                        </div>

                        {/* Message Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <MessageSquare size={14} className="text-blue-500" />
                                Message
                            </label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="How can we help you?"
                                rows="4"
                                className={`w-full bg-slate-50 border ${errors.message ? 'border-red-300' : 'border-slate-100'} focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none rounded-xl px-4 py-3 text-sm transition-premium placeholder-slate-400 font-medium resize-none`}
                            />
                            {errors.message && <p className="text-xs font-bold text-red-500 mt-1">{errors.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'sending'}
                            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-premium flex items-center justify-center gap-3 group active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed`}
                        >
                            {status === 'sending' ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Sending...</span>
                                </>
                            ) : (
                                <>
                                    <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    <span>Submit Message</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactSupport;
