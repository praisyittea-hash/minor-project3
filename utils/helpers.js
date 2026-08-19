export const debounce = (func, delay = 350) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

export const celsiusToFahrenheit = (celsius) => Math.round((celsius * 9) / 5 + 32);
export const fahrenheitToCelsius = (fahrenheit) => Math.round(((fahrenheit - 32) * 5) / 9);

export const formatTemperature = (celsius, unit = 'C') => {
  if (celsius === null || celsius === undefined || isNaN(celsius)) return '--';
  const val = unit === 'F' ? celsiusToFahrenheit(celsius) : Math.round(celsius);
  return `${val}°${unit}`;
};

export const formatWindSpeed = (kmh, unit = 'C') => {
  if (kmh === null || kmh === undefined || isNaN(kmh)) return '--';
  if (unit === 'F') {
    const mph = (kmh * 0.621371).toFixed(1);
    return `${mph} mph`;
  }
  return `${Math.round(kmh)} km/h`;
};

export const formatDate = (isoString, timeZone = 'auto') => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

export const getDayName = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return 'Today';
  return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
};

export const getWeatherInfo = (code, isDay = 1) => {
  const c = Number(code);
  const timePeriod = isDay ? 'day' : 'night';

  const weatherMap = {
    0: {
      label: 'Clear Sky',
      icon: isDay ? getSunIcon() : getMoonIcon(),
      bgTheme: 'clear',
    },
    1: {
      label: 'Mainly Clear',
      icon: isDay ? getSunCloudIcon() : getMoonCloudIcon(),
      bgTheme: 'partly-cloudy',
    },
    2: {
      label: 'Partly Cloudy',
      icon: isDay ? getSunCloudIcon() : getMoonCloudIcon(),
      bgTheme: 'partly-cloudy',
    },
    3: {
      label: 'Overcast',
      icon: getCloudIcon(),
      bgTheme: 'cloudy',
    },
    45: {
      label: 'Foggy',
      icon: getFogIcon(),
      bgTheme: 'fog',
    },
    48: {
      label: 'Depositing Rime Fog',
      icon: getFogIcon(),
      bgTheme: 'fog',
    },
    51: { label: 'Light Drizzle', icon: getDrizzleIcon(), bgTheme: 'rain' },
    53: { label: 'Moderate Drizzle', icon: getDrizzleIcon(), bgTheme: 'rain' },
    55: { label: 'Dense Drizzle', icon: getDrizzleIcon(), bgTheme: 'rain' },
    61: { label: 'Slight Rain', icon: getRainIcon(), bgTheme: 'rain' },
    63: { label: 'Moderate Rain', icon: getRainIcon(), bgTheme: 'rain' },
    65: { label: 'Heavy Rain', icon: getHeavyRainIcon(), bgTheme: 'heavy-rain' },
    71: { label: 'Slight Snowfall', icon: getSnowIcon(), bgTheme: 'snow' },
    73: { label: 'Moderate Snowfall', icon: getSnowIcon(), bgTheme: 'snow' },
    75: { label: 'Heavy Snowfall', icon: getSnowIcon(), bgTheme: 'snow' },
    77: { label: 'Snow Grains', icon: getSnowIcon(), bgTheme: 'snow' },
    80: { label: 'Slight Showers', icon: getRainIcon(), bgTheme: 'rain' },
    81: { label: 'Moderate Showers', icon: getRainIcon(), bgTheme: 'rain' },
    82: { label: 'Violent Showers', icon: getHeavyRainIcon(), bgTheme: 'heavy-rain' },
    85: { label: 'Slight Snow Showers', icon: getSnowIcon(), bgTheme: 'snow' },
    86: { label: 'Heavy Snow Showers', icon: getSnowIcon(), bgTheme: 'snow' },
    95: { label: 'Thunderstorm', icon: getThunderIcon(), bgTheme: 'thunder' },
    96: { label: 'Thunderstorm with Hail', icon: getThunderIcon(), bgTheme: 'thunder' },
    99: { label: 'Heavy Thunderstorm with Hail', icon: getThunderIcon(), bgTheme: 'thunder' },
  };

  return weatherMap[c] || {
    label: 'Atmospheric Conditions',
    icon: getCloudIcon(),
    bgTheme: 'cloudy',
  };
};

