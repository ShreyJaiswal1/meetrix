'use client';

import { motion } from 'framer-motion';
import { Crown, GraduationCap } from 'lucide-react';

interface ClassMember {
    id: string;
    role: string;
    joinedAt: string;
    user: { id: string; name: string; email: string; avatarUrl?: string };
}

interface MembersTabProps {
    members: ClassMember[];
    user: any;
    Avatar: React.ElementType;
}

export default function MembersTab({ members, user, Avatar }: MembersTabProps) {
    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="glass-card overflow-hidden">
                <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Class Members</h3>
                    <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--bg)', color: 'var(--text-2)' }}>{members.length} total</span>
                </div>
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                    {members.map((member, i) => (
                        <motion.div key={member.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <Avatar src={member.user.avatarUrl} name={member.user.name} />
                                <div>
                                    <div className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
                                        {member.user.name}
                                        {member.user.id === user?.id && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--bg)', color: 'var(--text-3)' }}>You</span>}
                                    </div>
                                    <div className="text-xs" style={{ color: 'var(--text-3)' }}>{member.user.email}</div>
                                </div>
                            </div>
                            {member.role === 'TEACHER' ? (
                                <span className="text-[10px] font-semibold flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'rgba(61,45,181,0.12)', color: 'var(--primary)' }}><Crown size={10} /> Teacher</span>
                            ) : (
                                <span className="text-[10px] font-semibold flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}><GraduationCap size={10} /> Student</span>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
