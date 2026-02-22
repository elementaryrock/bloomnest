import React, { useState, useEffect } from 'react';
import {
    BookOpen,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    Upload,
    Loader2,
    Image as ImageIcon,
    Star,
    Heart,
    Wand2,
    History,
    ArrowLeft,
    Shield,
    Smile
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';

const PRESET_SCENARIOS = [
    { label: '🦷 Going to the Dentist', value: 'Going to the dentist for a checkup' },
    { label: '💇 Getting a Haircut', value: 'Getting a haircut at the salon' },
    { label: '🏥 Visiting the Doctor', value: 'Visiting the doctor for a checkup' },
    { label: '🏫 First Day of School', value: 'First day at a new school' },
    { label: '✈️ Taking an Airplane', value: 'Taking an airplane for the first time' },
    { label: '🏊 Going Swimming', value: 'Going to the swimming pool' },
    { label: '🐕 Meeting a Dog', value: 'Meeting a friendly dog for the first time' },
    { label: '🌙 Sleeping Alone', value: 'Sleeping alone in their own room' },
];

const COMFORT_OBJECTS = [
    '🧸 Teddy Bear', '🦸 Superhero', '🧚 Fairy', '🐶 Puppy',
    '🦄 Unicorn', '🐱 Kitty', '🤖 Robot', '🧙 Wizard'
];

const NeuralNarrative = () => {
    const { user } = useAuth();
    const [currentView, setCurrentView] = useState('form'); // 'form', 'generating', 'storybook', 'history'
    const [childName, setChildName] = useState(user?.childName || '');
    const [scenario, setScenario] = useState('');
    const [customScenario, setCustomScenario] = useState('');
    const [comfortObject, setComfortObject] = useState('');
    const [customComfort, setCustomComfort] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [storybook, setStorybook] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [generationProgress, setGenerationProgress] = useState('');

    const handleGenerate = async () => {
        const finalScenario = scenario === 'custom' ? customScenario : scenario;
        const finalComfort = comfortObject === 'custom' ? customComfort : comfortObject.replace(/^[^\s]+\s/, '');

        if (!childName.trim()) {
            toast.error("Please enter your child's name");
            return;
        }
        if (!finalScenario.trim()) {
            toast.error('Please select or enter a scenario');
            return;
        }

        setIsGenerating(true);
        setCurrentView('generating');
        setGenerationProgress('Creating your personalized story...');

        try {
            const progressMessages = [
                'Writing the story outline...',
                'Designing the illustrations...',
                'Adding magical details...',
                'Bringing the story to life...',
                'Almost there! Finishing touches...'
            ];
            let msgIndex = 0;
            const progressInterval = setInterval(() => {
                msgIndex = (msgIndex + 1) % progressMessages.length;
                setGenerationProgress(progressMessages[msgIndex]);
            }, 8000);

            const response = await api.post('/narrative/generate', {
                childName: childName.trim(),
                scenario: finalScenario.trim(),
                comfortObject: finalComfort.trim()
            }, { timeout: 120000 });

            clearInterval(progressInterval);

            if (response.data.success) {
                setStorybook(response.data.data);
                setCurrentPage(0);
                setCurrentView('storybook');
                toast.success('Your storybook is ready! 🎉');
            } else {
                throw new Error(response.data.error?.message || 'Generation failed');
            }
        } catch (error) {
            console.error('Generation error:', error);
            toast.error(error.response?.data?.error?.message || 'Failed to generate storybook. Please try again.');
            setCurrentView('form');
        } finally {
            setIsGenerating(false);
        }
    };

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const response = await api.get('/narrative/history');
            if (response.data.success) {
                setHistory(response.data.data);
            }
        } catch (error) {
            console.error('History error:', error);
            toast.error('Failed to load history');
        } finally {
            setLoadingHistory(false);
        }
    };

    const openFromHistory = (narrative) => {
        setStorybook(narrative);
        setCurrentPage(0);
        setCurrentView('storybook');
    };

    // --- Render: Generating View ---
    if (currentView === 'generating') {
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Creating Magic ✨</h2>
                    <p className="text-gray-500 mb-6">{generationProgress}</p>
                    <div className="flex justify-center gap-1.5">
                        {[0, 1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="w-3 h-3 rounded-full bg-purple-400"
                                style={{
                                    animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                                    opacity: 0.4
                                }}
                            />
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-6">This may take up to 2 minutes</p>
                </div>
            </div>
        );
    }

    // --- Render: Storybook View ---
    if (currentView === 'storybook' && storybook) {
        const pages = storybook.pages || [];
        const page = pages[currentPage];
        const totalPages = pages.length;

        return (
            <div className="max-w-4xl mx-auto">
                {/* Back button */}
                <button
                    onClick={() => setCurrentView('form')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors"
                >
                    <ArrowLeft size={18} />
                    <span className="text-sm font-medium">Back to Create</span>
                </button>

                {/* Story Header */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                        <BookOpen className="text-purple-600" size={24} />
                        {storybook.childName}'s Story
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">{storybook.scenario}</p>
                </div>

                {/* Storybook Card */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    {/* Image Area */}
                    {page && (
                        <div className="relative">
                            <div className="aspect-square bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center overflow-hidden">
                                <img
                                    src={page.imageUrl}
                                    alt={`Page ${page.pageNumber}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                                <div className="hidden items-center justify-center w-full h-full text-gray-400">
                                    <ImageIcon size={64} />
                                </div>
                            </div>

                            {/* Page number badge */}
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm text-sm font-semibold text-purple-700">
                                {currentPage + 1} / {totalPages}
                            </div>
                        </div>
                    )}

                    {/* Caption */}
                    <div className="p-6 lg:p-8 bg-gradient-to-r from-purple-50 to-pink-50">
                        <p className="text-lg lg:text-xl text-gray-800 leading-relaxed font-medium text-center">
                            {page?.caption || 'Loading...'}
                        </p>
                    </div>

                    {/* Navigation */}
                    <div className="p-4 flex items-center justify-between border-t border-gray-100">
                        <button
                            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                            disabled={currentPage === 0}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium text-sm"
                        >
                            <ChevronLeft size={18} />
                            Previous
                        </button>

                        {/* Page dots */}
                        <div className="flex gap-2">
                            {pages.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentPage(idx)}
                                    className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentPage
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

                {/* Story completion encouragement */}
                {currentPage === totalPages - 1 && (
                    <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 text-center border border-yellow-100">
                        <div className="flex justify-center gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="text-yellow-400" size={20} fill="currentColor" />
                            ))}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">The End! 🎉</h3>
                        <p className="text-gray-600 text-sm">What a wonderful story! {storybook.childName} is so brave!</p>
                    </div>
                )}
            </div>
        );
    }

    // --- Render: History View ---
    if (currentView === 'history') {
        return (
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => setCurrentView('form')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors"
                >
                    <ArrowLeft size={18} />
                    <span className="text-sm font-medium">Back to Create</span>
                </button>

                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <History className="text-purple-600" size={24} />
                    Story History
                </h2>

                {loadingHistory ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="animate-spin text-purple-500" size={32} />
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <BookOpen size={48} className="mx-auto mb-3 opacity-50" />
                        <p>No stories yet. Create your first one!</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {history.map((item) => (
                            <button
                                key={item._id}
                                onClick={() => openFromHistory(item)}
                                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all text-left group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                                        {item.pages?.[0]?.imageUrl ? (
                                            <img
                                                src={item.pages[0].imageUrl}
                                                alt=""
                                                className="w-full h-full object-cover rounded-xl"
                                            />
                                        ) : (
                                            <BookOpen className="text-purple-400" size={24} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate group-hover:text-purple-700 transition-colors">
                                            {item.childName}'s Story
                                        </h3>
                                        <p className="text-sm text-gray-500 truncate">{item.scenario}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(item.createdAt).toLocaleDateString('en-US', {
                                                month: 'short', day: 'numeric', year: 'numeric'
                                            })}
                                            {' · '}
                                            {item.pages?.length || 0} pages
                                            {item.status === 'failed' && (
                                                <span className="ml-2 text-red-400">· Failed</span>
                                            )}
                                        </p>
                                    </div>
                                    <ChevronRight className="text-gray-300 group-hover:text-purple-400 transition-colors" size={20} />
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // --- Render: Form View (Default) ---
    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-sm">
                                <Sparkles className="text-white" size={20} />
                            </div>
                            NeuralNarrative
                        </h1>
                        <p className="text-gray-500 mt-2 text-sm">
                            Create a personalized visual story to help your child prepare for new experiences
                        </p>
                    </div>
                    <button
                        onClick={() => { setCurrentView('history'); fetchHistory(); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium"
                    >
                        <History size={16} />
                        History
                    </button>
                </div>

                {/* Info banner */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100 flex items-start gap-3">
                    <Shield className="text-purple-500 flex-shrink-0 mt-0.5" size={18} />
                    <p className="text-sm text-purple-800 leading-relaxed">
                        <span className="font-semibold">See it to be it!</span> AI generates friendly cartoon scenes where your child is the hero, helping them visualize success in challenging situations.
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="space-y-6">
                {/* Child's Name */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                        <Smile size={16} className="text-purple-500" />
                        Child's Name
                    </label>
                    <input
                        type="text"
                        value={childName}
                        onChange={(e) => setChildName(e.target.value)}
                        placeholder="Enter your child's name"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-gray-800 placeholder:text-gray-400"
                    />
                </div>

                {/* Scenario Selection */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                        <BookOpen size={16} className="text-purple-500" />
                        What's the situation?
                    </label>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        {PRESET_SCENARIOS.map((s) => (
                            <button
                                key={s.value}
                                onClick={() => setScenario(s.value)}
                                className={`px-3 py-2.5 rounded-xl text-sm text-left transition-all border ${scenario === s.value
                                        ? 'bg-purple-50 border-purple-300 text-purple-700 font-medium shadow-sm'
                                        : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100 hover:border-gray-200'
                                    }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setScenario('custom')}
                        className={`w-full px-3 py-2.5 rounded-xl text-sm text-left transition-all border ${scenario === 'custom'
                                ? 'bg-purple-50 border-purple-300 text-purple-700 font-medium'
                                : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        ✏️ Write your own scenario...
                    </button>
                    {scenario === 'custom' && (
                        <input
                            type="text"
                            value={customScenario}
                            onChange={(e) => setCustomScenario(e.target.value)}
                            placeholder="e.g., Taking medicine, Going to the hospital..."
                            className="w-full mt-3 px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-gray-800 placeholder:text-gray-400"
                        />
                    )}
                </div>

                {/* Comfort Object */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                        <Heart size={16} className="text-pink-500" />
                        Comfort Object / Hero
                    </label>
                    <p className="text-xs text-gray-400 mb-3">Optional — a character or object that supports your child in the story</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {COMFORT_OBJECTS.map((obj) => (
                            <button
                                key={obj}
                                onClick={() => setComfortObject(comfortObject === obj ? '' : obj)}
                                className={`px-3 py-2 rounded-xl text-sm transition-all border ${comfortObject === obj
                                        ? 'bg-pink-50 border-pink-300 text-pink-700 font-medium shadow-sm'
                                        : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {obj}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setComfortObject(comfortObject === 'custom' ? '' : 'custom')}
                        className={`w-full px-3 py-2 rounded-xl text-sm text-left transition-all border ${comfortObject === 'custom'
                                ? 'bg-pink-50 border-pink-300 text-pink-700 font-medium'
                                : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        ✏️ Custom comfort object...
                    </button>
                    {comfortObject === 'custom' && (
                        <input
                            type="text"
                            value={customComfort}
                            onChange={(e) => setCustomComfort(e.target.value)}
                            placeholder="e.g., My blankie, Spider-Man, My pet rabbit..."
                            className="w-full mt-3 px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all text-gray-800 placeholder:text-gray-400"
                        />
                    )}
                </div>

                {/* Generate Button */}
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !childName.trim() || (!scenario || (scenario === 'custom' && !customScenario.trim()))}
                    className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold text-lg shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all flex items-center justify-center gap-3"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="animate-spin" size={22} />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Wand2 size={22} />
                            Create Story
                        </>
                    )}
                </button>
            </div>

            {/* Keyframe animation style */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
            `}</style>
        </div>
    );
};

export default NeuralNarrative;
