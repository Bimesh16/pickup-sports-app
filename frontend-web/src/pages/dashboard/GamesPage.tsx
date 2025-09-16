import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, Badge } from '@components/ui';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Users, 
  DollarSign,
  Calendar,
  Map,
  List,
  ChevronDown,
  X,
  Plus,
  Minus,
  Star,
  TrendingUp,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { useLocationContext } from '@context/LocationContext';
import { mockDashboardApi } from './mockData';
import { apiClient } from '@lib/apiClient';

// Types
interface Game {
  id: string;
  sport: string;
  venue: string;
  time: string;
  price: number;
  playersCount: number;
  maxPlayers: number;
  skillLevel: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  distance?: number;
  isPrivate: boolean;
  createdBy: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
  description: string;
  status: 'ACTIVE' | 'FULL' | 'CANCELLED';
}

interface FilterState {
  sport: string;
  location: string;
  date: string;
  skillLevel: string;
  priceRange: [number, number];
  playerCount: [number, number];
  distance: number;
  isPrivate: boolean | null;
  sortBy: 'distance' | 'time' | 'price' | 'popularity';
  sortOrder: 'asc' | 'desc';
}

interface MapViewProps {
  games: Game[];
  onGameSelect: (game: Game) => void;
  selectedGame?: Game;
}

// Map View Component (using a simple div for now, can be replaced with react-leaflet)
const MapView: React.FC<MapViewProps> = ({ games, onGameSelect, selectedGame }) => {
  return (
    <div className="h-full bg-gradient-to-br from-blue-100 to-green-100 rounded-lg relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-gray-600">
          <Map className="w-16 h-16 mx-auto mb-4 text-blue-500" />
          <h3 className="text-lg font-semibold mb-2">Interactive Map</h3>
          <p className="text-sm">Map integration coming soon</p>
          <p className="text-xs mt-2">{games.length} games in your area</p>
        </div>
      </div>
      
      {/* Mock markers */}
      {games.slice(0, 5).map((game, index) => (
        <button
          key={game.id}
          onClick={() => onGameSelect(game)}
          className={`absolute w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform ${
            selectedGame?.id === game.id ? 'ring-4 ring-blue-300' : ''
          }`}
          style={{
            left: `${20 + (index * 15)}%`,
            top: `${30 + (index * 10)}%`
          }}
        >
          <span className="text-white text-xs font-bold">{game.sport[0]}</span>
        </button>
      ))}
    </div>
  );
};

