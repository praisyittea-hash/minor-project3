import { WeatherApi } from './api/weatherApi.js';
import { Storage } from './utils/storage.js';
import { Toast } from './components/toast.js';
import {
  debounce,
  formatTemperature,
  formatWindSpeed,
  formatDate,
  formatTime,
  getDayName,
  getWeatherInfo,
  sanitizeHTML,
} from './utils/helpers.js';

export class WeatherApp {
  constructor() {
    this.unit = Storage.getUnit();
    this.currentCity = Storage.getLastCity();
    this.weatherData = null;
    this.locationMeta = null;
    this.isLoading = false;

    this.elements = {
      searchInput: document.getElementById('weather-search-input'),
      searchForm: document.getElementById('weather-search-form'),
      searchBtn: document.getElementById('weather-search-btn'),
      geoBtn: document.getElementById('weather-geo-btn'),
      suggestionsBox: document.getElementById('weather-suggestions'),
      recentChipsContainer: document.getElementById('recent-searches-list'),
      unitBtnC: document.getElementById('unit-c'),
      unitBtnF: document.getElementById('unit-f'),

      weatherContainer: document.getElementById('weather-content-area'),
      loadingSkeleton: document.getElementById('weather-skeleton'),
      errorContainer: document.getElementById('weather-error-container'),
      errorMessage: document.getElementById('weather-error-text'),

      cityName: document.getElementById('weather-city-name'),
      dateText: document.getElementById('weather-date-text'),
      tempNumber: document.getElementById('weather-temp-number'),
      tempUnit: document.getElementById('weather-temp-unit'),
      feelsLike: document.getElementById('weather-feels-like'),
      illustration: document.getElementById('weather-illustration'),
      conditionBadge: document.getElementById('weather-condition-badge'),
      tempHigh: document.getElementById('weather-temp-high'),
      tempLow: document.getElementById('weather-temp-low'),

      metricHumidity: document.getElementById('metric-humidity'),
      metricWind: document.getElementById('metric-wind'),
      metricPressure: document.getElementById('metric-pressure'),
      metricPrecipitation: document.getElementById('metric-precipitation'),
      metricSunrise: document.getElementById('metric-sunrise'),
      metricSunset: document.getElementById('metric-sunset'),

      hourlySlider: document.getElementById('hourly-forecast-slider'),
      dailyList: document.getElementById('daily-forecast-list'),
    };

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateUnitButtons();
    this.renderRecentSearches();
    this.loadWeatherByCity(this.currentCity);
  }

