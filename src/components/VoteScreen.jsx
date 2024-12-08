import React, { useState } from 'react';
import { gameApi } from '../services/api';
import Header from './Header';

const VOTE_OPTIONS = {
    INSPIRING: 1,
    ACCEPTABLE: 0,
    SUSPICIOUS: -1
};

const VoteScreen = ({ lobbyId, playerId, lobbyState }) => {
    const [vote, setVote] = useState(null);
    const [error, setError] = useState('');
    const [voteSubmitted, setVoteSubmitted] = useState(false);

    const presidentName = lobbyState?.players[lobbyState?.current_president] || 'Unknown';
    const ministerNames = lobbyState?.nominated_ministers?.map(id => lobbyState.players[id]).join(' and ') || '';
    const accusedName = lobbyState?.execution_target ? lobbyState.players[lobbyState.execution_target] : null;
    const accuserName = lobbyState?.execution_accuser ? lobbyState.players[lobbyState.execution_accuser] : null;

    const isExecutionVote = lobbyState?.stage === 'execution';

    const handleVoteSubmit = async (voteValue) => {
        try {
            let response;
            if (isExecutionVote) {
                response = await gameApi.submitExecutionVote(lobbyId, playerId, voteValue === 1);
            } else {
                response = await gameApi.submitApprovalVote(lobbyId, playerId, voteValue);
            }

            if (response.success) {
                setVote(voteValue);
                setVoteSubmitted(true);
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError('Failed to submit vote');
        }
    };

    const VoteButton = ({ value, label, icon, description }) => (
        <button
            onClick={() => handleVoteSubmit(value)}
            disabled={voteSubmitted}
            className={`
                p-6 rounded-lg text-center transition-all w-full
                ${voteSubmitted 
                    ? vote === value 
                        ? 'bg-red-900 border-2 border-red-500' 
                        : 'bg-gray-800 opacity-50 cursor-not-allowed'
                    : 'bg-gray-800 hover:bg-gray-700 cursor-pointer'
                }
            `}
        >
            <div className="text-4xl mb-2">{icon}</div>
            <div className="text-xl font-bold mb-2">{label}</div>
            <div className="text-sm text-gray-400">{description}</div>
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <Header />
            <div className="max-w-4xl mx-auto mt-8 space-y-8">
                {/* Context Information */}
                <div className="bg-gray-800 p-6 rounded-lg text-center space-y-4">
                    {isExecutionVote ? (
                        <>
                            <h2 className="text-2xl font-bold text-red-500">
                                EXECUTION VOTE
                            </h2>
                            <p className="text-gray-400">
                                Minister <span className="text-red-500">{accuserName}</span> has accused{' '}
                                <span className="text-red-500">{accusedName}</span> of thoughtcrime
                            </p>
                        </>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold">
                                Vote on President <span className="text-red-500">{presidentName}'s</span> Speech
                            </h2>
                            <p className="text-gray-400">
                                Nominated Ministers: <span className="text-red-500">{ministerNames}</span>
                            </p>
                        </>
                    )}
                </div>

                {/* Vote Options */}
                {!voteSubmitted ? (
                    <div className="text-center mb-6">
                        <p className="text-xl text-gray-400">
                            {isExecutionVote 
                                ? "Should the accused be executed for thoughtcrime?" 
                                : "How do you judge the President's loyalty to Big Brother?"}
                        </p>
                    </div>
                ) : (
                    <div className="text-center mb-6">
                        <p className="text-xl text-gray-400">
                            Your judgment has been recorded
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {isExecutionVote ? (
                        <>
                            <VoteButton
                                value={1}
                                label="Execute"
                                icon="⚔️"
                                description="Death to traitors!"
                            />
                            <VoteButton
                                value={0}
                                label="Abstain"
                                icon="👁"
                                description="Let others decide"
                            />
                            <VoteButton
                                value={-1}
                                label="Spare"
                                icon="🕊️"
                                description="Show mercy"
                            />
                        </>
                    ) : (
                        <>
                            <VoteButton
                                value={VOTE_OPTIONS.INSPIRING}
                                label="Inspiring"
                                icon="⭐"
                                description="A model of Party loyalty"
                            />
                            <VoteButton
                                value={VOTE_OPTIONS.ACCEPTABLE}
                                label="Acceptable"
                                icon="👁"
                                description="Adequately orthodox"
                            />
                            <VoteButton
                                value={VOTE_OPTIONS.SUSPICIOUS}
                                label="Suspicious"
                                icon="⚠"
                                description="Potential thoughtcrime detected"
                            />
                        </>
                    )}
                </div>

                {/* Vote Count Display */}
                {(lobbyState?.votes || lobbyState?.execution_votes) && (
                    <div className="text-center text-gray-400">
                        Votes cast: {Object.keys(isExecutionVote ? lobbyState.execution_votes || {} : lobbyState.votes || {}).length} / {lobbyState.living_players.length}
                    </div>
                )}

                {error && (
                    <div className="text-red-500 text-center mt-4">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoteScreen; 