// Game Card Component
interface GameCardProps {
  game: Game;
  onJoin: (gameId: string) => void;
  isJoining?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ game, onJoin, isJoining = false }) => {
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    };
  };

  const { day, time } = formatTime(game.time);
  const isFull = game.playersCount >= game.maxPlayers;
  const canJoin = game.status === 'ACTIVE' && !isFull;

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow border border-[var(--border)] hover:border-[var(--brand-primary)]/50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[var(--brand-primary)]/10 rounded-lg flex items-center justify-center">
            <span className="text-2xl">
              {game.sport === 'Futsal' ? '⚽' : 
               game.sport === 'Basketball' ? '🏀' : 
               game.sport === 'Cricket' ? '🏏' : 
               game.sport === 'Volleyball' ? '🏐' : 
               game.sport === 'Badminton' ? '🏸' : 
               game.sport === 'Tennis' ? '🎾' : '⚽'}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-[var(--text)]">{game.sport}</h3>
            <p className="text-sm text-[var(--text-muted)]">{game.venue}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold text-[var(--brand-primary)]">NPR {game.price}</div>
          {game.distance && (
            <div className="text-xs text-[var(--text-muted)]">{game.distance.toFixed(1)} km away</div>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <Calendar className="w-4 h-4" />
          <span>{day} {time}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <MapPin className="w-4 h-4" />
          <span className="truncate">{game.location.address}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <Users className="w-4 h-4" />
          <span>{game.playersCount}/{game.maxPlayers} players</span>
          {isFull && <Badge variant="error" size="sm">Full</Badge>}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <Star className="w-4 h-4" />
          <span>{game.skillLevel}</span>
          {game.isPrivate && <Badge variant="default" size="sm">Private</Badge>}
        </div>
      </div>

      {game.description && (
        <p className="text-sm text-[var(--text-muted)] mb-4 line-clamp-2">{game.description}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="text-xs text-[var(--text-muted)]">
          by @{game.createdBy.username}
        </div>
        
        <Button
          onClick={() => onJoin(game.id)}
          disabled={!canJoin || isJoining}
          className={`${
            canJoin 
              ? 'bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 text-white' 
              : 'bg-[var(--bg-muted)] text-[var(--text-muted)] cursor-not-allowed'
          }`}
          size="sm"
        >
          {isJoining ? 'Joining...' : canJoin ? 'Join' : isFull ? 'Full' : 'Closed'}
        </Button>
      </div>
    </Card>
  );
};

// Filter Drawer Component
interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({ isOpen, onClose, filters, onFiltersChange }) => {
  if (!isOpen) return null;

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-[var(--bg-surface)] shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Filters</h2>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium mb-2">Price Range (NPR)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={filters.priceRange[0]}
                  onChange={(e) => updateFilter('priceRange', [Number(e.target.value), filters.priceRange[1]])}
                  className="flex-1 px-3 py-2 border border-[var(--border)] rounded-lg"
                  placeholder="Min"
                />
                <span>-</span>
                <input
                  type="number"
                  value={filters.priceRange[1]}
                  onChange={(e) => updateFilter('priceRange', [filters.priceRange[0], Number(e.target.value)])}
                  className="flex-1 px-3 py-2 border border-[var(--border)] rounded-lg"
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Player Count */}
            <div>
              <label className="block text-sm font-medium mb-2">Player Count</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={filters.playerCount[0]}
                  onChange={(e) => updateFilter('playerCount', [Number(e.target.value), filters.playerCount[1]])}
                  className="flex-1 px-3 py-2 border border-[var(--border)] rounded-lg"
                  placeholder="Min"
                />
                <span>-</span>
                <input
                  type="number"
                  value={filters.playerCount[1]}
                  onChange={(e) => updateFilter('playerCount', [filters.playerCount[0], Number(e.target.value)])}
                  className="flex-1 px-3 py-2 border border-[var(--border)] rounded-lg"
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Distance */}
            <div>
              <label className="block text-sm font-medium mb-2">Distance (km)</label>
              <input
                type="range"
                min="1"
                max="50"
                value={filters.distance}
                onChange={(e) => updateFilter('distance', Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
                <span>1 km</span>
                <span>{filters.distance} km</span>
                <span>50 km</span>
              </div>
            </div>

            {/* Privacy */}
            <div>
              <label className="block text-sm font-medium mb-2">Game Type</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="privacy"
                    checked={filters.isPrivate === null}
                    onChange={() => updateFilter('isPrivate', null)}
                  />
                  <span>All Games</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="privacy"
                    checked={filters.isPrivate === false}
                    onChange={() => updateFilter('isPrivate', false)}
                  />
                  <span>Public Only</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="privacy"
                    checked={filters.isPrivate === true}
                    onChange={() => updateFilter('isPrivate', true)}
                  />
                  <span>Private Only</span>
                </label>
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <div className="space-y-2">
                {[
                  { value: 'distance', label: 'Distance' },
                  { value: 'time', label: 'Time' },
                  { value: 'price', label: 'Price' },
                  { value: 'popularity', label: 'Popularity' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="sortBy"
                      value={option.value}
                      checked={filters.sortBy === option.value}
                      onChange={(e) => updateFilter('sortBy', e.target.value as FilterState['sortBy'])}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-8">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Apply Filters
            </Button>
            <Button 
              onClick={() => {
                onFiltersChange({
                  sport: '',
                  location: '',
                  date: '',
                  skillLevel: '',
                  priceRange: [0, 1000],
                  playerCount: [2, 20],
                  distance: 10,
                  isPrivate: null,
                  sortBy: 'distance',
                  sortOrder: 'asc'
                });
                onClose();
              }}
              className="flex-1"
            >
              Clear All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main GamesPage Component
export default function GamesPage() {
  const { location } = useLocationContext();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | undefined>();
  const [joiningGames, setJoiningGames] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [filters, setFilters] = useState<FilterState>({
    sport: '',
    location: '',
    date: '',
    skillLevel: '',
    priceRange: [0, 1000],
    playerCount: [2, 20],
    distance: 10,
    isPrivate: null,
    sortBy: 'distance',
    sortOrder: 'asc'
  });

  // Fetch games
  const fetchGames = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    try {
      setLoading(true);
      
      // Use mock data for now
      const mockGames = await mockDashboardApi.getNearbyGames(
        location?.lat || 27.7172, 
        location?.lng || 85.324, 
        filters.distance
      );

      // Apply filters
      let filteredGames = mockGames.filter(game => {
        if (filters.sport && !game.sport.toLowerCase().includes(filters.sport.toLowerCase())) return false;
        if (filters.skillLevel && game.skillLevel !== filters.skillLevel) return false;
        if (filters.priceRange[0] > 0 && game.price < filters.priceRange[0]) return false;
        if (filters.priceRange[1] < 1000 && game.price > filters.priceRange[1]) return false;
        if (filters.playerCount[0] > 0 && game.playersCount < filters.playerCount[0]) return false;
        if (filters.playerCount[1] < 20 && game.playersCount > filters.playerCount[1]) return false;
        if (filters.isPrivate !== null && game.isPrivate !== filters.isPrivate) return false;
        return true;
      });

      // Add mock distance data
      filteredGames = filteredGames.map(game => ({
        ...game,
        distance: Math.random() * 10 + 1, // Mock distance
        isPrivate: Math.random() > 0.7, // Mock privacy
        createdBy: {
          id: Math.floor(Math.random() * 100),
          username: `user${Math.floor(Math.random() * 1000)}`,
          avatarUrl: ''
        },
        description: `Join us for an exciting ${game.sport.toLowerCase()} game! All skill levels welcome.`,
        status: game.playersCount >= game.maxPlayers ? 'FULL' : 'ACTIVE'
      }));

      // Sort games
      filteredGames.sort((a, b) => {
        let comparison = 0;
        switch (filters.sortBy) {
          case 'distance':
            comparison = (a.distance || 0) - (b.distance || 0);
            break;
          case 'time':
            comparison = new Date(a.time).getTime() - new Date(b.time).getTime();
            break;
          case 'price':
            comparison = a.price - b.price;
            break;
          case 'popularity':
            comparison = b.playersCount - a.playersCount;
            break;
        }
        return filters.sortOrder === 'asc' ? comparison : -comparison;
      });

      if (reset) {
        setGames(filteredGames);
        setPage(1);
      } else {
        setGames(prev => [...prev, ...filteredGames]);
      }
      
      setHasMore(filteredGames.length === 20); // Assuming 20 items per page
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  }, [location, filters]);

  // Load more games
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      fetchGames(page + 1, false);
    }
  };

  // Join game
  const handleJoinGame = async (gameId: string) => {
    try {
      setJoiningGames(prev => new Set(prev).add(gameId));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update game in state
      setGames(prev => prev.map(game => 
        game.id === gameId 
          ? { ...game, playersCount: game.playersCount + 1 }
          : game
      ));
      
      // Show success message (you can implement a toast here)
      console.log('Joined game successfully!');
    } catch (error) {
      console.error('Error joining game:', error);
    } finally {
      setJoiningGames(prev => {
        const newSet = new Set(prev);
        newSet.delete(gameId);
        return newSet;
      });
    }
  };

  // Initial load
  useEffect(() => {
    fetchGames(1, true);
  }, [fetchGames]);

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Main Search Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search sports..."
                value={filters.sport}
                onChange={(e) => setFilters(prev => ({ ...prev, sport: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Location"
                value={filters.location || location?.name || 'Kathmandu'}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
              />
            </div>
            
            <select
              value={filters.skillLevel}
              onChange={(e) => setFilters(prev => ({ ...prev, skillLevel: e.target.value }))}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
            >
              <option value="">All Levels</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowFilters(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>
              
              <div className="flex items-center gap-1 bg-[var(--bg-muted)] rounded-lg p-1">
                <Button
                  onClick={() => setViewMode('list')}
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">List</span>
                </Button>
                <Button
                  onClick={() => setViewMode('map')}
                  variant={viewMode === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Map className="w-4 h-4" />
                  <span className="hidden sm:inline">Map</span>
                </Button>
              </div>
            </div>

            <div className="text-sm text-[var(--text-muted)]">
              {games.length} games found
            </div>
          </div>
        </div>
      </Card>

      {/* Content Area */}
      <div className={`grid gap-4 ${viewMode === 'list' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-5'}`}>
        {/* Games List */}
        <div className={`${viewMode === 'map' ? 'lg:col-span-3' : 'col-span-1'}`}>
          {loading && games.length === 0 ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-4 animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-[var(--bg-muted)] rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-[var(--bg-muted)] rounded w-1/3"></div>
                      <div className="h-3 bg-[var(--bg-muted)] rounded w-1/2"></div>
                      <div className="h-3 bg-[var(--bg-muted)] rounded w-2/3"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {games.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onJoin={handleJoinGame}
                  isJoining={joiningGames.has(game.id)}
                />
              ))}
              
              {hasMore && (
                <div className="text-center py-4">
                  <Button
                    onClick={loadMore}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    {loading ? 'Loading...' : 'Load More Games'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Map View */}
        {viewMode === 'map' && (
          <div className="lg:col-span-2 h-96 lg:h-auto">
            <Card className="h-full p-4">
              <MapView
                games={games}
                onGameSelect={setSelectedGame}
                selectedGame={selectedGame}
              />
            </Card>
          </div>
        )}
      </div>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </div>
  );
}