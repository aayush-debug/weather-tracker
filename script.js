// API key - Replace with your own from OpenWeatherMap
const API_KEY = 'AIzaSyCkjfW3FzVIauJd2ZjqNsBW9hPCluBFK-w'; // Sign up at https://openweathermap.org/api
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const weatherDisplay = document.getElementById('weather-display');
const cityName = document.getElementById('city-name');
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temperature');
const humidity = document.getElementById('humidity');
const feelsLike = document.getElementById('feels-like');
const pressure = document.getElementById('pressure');
const description = document.getElementById('description');
const forecastCards = document.getElementById('forecast-cards');
const searchHistory = document.getElementById('search-history');
const historyList = document.getElementById('history-list');
const themeToggle = document.getElementById('theme-toggle');
const unitToggle = document.getElementById('unit-toggle');

// State
let isCelsius = true;
let searchHistoryArr = JSON.parse(localStorage.getItem('weatherHistory')) || [];

// Event listeners
searchBtn.addEventListener('click', () => searchWeather(cityInput.value));
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchWeather(cityInput.value);
});
locationBtn.addEventListener('click', getLocationWeather);
themeToggle.addEventListener('click', toggleTheme);
unitToggle.addEventListener('click', toggleUnit);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateTheme();
    updateUnitButton();
    displaySearchHistory();
    if (searchHistoryArr.length > 0) {
        searchWeather(searchHistoryArr[0]); // Load last searched city
    }
});

// Functions
async function searchWeather(city) {
    if (!city.trim()) return;
    
    showLoading();
    hideError();
    hideWeather();
    
    try {
        const currentWeather = await fetchWeatherData(city);
        const forecast = await fetchForecastData(city);
        
        displayWeather(currentWeather);
        displayForecast(forecast);
        addToHistory(city);
        hideLoading();
        showWeather();
    } catch (error) {
        showError(error.message);
        hideLoading();
    }
}

async function getLocationWeather() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by this browser.');
        return;
    }
    
    showLoading();
    hideError();
    hideWeather();
    
    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
            const currentWeather = await fetchWeatherDataByCoords(latitude, longitude);
            const forecast = await fetchForecastDataByCoords(latitude, longitude);
            
            displayWeather(currentWeather);
            displayForecast(forecast);
            hideLoading();
            showWeather();
        } catch (error) {
            showError(error.message);
            hideLoading();
        }
    }, () => {
        showError('Unable to retrieve your location.');
        hideLoading();
    });
}

async function fetchWeatherData(city) {
    const response = await fetch(`${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`);
    if (!response.ok) throw new Error('City not found');
    return await response.json();
}

async function fetchWeatherDataByCoords(lat, lon) {
    const response = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    if (!response.ok) throw new Error('Weather data not available');
    return await response.json();
}

async function fetchForecastData(city) {
    const response = await fetch(`${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`);
    if (!response.ok) throw new Error('Forecast data not available');
    return await response.json();
}

async function fetchForecastDataByCoords(lat, lon) {
    const response = await fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    if (!response.ok) throw new Error('Forecast data not available');
    return await response.json();
}

function displayWeather(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    temperature.textContent = formatTemperature(data.main.temp);
    humidity.textContent = `Humidity: ${data.main.humidity}%`;
    feelsLike.textContent = `Feels like ${formatTemperature(data.main.feels_like)}`;
    pressure.textContent = `${data.main.pressure} hPa`;
    description.textContent = data.weather[0].description;
}

function displayForecast(data) {
    forecastCards.innerHTML = '';
    
    // Group forecast by day
    const dailyForecasts = {};
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000).toDateString();
        if (!dailyForecasts[date]) {
            dailyForecasts[date] = [];
        }
        dailyForecasts[date].push(item);
    });
    
    // Take first 5 days
    const days = Object.keys(dailyForecasts).slice(0, 5);
    
    days.forEach(day => {
        const dayData = dailyForecasts[day][0]; // Take noon data or first
        const card = createForecastCard(day, dayData);
        forecastCards.appendChild(card);
    });
}

function createForecastCard(date, data) {
    const card = document.createElement('div');
    card.className = 'forecast-card';
    
    const dateObj = new Date(date);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    
    card.innerHTML = `
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="${data.weather[0].description}">
        <div class="date">${dayName}</div>
        <div class="temp">${formatTemperature(data.main.temp)}</div>
        <div class="desc">${data.weather[0].description}</div>
    `;
    
    return card;
}

function formatTemperature(temp) {
    if (isCelsius) {
        return `${Math.round(temp)}°C`;
    } else {
        return `${Math.round(temp * 9/5 + 32)}°F`;
    }
}

function addToHistory(city) {
    const lowerCity = city.toLowerCase();
    searchHistoryArr = searchHistoryArr.filter(c => c.toLowerCase() !== lowerCity);
    searchHistoryArr.unshift(city);
    searchHistoryArr = searchHistoryArr.slice(0, 5); // Keep only 5 recent
    localStorage.setItem('weatherHistory', JSON.stringify(searchHistoryArr));
    displaySearchHistory();
}

function displaySearchHistory() {
    if (searchHistoryArr.length === 0) {
        searchHistory.classList.add('hidden');
        return;
    }
    
    historyList.innerHTML = '';
    searchHistoryArr.forEach(city => {
        const li = document.createElement('li');
        li.textContent = city;
        li.addEventListener('click', () => searchWeather(city));
        historyList.appendChild(li);
    });
    searchHistory.classList.remove('hidden');
}

function toggleTheme() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function updateTheme() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.body.classList.add('dark');
        themeToggle.textContent = '☀️';
    } else {
        themeToggle.textContent = '🌙';
    }
}

function toggleUnit() {
    isCelsius = !isCelsius;
    updateUnitButton();
    localStorage.setItem('unit', isCelsius ? 'celsius' : 'fahrenheit');
    
    // Refresh current weather display if visible
    if (!weatherDisplay.classList.contains('hidden')) {
        const currentCity = cityName.textContent.split(',')[0];
        if (currentCity) searchWeather(currentCity);
    }
}

function updateUnitButton() {
    unitToggle.textContent = isCelsius ? '°C' : '°F';
    const unit = localStorage.getItem('unit');
    if (unit === 'fahrenheit') {
        isCelsius = false;
        unitToggle.textContent = '°F';
    }
}

function showLoading() {
    loading.classList.remove('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

function hideError() {
    errorDiv.classList.add('hidden');
}

function showWeather() {
    weatherDisplay.classList.remove('hidden');
}

function hideWeather() {
    weatherDisplay.classList.add('hidden');
}