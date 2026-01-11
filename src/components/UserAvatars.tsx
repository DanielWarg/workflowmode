'use client';

import { useEffect, useState } from 'react';
import { useYjs } from '@/components/YjsProvider';

interface User {
    clientId: number;
    name: string;
    color: string;
}

type AwarenessState = {
    user?: {
        name?: string;
        color?: string;
    };
};

export function UserAvatars() {
    const { awareness } = useYjs();
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        if (!awareness) return;

        const updateUsers = () => {
            const states = awareness.getStates() as Map<number, AwarenessState>;
            const activeUsers: User[] = [];

            states.forEach((state, clientId) => {
                const name = state.user?.name;
                const color = state.user?.color;
                if (name && color) {
                    activeUsers.push({
                        clientId,
                        name,
                        color,
                    });
                }
            });

            // Sort by clientId to keep order stable
            activeUsers.sort((a, b) => a.clientId - b.clientId);

            setUsers(activeUsers);
        };

        updateUsers();
        awareness.on('change', updateUsers);

        return () => {
            awareness.off('change', updateUsers);
        };
    }, [awareness]);

    return (
        <div className="flex items-center -space-x-1.5 px-2">
            {users.map((user) => (
                <div
                    key={user.clientId}
                    className="w-7 h-7 rounded-full border-2 border-white dark:border-[#0d1424] flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10 relative group cursor-default transition-transform hover:scale-110 hover:z-10"
                    style={{ backgroundColor: user.color }}
                >
                    {user.name.charAt(0)}
                    {/* Tooltip */}
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
                        {user.name}
                    </div>
                </div>
            ))}
        </div>
    );
}