  setupEventListeners() {
    if (this.elements.searchForm) {
      this.elements.searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = this.elements.searchInput.value.trim();
        if (query) {
          this.loadWeatherByCity(query);
          this.hideSuggestions();
        }
      });
    }

    if (this.elements.searchInput) {
      const handleInput = debounce(async (e) => {
        const val = e.target.value.trim();
        if (val.length >= 2) {
          try {
            const cities = await WeatherApi.searchCities(val);
            this.renderSuggestions(cities);
          } catch (err) {}
        } else {
          this.hideSuggestions();
        }
      }, 300);

      this.elements.searchInput.addEventListener('input', handleInput);

      document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-input-box')) {
          this.hideSuggestions();
        }
      });
    }

    if (this.elements.geoBtn) {
      this.elements.geoBtn.addEventListener('click', () => {
        this.loadCurrentLocationWeather();
      });
    }

    if (this.elements.unitBtnC && this.elements.unitBtnF) {
      this.elements.unitBtnC.addEventListener('click', () => this.setUnit('C'));
      this.elements.unitBtnF.addEventListener('click', () => this.setUnit('F'));
    }
  }

  setUnit(newUnit) {
    if (this.unit === newUnit) return;
    this.unit = newUnit;
    Storage.setUnit(newUnit);
    this.updateUnitButtons();

    if (this.weatherData) {
      this.renderWeather(this.weatherData, this.locationMeta);
    }
  }

  updateUnitButtons() {
    if (this.elements.unitBtnC && this.elements.unitBtnF) {
      this.elements.unitBtnC.classList.toggle('active', this.unit === 'C');
      this.elements.unitBtnF.classList.toggle('active', this.unit === 'F');
    }
  }

  async loadWeatherByCity(cityName) {
    if (!cityName) return;
    this.setLoading(true);
    this.hideError();

    try {
      const cities = await WeatherApi.searchCities(cityName);
      if (!cities || cities.length === 0) {
        throw new Error(`Could not find weather data for "${cityName}". Please check the spelling.`);
      }

      const selected = cities[0];
      this.locationMeta = {
        name: selected.name,
        country: selected.country,
        admin: selected.admin,
        timezone: selected.timezone,
      };

      this.weatherData = await WeatherApi.getForecast(
        selected.latitude,
        selected.longitude,
        selected.timezone
      );

      Storage.setLastCity(selected.name);
      Storage.addWeatherHistory(selected.name);
      this.renderRecentSearches();

      this.renderWeather(this.weatherData, this.locationMeta);
      Toast.success(`Weather loaded for ${selected.name}`, 2500);
    } catch (error) {
      this.showError(error.message);
      Toast.error(error.message);
    } finally {
      this.setLoading(false);
    }
  }

  async loadCurrentLocationWeather() {
    if (!navigator.geolocation) {
      Toast.error('Geolocation is not supported by your browser.');
      return;
    }

    this.setLoading(true);
    this.hideError();
    Toast.info('Detecting your current location...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          const locationInfo = await WeatherApi.reverseGeocode(lat, lon);
          this.locationMeta = {
            name: locationInfo.name || 'Current Location',
            country: locationInfo.country || '',
            timezone: 'auto',
          };

          this.weatherData = await WeatherApi.getForecast(lat, lon);
          Storage.setLastCity(this.locationMeta.name);
          Storage.addWeatherHistory(this.locationMeta.name);
          this.renderRecentSearches();

          this.renderWeather(this.weatherData, this.locationMeta);
          Toast.success(`Located: ${this.locationMeta.name}`);
        } catch (err) {
          this.showError('Could not retrieve weather for your coordinates.');
          Toast.error('Failed to get weather for current location.');
        } finally {
          this.setLoading(false);
        }
      },
      (geoError) => {
        this.setLoading(false);
        let msg = 'Unable to access your location.';
        if (geoError.code === 1) msg = 'Location access was denied.';
        else if (geoError.code === 2) msg = 'Location unavailable.';
        Toast.warning(msg);
      },
      { timeout: 10000 }
    );
  }

  renderWeather(data, location) {
    if (!data || !data.current) return;

    const current = data.current;
    const daily = data.daily;
    const hourly = data.hourly;
    const weatherInfo = getWeatherInfo(current.weather_code, current.is_day);

    if (this.elements.cityName) {
      const locText = location.country ? `${location.name}, ${location.country}` : location.name;
      this.elements.cityName.textContent = locText;
    }

    if (this.elements.dateText) {
      this.elements.dateText.textContent = `${formatDate(current.time)} • Local Time ${formatTime(current.time)}`;
    }

    if (this.elements.tempNumber) {
      const tempVal = this.unit === 'F'
        ? Math.round((current.temperature_2m * 9) / 5 + 32)
        : Math.round(current.temperature_2m);
      this.elements.tempNumber.textContent = tempVal;
    }

    if (this.elements.tempUnit) {
      this.elements.tempUnit.textContent = `°${this.unit}`;
    }

    if (this.elements.feelsLike) {
      this.elements.feelsLike.textContent = `Feels like ${formatTemperature(current.apparent_temperature, this.unit)}`;
    }

    if (this.elements.illustration) {
      this.elements.illustration.innerHTML = weatherInfo.icon;
    }

    if (this.elements.conditionBadge) {
      this.elements.conditionBadge.textContent = weatherInfo.label;
    }

    if (this.elements.tempHigh && daily?.temperature_2m_max) {
      this.elements.tempHigh.innerHTML = `↑ ${formatTemperature(daily.temperature_2m_max[0], this.unit)}`;
    }

    if (this.elements.tempLow && daily?.temperature_2m_min) {
      this.elements.tempLow.innerHTML = `↓ ${formatTemperature(daily.temperature_2m_min[0], this.unit)}`;
    }

    if (this.elements.metricHumidity) {
      this.elements.metricHumidity.textContent = `${current.relative_humidity_2m}%`;
    }

    if (this.elements.metricWind) {
      this.elements.metricWind.textContent = formatWindSpeed(current.wind_speed_10m, this.unit);
    }

    if (this.elements.metricPressure) {
      this.elements.metricPressure.textContent = `${Math.round(current.surface_pressure)} hPa`;
    }

    if (this.elements.metricPrecipitation) {
      const pop = daily?.precipitation_probability_max ? `${daily.precipitation_probability_max[0]}%` : `${current.precipitation} mm`;
      this.elements.metricPrecipitation.textContent = pop;
    }

    if (this.elements.metricSunrise && daily?.sunrise) {
      this.elements.metricSunrise.textContent = formatTime(daily.sunrise[0]);
    }

    if (this.elements.metricSunset && daily?.sunset) {
      this.elements.metricSunset.textContent = formatTime(daily.sunset[0]);
    }

    this.renderHourlyForecast(hourly);
    this.renderDailyForecast(daily);
  }

  renderHourlyForecast(hourly) {
    if (!this.elements.hourlySlider || !hourly?.time) return;

    this.elements.hourlySlider.innerHTML = '';
    const now = new Date();
    const currentHourIndex = hourly.time.findIndex((t) => new Date(t) >= now) || 0;

    const hoursToShow = hourly.time.slice(currentHourIndex, currentHourIndex + 24);

    hoursToShow.forEach((timeStr, idx) => {
      const actualIdx = currentHourIndex + idx;
      const temp = hourly.temperature_2m[actualIdx];
      const code = hourly.weather_code[actualIdx];
      const isDay = hourly.is_day[actualIdx];
      const info = getWeatherInfo(code, isDay);
      const isCurrent = idx === 0;

      const card = document.createElement('div');
      card.className = `hourly-card ${isCurrent ? 'active-hour' : ''}`;
      card.innerHTML = `
        <span class="hourly-time">${isCurrent ? 'Now' : formatTime(timeStr)}</span>
        <div class="hourly-icon">${info.icon}</div>
        <span class="hourly-temp">${formatTemperature(temp, this.unit)}</span>
      `;
      this.elements.hourlySlider.appendChild(card);
    });
  }

  renderDailyForecast(daily) {
    if (!this.elements.dailyList || !daily?.time) return;

    this.elements.dailyList.innerHTML = '';

    daily.time.forEach((dateStr, idx) => {
      const maxTemp = daily.temperature_2m_max[idx];
      const minTemp = daily.temperature_2m_min[idx];
      const code = daily.weather_code[idx];
      const info = getWeatherInfo(code, 1);
      const dayName = getDayName(dateStr);

      const card = document.createElement('div');
      card.className = 'daily-card';
      card.innerHTML = `
        <div class="daily-day-name">${dayName}</div>
        <div class="daily-condition">
          <div class="daily-icon">${info.icon}</div>
          <span>${info.label}</span>
        </div>
        <div class="daily-bar-wrap">
          <span style="font-size: 0.8rem; color: #38bdf8;">${formatTemperature(minTemp, this.unit)}</span>
          <div class="daily-temp-bar">
            <div class="daily-temp-fill" style="left: 10%; right: 10%;"></div>
          </div>
          <span style="font-size: 0.8rem; color: #fb7185;">${formatTemperature(maxTemp, this.unit)}</span>
        </div>
        <div class="daily-temps">
          <span class="temp-high">${formatTemperature(maxTemp, this.unit)}</span>
          <span class="temp-low">${formatTemperature(minTemp, this.unit)}</span>
        </div>
      `;
      this.elements.dailyList.appendChild(card);
    });
  }

  renderSuggestions(cities) {
    if (!this.elements.suggestionsBox) return;

    if (!cities || cities.length === 0) {
      this.hideSuggestions();
      return;
    }

    this.elements.suggestionsBox.innerHTML = '';
    cities.forEach((city) => {
      const item = document.createElement('div');
      item.className = 'suggestion-item';
      item.innerHTML = `
        <span class="suggestion-city">${sanitizeHTML(city.name)}</span>
        <span class="suggestion-country">${sanitizeHTML(city.admin ? `${city.admin}, ` : '')}${sanitizeHTML(city.country)}</span>
      `;
      item.addEventListener('click', () => {
        this.elements.searchInput.value = city.name;
        this.hideSuggestions();
        this.loadWeatherByCity(city.name);
      });
      this.elements.suggestionsBox.appendChild(item);
    });

    this.elements.suggestionsBox.classList.add('active');
  }

  hideSuggestions() {
    if (this.elements.suggestionsBox) {
      this.elements.suggestionsBox.classList.remove('active');
    }
  }

  renderRecentSearches() {
    if (!this.elements.recentChipsContainer) return;

    const history = Storage.getWeatherHistory();
    this.elements.recentChipsContainer.innerHTML = '';

    history.forEach((city) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'recent-chip';
      chip.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        ${sanitizeHTML(city)}
      `;
      chip.addEventListener('click', () => {
        this.elements.searchInput.value = city;
        this.loadWeatherByCity(city);
      });
      this.elements.recentChipsContainer.appendChild(chip);
    });
  }

  setLoading(isLoading) {
    this.isLoading = isLoading;
    if (this.elements.loadingSkeleton) {
      this.elements.loadingSkeleton.classList.toggle('hidden', !isLoading);
    }
    if (this.elements.weatherContainer) {
      this.elements.weatherContainer.classList.toggle('hidden', isLoading);
    }
  }

  showError(message) {
    if (this.elements.errorContainer) {
      this.elements.errorContainer.classList.remove('hidden');
      if (this.elements.errorMessage) {
        this.elements.errorMessage.textContent = message;
      }
    }
    if (this.elements.weatherContainer) {
      this.elements.weatherContainer.classList.add('hidden');
    }
  }

  hideError() {
    if (this.elements.errorContainer) {
      this.elements.errorContainer.classList.add('hidden');
    }
  }
}
