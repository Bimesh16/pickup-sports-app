import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGames, useJoinGame } from '../hooks/useGames';
import { useAuthStore } from '../lib/auth';
import { format } from 'date-fns';
import { 
  Plus, 
  MapPin, 
  Clock, 
  Users, 
  Star,
  Calendar,
  TrendingUp,
  Search
} from 'lucide-react';

export default function HomePage() {
  const { user } = useAuthStore();
  const { data: gamesResponse, isLoading, error } = useGames();
  const joinGameMutation = useJoinGame();
  const [captchaToken, setCaptchaToken] = useState('');
  const [showCaptcha, setShowCaptcha] = useState<number | null>(null);
  
  const handleJoinGame = async (gameId: number) => {
    try {
      await joinGameMutation.mutateAsync({ id: gameId, captchaToken: captchaToken || undefined });
      setShowCaptcha(null);
      setCaptchaToken('');
    } catch (error: any) {
      if (error.message === 'captcha_required') {
        setShowCaptcha(gameId);
      } else {
        alert(error.message || 'Failed to join game');
      }
    }
  };
  
  const games = gamesResponse?.content || [];
  
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.username}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Ready to find your next pickup game?
            </p>
          </div>
          <Link
            to="/create-game"
            className="btn-primary px-4 py-2 h-fit flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Game</span>
          </Link>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Calendar className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Games Available</p>
              <p className="text-2xl font-semibold text-gray-900">{games.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-success-100 rounded-lg">
              <Users className="w-6 h-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Your Skill Level</p>
              <p className="text-2xl font-semibold text-gray-900">
                {user?.skillLevel || 'Not set'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-warning-100 rounded-lg">
              <Star className="w-6 h-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Your Rating</p>
              <p className="text-2xl font-semibold text-gray-900">
                {user?.ratingAverage ? user.ratingAverage.toFixed(1) : 'No ratings'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/search"
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border-2 border-transparent hover:border-primary-200"
        >
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Search className="w-8 h-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Find Games</h3>
              <p className="text-gray-600">Search by location, sport, or skill level</p>
            </div>
          </div>
        </Link>
        
        <Link
          to="/profile"
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border-2 border-transparent hover:border-primary-200"
        >
          <div className="flex items-center">
            <div className="p-3 bg-success-100 rounded-lg">
              <TrendingUp className="w-8 h-8 text-success-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Update Profile</h3>
              <p className="text-gray-600">Manage your preferences and skills</p>
            </div>
          </div>
        </Link>
      </div>
      
      {/* Recent Games */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Available Games</h2>
        </div>
        
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">Failed to load games</p>
            </div>
          ) : games.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No games available</h3>
              <p className="mt-1 text-sm text-gray-500">
                Be the first to create a game in your area!
              </p>
              <div className="mt-6">
                <Link to="/create-game" className="btn-primary">
                  Create Game
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {games.slice(0, 5).map((game) => (
                <div key={game.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <h3 className="font-semibold text-gray-900">{game.sport}</h3>
                        <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                          {game.skillLevel || 'All levels'}
                        </span>
                      </div>
                      
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{game.location}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            {game.time ? format(new Date(game.time), 'MMM d, h:mm a') : 'Time TBD'}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{game.participants?.length || 0} players</span>
                        </div>
                      </div>
                      
                      <p className="mt-1 text-sm text-gray-600">
                        Organized by {game.user?.username}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/games/${game.id}`}
                        className="btn-secondary px-3 py-1 text-sm"
                      >
                        View Details
                      </Link>
                      
                      {showCaptcha === game.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={captchaToken}
                            onChange={(e) => setCaptchaToken(e.target.value)}
                            placeholder="CAPTCHA"
                            className="input text-sm w-24"
                          />
                          <button
                            onClick={() => handleJoinGame(game.id)}
                            disabled={joinGameMutation.isPending}
                            className="btn-success px-3 py-1 text-sm"
                          >
                            Join
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleJoinGame(game.id)}
                          disabled={joinGameMutation.isPending}
                          className="btn-success px-3 py-1 text-sm"
                        >
                          Join Game
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {games.length > 5 && (
                <div className="text-center pt-4">
                  <Link to="/search" className="btn-secondary">
                    View All Games
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}