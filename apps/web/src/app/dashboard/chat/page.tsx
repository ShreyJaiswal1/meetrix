'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Users, Search, Send } from 'lucide-react';
import { useClassStore } from '@/stores/classes';
import { useAuthStore } from '@/stores/auth';
import io, { Socket } from 'socket.io-client';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Message {
    id: string;
    roomId: string;
    senderId: string;
    content: string;
    createdAt: string;
    sender: { id: string; name: string; avatarUrl?: string };
}

export default function ChatPage() {
    const { classes, fetchClasses } = useClassStore();
    const { user } = useAuthStore();
    
    const [socket, setSocket] = useState<Socket | null>(null);
    const [activeRoom, setActiveRoom] = useState<string | null>(null);
    const [messages, setMessages] = useState<Record<string, Message[]>>({});
    const [input, setInput] = useState('');
    const [connected, setConnected] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchClasses();
    }, [fetchClasses]);

    // Set initial active room when classes load
    useEffect(() => {
        if (classes.length > 0 && !activeRoom) {
            setActiveRoom(classes[0].id);
        }
    }, [classes, activeRoom]);

    // Socket setup
    useEffect(() => {
        if (!user) return;
        
        const socketUrl = process.env.NEXT_PUBLIC_API_URL 
            ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') 
            : 'http://localhost:4000';
            
        const newSocket = io(socketUrl, {
            transports: ['websocket'],
            autoConnect: true
        });

        newSocket.on('connect', () => setConnected(true));
        newSocket.on('disconnect', () => setConnected(false));
        
        newSocket.on('receive_message', (message: Message) => {
            setMessages(prev => ({
                ...prev,
                [message.roomId]: [...(prev[message.roomId] || []), message]
            }));
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    // Join room & fetch history when active room changes
    useEffect(() => {
        if (!socket || !activeRoom) return;

        socket.emit('join_room', activeRoom);

        // Fetch history if not already loaded
        if (!messages[activeRoom]) {
            api.get(`/classes/${activeRoom}/messages`)
                .then(res => {
                    if (res.data.success) {
                        setMessages(prev => ({ ...prev, [activeRoom]: res.data.data }));
                    }
                })
                .catch(err => {
                    console.error(err);
                });
        }

        return () => {
            socket.emit('leave_room', activeRoom);
        };
    }, [socket, activeRoom]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, activeRoom]);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !socket || !activeRoom || !user) return;

        socket.emit('send_message', {
            roomId: activeRoom,
            senderId: user.id,
            senderName: user.name,
            content: input.trim()
        });

        setInput('');
    };

    const activeClass = classes.find(c => c.id === activeRoom);
    const currentMessages = activeRoom ? (messages[activeRoom] || []) : [];

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col">
            <div className="flex-1 glass-card overflow-hidden flex shadow-2xl">
                {/* Sidebar */}
                <div className="w-80 border-r border-white/10 flex flex-col bg-black/5" style={{ borderColor: 'var(--border)' }}>
                    <div className="p-4 border-b border-white/5" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-lg">Messages</h2>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" size={14} />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                className="w-full bg-surface py-2.5 pl-10 pr-4 rounded-xl text-xs outline-none border border-transparent focus:border-secondary/20 transition-colors"
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto">
                        {classes.length === 0 && (
                            <div className="p-8 text-center text-[var(--text-3)]">
                                <p className="text-sm">You are not in any classes yet.</p>
                            </div>
                        )}
                        {classes.map((cls) => (
                            <div 
                                key={cls.id} 
                                onClick={() => setActiveRoom(cls.id)}
                                className={`p-4 flex gap-3 hover:bg-black/10 cursor-pointer transition-colors ${activeRoom === cls.id ? 'bg-secondary/10 border-l-4 border-secondary' : 'border-l-4 border-transparent'}`}
                            >
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 font-bold text-sm" style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>{cls.name[0]}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-bold text-sm truncate">{cls.name}</span>
                                    </div>
                                    <p className="text-xs text-[var(--text-3)] truncate">Click to view chat</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col relative bg-surface/50">
                    {activeClass ? (
                        <>
                            {/* Header */}
                            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/5" style={{ borderColor: 'var(--border)' }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-white font-bold">{activeClass.name[0]}</div>
                                    <div>
                                        <h3 className="font-bold text-sm">{activeClass.name}</h3>
                                        <p className={`text-[10px] font-bold flex items-center gap-1 ${connected ? 'text-green-500' : 'text-orange-500'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${connected ? 'bg-green-500' : 'bg-orange-500'}`} /> 
                                            {connected ? 'Connected' : 'Connecting...'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                     <button className="p-2 rounded-lg text-[var(--text-2)] hover:bg-surface transition-colors cursor-pointer"><Users size={18} /></button>
                                </div>
                            </div>

                            {/* Messages List */}
                            <div className="flex-1 p-6 overflow-y-auto space-y-4">
                                {currentMessages.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                         <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-4">
                                            <MessageSquare size={40} />
                                         </div>
                                         <h3 className="font-bold text-lg mb-2">Start the conversation</h3>
                                         <p className="text-sm max-w-xs">Send a message to everyone in {activeClass.name}.</p>
                                    </div>
                                )}
                                
                                {currentMessages.map((msg, i) => {
                                    const isMe = msg.senderId === user?.id;
                                    const showName = i === 0 || currentMessages[i - 1].senderId !== msg.senderId;
                                    
                                    return (
                                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            {showName && !isMe && (
                                                <span className="text-[10px] font-bold text-[var(--text-3)] ml-1 mb-1">{msg.sender.name}</span>
                                            )}
                                            <div 
                                                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-secondary text-white rounded-tr-sm' : 'bg-surface border border-[var(--border)] rounded-tl-sm text-[var(--text-1)]'}`}
                                            >
                                                {msg.content}
                                            </div>
                                            <span className="text-[9px] text-[var(--text-3)] mt-1 mx-1 opacity-60">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-black/5" style={{ borderTop: '1px solid var(--border)' }}>
                                <form onSubmit={sendMessage} className="flex gap-3 bg-surface p-2 rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
                                     <input
                                        type="text"
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 bg-transparent px-2 text-sm outline-none"
                                        disabled={!connected}
                                     />
                                     <button 
                                        type="submit"
                                        disabled={!input.trim() || !connected} 
                                        className="w-10 h-10 rounded-xl bg-secondary text-white flex items-center justify-center transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                     >
                                         <Send size={18} />
                                     </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 p-6">
                             <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-4">
                                <MessageSquare size={40} />
                             </div>
                             <h3 className="font-bold text-lg mb-2">No Room Selected</h3>
                             <p className="text-sm max-w-xs">Select a class from the sidebar to view your messages.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
