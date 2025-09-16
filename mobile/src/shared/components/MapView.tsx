import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Card } from '@components/ui';
import { MapPin, Users, Clock, DollarSign } from 'lucide-react';
import { getSportEmoji, formatGameTime } from '@api/games';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon for games
const createGameIcon = (sport: string, isSelected: boolean = false) => {
  return L.divIcon({
    className: 'custom-game-marker',
    html: `
      <div class="w-8 h-8 bg-[var(--brand-primary)] rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-sm font-bold ${
        isSelected ? 'ring-4 ring-[var(--brand-primary)]/30 scale-110' : ''
      }">
        ${getSportEmoji(sport)}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

interface Game {
  id: number;
  sport: string;
  location: string;
  time: string;
  latitude?: number;
  longitude?: number;
  currentPlayers?: number;
  maxPlayers?: number;
  pricePerPlayer?: number;
  skillLevel?: string;
  venue?: {
    name: string;
    address: string;
  };
  description?: string;
  status?: 'ACTIVE' | 'FULL' | 'CANCELLED' | 'COMPLETED';
}

interface MapViewProps {
  games: Game[];
  onGameSelect: (game: Game) => void;
  selectedGame?: Game;
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
}

// Component to update map view when selected game changes
const MapUpdater: React.FC<{ selectedGame?: Game }> = ({ selectedGame }) => {
  const map = useMap();
  
  useEffect(() => {
    if (selectedGame && selectedGame.latitude && selectedGame.longitude) {
      map.setView([selectedGame.latitude, selectedGame.longitude], map.getZoom());
    }
  }, [selectedGame, map]);
  
  return null;
};

const MapView: React.FC<MapViewProps> = ({ 
  games, 
  onGameSelect, 
  selectedGame,
  center = { lat: 27.7172, lng: 85.324 }, // Default to Kathmandu
  zoom = 12,
  className = "h-96 w-full"
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Filter games that have valid coordinates
  const gamesWithCoords = games.filter(game => 
    game.latitude && game.longitude && 
    !isNaN(game.latitude) && !isNaN(game.longitude)
  );

  if (!isClient) {
    // Server-side rendering fallback
    return (
      <Card className={`p-4 ${className}`}>
        <div className="h-full bg-gradient-to-br from-blue-100 to-green-100 rounded-lg relative overflow-hidden flex items-center justify-center">
          <div className="text-center text-gray-600">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-blue-500" />
            <h3 className="text-lg font-semibold mb-2">Loading Map...</h3>
            <p className="text-sm">Map will load shortly</p>
          </div>
        </div>
      </Card>
    );
  }

  if (gamesWithCoords.length === 0) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="h-full bg-gradient-to-br from-blue-100 to-green-100 rounded-lg relative overflow-hidden flex items-center justify-center">
          <div className="text-center text-gray-600">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-blue-500" />
            <h3 className="text-lg font-semibold mb-2">No Games Found</h3>
            <p className="text-sm">No games with location data available</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="h-full rounded-lg overflow-hidden">
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <MapUpdater selectedGame={selectedGame} />
          
          {gamesWithCoords.map((game) => {
            const { day, time } = formatGameTime(game.time);
            const isFull = (game.currentPlayers || 0) >= (game.maxPlayers || 0);
            
            return (
              <Marker
                key={game.id}
                position={[game.latitude!, game.longitude!]}
                icon={createGameIcon(game.sport, selectedGame?.id === game.id)}
                eventHandlers={{
                  click: () => onGameSelect(game),
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getSportEmoji(game.sport)}</span>
                      <h3 className="font-semibold text-sm">{game.sport}</h3>
                    </div>
                    
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{day} {time}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{game.venue?.name || game.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{game.currentPlayers || 0}/{game.maxPlayers || 0} players</span>
                        {isFull && <span className="text-red-500 font-medium">Full</span>}
                      </div>
                      
                      {game.pricePerPlayer && game.pricePerPlayer > 0 && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          <span>NPR {game.pricePerPlayer}</span>
                        </div>
                      )}
                      
                      {game.skillLevel && (
                        <div className="text-xs">
                          <span className="font-medium">Level:</span> {game.skillLevel}
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => onGameSelect(game)}
                      className="w-full mt-2 px-3 py-1 bg-[var(--brand-primary)] text-white text-xs rounded hover:bg-[var(--brand-primary)]/90 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </Card>
  );
};

export default MapView;