export const getSunIcon = () => `
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="14" fill="url(#sunGrad)" />
    <g stroke="#f59e0b" stroke-width="3.5" stroke-linecap="round">
      <line x1="32" y1="6" x2="32" y2="12" />
      <line x1="32" y1="52" x2="32" y2="58" />
      <line x1="6" y1="32" x2="12" y2="32" />
      <line x1="52" y1="32" x2="58" y2="32" />
      <line x1="13.62" y1="13.62" x2="17.86" y2="17.86" />
      <line x1="46.14" y1="46.14" x2="50.38" y2="50.38" />
      <line x1="13.62" y1="50.38" x2="17.86" y2="46.14" />
      <line x1="46.14" y1="17.86" x2="50.38" y2="13.62" />
    </g>
    <defs>
      <linearGradient id="sunGrad" x1="18" y1="18" x2="46" y2="46" gradientUnits="userSpaceOnUse">
        <stop stop-color="#fbbf24" />
        <stop offset="1" stop-color="#f59e0b" />
      </linearGradient>
    </defs>
  </svg>
`;

export const getMoonIcon = () => `
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M42 46C27.64 46 16 34.36 16 20C16 16.5 16.7 13.16 18 10.1C11.5 13.9 7 21 7 29C7 43.36 18.64 55 33 55C41 55 48.1 50.5 51.9 44C48.84 45.3 45.5 46 42 46Z" fill="url(#moonGrad)" />
    <defs>
      <linearGradient id="moonGrad" x1="10" y1="10" x2="50" y2="50" gradientUnits="userSpaceOnUse">
        <stop stop-color="#e0e7ff" />
        <stop offset="1" stop-color="#818cf8" />
      </linearGradient>
    </defs>
  </svg>
`;

export const getSunCloudIcon = () => `
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="10" fill="#fbbf24" />
    <path d="M22 50H46C51.52 50 56 45.52 56 40C56 34.78 52 30.5 46.9 30.06C45.8 21.6 38.6 15 30 15C21.4 15 14.2 21.6 13.1 30.06C8 30.5 4 34.78 4 40C4 45.52 8.48 50 14 50H22Z" fill="url(#cloudGrad)" opacity="0.95" />
    <defs>
      <linearGradient id="cloudGrad" x1="10" y1="15" x2="56" y2="50" gradientUnits="userSpaceOnUse">
        <stop stop-color="#ffffff" />
        <stop offset="1" stop-color="#94a3b8" />
      </linearGradient>
    </defs>
  </svg>
`;

export const getMoonCloudIcon = () => `
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M28 26C21.5 26 16.5 20.8 16.5 14.5C16.5 12.8 16.8 11.2 17.5 9.7C14 11.8 11.5 15.6 11.5 20C11.5 27.5 17.5 33.5 25 33.5C29.4 33.5 33.2 31 35.3 27.5C33.8 28.2 32.2 28.5 30.5 28.5" fill="#a5b4fc" />
    <path d="M22 50H46C51.52 50 56 45.52 56 40C56 34.78 52 30.5 46.9 30.06C45.8 21.6 38.6 15 30 15C21.4 15 14.2 21.6 13.1 30.06C8 30.5 4 34.78 4 40C4 45.52 8.48 50 14 50H22Z" fill="url(#cloudGrad)" />
    <defs>
      <linearGradient id="cloudGrad" x1="10" y1="15" x2="56" y2="50" gradientUnits="userSpaceOnUse">
        <stop stop-color="#cbd5e1" />
        <stop offset="1" stop-color="#64748b" />
      </linearGradient>
    </defs>
  </svg>
`;

export const getCloudIcon = () => `
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 52H46C51.52 52 56 47.52 56 42C56 36.78 52 32.5 46.9 32.06C45.8 23.6 38.6 17 30 17C21.4 17 14.2 23.6 13.1 32.06C8 32.5 4 36.78 4 42C4 47.52 8.48 52 14 52H22Z" fill="url(#cloudGradGray)" />
    <defs>
      <linearGradient id="cloudGradGray" x1="4" y1="17" x2="56" y2="52" gradientUnits="userSpaceOnUse">
        <stop stop-color="#e2e8f0" />
        <stop offset="1" stop-color="#94a3b8" />
      </linearGradient>
    </defs>
  </svg>
`;

