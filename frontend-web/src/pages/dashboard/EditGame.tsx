import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gamesApi, CreateGameRequest } from '@api/games';
import CreateGame from './CreateGame';
import { Card } from '@components/ui';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import ErrorBoundary from '@components/ErrorBoundary';

export default function EditGame() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [gameData, setGameData] = useState<Partial<CreateGameRequest> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGameData = async () => {
      if (!id) {
        setError('Game ID is required');
        setLoading(false);
        return;
      }

      try {
        const game = await gamesApi.getGameDetails(parseInt(id));
        
        // Transform game data to CreateGameRequest format
        const initialData: Partial<CreateGameRequest> = {
          sport: game.sport,
          title: game.sport || 'Game', // Use sport as default title if no title field
          description: game.description || '',
          time: game.time,
          location: game.location,
          latitude: game.latitude,
          longitude: game.longitude,
          skillLevel: (game.skillLevel as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ANY') || 'ANY',
          maxPlayers: game.maxPlayers || 10,
          minPlayers: 2, // Default since API doesn't provide minPlayers
          pricePerPlayer: game.pricePerPlayer || 0,
          gameType: 'PICKUP', // Default, could be enhanced based on game data
          duration: 90, // Default, could be enhanced based on game data
          equipment: '', // Could be enhanced based on game data
          rules: '', // Could be enhanced based on game data
          isPrivate: false, // Could be enhanced based on game data
          requiresApproval: false // Could be enhanced based on game data
        };

        setGameData(initialData);
      } catch (error) {
        console.error('Error fetching game data:', error);
        setError('Failed to load game data. You may not have permission to edit this game.');
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)]">
        <div className="relative bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] py-8">
          <div className="absolute inset-0 bg-[url('/images/nepal-pattern.svg')] opacity-10 bg-repeat" />
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Loading Game...</h1>
            <p className="text-white/80">Fetching game details for editing</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !gameData) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center">
          <Card className="p-8 text-center max-w-md">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              Unable to Edit Game
            </h3>
            <p className="text-[var(--text-muted)] mb-4">
              {error || 'Game not found or you may not have permission to edit this game.'}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/dashboard/games')}
                className="w-full px-4 py-2 bg-[var(--brand-primary)] text-white rounded-lg hover:bg-[var(--brand-primary)]/90 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Games
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 border border-[var(--border)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-muted)] transition-colors"
              >
                Try Again
              </button>
            </div>
          </Card>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <CreateGame
      isEditing={true}
      gameId={parseInt(id!)}
      initialData={gameData}
    />
  );
}
