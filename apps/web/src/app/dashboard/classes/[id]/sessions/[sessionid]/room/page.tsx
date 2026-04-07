'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { ChevronLeft, Loader2, Maximize2, ShieldAlert } from 'lucide-react';
import Script from 'next/script';

declare global {
    interface Window {
        JitsiMeetExternalAPI: any;
    }
}

export default function SessionRoomPage() {
    const { id: classId, sessionid } = useParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const jitsiApiRef = useRef<any>(null);

    useEffect(() => {
        api.get(`/classes/${classId}/sessions/${sessionid}/join`)
            .then(res => {
                if (res.data.success) setSession(res.data.data);
                else setError('Failed to load session info');
            })
            .catch(() => setError('Session not found or access denied'))
            .finally(() => setLoading(false));
    }, [classId, sessionid]);

    const startMeeting = () => {
        if (!session || !jitsiContainerRef.current) return;

        const domain = 'meet.jit.si';
        const options = {
            roomName: session.jitsiRoom,
            width: '100%',
            height: '100%',
            parentNode: jitsiContainerRef.current,
            userInfo: {
                displayName: user?.name,
                email: user?.email,
            },
            configOverwrite: {
                startWithAudioMuted: true,
                startWithVideoMuted: true,
                prejoinPageEnabled: true,
                disableThirdPartyRequests: true,
            },
            interfaceConfigOverwrite: {
                TOOLBAR_BUTTONS: [
                    'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                    'fms', 'hangup', 'profile', 'chat', 'recording',
                    'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                    'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                    'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                    'e2ee'
                ],
            }
        };

        jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-black">
            <Loader2 className="w-10 h-10 text-secondary animate-spin" />
        </div>
    );

    if (error) return (
        <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-6">
            <ShieldAlert size={48} className="text-red-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">{error}</h2>
            <button onClick={() => router.back()} className="px-6 py-2 bg-secondary rounded-xl font-bold">Go Back</button>
        </div>
    );

    return (
        <div className="h-screen flex flex-col bg-black overflow-hidden">
            <Script 
                src="https://meet.jit.si/external_api.js" 
                onLoad={startMeeting}
            />
            
            {/* Header */}
            <header className="px-6 py-3 flex items-center justify-between bg-[#111111] border-b border-white/5">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => {
                            if (window.confirm('Leave the session?')) {
                                router.back();
                            }
                        }}
                        className="p-2 rounded-lg hover:bg-white/5 text-white transition-colors cursor-pointer"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-sm font-bold text-white line-clamp-1">{session?.title}</h1>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Meetrix Classroom Session</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex flex-col items-end mr-4">
                         <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full animate-pulse uppercase">Secure Connection</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-white text-xs font-bold">
                        {user?.name[0]}
                    </div>
                </div>
            </header>

            {/* Jitsi Holder */}
            <div className="flex-1 relative">
                <div ref={jitsiContainerRef} className="absolute inset-0" />
            </div>
        </div>
    );
}
