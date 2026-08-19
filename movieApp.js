import { MovieApi } from './api/movieApi.js';
import { Storage } from './utils/storage.js';
import { Toast } from './components/toast.js';
import { Modal } from './components/modal.js';
import { debounce, sanitizeHTML } from './utils/helpers.js';

export class MovieApp {
  constructor() {
    this.currentQuery = 'Batman';
    this.currentType = '';
    this.currentYear = '';
    this.movies = [];
    this.isLoading = false;

    this.elements = {
      searchForm: document.getElementById('movie-search-form'),
      searchInput: document.getElementById('movie-search-input'),
      typeFilter: document.getElementById('movie-type-filter'),
      yearFilter: document.getElementById('movie-year-filter'),
      genreTags: document.querySelectorAll('.genre-tag'),
      resetBtn: document.getElementById('movie-reset-btn'),

      moviesGrid: document.getElementById('movies-grid'),
      resultsCount: document.getElementById('movies-results-count'),
      loadingSkeleton: document.getElementById('movies-skeleton'),
      emptyState: document.getElementById('movies-empty-state'),
      emptyStateDesc: document.getElementById('movies-empty-desc'),

      watchlistDrawer: document.getElementById('watchlist-drawer'),
      watchlistTrigger: document.getElementById('watchlist-trigger-btn'),
      watchlistCloseBtn: document.getElementById('watchlist-close-btn'),
      watchlistBody: document.getElementById('watchlist-items-list'),
      watchlistBadge: document.getElementById('watchlist-badge-count'),
      watchlistClearBtn: document.getElementById('watchlist-clear-btn'),

      modal: document.getElementById('movie-detail-modal'),
      modalCloseBtn: document.getElementById('modal-close-btn'),
      modalPoster: document.getElementById('modal-movie-poster'),
      modalTitle: document.getElementById('modal-movie-title'),
      modalTags: document.getElementById('modal-movie-tags'),
      modalPlot: document.getElementById('modal-movie-plot'),
      modalDirector: document.getElementById('modal-movie-director'),
      modalActors: document.getElementById('modal-movie-actors'),
      modalBoxOffice: document.getElementById('modal-movie-boxoffice'),
      modalAwards: document.getElementById('modal-movie-awards'),
      modalRatingsGrid: document.getElementById('modal-ratings-grid'),
      modalFavBtn: document.getElementById('modal-fav-btn'),

      apiKeyModal: document.getElementById('api-key-modal'),
      apiKeyTrigger: document.getElementById('api-key-trigger-btn'),
      apiKeyInput: document.getElementById('omdb-key-input'),
      apiKeySaveBtn: document.getElementById('omdb-key-save-btn'),
      apiKeyResetBtn: document.getElementById('omdb-key-reset-btn'),
      apiKeyCloseBtn: document.getElementById('api-key-close-btn'),
    };

    this.activeModalMovie = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateWatchlistBadge();
    this.renderWatchlist();
    this.performSearch(this.currentQuery);
  }

