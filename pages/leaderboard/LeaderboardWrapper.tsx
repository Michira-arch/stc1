import React, { useState } from 'react';
import { LeaderboardHome } from './LeaderboardHome';
import { LeaderboardDetail } from './LeaderboardDetail';

interface Props {
    onBack: () => void;
}

export const LeaderboardWrapper: React.FC<Props> = ({ onBack }) => {
    const [view, setView] = useState<'home' | 'detail'>('home');
    const [selectedLeaderboardId, setSelectedLeaderboardId] = useState<string | null>(null);

    if (view === 'detail' && selectedLeaderboardId) {
        return (
            <LeaderboardDetail
                leaderboardId={selectedLeaderboardId}
                onBack={() => {
                    setSelectedLeaderboardId(null);
                    setView('home');
                }}
            />
        );
    }

    return (
        <LeaderboardHome
            onBack={onBack}
            onSelectLeaderboard={(id) => {
                setSelectedLeaderboardId(id);
                setView('detail');
            }}
        />
    );
};
