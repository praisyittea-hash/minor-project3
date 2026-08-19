const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export const WeatherApi = {
  async searchCities(query) {
    if (!query || query.trim().length < 2) return [];

    const url = `${GEOCODING_BASE_URL}?name=${encodeURIComponent(query.trim())}&count=6&language=en&format=json`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Geocoding server responded with status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.results || data.results.length === 0) {
        return [];
      }

      return data.results.map((item) => ({
        id: item.id,
        name: item.name,
        country: item.country || '',
        admin: item.admin1 || '',
        latitude: item.latitude,
        longitude: item.longitude,
        timezone: item.timezone || 'auto',
      }));
    } catch (error) {
      throw new Error(error.message || 'Failed to search for cities. Please check your network.');
    }
  },

  async getForecast(latitude, longitude, timezone = 'auto') {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'is_day',
        'precipitation',
        'weather_code',
        'surface_pressure',
        'wind_speed_10m',
        'wind_direction_10m',
      ].join(','),
      hourly: ['temperature_2m', 'weather_code', 'is_day'].join(','),
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'sunrise',
        'sunset',
        'precipitation_probability_max',
      ].join(','),
      forecast_days: '7',
      timezone: timezone || 'auto',
    });

    const url = `${FORECAST_BASE_URL}?${params.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Weather service error (${response.status})`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(error.message || 'Unable to fetch weather forecast.');
    }
  },

  async reverseGeocode(lat, lon) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`;
      const response = await fetch(url, {
        headers: { 'User-Agent': 'WeatherAppMinorProject/1.0' },
      });
      if (response.ok) {
        const data = await response.json();
        const address = data.address || {};
        const cityName =
          address.city ||
          address.town ||
          address.village ||
          address.suburb ||
          address.county ||
          'Current Location';
        const country = address.country || '';
        return { name: cityName, country };
      }
    } catch (err) {}
    return { name: 'Current Location', country: '' };
  },
};
