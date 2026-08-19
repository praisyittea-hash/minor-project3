import { WeatherApp } from './weatherApp.js';
import { MovieApp } from './movieApp.js';
import { Storage } from './utils/storage.js';

document.addEventListener('DOMContentLoaded', () => {
  const hasWeather = document.getElementById('weather-app-container') || document.getElementById('weather-search-form');
  const hasMovies = document.getElementById('movies-app-container') || document.getElementById('movie-search-form');

  let weatherInstance = null;
  let movieInstance = null;

  if (hasWeather) {
    weatherInstance = new WeatherApp();
  }

  if (hasMovies) {
    movieInstance = new MovieApp();
  }

  const tabButtons = document.querySelectorAll('.app-tab-trigger');
  const viewSections = document.querySelectorAll('.app-view-section');

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const targetView = btn.dataset.view;
      if (!targetView) return;

      if (btn.tagName === 'A' && btn.getAttribute('href') && !btn.getAttribute('href').startsWith('#')) {
        return;
      }

      e.preventDefault();

      tabButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      viewSections.forEach((section) => {
        if (targetView === 'all' || section.id === `view-${targetView}`) {
          section.classList.remove('hidden');
        } else {
          section.classList.add('hidden');
        }
      });

      window.location.hash = targetView;
    });
  });

  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const siteHeader = document.querySelector('.site-header');
  if (mobileToggle && siteHeader) {
    mobileToggle.addEventListener('click', () => {
      siteHeader.classList.toggle('mobile-nav-active');
    });
  }

  if (window.location.hash) {
    const hash = window.location.hash.substring(1);
    const matchingBtn = document.querySelector(`.app-tab-trigger[data-view="${hash}"]`);
    if (matchingBtn) {
      matchingBtn.click();
    }
  }

  const badge = document.getElementById('watchlist-badge-count');
  if (badge) {
    badge.textContent = Storage.getWatchlist().length;
  }
});
