import { apiService } from './api';
import { 
  Venue, 
  VenueSearchParams, 
  VenueAvailability, 
  BookVenueRequest 
} from '@/types/venue';

class VenueService {
  // Venue Discovery
  async getVenues(params?: VenueSearchParams): Promise<Venue[]> {
    return await apiService.get<Venue[]>('/venues', params);
  }

  async getVenue(venueId: number): Promise<Venue> {
    return await apiService.get<Venue>(`/venues/${venueId}`);
  }

  async searchVenues(params: VenueSearchParams): Promise<Venue[]> {
    return await apiService.get<Venue[]>('/venues/search', params);
  }

  // Location-based search
  async getNearbyVenues(latitude: number, longitude: number, radius: number = 10): Promise<Venue[]> {
    return await apiService.get<Venue[]>('/venues/nearby', {
      latitude,
      longitude,
      radius
    });
  }

  // Venue Booking
  async getVenueAvailability(venueId: number, date: string): Promise<VenueAvailability> {
    return await apiService.get<VenueAvailability>(`/venues/${venueId}/availability`, {
      date
    });
  }

  async bookVenue(request: BookVenueRequest): Promise<any> {
    return await apiService.post<any>('/venues/book', request);
  }

  async getMyBookings(): Promise<any[]> {
    return await apiService.get<any[]>('/venues/my-bookings');
  }

  async cancelBooking(bookingId: number): Promise<void> {
    await apiService.delete(`/venues/bookings/${bookingId}`);
  }

  // Venue Reviews
  async getVenueReviews(venueId: number): Promise<any[]> {
    return await apiService.get<any[]>(`/venues/${venueId}/reviews`);
  }

  async addVenueReview(venueId: number, rating: number, comment: string): Promise<void> {
    await apiService.post(`/venues/${venueId}/reviews`, {
      rating,
      comment
    });
  }

  // Popular Venues in Nepal
  async getPopularVenuesInKathmandu(): Promise<Venue[]> {
    return await apiService.get<Venue[]>('/api/v1/nepal/venues/popular', {
      city: 'Kathmandu'
    });
  }

  async getVenuesByArea(area: string): Promise<Venue[]> {
    return await apiService.get<Venue[]>('/venues/by-area', {
      area
    });
  }

  // Venue Analytics
  async getVenueAnalytics(venueId: number): Promise<any> {
    return await apiService.get<any>(`/api/v1/ai/analytics/venues/${venueId}`);
  }

  // Venue Recommendations
  async getRecommendedVenues(userId: number, sport?: string): Promise<Venue[]> {
    return await apiService.get<Venue[]>(`/api/v1/ai/recommendations/venues/${userId}`, {
      sport
    });
  }
}

export const venueService = new VenueService();