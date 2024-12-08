import React, { useState } from 'react';
import { gameApi } from '../services/api';
import Header from './Header';

const StartScreen = ({ onGameStart }) => {
    const [username, setUsername] = useState('');
    const [lobbyId, setLobbyId] = useState('');
    const [error, setError] = useState('');

    const handleCreateLobby = async (e) => {
        e.preventDefault();
        if (!username.trim()) {
            setError('Username is required');
            return;
        }
        try {
            const response = await gameApi.createLobby(username);
            onGameStart(response.lobby_id, response.player_id, true);
        } catch (err) {
            setError('Failed to create lobby');
        }
    };

    const handleJoinLobby = async (e) => {
        e.preventDefault();
        if (!username.trim() || !lobbyId.trim()) {
            setError('Both username and lobby ID are required');
            return;
        }
        try {
            const response = await gameApi.joinLobby(lobbyId, username);
            console.log('Join response:', response);
            if (response.success) {
                console.log('Calling onGameStart with:', { 
                    lobbyId: response.lobby_id, 
                    playerId: response.player_id 
                });
                onGameStart(response.lobby_id, response.player_id, false);
            } else {
                setError(response.message || 'Failed to join lobby');
            }
        } catch (err) {
            console.error('Join lobby error:', err);
            setError('Failed to join lobby');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <Header />
            <div className="max-w-md mx-auto mt-12 space-y-8">
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <input
                        type="text"
                        placeholder="Enter your name, comrade"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-2 mb-4 bg-gray-700 rounded text-white"
                    />
                    
                    <div className="space-y-4">
                        <button
                            onClick={handleCreateLobby}
                            className="w-full bg-red-600 hover:bg-red-700 p-2 rounded transition-colors"
                        >
                            Create New Party Meeting
                        </button>
                        
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-600"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-gray-800 px-2 text-gray-400">OR</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <input
                                type="text"
                                placeholder="Enter Meeting ID"
                                value={lobbyId}
                                onChange={(e) => setLobbyId(e.target.value)}
                                className="w-full p-2 bg-gray-700 rounded text-white"
                            />
                            <button
                                onClick={handleJoinLobby}
                                className="w-full bg-gray-600 hover:bg-gray-700 p-2 rounded transition-colors"
                            >
                                Join Existing Meeting
                            </button>
                        </div>
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

export default StartScreen;
