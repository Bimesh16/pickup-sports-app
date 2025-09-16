import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, Badge, Modal } from '@components/ui';
import { 
  Search, 
  Filter, 
  MapPin, 
  Phone, 
  Users, 
  DollarSign,
  Star,
  Map,
  List,
  ChevronDown,
  X,
  Clock,
  Car,
  Droplets,
  Heart,
  Shield,
  Wifi,
  Coffee,
  Camera,
  ChevronRight
} from 'lucide-react';
import { useLocationContext } from '@context/LocationContext';
import { mockDashboardApi } from './mockData';
import { apiClient } from '@lib/apiClient';

// Types
interface Venue {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  capacity: number;
  hourlyRate: number;
  amenities: string[];
  location: {
    lat: number;
    lng: number;
  };
  distance?: number;
  rating?: number;
  reviewCount?: number;
  photos?: string[];
  isActive: boolean;
  sports: string[];
}

interface FilterState {
  sport: string;
  distance: number;
  priceRange: [number, number];
  amenities: string[];
  sortBy: 'distance' | 'price' | 'rating' | 'capacity';
  sortOrder: 'asc' | 'desc';
}

interface VenueDetailsModalProps {
  venue: Venue | null;
  isOpen: boolean;
  onClose: () => void;
  onBook: (venueId: string) => void;
  isBooking?: boolean;
}

// Amenity Icons Mapping
const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  parking: Car,
  locker_room: Users,
  shower: Droplets,
  first_aid: Heart,
  wifi: Wifi,
  refreshments: Coffee,
  security: Shield,
  photography: Camera,
  air_conditioning: Shield,
  lighting: Star
};

// Venue Card Component
interface VenueCardProps {
  venue: Venue;
  onClick: (venue: Venue) => void;
  onBook: (venueId: string) => void;
  isBooking?: boolean;
}

const VenueCard: React.FC<VenueCardProps> = ({ venue, onClick, onBook, isBooking = false }) => {
  const formatPrice = (price: number) => {
    return `NPR ${price.toLocaleString()}/hour`;
  };

  const getAmenityIcon = (amenity: string) => {
    const IconComponent = amenityIcons[amenity] || MapPin;
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <Card 
      className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer border border-[var(--border)] hover:border-[var(--brand-primary)]/50"
      onClick={() => onClick(venue)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-[var(--text)] text-lg mb-1">{venue.name}</h3>
          <p className="text-sm text-[var(--text-muted)] mb-2">{venue.address}</p>
          {venue.rating && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < Math.floor(venue.rating!) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <span className="text-sm text-[var(--text-muted)] ml-1">
                {venue.rating.toFixed(1)} ({venue.reviewCount} reviews)
              </span>
            </div>
          )}
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold text-[var(--brand-primary)]">
            {formatPrice(venue.hourlyRate)}
          </div>
          {venue.distance && (
            <div className="text-xs text-[var(--text-muted)]">{venue.distance.toFixed(1)} km away</div>
          )}
        </div>
      </div>

      <p className="text-sm text-[var(--text-muted)] mb-3 line-clamp-2">{venue.description}</p>

      <div className="flex items-center gap-4 mb-3 text-sm text-[var(--text-muted)]">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{venue.capacity} capacity</span>
        </div>
        <div className="flex items-center gap-1">
          <Phone className="w-4 h-4" />
          <span>{venue.phone}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {venue.amenities.slice(0, 4).map((amenity) => (
          <Badge 
            key={amenity} 
            variant="default" 
            size="sm" 
            className="flex items-center gap-1 bg-[var(--bg-muted)] text-[var(--text-muted)] border-0"
          >
            {getAmenityIcon(amenity)}
            <span className="capitalize">{amenity.replace('_', ' ')}</span>
          </Badge>
        ))}
        {venue.amenities.length > 4 && (
          <Badge variant="default" size="sm" className="bg-[var(--bg-muted)] text-[var(--text-muted)] border-0">
            +{venue.amenities.length - 4} more
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-[var(--text-muted)]">
          {venue.sports.join(', ')}
        </div>
        
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onBook(venue.id);
          }}
          disabled={isBooking}
          className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 text-white"
          size="sm"
        >
          {isBooking ? 'Booking...' : 'Book Venue'}
        </Button>
      </div>
    </Card>
  );
};

