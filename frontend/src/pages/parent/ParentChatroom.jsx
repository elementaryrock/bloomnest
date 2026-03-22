import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import dayjs from 'dayjs';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
    Send, UserCircle2, Loader2, Users, MessageSquare, Heart,
    Sparkles, ChevronRight, Hash, ArrowLeft, X
} from 'lucide-react';

const ROOMS = [
    { id: 'general', label: 'General', emoji: '💬', color: 'blue', desc: 'Open discussion for all parents' },
    { id: 'speech', label: 'Speech', emoji: '🗣️', color: 'violet', desc: 'Speech therapy community' },
    { id: 'ot', label: 'OT', emoji: '🧩', color: 'amber', desc: 'Occupational therapy parents' },
    { id: 'pt', label: 'PT', emoji: '🏃', color: 'emerald', desc: 'Physical therapy support' },
    { id: 'psychology', label: 'Psychology', emoji: '🧠', color: 'rose', desc: 'Psychology & behavioral' },
    { id: 'ei', label: 'EI', emoji: '🌱', color: 'teal', desc: 'Early intervention group' },
];

const ROOM_COLORS = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', accent: 'bg-blue-600', light: 'bg-blue-100', ring: 'ring-blue-200' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', accent: 'bg-violet-600', light: 'bg-violet-100', ring: 'ring-violet-200' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', accent: 'bg-amber-600', light: 'bg-amber-100', ring: 'ring-amber-200' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', accent: 'bg-emerald-600', light: 'bg-emerald-100', ring: 'ring-emerald-200' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', accent: 'bg-rose-600', light: 'bg-rose-100', ring: 'ring-rose-200' },
    teal: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', accent: 'bg-teal-600', light: 'bg-teal-100', ring: 'ring-teal-200' },
};

const THERAPY_LABELS = {
    Psychology: '🧠 Psychology',
    OT: '🧩 Occupational Therapy',
    PT: '🏃 Physical Therapy',
    Speech: '🗣️ Speech Therapy',
    EI: '🌱 Early Intervention',
};

const DIAGNOSIS_LABELS = {
    ASD: 'Autism Spectrum',
    SLD: 'Learning Disability',
    ID: 'Intellectual Disability',
    CP: 'Cerebral Palsy',
};

