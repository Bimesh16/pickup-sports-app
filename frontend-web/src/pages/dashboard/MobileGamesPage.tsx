import React, { useState, useEffect } from 'react';
import { Button, Card, Badge, Input } from '@components/ui';
import MobileBottomSheet from '@components/MobileBottomSheet';
import MobileDrawer from '@components/MobileDrawer';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Users, 
  DollarSign,
  Map,
  List,
  SlidersHorizontal,
  Calendar,
  Star,
  ChevronDown
} from 'lucide-react';
import { cn } from '@lib/utils';

const MobileGamesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [sortBy, setSortBy] = useState('distance');
  const [games, setGames] = useState([
    {
      id: '1',
      sport: 'Football',
      venue: 'Kathmandu Sports Complex',
      time: 'Today, 2:00 PM',
      price: 500,
      players: '8/12',
      distance: '0.5 km',
      rating: 4.8,
      image: '/api/placeholder/300/200'
    },
    {
      id: '2',
      sport: 'Basketball',
      venue: 'Basketball Court',
      time: 'Tomorrow, 10:00 AM',
      price: 300,
      players: '4/10',
      distance: '1.2 km',
      rating: 4.5,
      image: '/api/placeholder/300/200'
    }
  ]);

  const [filters, setFilters] = useState({
    sport: '',
    date: '',
    time: '',
    priceRange: [0, 1000],
    distance: 10,
    skillLevel: ''
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    // Apply filters logic here
    setIsFiltersOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      sport: '',
      date: '',
      time: '',
      priceRange: [0, 1000],
      distance: 10,
      skillLevel: ''
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="sticky top-0 z-30 bg-[var(--bg-surface)] pb-4">
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search games..."
              className="pl-10 h-11"
            />
          </div>
          
          <button
            onClick={() => setIsFiltersOpen(true)}
            className="px-4 py-2 bg-[var(--bg-muted)] rounded-lg text-[var(--text)] hover:bg-[var(--bg-hover)] transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Open filters"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSortBy('distance')}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors touch-manipulation min-h-[36px]",
              sortBy === 'distance' 
                ? "bg-[var(--brand-primary)] text-white" 
                : "bg-[var(--bg-muted)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"
            )}
          >
            Distance
          </button>
          
          <button
            onClick={() => setSortBy('time')}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors touch-manipulation min-h-[36px]",
              sortBy === 'time' 
                ? "bg-[var(--brand-primary)] text-white" 
                : "bg-[var(--bg-muted)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"
            )}
          >
            Time
          </button>
          
          <button
            onClick={() => setSortBy('price')}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors touch-manipulation min-h-[36px]",
              sortBy === 'price' 
                ? "bg-[var(--brand-primary)] text-white" 
                : "bg-[var(--bg-muted)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"
            )}
          >
            Price
          </button>
        </div>
      </div>

      {/* View Toggle - Mobile */}
      <div className="md:hidden flex justify-between items-center">
        <h2 className="text-lg font-semibold text-[var(--text)]">
          {games.length} games found
        </h2>
        
        <div className="flex bg-[var(--bg-muted)] rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "p-2 rounded-md transition-colors touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center",
              viewMode === 'list' 
                ? "bg-white text-[var(--brand-primary)] shadow-sm" 
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            )}
            aria-label="List view"
          >
            <List className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setViewMode('map')}
            className={cn(
              "p-2 rounded-md transition-colors touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center",
              viewMode === 'map' 
                ? "bg-white text-[var(--brand-primary)] shadow-sm" 
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            )}
            aria-label="Map view"
          >
            <Map className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Games List */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {games.map((game) => (
            <Card key={game.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex gap-3">
                <div className="w-16 h-16 bg-[var(--bg-muted)] rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">⚽</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-[var(--text)] truncate">
                        {game.sport}
                      </h3>
                      <p className="text-sm text-[var(--text-muted)] truncate">
                        {game.venue}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-2">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-[var(--text-muted)]">
                        {game.rating}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{game.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{game.distance}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{game.players}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-[var(--success)]" />
                      <span className="font-semibold text-[var(--success)]">
                        {game.price}
                      </span>
                    </div>
                    
                    <Button
                      size="sm"
                      className="px-4 py-2 text-sm font-medium touch-manipulation min-h-[36px]"
                    >
                      Join
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Map View Placeholder */}
      {viewMode === 'map' && (
        <div className="h-96 bg-[var(--bg-muted)] rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Map className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-2" />
            <p className="text-[var(--text-muted)]">Map view coming soon</p>
          </div>
        </div>
      )}

      {/* Filters Drawer */}
      <MobileDrawer
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        title="Filters"
        side="right"
        size="md"
      >
        <div className="p-4 space-y-6">
          {/* Sport Filter */}
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">
              Sport
            </label>
            <select
              value={filters.sport}
              onChange={(e) => handleFilterChange('sport', e.target.value)}
              className="w-full p-3 border border-[var(--border)] rounded-lg bg-[var(--bg-surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
            >
              <option value="">All Sports</option>
              <option value="football">Football</option>
              <option value="basketball">Basketball</option>
              <option value="cricket">Cricket</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">
              Date
            </label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              className="w-full p-3 border border-[var(--border)] rounded-lg bg-[var(--bg-surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
            />
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">
              Price Range: {filters.priceRange[0]} - {filters.priceRange[1]}
            </label>
            <input
              type="range"
              min="0"
              max="2000"
              step="100"
              value={filters.priceRange[1]}
              onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
              className="w-full"
            />
          </div>

          {/* Distance */}
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">
              Distance: {filters.distance} km
            </label>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={filters.distance}
              onChange={(e) => handleFilterChange('distance', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Skill Level */}
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">
              Skill Level
            </label>
            <select
              value={filters.skillLevel}
              onChange={(e) => handleFilterChange('skillLevel', e.target.value)}
              className="w-full p-3 border border-[var(--border)] rounded-lg bg-[var(--bg-surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
            >
              <option value="">Any Level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="flex-1 touch-manipulation min-h-[44px]"
            >
              Clear
            </Button>
            <Button
              onClick={applyFilters}
              className="flex-1 touch-manipulation min-h-[44px]"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </MobileDrawer>
    </div>
  );
};

export default MobileGamesPage;
