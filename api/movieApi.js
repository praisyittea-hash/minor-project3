import { Storage } from '../utils/storage.js';

const OMDB_BASE_URL = 'https://www.omdbapi.com/';
const TVMAZE_BASE_URL = 'https://api.tvmaze.com/';

export const MovieApi = {
  async searchMovies(query, type = '', year = '', page = 1) {
    if (!query || query.trim().length === 0) {
      return { movies: [], totalResults: 0 };
    }

    const apiKey = Storage.getOmdbApiKey();
    const params = new URLSearchParams({
      s: query.trim(),
      apikey: apiKey,
      page: page.toString(),
    });

    if (type) params.append('type', type);
    if (year) params.append('y', year.trim());

    try {
      const response = await fetch(`${OMDB_BASE_URL}?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`OMDb server error (${response.status})`);
      }

      const data = await response.json();

      if (data.Response === 'False') {
        if (data.Error && data.Error.includes('Invalid API key')) {
          return await this.searchTVMaze(query);
        }
        return { movies: [], totalResults: 0, error: data.Error || 'No movies found' };
      }

      return {
        movies: data.Search || [],
        totalResults: parseInt(data.totalResults, 10) || (data.Search ? data.Search.length : 0),
      };
    } catch (error) {
      return await this.searchTVMaze(query);
    }
  },

  async getMovieDetails(imdbID) {
    if (!imdbID) throw new Error('Valid IMDb ID is required');

    const apiKey = Storage.getOmdbApiKey();
    const url = `${OMDB_BASE_URL}?i=${encodeURIComponent(imdbID)}&plot=full&apikey=${apiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Movie details server error (${response.status})`);
      }

      const data = await response.json();
      if (data.Response === 'False') {
        throw new Error(data.Error || 'Movie details not found');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  async searchTVMaze(query) {
    try {
      const url = `${TVMAZE_BASE_URL}search/shows?q=${encodeURIComponent(query.trim())}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('TVMaze fallback failed');

      const data = await res.json();
      const movies = data.map((item) => {
        const show = item.show;
        const year = show.premiered ? show.premiered.split('-')[0] : 'N/A';
        const poster = show.image ? (show.image.medium || show.image.original) : 'N/A';

        return {
          Title: show.name,
          Year: year,
          imdbID: show.externals?.imdb || `tvm_${show.id}`,
          Type: show.type ? show.type.toLowerCase() : 'series',
          Poster: poster,
          rating: show.rating?.average ? `${show.rating.average}/10` : 'N/A',
          summary: show.summary ? show.summary.replace(/<[^>]*>?/gm, '') : '',
          genres: show.genres || [],
        };
      });

      return { movies, totalResults: movies.length };
    } catch (err) {
      return { movies: [], totalResults: 0, error: 'Could not fetch movies from any API.' };
    }
  },

  async getPopularCurated() {
    return this.searchMovies('Avengers');
  },
};
