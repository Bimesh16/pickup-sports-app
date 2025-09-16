// Weather Service for HomePage
// This service handles weather data fetching with fallback to mock data

interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
  icon: string;
}

interface WeatherApiResponse {
  name: string;
  main: {
    temp: number;
  };
  weather: Array<{
    main: string;
    icon: string;
  }>;
}

export class WeatherService {
  private static readonly API_KEY = 'YOUR_OPENWEATHER_API_KEY'; // Replace with actual API key
  private static readonly BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

  static async getWeather(lat: number, lng: number): Promise<WeatherData> {
    try {
      // Check if API key is configured
      if (this.API_KEY === 'YOUR_OPENWEATHER_API_KEY') {
        console.warn('Weather API key not configured, using fallback data');
        return this.getFallbackWeather();
      }

      const response = await fetch(
        `${this.BASE_URL}?lat=${lat}&lon=${lng}&appid=${this.API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data: WeatherApiResponse = await response.json();
      
      return {
        city: data.name,
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main,
        icon: data.weather[0].icon
      };
    } catch (error) {
      console.error('Weather fetch error:', error);
      return this.getFallbackWeather();
    }
  }

  private static getFallbackWeather(): WeatherData {
    // Return mock weather data for Nepal
    const cities = [
      { name: 'Kathmandu', temp: 22 },
      { name: 'Pokhara', temp: 25 },
      { name: 'Chitwan', temp: 28 },
      { name: 'Bharatpur', temp: 26 }
    ];
    
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    
    return {
      city: randomCity.name,
      temperature: randomCity.temp,
      condition: 'Clear',
      icon: '01d'
    };
  }

  static getWeatherIcon(iconCode: string): string {
    const iconMap: Record<string, string> = {
      '01d': '☀️',
      '01n': '🌙',
      '02d': '⛅',
      '02n': '☁️',
      '03d': '☁️',
      '03n': '☁️',
      '04d': '☁️',
      '04n': '☁️',
      '09d': '🌧️',
      '09n': '🌧️',
      '10d': '🌦️',
      '10n': '🌧️',
      '11d': '⛈️',
      '11n': '⛈️',
      '13d': '❄️',
      '13n': '❄️',
      '50d': '🌫️',
      '50n': '🌫️'
    };
    
    return iconMap[iconCode] || '☀️';
  }
}
