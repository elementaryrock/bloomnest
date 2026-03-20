import React, { useState } from 'react';
import { 
    Sparkles, Loader2, BookOpen, ChevronLeft, ChevronRight, RotateCcw, Star,
    ArrowLeft, BookText, LayoutGrid, ImageIcon, Wand2, AlertCircle
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
            // Call the backend API to generate the full storybook
            const response = await api.post('/narrative/generate', {
                childName: childContext.trim(),
                scenario: `Based on: ${favoriteContext.trim()}. ${theme.trim() ? `Themes: ${theme.trim()}` : ''}`,
                comfortObject: favoriteContext.split(',')[0].trim(), // Use first favorite thing as comfort object
            });

            if (response.data.success) {
                const narrativeData = response.data.data;
                
                // Align backend data with frontend story state
                const storyWithImages = {
                    title: `${childContext.trim()}'s Big Adventure`, // Backend doesn't return a title yet, so we'll generate one
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

    // --- Render: Storybook View ---
    if (story && !isGenerating) {
        const pages = story.pages || [];
        const page = pages[currentPage];
        const totalPages = pages.length;

        return (
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => setStory(null)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors"
                >
                    <ArrowLeft size={18} />
                    <span className="text-sm font-medium">Back to Create</span>
                </button>

                {/* Story Header */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                        <BookOpen className="text-purple-600" size={24} />
                        {story.title}
                    </h2>
                    <div className="mt-4 inline-flex rounded-2xl border border-gray-200 bg-white p-1 shadow-sm">
                        <button
                            onClick={() => setStoryLayout('storybook')}
                            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                                storyLayout === 'storybook'
                                    ? 'bg-purple-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <BookText size={16} />
                            Storybook
                        </button>
                        <button
                            onClick={() => setStoryLayout('grid')}
                            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                                storyLayout === 'grid'
                                    ? 'bg-purple-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <LayoutGrid size={16} />
                            Grid
                        </button>
                    </div>
                </div>

                {storyLayout === 'grid' ? (
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {pages.map((storyPage, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setCurrentPage(idx);
                                    setStoryLayout('storybook');
                                }}
                                className="overflow-hidden rounded-3xl border border-gray-100 bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                            >
                                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50">
                                    {storyPage.imageUrl ? (
                                        <img
                                            src={storyPage.imageUrl}
                                            alt={`Page ${idx + 1}`}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                                            <ImageIcon size={56} />
                                        </div>
                                    )}
                                    <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-purple-700 shadow-sm">
                                        Page {idx + 1}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <p className="line-clamp-3 text-sm font-medium leading-6 text-gray-700">
                                        {storyPage.narrativeText}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                        {page && (
                            <div className="relative">
                                <div className="aspect-square bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center overflow-hidden">
                                    {page.imageUrl ? (
                                        <img
                                            src={page.imageUrl}
                                            alt={`Page ${currentPage + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full text-gray-400">
                                            <ImageIcon size={64} />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm text-sm font-semibold text-purple-700">
                                    {currentPage + 1} / {totalPages}
                                </div>
                            </div>
                        )}

                        <div className="p-6 lg:p-8 bg-gradient-to-r from-purple-50 to-pink-50">
                            <p className="text-lg lg:text-xl text-gray-800 leading-relaxed font-medium text-center">
                                {page?.narrativeText || 'Loading...'}
                            </p>
                        </div>

                        <div className="p-4 flex items-center justify-between border-t border-gray-100">
                            <button
                                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                disabled={currentPage === 0}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium text-sm"
                            >
                                <ChevronLeft size={18} />
                                Previous
                            </button>

                            <div className="flex gap-2">
                                {pages.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentPage(idx)}
                                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                                            idx === currentPage
                                                ? 'bg-purple-600 scale-125'
                                                : 'bg-gray-300 hover:bg-gray-400'
                                        }`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                                disabled={currentPage === totalPages - 1}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium text-sm"
                            >
                                Next
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {storyLayout === 'storybook' && currentPage === totalPages - 1 && (
                    <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 text-center border border-yellow-100">
                        <div className="flex justify-center gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="text-yellow-400" size={20} fill="currentColor" />
                            ))}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">The End!</h3>
                        <p className="text-gray-600 text-sm">What a wonderful story!</p>
                    </div>
                )}
            </div>
        );
    }

    // --- Render: Generating View ---
    if (isGenerating) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="relative mb-8">
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-lg shadow-purple-200 animate-pulse">
                            <Wand2 className="text-white" size={40} />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                            <Sparkles className="text-white" size={16} />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Creating Magic</h2>
                    <p className="text-gray-500 mb-6">{progress}</p>
                    <div className="flex justify-center gap-1.5">
                        {[0, 1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="w-3 h-3 rounded-full bg-purple-400"
                                style={{
                                    animation: `nnpulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                                    opacity: 0.4
                                }}
                            />
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-6">This may take a couple of minutes</p>

                    {/* Show story preview while images are generating */}
                    {story && (
                        <div className="mt-8 text-left bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-3 text-center">{story.title}</h3>
                            <div className="space-y-2">
                                {story.pages.map((p, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm">
                                        {p.imageUrl ? (
                                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                <span className="text-green-600 text-xs">&#10003;</span>
                                            </div>
                                        ) : (
                                            <Loader2 className="animate-spin text-purple-400 flex-shrink-0" size={16} />
                                        )}
                                        <span className="text-gray-600 truncate">Page {i + 1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <style>{`
                        @keyframes nnpulse {
                            0%, 100% { opacity: 0.4; transform: scale(1); }
                            50% { opacity: 1; transform: scale(1.2); }
                        }
                    `}</style>
                </div>
            </div>
        );
    }

    // --- Render: Form View (Default) ---
    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="mb-4">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-sm">
                            <Sparkles className="text-white" size={20} />
                        </div>
                        Neural Narrative
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm">
                        Create a personalized AI-illustrated storybook for your child
                    </p>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100 flex items-start gap-3">
                    <Sparkles className="text-purple-500 flex-shrink-0 mt-0.5" size={18} />
                    <p className="text-sm text-purple-800 leading-relaxed">
                        <span className="font-semibold">How it works:</span> Describe your child, their favorite things, and an optional theme. AI will write a 5-page story and illustrate every page.
                    </p>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                    <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {/* Form */}
            <div className="space-y-6">
                {/* Child Description */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                        <BookOpen size={16} className="text-purple-500" />
                        About the Child
                    </label>
                    <p className="text-xs text-gray-400 mb-3">Describe your child — name, age, personality, appearance, etc.</p>
                    <textarea
                        value={childContext}
                        onChange={(e) => setChildContext(e.target.value)}
                        placeholder="e.g., A cheerful 5-year-old girl named Aria with curly brown hair and big brown eyes. She's shy but very curious..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-gray-800 placeholder:text-gray-400 resize-none"
                    />
                </div>

                {/* Favorite Things */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                        <Star size={16} className="text-pink-500" />
                        Favorite Things
                    </label>
                    <p className="text-xs text-gray-400 mb-3">What does your child love? Animals, toys, characters, activities...</p>
                    <textarea
                        value={favoriteContext}
                        onChange={(e) => setFavoriteContext(e.target.value)}
                        placeholder="e.g., Loves butterflies, painting, her stuffed bunny named Mochi, and strawberry ice cream..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all text-gray-800 placeholder:text-gray-400 resize-none"
                    />
                </div>

                {/* Theme / Learning Goal */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                        <Wand2 size={16} className="text-purple-500" />
                        Theme / Learning Goal
                    </label>
                    <p className="text-xs text-gray-400 mb-3">Optional — a lesson or theme for the story</p>
                    <input
                        type="text"
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        placeholder="e.g., Overcoming fear of the dark, making new friends, sharing..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-gray-800 placeholder:text-gray-400"
                    />
                </div>

                {/* Generate Button */}
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !childContext.trim() || !favoriteContext.trim()}
                    className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold text-lg shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all flex items-center justify-center gap-3"
                >
                    <Wand2 size={22} />
                    Create Story
                </button>
            </div>
        </div>
    );
};

export default NeuralNarrative;