export const getRainIcon = () => `
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 42H44C48.4 42 52 38.4 52 34C52 29.8 48.8 26.4 44.7 26C43.8 19.3 38.1 14 31.2 14C24.3 14 18.6 19.3 17.7 26C13.6 26.4 10.4 29.8 10.4 34C10.4 38.4 14 42 18.4 42H20Z" fill="#94a3b8" />
    <line x1="22" y1="46" x2="18" y2="56" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" />
    <line x1="32" y1="46" x2="28" y2="56" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" />
    <line x1="42" y1="46" x2="38" y2="56" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" />
  </svg>
`;

export const getHeavyRainIcon = () => `
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 38H44C48.4 38 52 34.4 52 30C52 25.8 48.8 22.4 44.7 22C43.8 15.3 38.1 10 31.2 10C24.3 10 18.6 15.3 17.7 22C13.6 22.4 10.4 25.8 10.4 30C10.4 34.4 14 38 18.4 38H20Z" fill="#64748b" />
    <line x1="18" y1="42" x2="14" y2="54" stroke="#0284c7" stroke-width="3" stroke-linecap="round" />
    <line x1="26" y1="44" x2="22" y2="56" stroke="#0284c7" stroke-width="3" stroke-linecap="round" />
    <line x1="34" y1="42" x2="30" y2="54" stroke="#0284c7" stroke-width="3" stroke-linecap="round" />
    <line x1="42" y1="44" x2="38" y2="56" stroke="#0284c7" stroke-width="3" stroke-linecap="round" />
  </svg>
`;

export const getDrizzleIcon = () => `
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 42H44C48.4 42 52 38.4 52 34C52 29.8 48.8 26.4 44.7 26C43.8 19.3 38.1 14 31.2 14C24.3 14 18.6 19.3 17.7 26C13.6 26.4 10.4 29.8 10.4 34C10.4 38.4 14 42 18.4 42H20Z" fill="#cbd5e1" />
    <circle cx="22" cy="48" r="2" fill="#38bdf8" />
    <circle cx="32" cy="52" r="2" fill="#38bdf8" />
    <circle cx="42" cy="48" r="2" fill="#38bdf8" />
  </svg>
`;

export const getSnowIcon = () => `
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 40H44C48.4 40 52 36.4 52 32C52 27.8 48.8 24.4 44.7 24C43.8 17.3 38.1 12 31.2 12C24.3 12 18.6 17.3 17.7 24C13.6 24.4 10.4 27.8 10.4 32C10.4 36.4 14 40 18.4 40H20Z" fill="#cbd5e1" />
    <g fill="#e0f2fe">
      <circle cx="22" cy="48" r="2.5" />
      <circle cx="32" cy="54" r="2.5" />
      <circle cx="42" cy="48" r="2.5" />
    </g>
  </svg>
`;

export const getThunderIcon = () => `
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 36H44C48.4 36 52 32.4 52 28C52 23.8 48.8 20.4 44.7 20C43.8 13.3 38.1 8 31.2 8C24.3 8 18.6 13.3 17.7 20C13.6 20.4 10.4 23.8 10.4 28C10.4 32.4 14 36 18.4 36H20Z" fill="#475569" />
    <polygon points="32,34 24,47 31,47 28,58 40,43 33,43" fill="#fbbf24" stroke="#f59e0b" stroke-width="1.5" stroke-linejoin="round" />
  </svg>
`;

export const getFogIcon = () => `
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="14" y1="26" x2="50" y2="26" stroke="#94a3b8" stroke-width="4" stroke-linecap="round" />
    <line x1="10" y1="36" x2="54" y2="36" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round" />
    <line x1="18" y1="46" x2="46" y2="46" stroke="#94a3b8" stroke-width="4" stroke-linecap="round" />
  </svg>
`;

export const sanitizeHTML = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};
