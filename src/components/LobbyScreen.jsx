import React from 'react';
import { gameApi } from '../services/api';
import Header from './Header';

const LobbyScreen = ({ lobbyId, playerId, isHost, lobbyState, error, setError }) => {
    console.log('LobbyScreen render:', { lobbyState });  // Debug log

    const handleStartGame = async () => {
        try {
            const response = await gameApi.startGame(lobbyId, playerId);
            if (!response.success) {
                setError(response.message);
            }
        } catch (err) {
            setError('Failed to start game');
        }
    };

    const copyLobbyId = () => {
        navigator.clipboard.writeText(lobbyId);
    };

    // Ensure we have an object to work with and add defensive checks
    const players = lobbyState?.players || {};
    const playerIds = Object.keys(players);
    const playersList = playerIds.map(id => players[id]);

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <Header />
            <div className="max-w-md mx-auto mt-12 space-y-8">
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">Meeting ID: {lobbyId}</h2>
                        <button
                            onClick={copyLobbyId}
                            className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                        >
                            Copy
                        </button>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Comrades Present:</h3>
                        <ul className="space-y-2">
                            {playerIds.length > 0 ? (
                                playersList.map((player, index) => (
                                    <li
                                        key={playerIds[index]}
                                        className="flex items-center space-x-2 bg-gray-700 p-2 rounded"
                                    >
                                        <span className="flex-grow">{player}</span>
                                        {playerIds[index] === lobbyState.host && (
                                            <span className="text-red-500">★</span>
                                        )}
                                    </li>
                                ))
                            ) : (
                                <li className="text-gray-500">No comrades present...</li>
                            )}
                        </ul>

                        {isHost && !lobbyState.isStarting && (
                            <button
                                onClick={handleStartGame}
                                disabled={playersList.length < 2}
                                className={`w-full p-2 rounded transition-colors ${
                                    playersList.length < 2
                                        ? 'bg-gray-600 cursor-not-allowed'
                                        : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                {playersList.length < 2
                                    ? 'Waiting for More Comrades...'
                                    : 'Begin Meeting'}
                            </button>
                        )}

                        {lobbyState.isStarting && (
                            <div className="text-center">
                                <p className="text-2xl font-bold text-red-500">
                                    Meeting Begins in {lobbyState.startCountdown}...
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="text-red-500 text-center">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LobbyScreen; 