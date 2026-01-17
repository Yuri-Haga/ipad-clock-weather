// DOM要素
const dateEl = document.getElementById('date');
const timeEl = document.getElementById('time');
const temperatureEl = document.getElementById('temperature');
const feelsLikeEl = document.getElementById('feels-like');
const weatherIconEl = document.getElementById('weather-icon');
const hourlyForecastEl = document.getElementById('hourly-forecast');
const statusEl = document.getElementById('status');

// 天気コードから絵文字への変換
const weatherCodeToEmoji = {
    0: '☀️',   // 快晴
    1: '🌤️',  // 主に晴れ
    2: '⛅',   // 部分的に曇り
    3: '☁️',   // 曇り
    45: '🌫️', // 霧
    48: '🌫️', // 着氷性の霧
    51: '🌧️', // 弱い霧雨
    53: '🌧️', // 霧雨
    55: '🌧️', // 強い霧雨
    56: '🌧️', // 着氷性の弱い霧雨
    57: '🌧️', // 着氷性の霧雨
    61: '🌧️', // 弱い雨
    63: '🌧️', // 雨
    65: '🌧️', // 強い雨
    66: '🌧️', // 着氷性の弱い雨
    67: '🌧️', // 着氷性の雨
    71: '🌨️', // 弱い雪
    73: '🌨️', // 雪
    75: '🌨️', // 強い雪
    77: '🌨️', // 雪粒
    80: '🌦️', // 弱いにわか雨
    81: '🌦️', // にわか雨
    82: '🌦️', // 強いにわか雨
    85: '🌨️', // 弱いにわか雪
    86: '🌨️', // 強いにわか雪
    95: '⛈️', // 雷雨
    96: '⛈️', // 弱い雹を伴う雷雨
    99: '⛈️'  // 雹を伴う雷雨
};

// 曜日
const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

// 時刻の更新
function updateDateTime() {
    const now = new Date();

    // 日付
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weekday = weekdays[now.getDay()];
    dateEl.textContent = `${year}年${month}月${day}日（${weekday}）`;

    // 時刻（秒なし）
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    timeEl.textContent = `${hours}:${minutes}`;
}

// 天気コードから絵文字を取得
function getWeatherEmoji(code) {
    return weatherCodeToEmoji[code] || '❓';
}

// 位置情報の取得
function getLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            position => resolve({
                lat: position.coords.latitude,
                lon: position.coords.longitude
            }),
            error => reject(error),
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
        );
    });
}

// 天気情報の取得
async function fetchWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,apparent_temperature&hourly=temperature_2m,weather_code&timezone=Asia/Tokyo&forecast_hours=7`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Weather fetch failed');
    }
    return response.json();
}

// 天気表示の更新
function updateWeatherDisplay(data) {
    // 現在の天気
    const current = data.current;
    temperatureEl.textContent = `${Math.round(current.temperature_2m)}°`;
    feelsLikeEl.textContent = `体感 ${Math.round(current.apparent_temperature)}°`;
    weatherIconEl.textContent = getWeatherEmoji(current.weather_code);

    // 時間ごとの予報
    const hourly = data.hourly;
    hourlyForecastEl.innerHTML = '';

    // 現在時刻のインデックスを見つける
    const now = new Date();
    const currentHour = now.getHours();

    // 次の6時間分を表示
    for (let i = 0; i < 6; i++) {
        const hourIndex = i; // APIはforecast_hours=7で現在から7時間分を返す
        if (hourIndex >= hourly.time.length) break;

        const time = new Date(hourly.time[hourIndex]);
        const hour = time.getHours();
        const temp = Math.round(hourly.temperature_2m[hourIndex]);
        const code = hourly.weather_code[hourIndex];

        const hourItem = document.createElement('div');
        hourItem.className = 'hour-item';
        hourItem.innerHTML = `
            <span class="hour-time">${hour}時</span>
            <span class="hour-icon">${getWeatherEmoji(code)}</span>
            <span class="hour-temp">${temp}°</span>
        `;
        hourlyForecastEl.appendChild(hourItem);
    }
}

// 天気の取得と更新
async function updateWeather() {
    try {
        statusEl.textContent = '位置情報を取得中...';
        statusEl.className = 'status';

        const location = await getLocation();

        statusEl.textContent = '天気情報を取得中...';
        const weather = await fetchWeather(location.lat, location.lon);

        updateWeatherDisplay(weather);

        const now = new Date();
        statusEl.textContent = `最終更新: ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    } catch (error) {
        console.error('Weather update failed:', error);
        statusEl.textContent = '天気情報の取得に失敗しました';
        statusEl.className = 'status error';
    }
}

// 初期化
function init() {
    // 時計を開始
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // 天気を取得
    updateWeather();

    // 30分ごとに天気を更新
    setInterval(updateWeather, 30 * 60 * 1000);
}

// アプリ開始
init();
