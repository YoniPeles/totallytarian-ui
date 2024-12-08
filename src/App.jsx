import { useState, useEffect, useRef } from 'react'
import StartScreen from './components/StartScreen'
import LobbyScreen from './components/LobbyScreen'
import RoleScreen from './components/RoleScreen'
import MainScreen from './components/MainScreen'
import VoteScreen from './components/VoteScreen'
import MinisterScreen from './components/MinisterScreen'
import { gameApi } from './services/api'
import './App.css'

function App() {
  const [gameState, setGameState] = useState({
    screen: 'start',
    lobbyId: null,
    playerId: null,
    isHost: false,
    playerRole: null,
    isGameOver: false,
    hasConfirmedRole: false
  })
  const [lobbyState, setLobbyState] = useState({
    players: {},
    isStarting: false,
    startCountdown: 0
  })
  const [error, setError] = useState('')
  const [pollingInterval, setPollingInterval] = useState(null);
  const pollInProgress = useRef(false);

  useEffect(() => {
    let consecutiveErrors = 0;
    const maxErrors = 5;
    let backoffTime = 1000;

    const fetchLobbyStatus = async () => {
      if (!gameState.lobbyId || pollInProgress.current || gameState.isGameOver) return;
      
      try {
        pollInProgress.current = true;
        const response = await gameApi.getLobbyStatus(gameState.lobbyId);
        
        if (response.success) {
          setLobbyState(response.status);
          consecutiveErrors = 0;
          backoffTime = 1000;

          if (response.status.game_over) {
            setGameState(prev => ({...prev, isGameOver: true}));
            if (pollingInterval) {
              clearInterval(pollingInterval);
              setPollingInterval(null);
            }
          } else if (response.status.is_started && gameState.screen === 'lobby') {
            setGameState(prev => ({
              ...prev,
              screen: prev.hasConfirmedRole ? 'main' : 'role'
            }));
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
        consecutiveErrors++;
        if (consecutiveErrors >= maxErrors) {
          backoffTime = Math.min(backoffTime * 2, 10000);
          if (pollingInterval) {
            clearInterval(pollingInterval);
          }
          setPollingInterval(setInterval(fetchLobbyStatus, backoffTime));
        }
        setError('Failed to fetch lobby status');
      } finally {
        pollInProgress.current = false;
      }
    };

    if (gameState.lobbyId && !gameState.isGameOver && !pollingInterval) {
      fetchLobbyStatus();
      const interval = setInterval(fetchLobbyStatus, backoffTime);
      setPollingInterval(interval);
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    };
  }, [gameState.lobbyId, gameState.isGameOver]);

  const handleGameStart = (lobbyId, playerId, isHost) => {
    setGameState({
      screen: 'lobby',
      lobbyId,
      playerId,
      isHost
    })
  }

  const handleRoleConfirm = (role) => {
    setGameState(prev => ({
      ...prev,
      screen: 'main',
      playerRole: role,
      hasConfirmedRole: true
    }))
  }

  const getActiveScreen = () => {
    if (!gameState.lobbyId) return 'start';
    if (gameState.isGameOver) return 'end';
    if (!gameState.hasConfirmedRole) return 'role';

    // Handle execution voting screen
    if (lobbyState?.stage === 'execution' && lobbyState?.living_players?.includes(gameState.playerId)) {
      return 'vote';
    }

    // Handle minister screen during policy phase
    if (lobbyState?.stage === 'policy' && 
        lobbyState?.nominated_ministers?.includes(gameState.playerId) &&
        lobbyState?.living_players?.includes(gameState.playerId)) {
      return 'minister';
    }

    // Handle voting screen
    if (lobbyState?.stage === 'voting' && lobbyState?.living_players?.includes(gameState.playerId)) {
      return 'vote';
    }

    return 'main';
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {gameState.screen === 'start' && (
        <StartScreen onGameStart={handleGameStart} />
      )}
      {gameState.screen === 'lobby' && (
        <LobbyScreen 
          lobbyId={gameState.lobbyId}
          playerId={gameState.playerId}
          isHost={gameState.isHost}
          lobbyState={lobbyState}
          error={error}
          setError={setError}
        />
      )}
      {gameState.screen === 'role' && (
        <RoleScreen 
          lobbyId={gameState.lobbyId}
          playerId={gameState.playerId}
          onRoleConfirm={handleRoleConfirm}
          playerRole={gameState.playerRole}
        />
      )}
      {gameState.screen === 'main' && (
        lobbyState.stage === 'voting' ? (
          <VoteScreen
            lobbyId={gameState.lobbyId}
            playerId={gameState.playerId}
            lobbyState={lobbyState}
          />
        ) : lobbyState.stage === 'policy' && 
          lobbyState.nominated_ministers?.includes(gameState.playerId) ? (
          <MinisterScreen
            lobbyId={gameState.lobbyId}
            playerId={gameState.playerId}
            lobbyState={lobbyState}
          />
        ) : (
          <MainScreen
            lobbyId={gameState.lobbyId}
            playerId={gameState.playerId}
            lobbyState={lobbyState}
          />
        )
      )}
    </div>
  )
}

export default App

