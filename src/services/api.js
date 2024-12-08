const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const gameApi = {
    // Create a new game lobby
    createLobby: async (username) => {
        const response = await fetch(`${API_BASE_URL}/game/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });
        return response.json();
    },

    // Join an existing lobby
    joinLobby: async (lobbyId, username) => {
        const response = await fetch(`${API_BASE_URL}/game/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lobby_id: lobbyId, username })
        });
        return response.json();
    },

    // Start the game (host only)
    startGame: async (lobbyId, hostId) => {
        const response = await fetch(`${API_BASE_URL}/game/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lobby_id: lobbyId, host_id: hostId })
        });
        return response.json();
    },

    // Get lobby status
    getLobbyStatus: async (lobbyId) => {
        const response = await fetch(`${API_BASE_URL}/game/status/${lobbyId}`);
        return response.json();
    },

    // Nominate president
    nominatePresident: async (lobbyId, nomineeId) => {
        const response = await fetch(`${API_BASE_URL}/game/nominate/president`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lobby_id: lobbyId, nominee_id: nomineeId })
        });
        return response.json();
    },

    // Nominate ministers
    nominateMinisters: async (lobbyId, presidentId, nomineeIds) => {
        const response = await fetch(`${API_BASE_URL}/game/nominate/ministers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                lobby_id: lobbyId,
                president_id: presidentId,
                nominee_ids: nomineeIds
            })
        });
        return response.json();
    },

    // Submit approval vote
    submitApprovalVote: async (lobbyId, voterId, vote) => {
        const response = await fetch(`${API_BASE_URL}/game/vote/approval`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                lobby_id: lobbyId,
                voter_id: voterId,
                vote
            })
        });
        return response.json();
    },

    // Submit policy vote
    submitPolicyVote: async (lobbyId, ministerId, vote) => {
        const response = await fetch(`${API_BASE_URL}/game/vote/policy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                lobby_id: lobbyId,
                minister_id: ministerId,
                vote
            })
        });
        return response.json();
    },

    // Initiate execution
    initiateExecution: async (lobbyId, accuserId, accusedId) => {
        const response = await fetch(`${API_BASE_URL}/game/execute/initiate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                lobby_id: lobbyId,
                accuser_id: accuserId,
                accused_id: accusedId
            })
        });
        return response.json();
    },

    // Submit execution vote
    submitExecutionVote: async (lobbyId, voterId, vote) => {
        const response = await fetch(`${API_BASE_URL}/game/execute/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                lobby_id: lobbyId,
                voter_id: voterId,
                vote
            })
        });
        return response.json();
    },

    // Get player role
    getPlayerRole: async (lobbyId, playerId) => {
        const response = await fetch(`${API_BASE_URL}/game/role/${lobbyId}/${playerId}`);
        return response.json();
    }
}; 