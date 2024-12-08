import React, { useState, useEffect } from 'react';
import { gameApi } from '../services/api';
import Header from './Header';

const POLICY_VOTE = {
    SUPPORT: 'support',
    SABOTAGE: 'sabotage'
};

const MinisterScreen = ({ lobbyId, playerId, lobbyState }) => {
    const [policyVote, setPolicyVote] = useState(null);
    const [executionTarget, setExecutionTarget] = useState(null);
    const [error, setError] = useState('');
    const [policySubmitted, setPolicySubmitted] = useState(false);
    const [executionSubmitted, setExecutionSubmitted] = useState(false);

    const otherMinisterId = lobbyState?.nominated_ministers?.find(id => id !== playerId);
    const otherMinisterName = lobbyState?.players[otherMinisterId];

    useEffect(() => {
        // Reset state if minister is executed
        if (!lobbyState?.living_players?.includes(playerId)) {
            setPolicySubmitted(false);
            setExecutionSubmitted(false);
            setPolicyVote(null);
        }
    }, [lobbyState?.living_players, playerId]);

    const handlePolicySubmit = async (vote) => {
        try {
            const response = await gameApi.submitPolicyVote(lobbyId, playerId, vote);
            if (response.success) {
                setPolicyVote(vote);
                setPolicySubmitted(true);
            } else {
                setError(response.message || 'Failed to submit policy vote');
            }
        } catch (err) {
            console.error('Policy vote error:', err);
            setError('Failed to submit policy vote');
        }
    };

    const handleExecutionSubmit = async () => {
        if (!executionTarget) return;
        
        try {
            const response = await gameApi.initiateExecution(lobbyId, playerId, executionTarget);
            if (response.success) {
                setExecutionSubmitted(true);
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError('Failed to initiate execution');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <Header />
            <div className="max-w-4xl mx-auto mt-8 space-y-8">
                {/* Policy Vote Section */}
                <div className="bg-gray-800 p-6 rounded-lg text-center space-y-4">
                    <h2 className="text-2xl font-bold">Minister's Decision</h2>
                    <p className="text-gray-400">
                        You and Minister <span className="text-red-500">{otherMinisterName}</span> must decide on the policy
                    </p>
                </div>

                {!policySubmitted ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => handlePolicySubmit(POLICY_VOTE.SUPPORT)}
                            className="p-6 rounded-lg text-center bg-gray-800 hover:bg-gray-700 transition-all"
                        >
                            <div className="text-4xl mb-2">✅</div>
                            <div className="text-xl font-bold mb-2">Support</div>
                            <div className="text-sm text-gray-400">Strengthen the Party's control</div>
                        </button>
                        <button
                            onClick={() => handlePolicySubmit(POLICY_VOTE.SABOTAGE)}
                            className="p-6 rounded-lg text-center bg-gray-800 hover:bg-gray-700 transition-all"
                        >
                            <div className="text-4xl mb-2">❌</div>
                            <div className="text-xl font-bold mb-2">Sabotage</div>
                            <div className="text-sm text-gray-400">Undermine the policy secretly</div>
                        </button>
                    </div>
                ) : (
                    <div className="text-center text-gray-400">
                        Your decision has been recorded
                    </div>
                )}

                {/* Execution Section */}
                {policySubmitted && !executionSubmitted && (
                    <div className="space-y-4">
                        <div className="bg-gray-800 p-6 rounded-lg text-center">
                            <h3 className="text-xl font-bold text-red-500 mb-4">
                                Call for Execution?
                            </h3>
                            <p className="text-gray-400 mb-4">
                                Do you suspect the other minister of thoughtcrime?
                            </p>
                            <button
                                onClick={() => {
                                    setExecutionTarget(otherMinisterId);
                                    handleExecutionSubmit();
                                }}
                                className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded transition-colors"
                            >
                                Call for Execution
                            </button>
                        </div>
                    </div>
                )}

                {/* Vote Count Display */}
                {lobbyState?.policy_votes && (
                    <div className="text-center text-gray-400">
                        Decisions made: {Object.keys(lobbyState.policy_votes).length} / 2
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

export default MinisterScreen; 