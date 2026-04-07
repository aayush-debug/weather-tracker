// API keys
const API_KEY = 'AIzaSyCkjfW3FzVIauJd2ZjqNsBW9hPCluBFK-w'; // OpenWeatherMap API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const AIR_QUALITY_URL = 'https://api.openweathermap.org/data/3.0/stations';
const POLLUTION_URL = 'https://api.openweathermap.org/data/2.5/air_pollution';

// DOM elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const weatherDisplay = document.getElementById('weather-display');
const aqiDisplay = document.getElementById('aqi-display');
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
const historicalPanel = document.getElementById('historical-data');
const chartBtns = document.querySelectorAll('.chart-btn');

// AQI elements
const aqiValue = document.getElementById('aqi-value');
const aqiLabel = document.getElementById('aqi-label');
const pm25 = document.getElementById('pm25');
const pm10 = document.getElementById('pm10');
const o3 = document.getElementById('o3');
const no2 = document.getElementById('no2');

// State
let isCelsius = true;
let searchHistoryArr = JSON.parse(localStorage.getItem('weatherHistory')) || [];
let historicalData = JSON.parse(localStorage.getItem('historicalData')) || {};
let historyChart = null;
let currentChartType = 'temp';
let currentLocation = null;

// Event listeners
searchBtn.addEventListener('click', () => searchWeather(cityInput.value));
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchWeather(cityInput.value);
});
locationBtn.addEventListener('click', getLocationWeather);
themeToggle.addEventListener('click', toggleTheme);
unitToggle.addEventListener('click', toggleUnit);
chartBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        chartBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentChartType = e.target.dataset.chart;
        updateHistoryChart();
    });
});

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
        const pollution = await fetchPollutionData(currentWeather.coord.lat, currentWeather.coord.lon);
        
        currentLocation = { lat: currentWeather.coord.lat, lon: currentWeather.coord.lon, name: city };
        
        displayWeather(currentWeather);
        displayAirQuality(pollution);
        displayForecast(forecast);
        addToHistory(city);
        saveHistoricalData(currentWeather, pollution);
        await loadHistoricalChart();
        
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
            const pollution = await fetchPollutionData(latitude, longitude);
            
            currentLocation = { lat: latitude, lon: longitude, name: currentWeather.name };
            
            displayWeather(currentWeather);
            displayAirQuality(pollution);
            displayForecast(forecast);
            addToHistory(currentWeather.name);
            saveHistoricalData(currentWeather, pollution);
            await loadHistoricalChart();
            
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

