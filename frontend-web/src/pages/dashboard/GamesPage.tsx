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
import { gamesApi, calculateDistance, formatGameTime, getSportEmoji } from '@api/games';
import { GameSummaryDTO } from '../../types/api';
import MapView from '@components/MapView';
import ErrorBoundary from '@components/ErrorBoundary';

// Types
interface Game extends GameSummaryDTO {
  distance?: number;
  venueName?: string;
  address?: string;
  pricePerPlayer?: number;
  playersCount?: number;
  isPrivate?: boolean;
  createdBy?: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
  description?: string;
  status?: 'ACTIVE' | 'FULL' | 'CANCELLED' | 'COMPLETED';
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


// Game Card Component
interface GameCardProps {
  game: Game;
  onJoin: (gameId: string) => void;
  isJoining?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ game, onJoin, isJoining = false }) => {
  const { day, time } = formatGameTime(game.time);
  const isFull = (game.currentPlayers || 0) >= (game.maxPlayers || 0);
  const canJoin = game.status === 'ACTIVE' && !isFull;

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow border border-[var(--border)] hover:border-[var(--brand-primary)]/50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[var(--brand-primary)]/10 rounded-lg flex items-center justify-center">
            <span className="text-2xl">{getSportEmoji(game.sport)}</span>
          </div>
          <div>
            <h3 className="font-semibold text-[var(--text)]">{game.sport}</h3>
            <p className="text-sm text-[var(--text-muted)]">{game.venue?.name || game.location}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold text-[var(--brand-primary)]">
            NPR {game.pricePerPlayer || 0}
          </div>
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
          <span className="truncate">{game.venue?.address || game.location}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <Users className="w-4 h-4" />
          <span>{game.currentPlayers || 0}/{game.maxPlayers || 0} players</span>
          {isFull && <Badge variant="error" size="sm">Full</Badge>}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <Star className="w-4 h-4" />
          <span>{game.skillLevel || 'Any Level'}</span>
          {game.isPrivate && <Badge variant="default" size="sm">Private</Badge>}
        </div>
      </div>

      {game.description && (
        <p className="text-sm text-[var(--text-muted)] mb-4 line-clamp-2">{game.description}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="text-xs text-[var(--text-muted)]">
          by @{game.creatorName || 'Unknown'}
        </div>
        
        <Button
          onClick={() => onJoin(game.id.toString())}
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
  const fetchGames = useCallback(async (pageNum: number = 0, reset: boolean = false) => {
    try {
      setLoading(true);
      
      // Prepare search parameters
      const searchParams = {
        sport: filters.sport || undefined,
        location: filters.location || undefined,
        skillLevel: filters.skillLevel || undefined,
        fromTime: filters.date ? new Date(filters.date).toISOString() : undefined,
        toTime: filters.date ? new Date(new Date(filters.date).getTime() + 24 * 60 * 60 * 1000).toISOString() : undefined,
        minPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
        maxPrice: filters.priceRange[1] < 1000 ? filters.priceRange[1] : undefined,
        minPlayers: filters.playerCount[0] > 0 ? filters.playerCount[0] : undefined,
        maxPlayers: filters.playerCount[1] < 20 ? filters.playerCount[1] : undefined,
        isPrivate: filters.isPrivate !== null ? filters.isPrivate : undefined,
        lat: location?.lat || 27.7172,
        lng: location?.lng || 85.324,
        radiusKm: filters.distance,
        page: pageNum,
        size: 20,
        sort: `${filters.sortBy},${filters.sortOrder}`
      };

      // Call the API
      const response = await gamesApi.searchGames(searchParams);
      
      // Calculate distances and transform data
      const transformedGames: Game[] = response.content.map(game => ({
        ...game,
        distance: game.latitude && game.longitude && location?.lat && location?.lng
          ? calculateDistance(location.lat, location.lng, game.latitude, game.longitude)
          : undefined,
        venueName: game.venue?.name,
        address: game.venue?.address || game.location,
        pricePerPlayer: game.pricePerPlayer || 0,
        playersCount: game.currentPlayers || 0,
        isPrivate: false, // Default to public, can be updated based on API response
        createdBy: {
          id: 0,
          username: game.creatorName || 'Unknown',
          avatarUrl: ''
        },
        description: game.description || `Join us for an exciting ${game.sport.toLowerCase()} game!`,
        status: game.status as 'ACTIVE' | 'FULL' | 'CANCELLED' | 'COMPLETED' || 'ACTIVE'
      }));

      if (reset) {
        setGames(transformedGames);
        setPage(0);
      } else {
        setGames(prev => [...prev, ...transformedGames]);
      }
      
      setHasMore(!response.last);
    } catch (error) {
      console.error('Error fetching games:', error);
      // Fallback to empty array on error
      if (reset) {
        setGames([]);
      }
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
      
      // Call the API to join the game
      const result = await gamesApi.joinGame(parseInt(gameId));
      
      // Update game in state
      setGames(prev => prev.map(game => 
        game.id.toString() === gameId 
          ? { 
              ...game, 
              currentPlayers: (game.currentPlayers || 0) + 1,
              status: result.status === 'confirmed' ? 'ACTIVE' : game.status
            }
          : game
      ));
      
      // Show success message
      console.log('Joined game successfully!', result.message);
    } catch (error) {
      console.error('Error joining game:', error);
      // You can show an error toast here
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
    fetchGames(0, true);
  }, [fetchGames]);

  // Refetch when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchGames(0, true);
    }, 500); // Debounce filter changes

    return () => clearTimeout(timeoutId);
  }, [filters.sport, filters.location, filters.date, filters.skillLevel, filters.priceRange, filters.playerCount, filters.distance, filters.isPrivate, filters.sortBy, filters.sortOrder]);

  return (
    <ErrorBoundary>
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
                  variant={viewMode === 'list' ? 'primary' : 'outline'}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">List</span>
                </Button>
                <Button
                  onClick={() => setViewMode('map')}
                  variant={viewMode === 'map' ? 'primary' : 'outline'}
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
                  isJoining={joiningGames.has(game.id.toString())}
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
            <MapView
              games={games}
              onGameSelect={setSelectedGame}
              selectedGame={selectedGame}
              center={location ? { lat: location.lat, lng: location.lng } : { lat: 27.7172, lng: 85.324 }}
              className="h-full"
            />
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
    </ErrorBoundary>
  );
}