const ParentChatroom = () => {
    const { user } = useAuth();
    const [activeRoom, setActiveRoom] = useState('general');
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [showMatches, setShowMatches] = useState(false);
    const [matches, setMatches] = useState(null);
    const [loadingMatches, setLoadingMatches] = useState(false);
    
    // DM State
    const [dmRecipient, setDmRecipient] = useState(null);
    const [dmMessage, setDmMessage] = useState('');
    const [sendingDm, setSendingDm] = useState(false);

    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    const activeRoomData = ROOMS.find(r => r.id === activeRoom);
    const colors = ROOM_COLORS[activeRoomData?.color || 'blue'];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Fetch messages for current room
    const fetchMessages = async (room) => {
        setIsLoading(true);
        try {
            const response = await api.get(`/chat/messages/${room}`);
            if (response.data.success) {
                setMessages(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
            setMessages([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch parent matches
    const fetchMatches = async () => {
        setLoadingMatches(true);
        try {
            const response = await api.get('/chat/parent-matches');
            if (response.data.success) {
                setMatches(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch matches:', error);
        } finally {
            setLoadingMatches(false);
        }
    };

    // Initialize socket
    useEffect(() => {
        const socketInstance = io(
            import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000',
            { withCredentials: true }
        );

        socketRef.current = socketInstance;
        setSocket(socketInstance);

        socketInstance.on('connect', () => {
            console.log('Connected to socket server');
            socketInstance.emit('join_room', activeRoom);
        });

        socketInstance.on('receive_message', (message) => {
            if (message.room === activeRoom) {
                setMessages(prev => [...prev, message]);
            }
        });

        return () => {
            if (socketInstance) socketInstance.disconnect();
        };
    }, []);

    // Switch rooms
    useEffect(() => {
        fetchMessages(activeRoom);

        if (socketRef.current?.connected) {
            // Leave all rooms, join new one
            ROOMS.forEach(r => socketRef.current.emit('leave_room', r.id));
            socketRef.current.emit('join_room', activeRoom);
        }
    }, [activeRoom]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socketRef.current) return;

        socketRef.current.emit('send_message', {
            sender: user.id || user._id,
            content: newMessage,
            senderName: user.name || user.parentName || 'Parent',
            childName: user.childName || 'Child',
            room: activeRoom
        });
        setNewMessage('');
    };

    const handleSwitchRoom = (roomId) => {
        setActiveRoom(roomId);
        setShowMatches(false);
    };

    const handleSendDM = async (e) => {
        e.preventDefault();
        if (!dmMessage.trim() || !dmRecipient) return;

        setSendingDm(true);
        try {
            const res = await api.post('/chat/dm/send', {
                receiverId: dmRecipient._id,
                content: dmMessage
            });
            if (res.data.success) {
                setDmRecipient(null);
                setDmMessage('');
                alert('Message sent successfully! You can view replies in your Dashboard.');
            }
        } catch (err) {
            alert('Failed to send message. Please try again.');
        } finally {
            setSendingDm(false);
        }
    };

    // --- Render: Matches Panel ---
    const renderMatchesPanel = () => (
        <div className="h-full flex flex-col bg-white">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                <button
                    onClick={() => setShowMatches(false)}
                    className="lg:hidden p-1 text-gray-500 hover:text-gray-800 transition-colors"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-sm">
                    <Heart className="text-white" size={16} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-sm">Suggested Connections</h3>
                    <p className="text-xs text-gray-500">Parents on a similar journey</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingMatches ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin text-rose-400" size={28} />
                    </div>
                ) : !matches || matches.matches?.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <Users size={40} className="mx-auto mb-3 opacity-40" />
                        <p className="text-sm font-medium">No matches found yet</p>
                        <p className="text-xs mt-1">Matches appear based on your child's therapy bookings</p>
                    </div>
                ) : (
                    <>
                        {matches.myTherapyTypes?.length > 0 && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100 mb-2">
                                <p className="text-xs font-semibold text-blue-700 mb-1.5">Your therapy types</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {matches.myTherapyTypes.map(t => (
                                        <span key={t} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                            {THERAPY_LABELS[t] || t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {matches.matches.map((match) => (
                            <div
                                key={match._id}
                                className="bg-white rounded-xl p-4 border border-gray-100 hover:border-rose-200 hover:shadow-sm transition-all group flex flex-col"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center flex-shrink-0 text-rose-600 font-bold text-sm ring-2 ring-rose-50">
                                        {match.parentName?.charAt(0)?.toUpperCase() || 'P'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 text-sm truncate">
                                            {match.parentName}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            Parent of {match.childName}{match.childAge ? `, ${match.childAge}y` : ''}
                                        </p>
                                    </div>
                                </div>

                                {match.sharedTherapyTypes?.length > 0 && (
                                    <div className="mt-2.5">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Shared Therapies</p>
                                        <div className="flex flex-wrap gap-1">
                                            {match.sharedTherapyTypes.map(t => (
                                                <span key={t} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-medium border border-emerald-100">
                                                    {THERAPY_LABELS[t] || t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {match.sharedDiagnosis?.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Shared Diagnosis</p>
                                        <div className="flex flex-wrap gap-1">
                                            {match.sharedDiagnosis.map(d => (
                                                <span key={d} className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded-full text-[11px] font-medium border border-violet-100">
                                                    {DIAGNOSIS_LABELS[d] || d}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="mt-4 flex gap-2 pt-3 border-t border-gray-50">
                                    <button
                                        onClick={() => setDmRecipient(match)}
                                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <MessageSquare size={14} />
                                        Message
                                    </button>
                                    {match.parentPhone && (
                                        <a
                                            href={`https://wa.me/${match.parentPhone.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(match.parentName)}!%20I%20saw%20we're%20both%20parents%20at%20Bloomnest.`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-medium py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 text-center"
                                        >
                                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                                            </svg>
                                             WhatsApp
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* DM Compose Modal (Inline) */}
            {dmRecipient && (
                <div className="absolute inset-x-0 bottom-0 bg-white border-t border-gray-100 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-t-2xl z-20">
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-sm font-semibold text-gray-800">
                            Message <span className="text-blue-600">{dmRecipient.parentName}</span>
                        </p>
                        <button onClick={() => setDmRecipient(null)} className="text-gray-400 hover:text-rose-500 transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                    <form onSubmit={handleSendDM} className="flex gap-2">
                        <input
                            type="text"
                            value={dmMessage}
                            onChange={(e) => setDmMessage(e.target.value)}
                            placeholder="Type a polite hello..."
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={!dmMessage.trim() || sendingDm}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center min-w-[80px]"
                        >
                            {sendingDm ? <Loader2 size={16} className="animate-spin" /> : 'Send'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );

    // --- Main Render ---
    return (
        <div className="flex flex-col h-[calc(100vh-120px)] max-h-[850px] bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden relative">
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <MessageSquare size={20} />
                            Parents Lounge
                        </h2>
                        <p className="text-sm text-blue-100 mt-0.5">Connect with parents on a similar journey</p>
                    </div>
                    <button
                        onClick={() => { setShowMatches(!showMatches); if (!matches) fetchMatches(); }}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                            showMatches
                                ? 'bg-white text-indigo-700 shadow-sm'
                                : 'bg-white/15 hover:bg-white/25 text-white'
                        }`}
                    >
                        <Users size={16} />
                        <span className="hidden sm:inline">Suggested</span>
                        <span className="sm:hidden">Match</span>
                    </button>
                </div>

                {/* Room Tabs */}
                <div className="flex gap-1.5 mt-4 overflow-x-auto pb-1 -mb-1 scrollbar-hide">
                    {ROOMS.map(room => (
                        <button
                            key={room.id}
                            onClick={() => handleSwitchRoom(room.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                                activeRoom === room.id
                                    ? 'bg-white text-indigo-700 shadow-sm'
                                    : 'text-white/80 hover:bg-white/15 hover:text-white'
                            }`}
                        >
                            <span>{room.emoji}</span>
                            {room.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Chat Area */}
                <div className={`flex-1 flex flex-col min-w-0 ${showMatches ? 'hidden lg:flex' : 'flex'}`}>
                    {/* Room info bar */}
                    <div className={`px-5 py-2.5 border-b border-gray-100 flex items-center gap-2 ${colors.bg}`}>
                        <Hash size={14} className={colors.text} />
                        <span className={`text-sm font-semibold ${colors.text}`}>{activeRoomData?.label}</span>
                        <span className="text-xs text-gray-400 ml-1">— {activeRoomData?.desc}</span>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gray-50/50 relative">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-full">
                                <Loader2 className="h-7 w-7 animate-spin text-blue-400" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-center py-16 text-gray-400">
                                <div className={`w-14 h-14 mx-auto mb-3 rounded-2xl ${colors.light} flex items-center justify-center`}>
                                    <MessageSquare size={24} className={colors.text} />
                                </div>
                                <p className="font-medium text-gray-600">No messages in #{activeRoomData?.label} yet</p>
                                <p className="text-sm mt-1">Be the first to start the conversation!</p>
                            </div>
                        ) : (
                            messages.map((msg, index) => {
                                const userId = user.id || user._id;
                                const isMe = msg.sender?._id === userId || msg.sender === userId;
                                const parentName = msg.sender?.parentName || msg.senderName || 'Parent';
                                const childName = msg.sender?.childName || msg.childName || '';

                                return (
                                    <div key={msg._id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`flex max-w-[75%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                                            {!isMe && (
                                                <div className={`w-8 h-8 rounded-full ${colors.light} flex items-center justify-center flex-shrink-0 ring-2 ${colors.ring}`}>
                                                    <span className={`${colors.text} font-semibold text-xs`}>
                                                        {parentName.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}

                                            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                <div className="flex items-baseline gap-2 mb-0.5 px-1">
                                                    <span className="text-xs font-semibold text-gray-700">
                                                        {isMe ? 'You' : parentName}
                                                    </span>
                                                    {!isMe && childName && (
                                                        <span className="text-[11px] text-gray-400">parent of {childName}</span>
                                                    )}
                                                    <span className="text-[11px] text-gray-400">
                                                        {dayjs(msg.createdAt).format('h:mm A')}
                                                    </span>
                                                </div>

                                                <div
                                                    className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                                                        isMe
                                                            ? `${colors.accent} text-white rounded-br-sm`
                                                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                                                    }`}
                                                >
                                                    <p className="text-[14px] leading-relaxed break-words">{msg.content}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <form onSubmit={handleSendMessage} className="flex gap-3">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder={`Message #${activeRoomData?.label || 'general'}...`}
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all text-sm"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className={`${colors.accent} text-white p-3 px-5 rounded-xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-medium text-sm`}
                            >
                                <Send size={16} />
                                <span className="hidden sm:inline">Send</span>
                            </button>
                        </form>
                    </div>
                </div>

                {/* Matches Sidebar */}
                {showMatches && (
                    <div className="w-full lg:w-80 lg:border-l border-gray-100 flex-shrink-0 relative">
                        {renderMatchesPanel()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ParentChatroom;