// Venue Details Modal
const VenueDetailsModal: React.FC<VenueDetailsModalProps> = ({ 
  venue, 
  isOpen, 
  onClose, 
  onBook, 
  isBooking = false 
}) => {
  if (!venue) return null;

  const formatPrice = (price: number) => {
    return `NPR ${price.toLocaleString()}/hour`;
  };

  const getAmenityIcon = (amenity: string) => {
    const IconComponent = amenityIcons[amenity] || MapPin;
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-2">{venue.name}</h2>
            <p className="text-[var(--text-muted)] mb-2">{venue.address}</p>
            {venue.rating && (
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.floor(venue.rating!) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <span className="text-sm text-[var(--text-muted)]">
                  {venue.rating.toFixed(1)} ({venue.reviewCount} reviews)
                </span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[var(--brand-primary)]">
              {formatPrice(venue.hourlyRate)}
            </div>
            {venue.distance && (
              <div className="text-sm text-[var(--text-muted)]">{venue.distance.toFixed(1)} km away</div>
            )}
          </div>
        </div>

        {/* Photos */}
        {venue.photos && venue.photos.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {venue.photos.slice(0, 4).map((photo, index) => (
              <div 
                key={index}
                className="aspect-video bg-[var(--bg-muted)] rounded-lg flex items-center justify-center"
              >
                <Camera className="w-8 h-8 text-[var(--text-muted)]" />
              </div>
            ))}
          </div>
        )}

        {/* Description */}
        <div>
          <h3 className="font-semibold text-[var(--text)] mb-2">About</h3>
          <p className="text-[var(--text-muted)]">{venue.description}</p>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--brand-primary)]" />
            <div>
              <div className="text-sm font-medium">Capacity</div>
              <div className="text-sm text-[var(--text-muted)]">{venue.capacity} people</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-[var(--brand-primary)]" />
            <div>
              <div className="text-sm font-medium">Phone</div>
              <div className="text-sm text-[var(--text-muted)]">{venue.phone}</div>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div>
          <h3 className="font-semibold text-[var(--text)] mb-3">Amenities</h3>
          <div className="grid grid-cols-2 gap-3">
            {venue.amenities.map((amenity) => (
              <div key={amenity} className="flex items-center gap-2">
                {getAmenityIcon(amenity)}
                <span className="text-sm capitalize">{amenity.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sports */}
        <div>
          <h3 className="font-semibold text-[var(--text)] mb-2">Available Sports</h3>
          <div className="flex flex-wrap gap-2">
            {venue.sports.map((sport) => (
              <Badge key={sport} variant="default" className="bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border-0">
                {sport}
              </Badge>
            ))}
          </div>
        </div>

        {/* Map */}
        <div>
          <h3 className="font-semibold text-[var(--text)] mb-2">Location</h3>
          <div className="h-48 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-600">
              <Map className="w-12 h-12 mx-auto mb-2 text-blue-500" />
              <p className="text-sm">Interactive map coming soon</p>
              <p className="text-xs">{venue.address}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[var(--border)]">
          <Button
            onClick={() => onBook(venue.id)}
            disabled={isBooking}
            className="flex-1 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 text-white"
          >
            {isBooking ? 'Booking...' : 'Book This Venue'}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
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

  const toggleAmenity = (amenity: string) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    updateFilter('amenities', newAmenities);
  };

  const availableAmenities = [
    'parking', 'locker_room', 'shower', 'first_aid', 'wifi', 
    'refreshments', 'security', 'air_conditioning', 'lighting'
  ];

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

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium mb-2">Price Range (NPR/hour)</label>
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

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium mb-2">Amenities</label>
              <div className="space-y-2">
                {availableAmenities.map((amenity) => (
                  <label key={amenity} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                    />
                    <span className="capitalize">{amenity.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <div className="space-y-2">
                {[
                  { value: 'distance', label: 'Distance' },
                  { value: 'price', label: 'Price' },
                  { value: 'rating', label: 'Rating' },
                  { value: 'capacity', label: 'Capacity' }
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
                  distance: 10,
                  priceRange: [0, 5000],
                  amenities: [],
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

// Main VenuesPage Component
export default function VenuesPage() {
  const { location } = useLocationContext();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [bookingVenues, setBookingVenues] = useState<Set<string>>(new Set());

  const [filters, setFilters] = useState<FilterState>({
    sport: '',
    distance: 10,
    priceRange: [0, 5000],
    amenities: [],
    sortBy: 'distance',
    sortOrder: 'asc'
  });

  // Fetch venues
  const fetchVenues = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use mock data for now
      const mockVenues = await mockDashboardApi.getVenues();
      
      // Transform mock data to match Venue interface
      const transformedVenues: Venue[] = mockVenues.map(venue => ({
        id: venue.id.toString(),
        name: venue.name,
        description: venue.description,
        address: venue.address,
        phone: venue.phone,
        capacity: venue.capacity,
        hourlyRate: venue.hourlyRate,
        amenities: venue.amenities,
        location: {
          lat: venue.latitude,
          lng: venue.longitude
        },
        distance: Math.random() * 10 + 1, // Mock distance
        rating: 4 + Math.random(), // Mock rating
        reviewCount: Math.floor(Math.random() * 100) + 10, // Mock review count
        photos: [], // Mock photos
        isActive: venue.isActive,
        sports: ['Futsal', 'Basketball', 'Volleyball'] // Mock sports
      }));

      // Apply filters
      let filteredVenues = transformedVenues.filter(venue => {
        if (filters.distance > 0 && (venue.distance || 0) > filters.distance) return false;
        if (filters.priceRange[0] > 0 && venue.hourlyRate < filters.priceRange[0]) return false;
        if (filters.priceRange[1] < 5000 && venue.hourlyRate > filters.priceRange[1]) return false;
        if (filters.amenities.length > 0 && !filters.amenities.every(amenity => venue.amenities.includes(amenity))) return false;
        return true;
      });

      // Sort venues
      filteredVenues.sort((a, b) => {
        let comparison = 0;
        switch (filters.sortBy) {
          case 'distance':
            comparison = (a.distance || 0) - (b.distance || 0);
            break;
          case 'price':
            comparison = a.hourlyRate - b.hourlyRate;
            break;
          case 'rating':
            comparison = (b.rating || 0) - (a.rating || 0);
            break;
          case 'capacity':
            comparison = b.capacity - a.capacity;
            break;
        }
        return filters.sortOrder === 'asc' ? comparison : -comparison;
      });

      setVenues(filteredVenues);
    } catch (error) {
      console.error('Error fetching venues:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Book venue
  const handleBookVenue = async (venueId: string) => {
    try {
      setBookingVenues(prev => new Set(prev).add(venueId));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message (you can implement a toast here)
      console.log('Venue booked successfully!');
      
      // Close modal
      setSelectedVenue(null);
    } catch (error) {
      console.error('Error booking venue:', error);
    } finally {
      setBookingVenues(prev => {
        const newSet = new Set(prev);
        newSet.delete(venueId);
        return newSet;
      });
    }
  };

  // Initial load
  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Main Search Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search venues..."
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
                value={location?.name || 'Kathmandu'}
                className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
                readOnly
              />
            </div>
            
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as FilterState['sortBy'] }))}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
            >
              <option value="distance">Sort by Distance</option>
              <option value="price">Sort by Price</option>
              <option value="rating">Sort by Rating</option>
              <option value="capacity">Sort by Capacity</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button
              onClick={() => setShowFilters(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            
            <div className="text-sm text-[var(--text-muted)]">
              {venues.length} venues found
            </div>
          </div>
        </div>
      </Card>

      {/* Venues List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 bg-[var(--bg-muted)] rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[var(--bg-muted)] rounded w-1/3"></div>
                    <div className="h-3 bg-[var(--bg-muted)] rounded w-1/2"></div>
                    <div className="h-3 bg-[var(--bg-muted)] rounded w-2/3"></div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-[var(--bg-muted)] rounded w-16"></div>
                      <div className="h-6 bg-[var(--bg-muted)] rounded w-20"></div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : venues.length > 0 ? (
          venues.map((venue) => (
            <VenueCard
              key={venue.id}
              venue={venue}
              onClick={setSelectedVenue}
              onBook={handleBookVenue}
              isBooking={bookingVenues.has(venue.id)}
            />
          ))
        ) : (
          <Card className="p-8 text-center">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-[var(--text-muted)] opacity-50" />
            <h3 className="text-lg font-semibold text-[var(--text)] mb-2">No venues found</h3>
            <p className="text-[var(--text-muted)] mb-4">
              Try adjusting your filters or search criteria
            </p>
            <Button
              onClick={() => setShowFilters(true)}
              variant="outline"
            >
              Adjust Filters
            </Button>
          </Card>
        )}
      </div>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Venue Details Modal */}
      <VenueDetailsModal
        venue={selectedVenue}
        isOpen={!!selectedVenue}
        onClose={() => setSelectedVenue(null)}
        onBook={handleBookVenue}
        isBooking={selectedVenue ? bookingVenues.has(selectedVenue.id) : false}
      />
    </div>
  );
}