import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import dayjs from 'dayjs';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Send, UserCircle2, Loader2 } from 'lucide-react';

const ParentChatroom = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        // Fetch message history
        const fetchMessages = async () => {
            try {
                const response = await api.get('/chat/messages');
                if (response.data.success) {
                    setMessages(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch messages:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessages();

        // Initialize Socket
        const socketInstance = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
            withCredentials: true
        });

        setSocket(socketInstance);

        socketInstance.on('connect', () => {
            console.log('Connected to socket server');
            socketInstance.emit('join_parent_lounge');
        });

        socketInstance.on('receive_message', (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        return () => {
            if (socketInstance) socketInstance.disconnect();
        };
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        const messageData = {
            sender: user.id || user._id,
            content: newMessage,
            senderName: user.name || user.parentName || 'Parent',
            childName: user.childName || 'Child'
        };

        socket.emit('send_message', messageData);
        setNewMessage('');
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] max-h-[800px] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Parents Lounge</h2>
                    <p className="text-sm text-blue-100">Connect and share with other parents</p>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    Online
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-6">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">
                        <UserCircle2 className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <p>No messages yet.</p>
                        <p className="text-sm">Be the first to start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const userId = user.id || user._id;
                        const isMe = msg.sender?._id === userId || msg.sender === userId;
                        
                        // Handle populated sender vs non-populated sender depending on if it's from history vs socket
                        const parentName = msg.sender?.parentName || msg.senderName || 'Unknown Parent';
                        const childName = msg.sender?.childName || msg.childName ? `(Parent of ${msg.sender?.childName || msg.childName})` : '';

                        return (
                            <div key={msg._id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex max-w-[75%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                                    
                                    {!isMe && (
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 border border-indigo-200 shadow-sm">
                                            <span className="text-indigo-600 font-medium text-sm">
                                                {parentName.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}

                                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-baseline gap-2 mb-1 px-1">
                                            <span className="text-sm font-medium text-gray-700">
                                                {isMe ? 'You' : parentName}
                                            </span>
                                            {!isMe && <span className="text-xs text-gray-500">{childName}</span>}
                                            <span className="text-xs text-gray-400">
                                                {dayjs(msg.createdAt).format('h:mm A')}
                                            </span>
                                        </div>
                                        
                                        <div 
                                            className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                                                isMe 
                                                ? 'bg-blue-600 text-white rounded-br-none' 
                                                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                            }`}
                                        >
                                            <p className="text-[15px] leading-relaxed break-words">{msg.content}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-[15px]"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-blue-600 text-white p-3 px-6 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center group"
                    >
                        <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ParentChatroom;
