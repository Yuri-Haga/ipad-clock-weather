// DOM要素
const dateEl = document.getElementById('date');
const timeEl = document.getElementById('time');
const temperatureEl = document.getElementById('temperature');
const feelsLikeEl = document.getElementById('feels-like');
const weatherIconEl = document.getElementById('weather-icon');
const hourlyForecastEl = document.getElementById('hourly-forecast');
const dailyForecastEl = document.getElementById('daily-forecast');
const locationEl = document.getElementById('location');
const todayHighLowEl = document.getElementById('today-high-low');
const precipitationEl = document.getElementById('precipitation');
const messageEl = document.getElementById('message');
const statusEl = document.getElementById('status');

// ツンデレお嬢様の時間帯別メッセージ
const timeBasedMessages = {
    // 朝 (7:00-9:59)
    morning: [
        "おはよう...ちゃんと起きられたのね",
        "朝から頑張るなんて...見直したわ、ちょっとだけ",
        "今日も一日、しっかりやりなさいよね！",
        "朝ごはん、ちゃんと食べた？...別に心配してないけど",
        "いい朝ね...あなたと迎えられて、なんて思ってないわよ！"
    ],
    // 午前 (10:00-12:59)
    lateMorning: [
        "午前中が勝負よ、分かってるわね？",
        "集中しなさいよ...見てるんだから",
        "調子はどう？...別に気にしてるわけじゃないけど",
        "ふん、なかなか頑張ってるじゃない",
        "お昼まであと少しよ...ペース配分、考えなさいよね"
    ],
    // 午後 (13:00-15:59)
    afternoon: [
        "午後も気を抜かないでよね",
        "眠くなってないでしょうね？しっかりしなさい！",
        "お昼ちゃんと食べた？...聞いてるだけよ",
        "午後も頑張りなさい...応援してあげるわ、特別に",
        "あと半日よ、最後まで気を抜かないで！"
    ],
    // 夕方 (16:00-18:59)
    evening: [
        "もうひと踏ん張りよ、できるわよね？",
        "今日も頑張ったわね...ちょっとだけ認めてあげる",
        "そろそろ終わりが見えてきたわね...お疲れさま、なんて",
        "夕方まで頑張れるなんて...見直したわ",
        "今日の締めくくり、しっかりやりなさいよ！"
    ],
    // 夜 (19:00-21:59)
    night: [
        "今日もお疲れさま...感謝してるわけじゃないけど",
        "ゆっくり休んでいいのよ...許可してあげるわ",
        "今日一日、よく頑張ったわね...褒めてないわよ！",
        "夜は自分の時間よ...好きに過ごしなさい",
        "リラックスしなさいよ...あなたには必要だから"
    ],
    // 深夜 (22:00-6:59)
    lateNight: [
        "こんな時間まで...無理しないでよね",
        "早く寝なさいよ...心配してるわけじゃないけど",
        "夜更かしはお肌に悪いのよ？...あなたのためを思って言ってるの",
        "まだ起きてるの？...付き合ってあげるわ、仕方ないから",
        "おやすみ...って、別に優しくしてるわけじゃないんだから！"
    ]
};

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

    // 時間帯が変わったらメッセージを更新
    const newPeriod = getTimePeriod(now.getHours());
    if (newPeriod !== currentPeriod) {
        currentPeriod = newPeriod;
        if (messageEl) {
            messageEl.textContent = getTimeBasedMessage();
        }
    }
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

// 地名の取得（逆ジオコーディング）
async function fetchLocationName(lat, lon) {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ja`;
        const response = await fetch(url, {
            headers: { 'User-Agent': 'WeatherWidget/1.0' }
        });
        if (!response.ok) return null;
        const data = await response.json();
        // 市区町村名を取得（city > town > village > county の順で探す）
        const address = data.address;
        return address.city || address.town || address.village || address.county || address.state || null;
    } catch {
        return null;
    }
}

// 時間帯を取得
function getTimePeriod(hour) {
    if (hour >= 7 && hour < 10) return 'morning';
    if (hour >= 10 && hour < 13) return 'lateMorning';
    if (hour >= 13 && hour < 16) return 'afternoon';
    if (hour >= 16 && hour < 19) return 'evening';
    if (hour >= 19 && hour < 22) return 'night';
    return 'lateNight'; // 22:00-6:59
}

// 時間帯別メッセージを取得
function getTimeBasedMessage() {
    const now = new Date();
    const hour = now.getHours();
    const period = getTimePeriod(hour);
    const messages = timeBasedMessages[period];

    // 日付をシードにして同じ時間帯では同じメッセージを表示
    const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    return messages[seed % messages.length];
}

// 現在の時間帯を保持
let currentPeriod = null;

// 天気情報の取得
async function fetchWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,apparent_temperature&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia/Tokyo&forecast_hours=7&forecast_days=5`;

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

    // 今日の最高/最低気温と降水確率
    const daily = data.daily;
    if (todayHighLowEl && daily.temperature_2m_max && daily.temperature_2m_min) {
        const todayHigh = Math.round(daily.temperature_2m_max[0]);
        const todayLow = Math.round(daily.temperature_2m_min[0]);
        todayHighLowEl.textContent = `${todayHigh}° / ${todayLow}°`;
    }
    if (precipitationEl && daily.precipitation_probability_max) {
        const precip = daily.precipitation_probability_max[0];
        precipitationEl.textContent = `☔ ${precip}%`;
    }

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

    // 日別予報（明日・明後日）
    dailyForecastEl.innerHTML = '';
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

    for (let i = 1; i < Math.min(5, daily.time.length); i++) {
        const date = new Date(daily.time[i]);
        const dayName = dayNames[date.getDay()];
        const high = Math.round(daily.temperature_2m_max[i]);
        const low = Math.round(daily.temperature_2m_min[i]);
        const code = daily.weather_code[i];

        const dailyItem = document.createElement('div');
        dailyItem.className = 'daily-item';
        dailyItem.innerHTML = `
            <span class="daily-day">${date.getMonth() + 1}/${date.getDate()}(${dayName})</span>
            <span class="daily-icon">${getWeatherEmoji(code)}</span>
            <span class="daily-temps"><span class="daily-high">${high}°</span> / <span class="daily-low">${low}°</span></span>
        `;
        dailyForecastEl.appendChild(dailyItem);
    }
}

// 天気の取得と更新
async function updateWeather() {
    try {
        statusEl.textContent = '位置情報を取得中...';
        statusEl.className = 'status';

        const location = await getLocation();

        statusEl.textContent = '天気情報を取得中...';
        const [weather, locationName] = await Promise.all([
            fetchWeather(location.lat, location.lon),
            fetchLocationName(location.lat, location.lon)
        ]);

        updateWeatherDisplay(weather);

        // 地名を表示
        if (locationName && locationEl) {
            locationEl.textContent = locationName;
        }

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

    // 時間帯別メッセージを表示（初期化）
    const now = new Date();
    currentPeriod = getTimePeriod(now.getHours());
    if (messageEl) {
        messageEl.textContent = getTimeBasedMessage();
    }

    // 天気を取得
    updateWeather();

    // 30分ごとに天気を更新
    setInterval(updateWeather, 30 * 60 * 1000);
}

// アプリ開始
init();