async function fetchPollutionData(lat, lon) {
    const response = await fetch(`${POLLUTION_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
    if (!response.ok) throw new Error('Pollution data not available');
    return await response.json();
}

function displayWeather(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    temperature.textContent = formatTemperature(data.main.temp);
    humidity.textContent = `${data.main.humidity}%`;
    feelsLike.textContent = formatTemperature(data.main.feels_like);
    pressure.textContent = `${data.main.pressure} hPa`;
    description.textContent = data.weather[0].description;
    
    // Additional weather info
    document.getElementById('wind-speed').textContent = `${data.wind.speed} m/s`;
    document.getElementById('wind-direction').textContent = `${getWindDirection(data.wind.deg)} (${data.wind.deg}°)`;
    document.getElementById('visibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    document.getElementById('cloud-cover').textContent = `${data.clouds.all}%`;
    document.getElementById('dew-point').textContent = formatTemperature(calculateDewPoint(data.main.temp, data.main.humidity));
    
    // Sunrise and sunset
    const sunriseTime = new Date(data.sys.sunrise * 1000);
    const sunsetTime = new Date(data.sys.sunset * 1000);
    document.getElementById('sunrise-time').textContent = sunriseTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('sunset-time').textContent = sunsetTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    // UV Index (fetch separately)
    fetchUVIndex(data.coord.lat, data.coord.lon);
}

function getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}

function calculateDewPoint(temp, humidity) {
    const a = 17.27;
    const b = 237.7;
    const alphaTT = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
    return (b * alphaTT) / (a - alphaTT);
}

async function fetchUVIndex(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        if (response.ok) {
            const data = await response.json();
            document.getElementById('uv-index').textContent = data.value.toFixed(1);
        }
    } catch (error) {
        document.getElementById('uv-index').textContent = 'N/A';
    }
}

function displayAirQuality(data) {
    if (data.list && data.list.length > 0) {
        const pollutants = data.list[0].components;
        const aqi = data.list[0].main.aqi;
        
        aqiValue.textContent = aqi;
        aqiLabel.textContent = getAQILabel(aqi);
        aqiLabel.className = `aqi-label aqi-${getAQIClass(aqi)}`;
        
        pm25.textContent = `${(pollutants.pm2_5 || 0).toFixed(1)} µg/m³`;
        pm10.textContent = `${(pollutants.pm10 || 0).toFixed(1)} µg/m³`;
        o3.textContent = `${(pollutants.o3 || 0).toFixed(1)} µg/m³`;
        no2.textContent = `${(pollutants.no2 || 0).toFixed(1)} µg/m³`;
        
        aqiDisplay.classList.remove('hidden');
    }
}

function getAQILabel(aqi) {
    const labels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
    return labels[aqi - 1] || 'Unknown';
}

function getAQIClass(aqi) {
    const classes = ['good', 'fair', 'moderate', 'poor', 'very-poor'];
    return classes[aqi - 1] || 'unknown';
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

function saveHistoricalData(weatherData, pollutionData) {
    const today = new Date().toISOString().split('T')[0];
    const key = `${currentLocation?.name || weatherData.name}_${today}`;
    
    if (!historicalData[key]) {
        historicalData[key] = {
            temp: weatherData.main.temp,
            humidity: weatherData.main.humidity,
            aqi: pollutionData.list[0].main.aqi,
            pm25: pollutionData.list[0].components.pm2_5,
            date: today
        };
        localStorage.setItem('historicalData', JSON.stringify(historicalData));
    }
}

async function loadHistoricalChart() {
    historicalPanel.classList.remove('hidden');
    await updateHistoryChart();
}

function updateHistoryChart() {
    if (!currentLocation) return;
    
    const labels = [];
    const data = [];
    const today = new Date();
    
    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        labels.push(dateStr.split('-')[2]); // Day of month
        
        const key = Object.keys(historicalData).find(k => k.includes(dateStr));
        if (key) {
            if (currentChartType === 'temp') {
                data.push(historicalData[key].temp);
            } else if (currentChartType === 'aqi') {
                data.push(historicalData[key].aqi);
            } else if (currentChartType === 'humidity') {
                data.push(historicalData[key].humidity);
            }
        } else {
            data.push(null);
        }
    }
    
    const ctx = document.getElementById('history-chart');
    
    if (historyChart) {
        historyChart.destroy();
    }
    
    const colors = {
        temp: 'rgb(255, 107, 107)',
        aqi: 'rgb(100, 200, 255)',
        humidity: 'rgb(100, 255, 200)'
    };
    
    const labels_text = {
        temp: 'Temperature (°C)',
        aqi: 'Air Quality Index',
        humidity: 'Humidity (%)'
    };
    
    historyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: labels_text[currentChartType],
                    data: data,
                    borderColor: colors[currentChartType],
                    backgroundColor: colors[currentChartType] + '20',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: document.body.classList.contains('dark') ? '#eaf6ff' : '#333'
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        color: document.body.classList.contains('dark') ? '#eaf6ff' : '#333'
                    },
                    grid: {
                        color: document.body.classList.contains('dark') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: document.body.classList.contains('dark') ? '#eaf6ff' : '#333'
                    },
                    grid: {
                        color: document.body.classList.contains('dark') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    }
                }
            }
        }
    });
}