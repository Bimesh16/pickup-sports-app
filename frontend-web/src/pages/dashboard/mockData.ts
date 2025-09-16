import type { Game, Venue, Notification } from '@app-types/api';

const now = new Date();

export const mockDashboardApi = {
  async getGames(): Promise<Game[]> {
    const baseTime = now.getTime();
    return [
      {
        id: 101,
        sport: 'Futsal',
        location: 'Tundikhel Futsal Court',
        latitude: 27.7172,
        longitude: 85.324,
        gameTime: new Date(baseTime + 3600_000).toISOString(),
        skillLevel: 'INTERMEDIATE',
        description: 'Evening futsal match welcoming all hustle levels.',
        minPlayers: 8,
        maxPlayers: 12,
        currentPlayers: 7,
        pricePerPlayer: 150,
        durationMinutes: 90,
        status: 'ACTIVE',
        createdBy: { id: 1, username: 'sanjay', avatarUrl: '' },
        participants: [],
        venue: { name: 'Tundikhel Futsal Court', address: 'Kathmandu' },
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      },
      {
        id: 102,
        sport: 'Basketball',
        location: 'Kathmandu Sports Complex',
        latitude: 27.72,
        longitude: 85.33,
        gameTime: new Date(baseTime + 7200_000).toISOString(),
        skillLevel: 'ADVANCED',
        description: 'Full-court run focused on fast breaks and tight defence.',
        minPlayers: 8,
        maxPlayers: 10,
        currentPlayers: 6,
        pricePerPlayer: 0,
        durationMinutes: 120,
        status: 'ACTIVE',
        createdBy: { id: 2, username: 'anita', avatarUrl: '' },
        participants: [],
        venue: { name: 'Kathmandu Sports Complex', address: 'New Baneshwor' },
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      },
      {
        id: 103,
        sport: 'Cricket',
        location: 'TU Cricket Ground',
        latitude: 27.68,
        longitude: 85.31,
        gameTime: new Date(baseTime + 14400_000).toISOString(),
        skillLevel: 'BEGINNER',
        description: 'Friendly practice nets with coaching tips for new players.',
        minPlayers: 12,
        maxPlayers: 20,
        currentPlayers: 14,
        pricePerPlayer: 200,
        durationMinutes: 150,
        status: 'ACTIVE',
        createdBy: { id: 3, username: 'manish', avatarUrl: '' },
        participants: [],
        venue: { name: 'TU Cricket Ground', address: 'Kirtipur' },
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      },
      {
        id: 104,
        sport: 'Volleyball',
        location: 'Pulchowk Sports Complex',
        latitude: 27.69,
        longitude: 85.32,
        gameTime: new Date(baseTime + 18000_000).toISOString(),
        skillLevel: 'INTERMEDIATE',
        description: 'Competitive volleyball match for intermediate players.',
        minPlayers: 8,
        maxPlayers: 12,
        currentPlayers: 10,
        pricePerPlayer: 100,
        durationMinutes: 90,
        status: 'ACTIVE',
        createdBy: { id: 4, username: 'priya', avatarUrl: '' },
        participants: [],
        venue: { name: 'Pulchowk Sports Complex', address: 'Lalitpur' },
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      },
      {
        id: 105,
        sport: 'Badminton',
        location: 'Satdobato Sports Complex',
        latitude: 27.65,
        longitude: 85.30,
        gameTime: new Date(baseTime + 21600_000).toISOString(),
        skillLevel: 'ADVANCED',
        description: 'High-intensity badminton doubles match.',
        minPlayers: 4,
        maxPlayers: 8,
        currentPlayers: 6,
        pricePerPlayer: 80,
        durationMinutes: 60,
        status: 'ACTIVE',
        createdBy: { id: 5, username: 'rajesh', avatarUrl: '' },
        participants: [],
        venue: { name: 'Satdobato Sports Complex', address: 'Lalitpur' },
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      },
      {
        id: 106,
        sport: 'Tennis',
        location: 'Kathmandu Club',
        latitude: 27.72,
        longitude: 85.35,
        gameTime: new Date(baseTime + 25200_000).toISOString(),
        skillLevel: 'INTERMEDIATE',
        description: 'Tennis singles and doubles practice session.',
        minPlayers: 2,
        maxPlayers: 4,
        currentPlayers: 3,
        pricePerPlayer: 300,
        durationMinutes: 120,
        status: 'ACTIVE',
        createdBy: { id: 6, username: 'sophia', avatarUrl: '' },
        participants: [],
        venue: { name: 'Kathmandu Club', address: 'Durbarmarg' },
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      }
    ];
  },
  async getVenues(): Promise<Venue[]> {
    return [
      {
        id: 201,
        name: 'Dasharath Stadium Courts',
        description: 'Multi-purpose courts with locker rooms and cafe. Perfect for basketball, volleyball, and other indoor sports. Features modern facilities and professional-grade equipment.',
        address: 'Tripureshwor, Kathmandu',
        latitude: 27.6938,
        longitude: 85.3142,
        phone: '+977-1-4101234',
        capacity: 40,
        hourlyRate: 1800,
        amenities: ['parking', 'locker_room', 'refreshments', 'wifi', 'security'],
        isActive: true
      },
      {
        id: 202,
        name: 'Bhaktapur Arena',
        description: 'Indoor futsal turf with advanced lighting. State-of-the-art facility with air conditioning and professional-grade turf. Ideal for futsal and small-sided football games.',
        address: 'Suryabinayak, Bhaktapur',
        latitude: 27.6713,
        longitude: 85.4376,
        phone: '+977-1-5123456',
        capacity: 18,
        hourlyRate: 1500,
        amenities: ['parking', 'shower', 'first_aid', 'air_conditioning', 'lighting'],
        isActive: true
      },
      {
        id: 203,
        name: 'Kathmandu Sports Complex',
        description: 'Large multi-sport complex with multiple courts and fields. Features basketball courts, volleyball courts, and a main hall for various sports activities.',
        address: 'New Baneshwor, Kathmandu',
        latitude: 27.72,
        longitude: 85.33,
        phone: '+977-1-1234567',
        capacity: 60,
        hourlyRate: 2000,
        amenities: ['parking', 'locker_room', 'shower', 'first_aid', 'wifi', 'refreshments', 'security'],
        isActive: true
      },
      {
        id: 204,
        name: 'Pulchowk Sports Center',
        description: 'Modern sports facility with excellent amenities. Perfect for badminton, table tennis, and other indoor sports. Features professional lighting and ventilation.',
        address: 'Pulchowk, Lalitpur',
        latitude: 27.69,
        longitude: 85.32,
        phone: '+977-1-2345678',
        capacity: 25,
        hourlyRate: 1200,
        amenities: ['parking', 'locker_room', 'air_conditioning', 'lighting', 'wifi'],
        isActive: true
      },
      {
        id: 205,
        name: 'Satdobato Sports Complex',
        description: 'Comprehensive sports complex with multiple facilities. Features basketball courts, volleyball courts, and a main hall for various activities.',
        address: 'Satdobato, Lalitpur',
        latitude: 27.65,
        longitude: 85.30,
        phone: '+977-1-3456789',
        capacity: 50,
        hourlyRate: 1600,
        amenities: ['parking', 'locker_room', 'shower', 'first_aid', 'refreshments', 'security'],
        isActive: true
      },
      {
        id: 206,
        name: 'Kathmandu Club',
        description: 'Premium sports club with tennis courts and other facilities. Exclusive venue with high-end amenities and professional services.',
        address: 'Durbarmarg, Kathmandu',
        latitude: 27.72,
        longitude: 85.35,
        phone: '+977-1-4567890',
        capacity: 15,
        hourlyRate: 3000,
        amenities: ['parking', 'locker_room', 'shower', 'wifi', 'refreshments', 'security', 'air_conditioning'],
        isActive: true
      },
      {
        id: 207,
        name: 'TU Cricket Ground',
        description: 'Large outdoor cricket ground with practice nets. Perfect for cricket practice and matches. Features well-maintained pitch and facilities.',
        address: 'Kirtipur, Kathmandu',
        latitude: 27.68,
        longitude: 85.31,
        phone: '+977-1-5678901',
        capacity: 100,
        hourlyRate: 2500,
        amenities: ['parking', 'first_aid', 'refreshments', 'security'],
        isActive: true
      },
      {
        id: 208,
        name: 'Tundikhel Futsal Court',
        description: 'Popular futsal court in the heart of Kathmandu. Well-maintained turf with good lighting. Great for evening games and tournaments.',
        address: 'Tundikhel, Kathmandu',
        latitude: 27.7172,
        longitude: 85.324,
        phone: '+977-1-6789012',
        capacity: 20,
        hourlyRate: 1000,
        amenities: ['parking', 'lighting', 'refreshments'],
        isActive: true
      }
    ];
  },
  async getNotifications(): Promise<Notification[]> {
    return [
      {
        id: 301,
        userId: 1,
        message: 'You have been added to Futsal Friday Night!',
        type: 'GAME_UPDATE',
        isRead: false,
        createdAt: now.toISOString()
      },
      {
        id: 302,
        userId: 1,
        message: 'Venue booking confirmed at Kathmandu Sports Complex.',
        type: 'BOOKING',
        isRead: true,
        readAt: now.toISOString(),
        createdAt: now.toISOString()
      }
    ];
  },
  async getRecommendations() {
    const games = await this.getGames();
    return games.slice(0, 2).map((game) => ({
      id: game.id,
      title: game.sport + ' spotlight',
      summary: game.description,
      game
    }));
  },
  
  // New methods for HomePage and GamesPage
  async getNearbyGames(lat: number, lon: number, radius: number = 5) {
    const games = await this.getGames();
    return games.map(game => ({
      id: game.id.toString(),
      sport: game.sport,
      venue: game.venue.name,
      time: game.gameTime,
      price: game.pricePerPlayer,
      playersCount: game.currentPlayers,
      maxPlayers: game.maxPlayers,
      skillLevel: game.skillLevel,
      location: {
        lat: game.latitude,
        lng: game.longitude,
        address: game.venue.address
      }
    }));
  },

  async searchGames(filters: any) {
    const games = await this.getGames();
    return games.map(game => ({
      id: game.id.toString(),
      sport: game.sport,
      venue: game.venue.name,
      time: game.gameTime,
      price: game.pricePerPlayer,
      playersCount: game.currentPlayers,
      maxPlayers: game.maxPlayers,
      skillLevel: game.skillLevel,
      location: {
        lat: game.latitude,
        lng: game.longitude,
        address: game.venue.address
      },
      distance: Math.random() * 10 + 1, // Mock distance
      isPrivate: Math.random() > 0.7, // Mock privacy
      createdBy: {
        id: Math.floor(Math.random() * 100),
        username: `user${Math.floor(Math.random() * 1000)}`,
        avatarUrl: ''
      },
      description: `Join us for an exciting ${game.sport.toLowerCase()} game! All skill levels welcome.`,
      status: game.currentPlayers >= game.maxPlayers ? 'FULL' : 'ACTIVE'
    }));
  },

  async getTrendingSports(lat: number, lon: number) {
    return [
      { sport: 'Futsal', playerCount: 24, gameCount: 8, icon: '⚽' },
      { sport: 'Basketball', playerCount: 18, gameCount: 6, icon: '🏀' },
      { sport: 'Cricket', playerCount: 32, gameCount: 4, icon: '🏏' },
      { sport: 'Volleyball', playerCount: 16, gameCount: 5, icon: '🏐' },
      { sport: 'Badminton', playerCount: 12, gameCount: 6, icon: '🏸' },
      { sport: 'Tennis', playerCount: 8, gameCount: 4, icon: '🎾' }
    ];
  },

  async getRecentActivity(userId: number) {
    return [
      {
        id: '1',
        sport: 'Futsal',
        venue: 'Tundikhel Futsal Court',
        date: new Date(now.getTime() - 86400000).toISOString(), // 1 day ago
        status: 'won' as const,
        outcome: 'Won 3-2'
      },
      {
        id: '2',
        sport: 'Basketball',
        venue: 'Kathmandu Sports Complex',
        date: new Date(now.getTime() - 172800000).toISOString(), // 2 days ago
        status: 'lost' as const,
        outcome: 'Lost 45-52'
      },
      {
        id: '3',
        sport: 'Cricket',
        venue: 'TU Cricket Ground',
        date: new Date(now.getTime() - 259200000).toISOString(), // 3 days ago
        status: 'won' as const,
        outcome: 'Won by 15 runs'
      },
      {
        id: '4',
        sport: 'Volleyball',
        venue: 'Dasharath Stadium',
        date: new Date(now.getTime() - 345600000).toISOString(), // 4 days ago
        status: 'tied' as const,
        outcome: 'Tied 2-2'
      }
    ];
  },

  async getUnreadNotifications() {
    const notifications = await this.getNotifications();
    return notifications.filter(n => !n.isRead).map(notification => ({
      id: notification.id.toString(),
      title: notification.type === 'GAME_UPDATE' ? 'Game Update' : 
             notification.type === 'BOOKING' ? 'Booking Confirmed' : 'System Notification',
      message: notification.message,
      type: notification.type.toLowerCase().includes('game') ? 'game' as const :
            notification.type.toLowerCase().includes('booking') ? 'venue' as const : 'system' as const,
      isRead: notification.isRead,
      createdAt: notification.createdAt
    }));
  }
};
