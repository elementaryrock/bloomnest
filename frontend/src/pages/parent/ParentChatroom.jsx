import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import dayjs from 'dayjs';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
    Plus, Globe, Mic, ArrowUp, UserCircle2, Loader2, Users,
    MessageSquare, Heart, ArrowLeft, X, Hash
} from 'lucide-react';

const ROOMS = [
    { id: 'general', label: 'General', emoji: '💬', desc: 'Open discussion' },
    { id: 'speech', label: 'Speech', emoji: '🗣️', desc: 'Speech therapy' },
    { id: 'ot', label: 'OT', emoji: '🧩', desc: 'Occupational therapy' },
    { id: 'pt', label: 'PT', emoji: '🏃', desc: 'Physical therapy' },
    { id: 'psychology', label: 'Psychology', emoji: '🧠', desc: 'Behavioral' },
    { id: 'ei', label: 'EI', emoji: '🌱', desc: 'Early intervention' },
];

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
    const [showInbox, setShowInbox] = useState(false);
    const [inbox, setInbox] = useState([]);
    const [loadingInbox, setLoadingInbox] = useState(false);
    const [activeDM, setActiveDM] = useState(null);
    const [dmMessages, setDmMessages] = useState([]);
    const [loadingDM, setLoadingDM] = useState(false);

    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    const activeRoomData = ROOMS.find(r => r.id === activeRoom);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchInbox = async () => {
        setLoadingInbox(true);
        try {
            const response = await api.get('/chat/dm/inbox');
            if (response.data.success) {
                setInbox(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch inbox:', error);
        } finally {
            setLoadingInbox(false);
        }
    };

    const handleOpenDM = async (partnerId, partnerName, partnerChildName) => {
        setActiveDM({ id: partnerId, name: partnerName, childName: partnerChildName });
        setActiveRoom(null);
        setShowMatches(false);
        setShowInbox(false);
        setDmMessages([]);
        setLoadingDM(true);
        try {
            const response = await api.get(`/chat/dm/conversation/${partnerId}`);
            if (response.data.success) {
                setDmMessages(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch DM conversation:', error);
        } finally {
            setLoadingDM(false);
        }
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

    const activeDMRef = useRef(activeDM);
    useEffect(() => { activeDMRef.current = activeDM; }, [activeDM]);
    const activeRoomRef = useRef(activeRoom);
    useEffect(() => { activeRoomRef.current = activeRoom; }, [activeRoom]);

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
            const uid = user?.id || user?._id;
            if (uid) socketInstance.emit('join_own_room', uid);
            if (activeRoomRef.current) socketInstance.emit('join_room', activeRoomRef.current);
        });

        socketInstance.on('receive_message', (message) => {
            if (message.room === activeRoomRef.current) {
                setMessages(prev => [...prev, message]);
            }
        });

        socketInstance.on('receive_direct_message', (dm) => {
            const uid = user?.id || user?._id;
            const partnerId = dm.sender._id === uid ? dm.receiver._id : dm.sender._id;

            if (activeDMRef.current?.id === partnerId) {
                setDmMessages(prev => [...prev, dm]);
            }
            fetchInbox();
        });

        return () => {
            if (socketInstance) socketInstance.disconnect();
        };
    }, []);

    // Switch rooms
    useEffect(() => {
        if (activeRoom) {
            fetchMessages(activeRoom);

            if (socketRef.current?.connected) {
                // Leave all rooms, join new one
                ROOMS.forEach(r => socketRef.current.emit('leave_room', r.id));
                socketRef.current.emit('join_room', activeRoom);
            }
        }
    }, [activeRoom]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, dmMessages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socketRef.current) return;

        if (activeDM) {
            socketRef.current.emit('send_direct_message', {
                senderId: user.id || user._id,
                receiverId: activeDM.id,
                content: newMessage,
            });
        } else {
            socketRef.current.emit('send_message', {
                sender: user.id || user._id,
                content: newMessage,
                senderName: user.name || user.parentName || 'Parent',
                childName: user.childName || 'Child',
                room: activeRoom
            });
        }
        setNewMessage('');
    };

    const handleSwitchRoom = (roomId) => {
        setActiveRoom(roomId);
        setActiveDM(null);
        setShowMatches(false);
        setShowInbox(false);
    };

    const renderInboxPanel = () => (
        <div className="h-full flex flex-col bg-[#fafafa]">
            <div className="px-5 py-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-gray-900 text-sm tracking-tight flex items-center gap-2">
                        <MessageSquare size={16} className="text-blue-500" />
                        Direct Messages
                    </h3>
                    <p className="text-[11px] text-gray-400 font-medium mt-1">Your personal conversations</p>
                </div>
                <button
                    onClick={() => setShowInbox(false)}
                    className="p-2 text-gray-400 hover:text-gray-900 bg-white shadow-sm border border-gray-100 rounded-full transition-all"
                >
                    <X size={14} strokeWidth={2.5} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingInbox ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin text-gray-300" size={24} />
                    </div>
                ) : !inbox || inbox.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <MessageSquare size={32} strokeWidth={1.5} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-medium">No messages yet</p>
                        <p className="text-[11px] mt-1 opacity-70">Check out Matches to find other parents!</p>
                    </div>
                ) : (
                    inbox.map((chat) => (
                        <div
                            key={chat.partnerId}
                            onClick={() => handleOpenDM(chat.partnerId, chat.partnerName, chat.partnerChildName)}
                            className="bg-white rounded-xl p-4 border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer flex items-center gap-3"
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-sm">
                                {chat.partnerName?.charAt(0)?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <p className="font-semibold text-gray-900 text-sm truncate tracking-tight">
                                        {chat.partnerName}
                                    </p>
                                    <span className="text-[10px] text-gray-400 w-12 text-right">
                                        {new Date(chat.lastMessageAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 truncate pr-2">
                                    {chat.isLastFromMe ? 'You: ' : ''}{chat.lastMessage}
                                </p>
                            </div>
                            {chat.unreadCount > 0 && (
                                <div className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
                                    {chat.unreadCount}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    // --- Render: Matches Panel (Sleek Aesthetic) ---
    const renderMatchesPanel = () => (
        <div className="h-full flex flex-col bg-[#fafafa]">
            <div className="px-5 py-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-gray-900 text-sm tracking-tight flex items-center gap-2">
                        <Users size={16} className="text-gray-400" />
                        Suggested Connections
                    </h3>
                    <p className="text-[11px] text-gray-400 font-medium mt-1">Parents on a similar journey</p>
                </div>
                <button
                    onClick={() => setShowMatches(false)}
                    className="p-2 text-gray-400 hover:text-gray-900 bg-white shadow-sm border border-gray-100 rounded-full transition-all"
                >
                    <X size={14} strokeWidth={2.5} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingMatches ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin text-gray-300" size={24} />
                    </div>
                ) : !matches || matches.matches?.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <Users size={32} strokeWidth={1.5} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-medium">No matches found</p>
                    </div>
                ) : (
                    <>
                        {matches.myTherapyTypes?.length > 0 && (
                            <div className="bg-white rounded-[1rem] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 mb-2">
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Your Therapies</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {matches.myTherapyTypes.map(t => (
                                        <span key={t} className="px-2.5 py-1 bg-gray-50 text-gray-700 border border-gray-100 rounded-full text-[11px] font-medium">
                                            {THERAPY_LABELS[t] || t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {matches.matches.map((match) => (
                            <div
                                key={match._id}
                                className="bg-white rounded-[1rem] p-5 border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all flex flex-col group"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-800 font-semibold text-sm border border-gray-100">
                                        {match.parentName?.charAt(0)?.toUpperCase() || 'P'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 text-sm truncate tracking-tight">
                                            {match.parentName}
                                        </p>
                                        <p className="text-[11px] text-gray-400 truncate">
                                            Parent of {match.childName}{match.childAge ? `, ${match.childAge}y` : ''}
                                        </p>
                                    </div>
                                </div>

                                {(match.sharedTherapyTypes?.length > 0 || match.sharedDiagnosis?.length > 0) && (
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {match.sharedTherapyTypes?.map(t => (
                                            <span key={t} className="px-2 py-0.5 bg-blue-50/50 text-blue-700 rounded text-[10px] font-medium">
                                                {THERAPY_LABELS[t] || t}
                                            </span>
                                        ))}
                                        {match.sharedDiagnosis?.map(d => (
                                            <span key={d} className="px-2 py-0.5 bg-rose-50/50 text-rose-700 rounded text-[10px] font-medium">
                                                {DIAGNOSIS_LABELS[d] || d}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleOpenDM(match._id, match.parentName, match.childName)}
                                        className="flex-1 bg-gray-900 hover:bg-black text-white font-medium py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <MessageSquare size={12} />
                                        Message
                                    </button>
                                    {match.parentPhone && (
                                        <a
                                            href={`https://wa.me/${match.parentPhone.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(match.parentName)}!%20I%20saw%20we're%20both%20parents%20at%20Bloomnest.`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-medium py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 text-center"
                                        >
                                            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
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

        </div>
    );

    // --- Main Render ---
    return (
        <div className="flex flex-col h-[calc(100vh-90px)] md:h-[calc(100vh-120px)] max-h-[900px] bg-white rounded-2xl md:rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden relative">

            {/* Minimalist Top Nav */}
            <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-b border-gray-50 bg-white/80 backdrop-blur-md z-10 absolute top-0 inset-x-0">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 md:pb-0">
                    {ROOMS.map(room => (
                        <button
                            key={room.id}
                            onClick={() => handleSwitchRoom(room.id)}
                            className={`px-3 md:px-4 py-1.5 whitespace-nowrap rounded-full text-xs font-semibold tracking-wide transition-all ${activeRoom === room.id
                                    ? 'bg-black text-white'
                                    : 'text-gray-500 hover:bg-gray-100'
                                }`}
                        >
                            {room.label}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2 py-1 pl-4 border-l border-gray-100 ml-2">
                    <button
                        onClick={() => { setShowInbox(!showInbox); setShowMatches(false); if (!inbox.length) fetchInbox(); }}
                        className={`w-9 h-9 flex items-center justify-center rounded-full transition-all border ${showInbox
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:text-blue-600'
                            }`}
                        title="Direct Messages"
                    >
                        <MessageSquare size={16} strokeWidth={2} />
                    </button>
                    <button
                        onClick={() => { setShowMatches(!showMatches); setShowInbox(false); if (!matches) fetchMatches(); }}
                        className={`w-9 h-9 flex items-center justify-center rounded-full transition-all border ${showMatches
                                ? 'bg-black text-white border-black shadow-md'
                                : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-900'
                            }`}
                        title="Match Settings"
                    >
                        <Users size={16} strokeWidth={2} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex flex-1 overflow-hidden pt-[60px] md:pt-[68px]">
                {/* Main Chat/Orb Area */}
                <div className={`flex-1 flex flex-col min-w-0 bg-white relative ${(showMatches || showInbox) ? 'hidden lg:flex' : 'flex'}`}>

                    {/* Centered Area (Messages or Orb) */}
                    <div className="flex-1 overflow-y-auto px-6 lg:px-12 pt-6 pb-32 flex flex-col justify-end relative">
                        {(!activeDM && isLoading) || (activeDM && loadingDM) ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-gray-200" />
                            </div>
                        ) : (!activeDM && messages.length === 0) ? (
                            /* Chatroom Empty State */
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 animate-in fade-in duration-700">
                                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                                    <MessageSquare size={28} className="text-gray-300" strokeWidth={1.5} />
                                </div>
                                <h1 className="text-gray-800 text-[16px] max-w-[340px] text-center font-semibold tracking-tight">
                                    Welcome to #{activeRoomData?.label || 'General'}
                                </h1>
                                <p className="text-gray-400 text-[13px] text-center mt-1">
                                    {activeRoomData?.desc || 'Be the first to start the conversation!'}
                                </p>
                            </div>
                        ) : (activeDM && dmMessages.length === 0) ? (
                            /* DM Empty State */
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 animate-in fade-in duration-700">
                                <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4 border border-blue-100 text-blue-600 text-2xl font-bold">
                                    {activeDM.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <h1 className="text-gray-800 text-[16px] max-w-[340px] text-center font-semibold tracking-tight">
                                    Private Chat with {activeDM.name}
                                </h1>
                                <p className="text-gray-400 text-[13px] text-center mt-1">
                                    Start the conversation!
                                </p>
                            </div>
                        ) : (
                            /* Messages List */
                            <div className="space-y-6 w-full max-w-3xl mx-auto flex flex-col justify-end min-h-full">
                                {(activeDM ? dmMessages : messages).map((msg, index) => {
                                    const userId = user.id || user._id;
                                    const senderIdObj = msg.sender?._id || msg.sender;
                                    const isMe = senderIdObj === userId;
                                    const parentName = msg.sender?.parentName || msg.senderName || 'Parent';

                                    return (
                                        <div key={msg._id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 fade-in duration-300`}>
                                            <div className={`flex max-w-[90%] md:max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2.5`}>

                                                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                    <div className="flex items-center gap-2 mb-1 px-1">
                                                        <span className="text-[11px] font-semibold text-gray-400">
                                                            {isMe ? '' : parentName}
                                                        </span>
                                                        <span className="text-[10px] text-gray-300">
                                                            {dayjs(msg.createdAt).format('h:mm A')}
                                                        </span>
                                                    </div>

                                                    <div
                                                        className={`px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.02)] ${isMe
                                                                ? 'bg-[#1c1c1e] text-white rounded-[1.25rem] rounded-br-[4px]'
                                                                : 'bg-[#f4f4f5] text-[#1c1c1e] rounded-[1.25rem] rounded-bl-[4px]'
                                                            }`}
                                                    >
                                                        <p className="text-[14px] leading-relaxed break-words font-medium tracking-tight">
                                                            {msg.content}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Floating Sleek Input Pill */}
                    <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[800px] px-3 md:px-4 pointer-events-none">
                        <form
                            onSubmit={handleSendMessage}
                            className="bg-white rounded-full md:rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] md:shadow-[0_12px_40px_rgb(0,0,0,0.12)] border border-gray-100 p-1.5 md:p-2 pl-3 md:pl-3 flex items-center gap-2 pointer-events-auto transition-transform focus-within:scale-[1.01] focus-within:shadow-[0_12px_40px_rgb(0,0,0,0.15)] md:focus-within:shadow-[0_16px_50px_rgb(0,0,0,0.15)]"
                        >
                            {/* Input Field */}
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder={activeDM ? `Message ${activeDM.name.split(' ')[0]}...` : `Message #${activeRoomData?.label || 'general'}...`}
                                className="flex-1 min-w-0 bg-transparent text-[14px] font-medium tracking-tight focus:outline-none placeholder:text-gray-400 text-gray-800 px-3 py-2"
                            />

                            {/* Right Icons */}
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="w-9 h-9 rounded-full bg-[#1c1c1e] text-white flex items-center justify-center disabled:opacity-30 disabled:scale-100 transition-all flex-shrink-0 hover:scale-[1.05] active:scale-95"
                            >
                                <ArrowUp size={18} strokeWidth={2.5} />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Sidebars */}
                {showMatches && (
                    <div className="w-full lg:w-[320px] border-l border-gray-100 flex-shrink-0 relative">
                        {renderMatchesPanel()}
                    </div>
                )}
                {showInbox && (
                    <div className="w-full lg:w-[320px] border-l border-gray-100 flex-shrink-0 relative z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.03)] border-gray-100 bg-[#fafafa]">
                        {renderInboxPanel()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ParentChatroom;