  setupEventListeners() {
    if (this.elements.searchForm) {
      this.elements.searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const q = this.elements.searchInput.value.trim();
        if (q) {
          this.currentQuery = q;
          this.performSearch(this.currentQuery);
        }
      });
    }

    if (this.elements.searchInput) {
      const handleInput = debounce((e) => {
        const val = e.target.value.trim();
        if (val.length >= 3) {
          this.currentQuery = val;
          this.performSearch(this.currentQuery);
        }
      }, 500);

      this.elements.searchInput.addEventListener('input', handleInput);
    }

    if (this.elements.typeFilter) {
      this.elements.typeFilter.addEventListener('change', (e) => {
        this.currentType = e.target.value;
        this.performSearch(this.currentQuery);
      });
    }

    if (this.elements.yearFilter) {
      this.elements.yearFilter.addEventListener('input', debounce((e) => {
        this.currentYear = e.target.value.trim();
        this.performSearch(this.currentQuery);
      }, 400));
    }

    if (this.elements.genreTags) {
      this.elements.genreTags.forEach((tag) => {
        tag.addEventListener('click', () => {
          this.elements.genreTags.forEach((t) => t.classList.remove('active'));
          tag.classList.add('active');
          const genre = tag.dataset.genre || tag.textContent.trim();
          this.elements.searchInput.value = genre;
          this.currentQuery = genre;
          this.performSearch(this.currentQuery);
        });
      });
    }

    if (this.elements.resetBtn) {
      this.elements.resetBtn.addEventListener('click', () => {
        this.elements.searchInput.value = '';
        this.elements.typeFilter.value = '';
        this.elements.yearFilter.value = '';
        this.currentType = '';
        this.currentYear = '';
        this.currentQuery = 'Batman';
        this.elements.genreTags.forEach((t) => t.classList.remove('active'));
        this.performSearch('Batman');
      });
    }

    if (this.elements.watchlistTrigger) {
      this.elements.watchlistTrigger.addEventListener('click', () => this.toggleWatchlist(true));
    }

    if (this.elements.watchlistCloseBtn) {
      this.elements.watchlistCloseBtn.addEventListener('click', () => this.toggleWatchlist(false));
    }

    if (this.elements.watchlistClearBtn) {
      this.elements.watchlistClearBtn.addEventListener('click', () => {
        if (confirm('Clear all items from your watchlist?')) {
          Storage.clearWatchlist();
          this.renderWatchlist();
          this.updateWatchlistBadge();
          this.renderMovies(this.movies);
          Toast.info('Watchlist cleared');
        }
      });
    }

    if (this.elements.modalCloseBtn) {
      this.elements.modalCloseBtn.addEventListener('click', () => Modal.close());
    }

    if (this.elements.modalFavBtn) {
      this.elements.modalFavBtn.addEventListener('click', () => {
        if (this.activeModalMovie) {
          this.toggleFavorite(this.activeModalMovie);
          this.updateModalFavBtnState(this.activeModalMovie.imdbID);
        }
      });
    }

    if (this.elements.apiKeyTrigger && this.elements.apiKeyModal) {
      this.elements.apiKeyTrigger.addEventListener('click', () => {
        if (this.elements.apiKeyInput) {
          this.elements.apiKeyInput.value = Storage.getOmdbApiKey();
        }
        Modal.open('api-key-modal');
      });
    }

    if (this.elements.apiKeyCloseBtn) {
      this.elements.apiKeyCloseBtn.addEventListener('click', () => Modal.close());
    }

    if (this.elements.apiKeySaveBtn) {
      this.elements.apiKeySaveBtn.addEventListener('click', () => {
        const val = this.elements.apiKeyInput.value.trim();
        if (val) {
          Storage.setOmdbApiKey(val);
          Toast.success('OMDb API Key saved!');
          Modal.close();
          this.performSearch(this.currentQuery);
        } else {
          Toast.warning('Please enter a valid API key');
        }
      });
    }

    if (this.elements.apiKeyResetBtn) {
      this.elements.apiKeyResetBtn.addEventListener('click', () => {
        Storage.setOmdbApiKey('trilogy');
        if (this.elements.apiKeyInput) this.elements.apiKeyInput.value = 'trilogy';
        Toast.info('Reset to default demo key (trilogy)');
        Modal.close();
        this.performSearch(this.currentQuery);
      });
    }
  }

  async performSearch(query) {
    if (!query) return;
    this.setLoading(true);
    this.hideEmptyState();

    try {
      const result = await MovieApi.searchMovies(
        query,
        this.currentType,
        this.currentYear
      );

      this.movies = result.movies || [];

      if (this.movies.length === 0) {
        this.showEmptyState(result.error || `No results found for "${query}"`);
      } else {
        this.renderMovies(this.movies);
        if (this.elements.resultsCount) {
          this.elements.resultsCount.innerHTML = `Found <strong>${result.totalResults}</strong> titles for "<strong>${sanitizeHTML(query)}</strong>"`;
        }
      }
    } catch (err) {
      this.showEmptyState('Could not retrieve movies. Please try again.');
      Toast.error('Search failed. Check your network or API settings.');
    } finally {
      this.setLoading(false);
    }
  }

  renderMovies(movies) {
    if (!this.elements.moviesGrid) return;
    this.elements.moviesGrid.innerHTML = '';

    movies.forEach((movie) => {
      const card = this.createMovieCard(movie);
      this.elements.moviesGrid.appendChild(card);
    });
  }

  createMovieCard(movie) {
    const isFav = Storage.isMovieInWatchlist(movie.imdbID);
    const hasPoster = movie.Poster && movie.Poster !== 'N/A';

    const card = document.createElement('div');
    card.className = 'movie-card';
    card.dataset.id = movie.imdbID;

    card.innerHTML = `
      <div class="movie-poster-wrap">
        ${hasPoster 
          ? `<img src="${movie.Poster}" alt="${sanitizeHTML(movie.Title)}" class="movie-poster" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'poster-fallback\\'><svg viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'1.5\\'><rect x=\\'2\\' y=\\'2\\' width=\\'20\\' height=\\'20\\' rx=\\'2.18\\' ry=\\'2.18\\'/><line x1=\\'7\\' y1=\\'2\\' x2=\\'7\\' y2=\\'22\\'/><line x1=\\'17\\' y1=\\'2\\' x2=\\'17\\' y2=\\'22\\'/><line x1=\\'2\\' y1=\\'12\\' x2=\\'22\\' y2=\\'12\\'/></svg><span>No Poster</span></div>'"/>` 
          : `<div class="poster-fallback"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg><span>No Poster</span></div>`}
        
        <div class="card-top-badges">
          <span class="type-pill">${sanitizeHTML(movie.Type || 'movie')}</span>
          <button type="button" class="fav-btn ${isFav ? 'favorited' : ''}" title="Add to Watchlist" aria-label="Toggle Watchlist">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="${isFav ? '#f43f5e' : 'none'}" stroke="currentColor" stroke-width="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
        </div>
      </div>
      
      <div class="movie-card-body">
        <div>
          <h3 class="movie-title" title="${sanitizeHTML(movie.Title)}">${sanitizeHTML(movie.Title)}</h3>
        </div>
        <div class="movie-meta-footer">
          <span class="movie-year">${sanitizeHTML(movie.Year)}</span>
          <span class="movie-rating-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            ${movie.imdbRating || movie.rating || 'IMDb'}
          </span>
        </div>
      </div>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.closest('.fav-btn')) return;
      this.openMovieDetails(movie.imdbID);
    });

    const favBtn = card.querySelector('.fav-btn');
    favBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleFavorite(movie);
      const nowFav = Storage.isMovieInWatchlist(movie.imdbID);
      favBtn.classList.toggle('favorited', nowFav);
      favBtn.querySelector('svg').setAttribute('fill', nowFav ? '#f43f5e' : 'none');
    });

    return card;
  }

  async openMovieDetails(imdbID) {
    Toast.info('Fetching movie details...', 1500);
    try {
      const details = await MovieApi.getMovieDetails(imdbID);
      this.activeModalMovie = details;

      if (this.elements.modalTitle) {
        this.elements.modalTitle.textContent = `${details.Title} (${details.Year})`;
      }

      if (this.elements.modalPoster) {
        const hasPoster = details.Poster && details.Poster !== 'N/A';
        this.elements.modalPoster.src = hasPoster ? details.Poster : '';
        this.elements.modalPoster.style.display = hasPoster ? 'block' : 'none';
      }

      if (this.elements.modalTags) {
        const tags = [];
        if (details.Rated && details.Rated !== 'N/A') tags.push(`<span class="badge badge-rose">${details.Rated}</span>`);
        if (details.Runtime && details.Runtime !== 'N/A') tags.push(`<span class="badge badge-purple">${details.Runtime}</span>`);
        if (details.Genre) {
          details.Genre.split(',').forEach((g) => {
            tags.push(`<span class="badge badge-cyan">${g.trim()}</span>`);
          });
        }
        this.elements.modalTags.innerHTML = tags.join(' ');
      }

      if (this.elements.modalPlot) {
        this.elements.modalPlot.textContent = details.Plot || 'No plot summary available.';
      }

      if (this.elements.modalDirector) {
        this.elements.modalDirector.textContent = details.Director || 'N/A';
      }

      if (this.elements.modalActors) {
        this.elements.modalActors.textContent = details.Actors || 'N/A';
      }

      if (this.elements.modalBoxOffice) {
        this.elements.modalBoxOffice.textContent = details.BoxOffice || 'N/A';
      }

      if (this.elements.modalAwards) {
        this.elements.modalAwards.textContent = details.Awards || 'N/A';
      }

      if (this.elements.modalRatingsGrid) {
        this.renderRatingsBreakdown(details);
      }

      this.updateModalFavBtnState(details.imdbID);

      Modal.open('movie-detail-modal');
    } catch (err) {
      Toast.error('Could not load full movie details.');
    }
  }

  renderRatingsBreakdown(details) {
    const ratings = details.Ratings || [];
    let imdbVal = details.imdbRating && details.imdbRating !== 'N/A' ? `${details.imdbRating}/10` : 'N/A';
    let rottenVal = 'N/A';
    let metaVal = details.Metascore && details.Metascore !== 'N/A' ? `${details.Metascore}/100` : 'N/A';

    ratings.forEach((r) => {
      if (r.Source === 'Rotten Tomatoes') rottenVal = r.Value;
      if (r.Source === 'Metacritic' && metaVal === 'N/A') metaVal = r.Value;
    });

    this.elements.modalRatingsGrid.innerHTML = `
      <div class="rating-box">
        <div class="rating-box-source">IMDb</div>
        <div class="rating-box-value" style="color: #fbbf24;">${imdbVal}</div>
      </div>
      <div class="rating-box">
        <div class="rating-box-source">Rotten Tomatoes</div>
        <div class="rating-box-value" style="color: #fb7185;">${rottenVal}</div>
      </div>
      <div class="rating-box">
        <div class="rating-box-source">Metascore</div>
        <div class="rating-box-value" style="color: #38bdf8;">${metaVal}</div>
      </div>
    `;
  }

  updateModalFavBtnState(imdbID) {
    if (!this.elements.modalFavBtn) return;
    const isFav = Storage.isMovieInWatchlist(imdbID);
    this.elements.modalFavBtn.classList.toggle('btn-movie', !isFav);
    this.elements.modalFavBtn.classList.toggle('btn-glass', isFav);
    this.elements.modalFavBtn.innerHTML = isFav
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="#f43f5e" stroke="#f43f5e" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> In Watchlist`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> Add to Watchlist`;
  }

  toggleFavorite(movie) {
    const isFav = Storage.isMovieInWatchlist(movie.imdbID);
    if (isFav) {
      Storage.removeFromWatchlist(movie.imdbID);
      Toast.info(`Removed "${movie.Title}" from Watchlist`);
    } else {
      Storage.addToWatchlist(movie);
      Toast.success(`Added "${movie.Title}" to Watchlist!`);
    }

    this.updateWatchlistBadge();
    this.renderWatchlist();
    this.renderMovies(this.movies);
  }

  toggleWatchlist(open) {
    if (this.elements.watchlistDrawer) {
      this.elements.watchlistDrawer.classList.toggle('active', open);
    }
  }

  renderWatchlist() {
    if (!this.elements.watchlistBody) return;
    const list = Storage.getWatchlist();

    if (list.length === 0) {
      this.elements.watchlistBody.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 1rem; opacity: 0.5;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <p>Your watchlist is empty.</p>
          <span style="font-size: 0.8rem;">Click the heart icon on any movie to save it here!</span>
        </div>
      `;
      return;
    }

    this.elements.watchlistBody.innerHTML = '';
    list.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'watchlist-item';
      row.innerHTML = `
        <img src="${item.Poster && item.Poster !== 'N/A' ? item.Poster : ''}" alt="${sanitizeHTML(item.Title)}" class="watchlist-thumb" onerror="this.style.display='none'"/>
        <div>
          <div class="watchlist-item-title">${sanitizeHTML(item.Title)}</div>
          <div class="watchlist-item-year">${sanitizeHTML(item.Year)} • ${sanitizeHTML(item.Type)}</div>
        </div>
        <button type="button" class="btn btn-glass btn-icon btn-sm" title="Remove" style="color: #fb7185;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      `;

      row.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        this.toggleWatchlist(false);
        this.openMovieDetails(item.imdbID);
      });

      const removeBtn = row.querySelector('button');
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleFavorite(item);
      });

      this.elements.watchlistBody.appendChild(row);
    });
  }

  updateWatchlistBadge() {
    if (this.elements.watchlistBadge) {
      const count = Storage.getWatchlist().length;
      this.elements.watchlistBadge.textContent = count;
    }
  }

  setLoading(isLoading) {
    this.isLoading = isLoading;
    if (this.elements.loadingSkeleton) {
      this.elements.loadingSkeleton.classList.toggle('hidden', !isLoading);
    }
    if (this.elements.moviesGrid) {
      this.elements.moviesGrid.classList.toggle('hidden', isLoading);
    }
  }

  showEmptyState(msg) {
    if (this.elements.emptyState) {
      this.elements.emptyState.classList.remove('hidden');
      if (this.elements.emptyStateDesc) {
        this.elements.emptyStateDesc.textContent = msg;
      }
    }
    if (this.elements.moviesGrid) {
      this.elements.moviesGrid.classList.add('hidden');
    }
  }

  hideEmptyState() {
    if (this.elements.emptyState) {
      this.elements.emptyState.classList.add('hidden');
    }
  }
}
