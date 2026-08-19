const STORAGE_KEYS = {
  WEATHER_HISTORY: 'mp3_weather_history',
  WEATHER_UNIT: 'mp3_weather_unit',
  LAST_CITY: 'mp3_last_city',
  MOVIE_WATCHLIST: 'mp3_movie_watchlist',
  OMDB_API_KEY: 'mp3_omdb_key',
};

const getJSON = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
};

const setJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
};

export const Storage = {
  getWeatherHistory() {
    return getJSON(STORAGE_KEYS.WEATHER_HISTORY, ['London', 'New York', 'Tokyo', 'Paris']);
  },

  addWeatherHistory(city) {
    if (!city || typeof city !== 'string') return;
    const trimmed = city.trim();
    let history = this.getWeatherHistory().filter(
      (c) => c.toLowerCase() !== trimmed.toLowerCase()
    );
    history.unshift(trimmed);
    if (history.length > 6) history = history.slice(0, 6);
    setJSON(STORAGE_KEYS.WEATHER_HISTORY, history);
  },

  getUnit() {
    return localStorage.getItem(STORAGE_KEYS.WEATHER_UNIT) || 'C';
  },

  setUnit(unit) {
    localStorage.setItem(STORAGE_KEYS.WEATHER_UNIT, unit);
  },

  getLastCity() {
    return localStorage.getItem(STORAGE_KEYS.LAST_CITY) || 'London';
  },

  setLastCity(city) {
    if (city) localStorage.setItem(STORAGE_KEYS.LAST_CITY, city);
  },

  getWatchlist() {
    return getJSON(STORAGE_KEYS.MOVIE_WATCHLIST, []);
  },

  isMovieInWatchlist(imdbID) {
    const list = this.getWatchlist();
    return list.some((m) => m.imdbID === imdbID);
  },

  addToWatchlist(movie) {
    if (!movie || !movie.imdbID) return;
    const list = this.getWatchlist();
    if (!list.some((m) => m.imdbID === movie.imdbID)) {
      list.unshift({
        imdbID: movie.imdbID,
        Title: movie.Title,
        Year: movie.Year,
        Poster: movie.Poster,
        Type: movie.Type || 'movie',
        imdbRating: movie.imdbRating || movie.rating || 'N/A',
      });
      setJSON(STORAGE_KEYS.MOVIE_WATCHLIST, list);
    }
  },

  removeFromWatchlist(imdbID) {
    let list = this.getWatchlist();
    list = list.filter((m) => m.imdbID !== imdbID);
    setJSON(STORAGE_KEYS.MOVIE_WATCHLIST, list);
  },

  clearWatchlist() {
    setJSON(STORAGE_KEYS.MOVIE_WATCHLIST, []);
  },

  getOmdbApiKey() {
    return localStorage.getItem(STORAGE_KEYS.OMDB_API_KEY) || 'trilogy';
  },

  setOmdbApiKey(key) {
    if (key) {
      localStorage.setItem(STORAGE_KEYS.OMDB_API_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEYS.OMDB_API_KEY);
    }
  },
};
