import React, { useState } from 'react';
import { 
    Sparkles, Loader2, BookOpen, ChevronLeft, ChevronRight, RotateCcw, Star,
    ArrowLeft, BookText, LayoutGrid, ImageIcon, Wand2, AlertCircle, History,
    User, Heart, Lightbulb, PenTool, Image as LucideImage
} from 'lucide-react';
import api from '../../services/api';

const NeuralNarrative = () => {
    // Inputs
    const [childContext, setChildContext] = useState('');
    const [favoriteContext, setFavoriteContext] = useState('');
    const [theme, setTheme] = useState('');

    // Status
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState('');
    const [error, setError] = useState('');

    // Output
    const [story, setStory] = useState(null);

    // UI
    const [currentPage, setCurrentPage] = useState(0);
    const [storyLayout, setStoryLayout] = useState('grid');

    // History
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const response = await api.get('/narrative/history');
            if (response.data.success) {
                setHistory(response.data.data);
            }
        } catch (error) {
            console.error('History error:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const openFromHistory = (narrative) => {
        const aiTitle = narrative.pages?.[0]?.storyTitle;
        const storyWithImages = {
            title: aiTitle || `${narrative.childName}'s Story`,
            pages: narrative.pages.map(page => ({
                narrativeText: page.caption,
                imageUrl: page.imageUrl
            }))
        };
        setStory(storyWithImages);
        setCurrentPage(0);
        setStoryLayout('grid');
        setShowHistory(false);
    };

    const handleGenerate = async () => {
        if (!childContext.trim()) {
            setError("Please describe your child.");
            return;
        }
        if (!favoriteContext.trim()) {
            setError("Please describe your child's favorite things.");
            return;
        }

        setIsGenerating(true);
        setError('');
        setStory(null);
        setProgress('Connecting to magical story server...');

        try {
            const response = await api.post('/narrative/generate', {
                childName: childContext.trim(),
                scenario: favoriteContext.trim(),
                theme: theme.trim(),
                comfortObject: favoriteContext.split(',')[0].trim(),
            });

            if (response.data.success) {
                const narrativeData = response.data.data;
                // Use AI-generated title from the first page, with fallback
                const aiTitle = narrativeData.pages?.[0]?.storyTitle;
                const storyWithImages = {
                    title: aiTitle || `${childContext.trim()}'s Story`,
                    pages: narrativeData.pages.map(page => ({
                        narrativeText: page.caption,
                        imageUrl: page.imageUrl
                    }))
                };
                
                setStory(storyWithImages);
                setProgress('');
                setCurrentPage(0);
                setStoryLayout('grid');
            } else {
                throw new Error(response.data.error?.message || 'Failed to generate story');
            }

        } catch (err) {
            console.error('Generation error:', err);
            setError(err.response?.data?.error?.message || err.message || 'Failed to generate story. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    // --- Render: History View ---
    if (showHistory) {
        return (
            <div className="max-w-5xl mx-auto animate-fadeIn">
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => setShowHistory(false)}
                        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-premium group"
                    >
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-blue-200 group-hover:bg-blue-50 transition-premium">
                            <ArrowLeft size={16} />
                        </div>
                        <span className="text-sm font-bold tracking-tight-premium">Return to Creation</span>
                    </button>
                    
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight-premium flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-soft">
                            <History size={20} />
                        </div>
                        Narrative Archives
                    </h2>
                </div>

                {loadingHistory ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="relative w-12 h-12 mb-4">
                            <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Opening Vault...</p>
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookOpen size={40} className="text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">No Stories Archived Yet</h3>
                        <p className="text-slate-500 max-w-xs mx-auto text-sm font-medium">Create your first personalized story to see it appear here in your collection.</p>
                        <button 
                            onClick={() => setShowHistory(false)}
                            className="mt-6 font-bold text-blue-600 hover:text-blue-700 text-sm"
                        >
                            Start Creating &rarr;
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {history.map((item) => (
                            <button
                                key={item._id}
                                onClick={() => openFromHistory(item)}
                                className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-blue-300 hover:shadow-hover transition-premium text-left group flex flex-col h-full"
                            >
                                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-slate-100">
                                    {item.pages?.[0]?.imageUrl ? (
                                        <img
                                            src={item.pages[0].imageUrl}
                                            alt=""
                                            className="w-full h-full object-cover group-hover:scale-105 transition-premium"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-slate-300">
                                            <BookOpen size={32} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-premium flex items-end p-4">
                                        <span className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                            Open Story <ChevronRight size={14} />
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-premium mb-1">
                                        {item.childName}'s Tale
                                    </h3>
                                    <p className="text-xs text-slate-500 line-clamp-2 font-medium leading-relaxed mb-3">
                                        {item.scenario}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-md bg-blue-50 flex items-center justify-center">
                                            <BookText size={12} className="text-blue-500" />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                            {item.pages?.length || 0} Pages
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                        {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // --- Render: Storybook View ---
    if (story && !isGenerating) {
        const pages = story.pages || [];
        const page = pages[currentPage];
        const totalPages = pages.length;

        return (
            <div className="max-w-6xl mx-auto animate-fadeIn">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <button
                        onClick={() => setStory(null)}
                        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-premium group"
                    >
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-blue-200 group-hover:bg-blue-50 transition-premium">
                            <ArrowLeft size={16} />
                        </div>
                        <span className="text-sm font-bold tracking-tight-premium">New Story</span>
                    </button>

                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl p-1 shadow-soft">
                        <button
                            onClick={() => setStoryLayout('grid')}
                            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-premium ${
                                storyLayout === 'grid'
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            <LayoutGrid size={14} strokeWidth={2.5} />
                            Overview
                        </button>
                        <button
                            onClick={() => setStoryLayout('storybook')}
                            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-premium ${
                                storyLayout === 'storybook'
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            <BookOpen size={14} strokeWidth={2.5} />
                            Read
                        </button>
                    </div>
                </div>

                {/* Story Title */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight-premium flex items-center justify-center gap-3">
                        <Sparkles size={22} className="text-blue-500" />
                        {story.title}
                        <Sparkles size={22} className="text-blue-500" />
                    </h2>
                </div>

                {storyLayout === 'grid' ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {pages.map((storyPage, idx) => (
                            <div
                                key={idx}
                                onClick={() => {
                                    setCurrentPage(idx);
                                    setStoryLayout('storybook');
                                }}
                                className="group relative overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-soft transition-premium hover:shadow-hover hover:-translate-y-1 cursor-pointer"
                            >
                                <div className="aspect-square relative overflow-hidden bg-slate-100">
                                    {storyPage.imageUrl ? (
                                        <img
                                            src={storyPage.imageUrl}
                                            alt={`Page ${idx + 1}`}
                                            className="h-full w-full object-cover group-hover:scale-110 transition-premium duration-700"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-slate-300">
                                            <ImageIcon size={48} />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <div className="bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm border border-white/20">
                                            Page {idx + 1}
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-premium flex items-end p-6">
                                        <p className="text-white text-sm font-medium leading-relaxed line-clamp-2">
                                            {storyPage.narrativeText}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-[2.5rem] shadow-hover border border-slate-200 overflow-hidden relative">
                            <div className="grid lg:grid-cols-2 min-h-[500px]">
                                {/* Illustration Side */}
                                <div className="relative bg-slate-50 border-r border-slate-100 overflow-hidden">
                                    <div className="absolute inset-0">
                                        {page?.imageUrl ? (
                                            <img
                                                src={page.imageUrl}
                                                alt={`Page ${currentPage + 1}`}
                                                className="w-full h-full object-cover animate-fadeIn"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-slate-300">
                                                <LucideImage size={64} strokeWidth={1} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute top-6 left-6">
                                        <div className="bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-extrabold uppercase tracking-widest px-4 py-2 rounded-full shadow-sm border border-white/20">
                                            {currentPage + 1} of {totalPages}
                                        </div>
                                    </div>
                                </div>

                                {/* Text Side */}
                                <div className="p-8 lg:p-12 flex flex-col justify-between bg-white relative">
                                    <div className="space-y-6">
                                        <Sparkles className="text-blue-500 opacity-20" size={32} />
                                        <p className="text-xl lg:text-2xl text-slate-900 leading-relaxed font-bold tracking-tight-premium first-letter:text-5xl first-letter:font-extrabold first-letter:mr-3 first-letter:float-left first-letter:text-blue-600">
                                            {page?.narrativeText || 'Loading the magic...'}
                                        </p>
                                    </div>

                                    <div className="pt-12 flex items-center justify-between">
                                        <button
                                            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                            disabled={currentPage === 0}
                                            className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-premium group"
                                        >
                                            <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
                                        </button>

                                        <div className="flex gap-2">
                                            {pages.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setCurrentPage(idx)}
                                                    className={`h-1.5 rounded-full transition-premium ${
                                                        idx === currentPage
                                                            ? 'w-8 bg-blue-600'
                                                            : 'w-1.5 bg-slate-200 hover:bg-slate-300'
                                                    }`}
                                                />
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                                            disabled={currentPage === totalPages - 1}
                                            className="w-12 h-12 rounded-full bg-slate-900 border border-slate-900 flex items-center justify-center text-white hover:bg-blue-600 hover:border-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-premium group"
                                        >
                                            <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {currentPage === totalPages - 1 && (
                            <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-center text-white shadow-hover animate-fadeIn relative overflow-hidden group">
                                <div className="absolute -right-4 -top-4 text-white/10 group-hover:rotate-12 transition-transform duration-700">
                                    <Star size={160} fill="currentColor" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex justify-center gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="text-amber-300" size={24} fill="currentColor" />
                                        ))}
                                    </div>
                                    <h3 className="text-2xl font-extrabold tracking-tight-premium mb-2">The End of a Great Adventure!</h3>
                                    <p className="text-blue-100 font-medium">We hope {story.title.split("'")[0]} enjoyed this story.</p>
                                    <button 
                                        onClick={() => setStory(null)}
                                        className="mt-6 bg-white text-blue-600 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-50 transition-premium shadow-sm"
                                    >
                                        Create Another Tale
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // --- Render: Generating View ---
    if (isGenerating) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center animate-fadeIn relative overflow-hidden">
                {/* Background Magic Dust */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-[100px] animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-400/10 rounded-full blur-[100px] animate-pulse delay-700"></div>
                </div>

                <div className="relative z-10 text-center max-w-lg mx-auto px-6">
                    <div className="mb-10 relative">
                        <div className="w-24 h-24 mx-auto bg-slate-900 rounded-[2rem] flex items-center justify-center shadow-hover animate-bounce-subtle">
                            <Wand2 className="text-white animate-pulse" size={40} strokeWidth={1.5} />
                        </div>
                        <div className="absolute -top-2 -right-2 w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg animate-spin-slow">
                            <Sparkles className="text-white" size={20} />
                        </div>
                    </div>

                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight-premium mb-4">
                        Weaving a Magical Tale
                    </h2>
                    <p className="text-slate-500 font-medium mb-8 bg-slate-100/50 backdrop-blur-sm px-4 py-2 rounded-full inline-block">
                        {progress || "Brewing ideas and coloring pages..."}
                    </p>

                    <div className="flex justify-center gap-3 mb-10">
                        {[0, 1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="w-3 h-3 rounded-full bg-blue-600"
                                style={{
                                    animation: `premium-pulse 1.5s ease-in-out ${i * 0.2}s infinite`
                                }}
                            />
                        ))}
                    </div>

                    {story && (
                        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200 shadow-soft text-left animate-fadeIn">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                    <BookOpen size={18} strokeWidth={2.5} />
                                </div>
                                <h3 className="font-extrabold text-slate-900 tracking-tight-premium">Manifesting: {story.title}</h3>
                            </div>
                            <div className="grid grid-cols-5 gap-2">
                                {story.pages.map((p, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className={`h-1.5 rounded-full transition-premium ${p.imageUrl ? 'bg-emerald-500' : 'bg-slate-100 animate-pulse'}`}></div>
                                        <p className={`text-[10px] font-bold text-center uppercase tracking-tighter ${p.imageUrl ? 'text-emerald-600' : 'text-slate-400'}`}>
                                            {p.imageUrl ? 'Done' : `P${i+1}`}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <style>{`
                    @keyframes premium-pulse {
                        0%, 100% { opacity: 0.3; transform: scale(0.8); }
                        50% { opacity: 1; transform: scale(1.2); }
                    }
                    @keyframes bounce-subtle {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-10px); }
                    }
                    @keyframes spin-slow {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    .animate-bounce-subtle {
                        animation: bounce-subtle 3s ease-in-out infinite;
                    }
                    .animate-spin-slow {
                        animation: spin-slow 8s linear infinite;
                    }
                `}</style>
            </div>
        );
    }

    // --- Render: Form View (Default) ---
    return (
        <div className="max-w-5xl mx-auto animate-fadeIn pb-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-extrabold uppercase tracking-widest border border-blue-100">
                            NeuralNarrative™ Engine
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                            <Sparkles size={14} fill="currentColor" />
                            <span className="text-[10px] font-extrabold uppercase tracking-widest">AI Assisted</span>
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight-premium">
                        Create a <span className="text-blue-600">Masterpiece.</span>
                    </h1>
                    <p className="text-slate-500 mt-3 font-medium text-lg max-w-xl">
                        Turn your child's personality and interests into a professionally illustrated storybook in seconds.
                    </p>
                </div>
                
                <button
                    onClick={() => { setShowHistory(true); fetchHistory(); }}
                    className="group flex items-center gap-3 bg-white border border-slate-200 px-6 py-3.5 rounded-2xl font-bold text-slate-700 hover:border-blue-400 hover:shadow-hover transition-premium shadow-soft"
                >
                    <History size={18} className="group-hover:rotate-[-30deg] transition-transform duration-500" />
                    Archive
                </button>
            </div>

            {/* Main Interface Split */}
            <div className="grid lg:grid-cols-12 gap-8">
                {/* Form Side */}
                <div className="lg:col-span-8 space-y-6">
                    {error && (
                        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-start gap-3 animate-fadeIn">
                            <AlertCircle className="text-rose-500 flex-shrink-0 mt-0.5" size={18} />
                            <p className="text-sm font-bold text-rose-700">{error}</p>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Child Personality */}
                        <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-soft focus-within:border-blue-400 transition-premium">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <User size={22} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-slate-900 tracking-tight-premium">The Hero</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Character details</p>
                                </div>
                            </div>
                            <textarea
                                value={childContext}
                                onChange={(e) => setChildContext(e.target.value)}
                                placeholder="Name, age, personality traits, and physical appearance..."
                                rows={4}
                                className="w-full bg-slate-50 border-none focus:ring-0 text-slate-800 placeholder:text-slate-400 font-medium text-sm leading-relaxed rounded-2xl p-4 resize-none transition-premium"
                            />
                        </div>

                        {/* Favorites */}
                        <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-soft focus-within:border-pink-400 transition-premium">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600">
                                    <Heart size={22} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-slate-900 tracking-tight-premium">Inspiration</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Favorite things</p>
                                </div>
                            </div>
                            <textarea
                                value={favoriteContext}
                                onChange={(e) => setFavoriteContext(e.target.value)}
                                placeholder="Toys, animals, colors, and things that make them smile..."
                                rows={4}
                                className="w-full bg-slate-50 border-none focus:ring-0 text-slate-800 placeholder:text-slate-400 font-medium text-sm leading-relaxed rounded-2xl p-4 resize-none transition-premium"
                            />
                        </div>
                    </div>

                    {/* Theme / Goal */}
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-soft focus-within:border-amber-400 transition-premium">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                                <Lightbulb size={22} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-slate-900 tracking-tight-premium">Story Arc</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Optional theme or lesson</p>
                            </div>
                        </div>
                        <input
                            type="text"
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            placeholder="e.g., Learning to share, a trip to the moon, overcoming fears..."
                            className="w-full bg-slate-50 border-none focus:ring-0 text-slate-800 placeholder:text-slate-400 font-medium text-sm rounded-2xl p-4 transition-premium"
                        />
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !childContext.trim() || !favoriteContext.trim()}
                        className="w-full group relative flex items-center justify-center gap-3 bg-slate-900 text-white py-5 rounded-[2rem] font-extrabold text-lg overflow-hidden shadow-hover hover:shadow-blue-200 transition-premium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-premium"></div>
                        <span className="relative z-10 flex items-center gap-3">
                            <PenTool size={22} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform" />
                            Generate Personalized Narrative
                        </span>
                    </button>
                </div>

                {/* Info Side */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-soft relative overflow-hidden group">
                        <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-125 transition-transform duration-700">
                            <Sparkles size={120} />
                        </div>
                        <h3 className="text-xl font-extrabold tracking-tight-premium mb-6 flex items-center gap-3">
                            How it Works
                        </h3>
                        <div className="space-y-6">
                            {[
                                { step: '01', title: 'Contextualization', desc: 'Our AI analyzes the child\'s unique traits and clinical focus.' },
                                { step: '02', title: 'Narrative Synthesis', desc: 'A custom 5-page story is written with specific vocabulary goals.' },
                                { step: '03', title: 'Neural Rendering', desc: 'Each page is illustrated using state-of-the-art diffusion models.' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <span className="text-blue-500 font-extrabold text-sm font-mono pt-1">{item.step}</span>
                                    <div>
                                        <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                                        <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-soft">
                        <h3 className="text-lg font-extrabold text-slate-900 tracking-tight-premium mb-4">Pro Tips</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-xs text-slate-500 font-medium leading-relaxed">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                                Use descriptive adjectives like "brave", "sparkly", or "energetic".
                            </li>
                            <li className="flex items-start gap-3 text-xs text-slate-500 font-medium leading-relaxed">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                                Mention specific objects like "a red tricycle" or "a blue blanket".
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NeuralNarrative;

