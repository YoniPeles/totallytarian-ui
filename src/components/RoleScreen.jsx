import React, { useState, useEffect, useRef } from 'react';
import { gameApi } from '../services/api';

const RoleScreen = ({ lobbyId, playerId, onRoleConfirm, playerRole }) => {
    const [role, setRole] = useState(null);
    const [error, setError] = useState('');
    const [isRevealed, setIsRevealed] = useState(false);
    const hasInitiallyFetched = useRef(false);

    useEffect(() => {
        if (playerRole && !role) {
            setRole(playerRole);
        }
    }, [playerRole]);

    useEffect(() => {
        const fetchRole = async () => {
            if (role || hasInitiallyFetched.current) return;
            
            hasInitiallyFetched.current = true;
            try {
                const response = await gameApi.getPlayerRole(lobbyId, playerId);
                if (response.success && !role) {
                    setRole(response.role);
                } else if (!response.success) {
                    setError('Failed to fetch role');
                }
            } catch (err) {
                setError('Failed to fetch role');
                hasInitiallyFetched.current = false;
            }
        };

        if (!role && !hasInitiallyFetched.current) {
            fetchRole();
        }
    }, [lobbyId, playerId]);

    const getRoleDescription = () => {
        switch (role) {
            case 'thought_police':
                return {
                    title: "Thought Police",
                    description: "You are a member of the Thought Police. Your mission is to maintain order and identify dissidents. Win by either reaching maximum social order or eliminating all resistance members.",
                    color: "text-red-500"
                };
            case 'resistance':
                return {
                    title: "Resistance",
                    description: "You are a member of the Resistance. Appear loyal while secretly working to destabilize the regime. Win by reducing social order to minimum through careful sabotage.",
                    color: "text-blue-500"
                };
            case 'proles':
                return {
                    title: "Prole",
                    description: "You are a Prole. Survive by appearing loyal to the Party. You win with the Resistance if they succeed, or survive if the Party maintains control.",
                    color: "text-gray-300"
                };
            default:
                return {
                    title: "Unknown",
                    description: "Role not assigned",
                    color: "text-gray-500"
                };
        }
    };

    const handleReveal = () => {
        setIsRevealed(true);
    };

    const handleConfirm = () => {
        onRoleConfirm(role);
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-red-500 text-center">
                    {error}
                </div>
            </div>
        );
    }

    const roleInfo = getRoleDescription();

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center justify-center">
            <div className="max-w-2xl mx-auto text-center space-y-8">
                {!isRevealed ? (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-red-600">Your Role Assignment Awaits</h2>
                        <p className="text-gray-400">Click to reveal your role in the Party</p>
                        <button
                            onClick={handleReveal}
                            className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-lg transition-colors"
                        >
                            Reveal Role
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8 animate-fade-in">
                        <div className="space-y-4">
                            <h2 className={`text-4xl font-bold ${roleInfo.color}`}>
                                {roleInfo.title}
                            </h2>
                            <p className="text-xl text-gray-300">
                                {roleInfo.description}
                            </p>
                        </div>

                        <button
                            onClick={handleConfirm}
                            className="bg-gray-800 hover:bg-gray-700 px-8 py-3 rounded-lg transition-colors"
                        >
                            I Understand My Duty
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoleScreen; 