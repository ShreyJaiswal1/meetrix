'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Bot, Users, Settings, Search, Send, Plus } from 'lucide-react';

const mockRooms = [
    { name: 'Physics Class Group', lastMsg: 'Does anyone have the notes from Chapter 4?', time: '2m ago', unread: 3 },
    { name: 'Mathematics II', lastMsg: 'Prisma is so much better than SQL.', time: '1h ago', unread: 0 },
    { name: 'Prof. Miller', lastMsg: 'The assignment is due tonight at 11PM.', time: '4h ago', unread: 1 },
];

export default function ChatPlaceholder() {
    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col">
            <div className="flex-1 glass-card overflow-hidden flex shadow-2xl">
                {/* Sidebar */}
                <div className="w-80 border-r border-white/10 flex flex-col bg-black/5" style={{ borderColor: 'var(--border)' }}>
                    <div className="p-4 border-b border-white/5" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-lg">Messages</h2>
                            <button className="p-1.5 rounded-lg bg-surface text-secondary hover:bg-secondary/10 transition-colors"><Plus size={18} /></button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" size={14} />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                className="w-full bg-surface py-2.5 pl-10 pr-4 rounded-xl text-xs outline-none border border-transparent focus:border-secondary/20"
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto">
                        {mockRooms.map((room, i) => (
                            <div key={i} className={`p-4 flex gap-3 hover:bg-black/10 cursor-pointer transition-colors ${i === 0 ? 'bg-secondary/10 border-l-4 border-secondary' : ''}`}>
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 font-bold text-sm" style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>{room.name[0]}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-bold text-sm truncate">{room.name}</span>
                                        <span className="text-[10px] text-[var(--text-3)]">{room.time}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-[var(--text-2)] truncate">{room.lastMsg}</p>
                                        {room.unread > 0 && <span className="w-4 h-4 bg-secondary text-white text-[9px] font-bold rounded-full flex items-center justify-center">{room.unread}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/5" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-white font-bold">P</div>
                            <div>
                                <h3 className="font-bold text-sm">Physics Class Group</h3>
                                <p className="text-[10px] text-green-500 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> 12 online</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <button className="p-2 rounded-lg text-[var(--text-2)] hover:bg-surface transition-colors cursor-pointer"><Users size={18} /></button>
                             <button className="p-2 rounded-lg text-[var(--text-2)] hover:bg-surface transition-colors cursor-pointer"><Settings size={18} /></button>
                        </div>
                    </div>

                    <div className="flex-1 p-6 flex flex-col items-center justify-center text-center opacity-40">
                         <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-4">
                            <MessageSquare size={40} />
                         </div>
                         <h3 className="font-bold text-lg mb-2">Real-time Chat via Socket.io</h3>
                         <p className="text-sm max-w-xs">Full messaging features including file sharing and voice notes are coming to the dashboard in the next update.</p>
                         <div className="mt-8 px-4 py-2 rounded-full border border-secondary/30 text-secondary text-[10px] font-bold uppercase tracking-widest animate-pulse">Socket.io Connected</div>
                    </div>

                    <div className="p-4 bg-black/5" style={{ borderTop: '1px solid var(--border)' }}>
                        <div className="flex gap-3 bg-surface p-2 rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
                             <input
                                disabled
                                type="text"
                                placeholder="Type a message..."
                                className="flex-1 bg-transparent px-2 text-sm outline-none"
                             />
                             <button disabled className="w-10 h-10 rounded-xl bg-secondary text-white flex items-center justify-center opacity-50 cursor-not-allowed"><Send size={18} /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
