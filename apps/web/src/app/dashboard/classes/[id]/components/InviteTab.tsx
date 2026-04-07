'use client';

import { motion } from 'framer-motion';
import { Copy, Check, Link as LinkIcon, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

interface InviteTabProps {
    inviteCode: string;
    inviteUrl: string;
    clsName: string;
}

export default function InviteTab({ inviteCode, inviteUrl, clsName }: InviteTabProps) {
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    const copyInviteCode = async () => {
        await navigator.clipboard.writeText(inviteCode);
        setCopiedCode(true);
        toast.success('Invite code copied!');
        setTimeout(() => setCopiedCode(false), 2000);
    };

    const copyInviteLink = async () => {
        await navigator.clipboard.writeText(inviteUrl);
        setCopiedLink(true);
        toast.success('Invite link copied!');
        setTimeout(() => setCopiedLink(false), 2000);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="glass-card p-6">
                <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-1)' }}>Share this class</h3>
                <div className="mb-5">
                    <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--text-2)' }}>Invite Code</label>
                    <div className="flex items-center justify-between p-4 rounded-xl border" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
                        <span className="text-2xl font-mono font-extrabold tracking-[0.2em]" style={{ color: 'var(--secondary)' }}>{inviteCode}</span>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={copyInviteCode} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors" style={{ background: copiedCode ? 'rgba(34,197,94,0.1)' : 'var(--surface)', color: copiedCode ? 'rgb(34,197,94)' : 'var(--text-2)', border: `1px solid ${copiedCode ? 'rgba(34,197,94,0.3)' : 'var(--border)'}` }}>
                            {copiedCode ? <Check size={14} /> : <Copy size={14} />} {copiedCode ? 'Copied' : 'Copy'}
                        </motion.button>
                    </div>
                </div>
                <div className="mb-5">
                    <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--text-2)' }}>Invite Link</label>
                    <div className="flex items-center justify-between p-3 rounded-xl border gap-3" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <LinkIcon size={14} className="shrink-0" style={{ color: 'var(--text-3)' }} />
                            <span className="text-xs truncate font-mono" style={{ color: 'var(--text-2)' }}>{inviteUrl}</span>
                        </div>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={copyInviteLink} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors shrink-0" style={{ background: copiedLink ? 'rgba(34,197,94,0.1)' : 'var(--surface)', color: copiedLink ? 'rgb(34,197,94)' : 'var(--text-2)', border: `1px solid ${copiedLink ? 'rgba(34,197,94,0.3)' : 'var(--border)'}` }}>
                            {copiedLink ? <Check size={14} /> : <Copy size={14} />} {copiedLink ? 'Copied' : 'Copy'}
                        </motion.button>
                    </div>
                </div>
                <button
                    onClick={async () => {
                        if (navigator.share) {
                            try { await navigator.share({ title: `Join "${clsName}" on Meetrix`, text: `Use invite code ${inviteCode} to join "${clsName}" on Meetrix!`, url: inviteUrl }); } catch {}
                        } else { copyInviteLink(); }
                    }}
                    className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all border"
                    style={{ borderColor: 'var(--secondary)', color: 'var(--secondary)' }}
                >
                    <Share2 size={16} /> Share with Students
                </button>
            </div>
        </motion.div>
    );
}
