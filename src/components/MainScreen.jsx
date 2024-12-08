import React, { useState, useEffect } from 'react';
import { gameApi } from '../services/api';
import Header from './Header';
import AnnouncementScreen, { ANNOUNCEMENT_TYPES } from './AnnouncementScreen';

const MainScreen = ({ lobbyId, playerId, lobbyState }) => {
    const [selectedNominee, setSelectedNominee] = useState(null);
    const [selectedMinisters, setSelectedMinisters] = useState([]);
    const [loyaltyPressed, setLoyaltyPressed] = useState(false);
    const [error, setError] = useState('');
    const [playerRole, setPlayerRole] = useState(null);
    const [isNominationSubmitted, setIsNominationSubmitted] = useState(false);
    const [announcement, setAnnouncement] = useState(null);
    const [lastAnnouncedStage, setLastAnnouncedStage] = useState(null);
    const [ministersSubmitted, setMinistersSubmitted] = useState(false);
    const [speechSubmitted, setSpeechSubmitted] = useState(false);

    const isPresident = playerId === lobbyState?.current_president;

    useEffect(() => {
        if (lobbyState?.round_number) {
            setIsNominationSubmitted(false);
        }
    }, [lobbyState?.round_number]);

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const response = await gameApi.getPlayerRole(lobbyId, playerId);
                if (response.success) {
                    setPlayerRole(response.role);
                }
            } catch (err) {
                setError('Failed to fetch role');
            }
        };
        fetchRole();
    }, [lobbyId, playerId]);

    useEffect(() => {
        if (lobbyState?.stage !== lastAnnouncedStage) {
            let newAnnouncement = null;

            switch (lobbyState?.stage) {
                case 'nominating':
                    if (lobbyState?.current_president) {
                        const presidentName = lobbyState.players[lobbyState.current_president];
                        newAnnouncement = {
                            type: ANNOUNCEMENT_TYPES.NOMINATION,
                            presidentName: presidentName
                        };
                    }
                    break;
                case 'minister_selection':
                    const presidentName = lobbyState.players[lobbyState.current_president];
                    newAnnouncement = {
                        type: ANNOUNCEMENT_TYPES.NOMINATION,
                        presidentName: presidentName,
                        message: `${presidentName} is selecting ministers.`
                    };
                    break;
                case 'voting':
                    const ministerNames = lobbyState.nominated_ministers
                        .map(id => lobbyState.players[id])
                        .join(' and ');
                    newAnnouncement = {
                        type: ANNOUNCEMENT_TYPES.NOMINATION,
                        presidentName: lobbyState.players[lobbyState.current_president],
                        message: `Vote on ministers ${ministerNames}.`
                    };
                    break;
                case 'policy':
                    newAnnouncement = {
                        type: ANNOUNCEMENT_TYPES.VOTE_RESULT_APPROVED,
                        message: "Ministers approved. Policy voting begins."
                    };
                    break;
                case 'execution':
                    if (lobbyState.execution_accuser && lobbyState.execution_target) {
                        newAnnouncement = {
                            type: ANNOUNCEMENT_TYPES.EXECUTION_CALL,
                            accuserName: lobbyState.players[lobbyState.execution_accuser],
                            accusedName: lobbyState.players[lobbyState.execution_target]
                        };
                    }
                    break;
                default:
                    break;
            }

            if (newAnnouncement) {
                setAnnouncement(newAnnouncement);
                setLastAnnouncedStage(lobbyState?.stage);

                // Automatically clear the announcement after 3 seconds
                const timer = setTimeout(() => {
                    setAnnouncement(null);
                }, 3000);

                return () => clearTimeout(timer);
            }
        }
    }, [lobbyState?.stage, lastAnnouncedStage, lobbyState?.current_president, lobbyState?.players, lobbyState?.execution_accuser, lobbyState?.execution_target]);

    const isThoughtPolice = playerRole === 'thought_police';

    const handleNominatePresident = async (nomineeId) => {
        try {
            const response = await gameApi.nominatePresident(lobbyId, nomineeId);
            if (!response.success) {
                setError(response.message);
            } else {
                setIsNominationSubmitted(true);
            }
            setSelectedNominee(null);
        } catch (err) {
            setError('Failed to submit nomination');
        }
    };

    const handleLoyaltyButton = () => {
        setLoyaltyPressed(true);
    };

    const handleMinisterSelection = (ministerId) => {
        if (!isPresident || lobbyState?.stage !== 'minister_selection' || ministerId === playerId) {
            return;
        }

        setSelectedMinisters(prev => {
            if (prev.includes(ministerId)) {
                return prev.filter(id => id !== ministerId);
            }
            if (prev.length < 2) {
                return [...prev, ministerId];
            }
            return prev;
        });
    };

    const handleSpeechSubmit = async () => {
        try {
            const response = await gameApi.nominateMinisters(
                lobbyId, 
                playerId, 
                selectedMinisters
            );
            if (response.success) {
                setSpeechSubmitted(true);
                setMinistersSubmitted(true);
            } else {
                setError('Failed to submit minister nominations');
            }
        } catch (err) {
            setError('Failed to submit minister nominations');
        }
    };

    const renderOrderMeter = () => {
        const percentage = ((lobbyState?.order_meter || 0) / 300) * 100;
        return (
            <div className="w-full bg-gray-700 rounded-full h-6 mb-8">
                <div 
                    className="bg-red-600 h-6 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                >
                </div>
            </div>
        );
    };

    const renderPlayerGrid = () => {
        const players = lobbyState?.players || {};
        const livingPlayers = lobbyState?.living_players || [];
        
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(players).map(([id, name]) => {
                    const isAlive = livingPlayers.includes(id);
                    const isPresident = id === lobbyState?.current_president;
                    const isMinister = lobbyState?.nominated_ministers?.includes(id);
                    const canBeNominated = isAlive && 
                                         lobbyState?.stage === 'nominating' && 
                                         isThoughtPolice;
                    const canBeMinister = isAlive && 
                                        isPresident === false && 
                                        id !== playerId && 
                                        lobbyState?.stage === 'minister_selection' && 
                                        playerId === lobbyState?.current_president && 
                                        !ministersSubmitted;
                    const isSelected = selectedMinisters?.includes(id) || selectedNominee === id;

                    return (
                        <div 
                            key={id}
                            onClick={() => {
                                if (canBeNominated) {
                                    setSelectedNominee(id);
                                } else if (canBeMinister) {
                                    handleMinisterSelection(id);
                                }
                            }}
                            className={`
                                p-4 rounded-lg text-center transition-all
                                ${!isAlive ? 'bg-gray-800 text-gray-500' : 
                                  isPresident ? 'bg-red-700' :
                                  isMinister ? 'bg-red-900' :
                                  isSelected ? 'bg-red-600' :
                                  (canBeNominated || canBeMinister) ? 'bg-gray-700 hover:bg-gray-600 cursor-pointer' :
                                  'bg-gray-700'}
                            `}
                        >
                            <div className="font-bold">{name}</div>
                            {isPresident && <div className="text-sm">President</div>}
                            {isMinister && <div className="text-sm">Minister</div>}
                            {!isAlive && <div className="text-sm">(Executed)</div>}
                            {isSelected && <div className="text-sm">(Selected)</div>}
                            {canBeMinister && <div className="text-sm text-gray-400">(Available)</div>}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderMinisterSelection = () => {
        if (isPresident && lobbyState?.stage === 'minister_selection' && !speechSubmitted) {
            return (
                <div className="space-y-6">
                    <div className="text-center text-xl font-bold text-red-500">
                        You have been chosen as President
                    </div>
                    <div className="text-center text-gray-300">
                        Stand up and deliver your speech praising Big Brother and the Party.
                        <br />
                        Then select two ministers from the grid above who have shown proper loyalty.
                    </div>
                    <div className="text-center text-gray-400">
                        {selectedMinisters.length === 0 
                            ? "Select 2 ministers" 
                            : `Selected ${selectedMinisters.length}/2 ministers`}
                    </div>
                    <button
                        onClick={handleSpeechSubmit}
                        disabled={selectedMinisters.length !== 2}
                        className={`w-full p-3 rounded-lg transition-colors ${
                            selectedMinisters.length === 2
                                ? 'bg-red-600 hover:bg-red-700 cursor-pointer'
                                : 'bg-gray-700 cursor-not-allowed'
                        }`}
                    >
                        Confirm Minister Nominations
                    </button>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <Header />
            <div className="max-w-4xl mx-auto mt-8 space-y-8">
                {renderOrderMeter()}
                {renderPlayerGrid()}
                {renderMinisterSelection()}

                <div className="mt-8 space-y-4">
                    {/* Show speech submitted message */}
                    {isPresident && speechSubmitted && (
                        <div className="text-center text-gray-400">
                            Minister nominations submitted. Awaiting party approval.
                        </div>
                    )}

                    {/* Original nomination and loyalty buttons */}
                    {playerRole && (
                        <div className="flex justify-center space-x-4">
                            {selectedNominee && isThoughtPolice && !isNominationSubmitted && (
                                <button
                                    onClick={() => handleNominatePresident(selectedNominee)}
                                    className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded"
                                >
                                    Confirm Nomination
                                </button>
                            )}

                            {isThoughtPolice && isNominationSubmitted && (
                                <div className="px-6 py-2 bg-gray-700 rounded">
                                    Nomination Submitted
                                </div>
                            )}

                            {lobbyState?.stage === 'nominating' && !isThoughtPolice && (
                                <button
                                    onClick={handleLoyaltyButton}
                                    disabled={loyaltyPressed}
                                    className={`px-6 py-2 rounded ${
                                        loyaltyPressed 
                                            ? 'bg-gray-700 cursor-not-allowed' 
                                            : 'bg-red-600 hover:bg-red-700'
                                    }`}
                                >
                                    {loyaltyPressed ? 'Loyalty Confirmed' : 'Confirm Loyalty'}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {error && (
                    <div className="text-red-500 text-center mt-4">
                        {error}
                    </div>
                )}
            </div>

            {announcement && (
                <AnnouncementScreen 
                    announcement={announcement}
                    onClose={() => setAnnouncement(null)}
                />
            )}
        </div>
    );
};

export default MainScreen; 