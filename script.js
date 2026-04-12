const API_KEY = '2dca580c2a14b55200e784d157207b4d';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
function toggleTheme() {
    let body = document.body;
    let button = document.querySelector(".theme-toggle");
    
    if (body.classList.contains("light-theme")) {
        body.classList.remove("light-theme");
        button.textContent = "🌙 Dark";
        localStorage.setItem("theme", "dark");
    } else {
        body.classList.add("light-theme");
        button.textContent = "☀️ Light";
        localStorage.setItem("theme", "light");
    }
}

document.addEventListener("DOMContentLoaded", function() {
    let savedTheme = localStorage.getItem("theme") || "dark";
    let button = document.querySelector(".theme-toggle");
    
    if (savedTheme === "light") {
        document.body.classList.add("light-theme");
        button.textContent = "☀️ Light";
    }
});

let selectedMood = null;
let selectedOption = null;
let allResults = [];

const moodMap = { happy: "comedy", sad: "drama", excited: "action", relaxed: "romance" };
const moodEmojis = { happy: "😊", sad: "😢", excited: "🤩", relaxed: "😌" };


function showPage(pageNum) {
    document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
    document.getElementById("page" + pageNum).classList.add("active");
}


function selectMood(mood) {
    selectedMood = mood;
    let capital = mood.charAt(0).toUpperCase() + mood.slice(1);
    document.getElementById("moodDisplay").innerText = "You're feeling " + moodEmojis[mood] + " " + capital;
    showPage(2);
}


function selectOption(option) {
    selectedOption = option;
    const emojis = { movie: "🎬", music: "🎵", quote: "💬", activity: "🎯" };
    
    let msg = moodEmojis[selectedMood] + " " + selectedMood.toUpperCase() + 
              " → " + emojis[option] + " " + option.toUpperCase();
    document.getElementById("selectionInfo").innerText = msg;
    
    document.getElementById("resultsList").innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading...</p></div>';
    allResults = [];
    
    showPage(3);
    fetchData();
}

// FETCH DATA FROM API
function fetchData() {
    if (selectedOption === "movie") fetchMovies();
    else if (selectedOption === "music") fetchMusic();
    else if (selectedOption === "quote") fetchQuotes();
    else if (selectedOption === "activity") fetchActivities();
}

// Fetch Movies
function fetchMovies() {
    let keyword = moodMap[selectedMood];
    fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&page=1`)
        .then(r => r.json())
        .then(data => {
            allResults = data.results?.slice(0, 20).map(movie => {
                let title = movie.title || "Unknown";
                let rating = movie.vote_average ? "⭐ " + movie.vote_average.toFixed(1) + "/10" : "";
                let desc = movie.overview?.substring(0, 150) || "No description";
                let posterPath = movie.poster_path ? `${IMAGE_BASE_URL}/w500${movie.poster_path}` : "";
                let link = "https://www.youtube.com/results?search_query=" + encodeURIComponent(title + " trailer");
                
                let html = `<div class="result-card">
                    ${posterPath ? `<img src="${posterPath}" alt="${title}">` : ''}
                    <div class="result-title">🎬 ${title}</div>
                    <div class="result-detail">${rating}</div>
                    <div class="result-description">${desc}</div>
                    <a href="${link}" target="_blank" class="yt-link">▶ Watch Trailer →</a>
                </div>`;
                
                return { html, searchText: title };
            }) || [];
            allResults.sort(() => Math.random() - 0.5);
            displayResults();
        })
        .catch(e => {
            console.error(e);
            displayError("Failed to load movies");
        });
}

// Fetch Music
function fetchMusic() {
    const queries = {
        happy: "upbeat OR pop OR dance",
        sad: "sad OR melancholic OR emotional",
        excited: "rock OR metal OR electronic",
        relaxed: "ambient OR chill OR lo-fi"
    };
    
    fetch(`https://musicbrainz.org/ws/2/recording?query=${encodeURIComponent(queries[selectedMood])}&limit=50&fmt=json`, 
        { headers: { 'Accept': 'application/json' } })
        .then(r => r.json())
        .then(data => {
            allResults = data.recordings?.slice(0, 25).map(track => {
                let title = track.title || "Unknown";
                let artist = track['artist-credit']?.[0]?.name || "Unknown Artist";
                let score = track.score ? "🔥 " + track.score + "%" : "";
                let link = "https://www.youtube.com/results?search_query=" + encodeURIComponent(title + " " + artist);
                
                let html = `<div class="result-card">
                    <div class="result-title">🎵 ${title}</div>
                    <div class="result-detail">🎤 ${artist}</div>
                    <div class="result-detail">${score}</div>
                    <a href="${link}" target="_blank" class="yt-link">▶ Listen →</a>
                </div>`;
                
                return { html, searchText: title + " " + artist };
            }) || [];
            allResults.sort(() => Math.random() - 0.5);
            displayResults();
        })
        .catch(e => displayError("Failed to load music"));
}

// Fetch Quotes
function fetchQuotes() {
    fetch("https://dummyjson.com/quotes?limit=30")
        .then(r => r.json())
        .then(data => {
            allResults = data.quotes?.map(quote => {
                let html = `<div class="result-card">
                    <div class="result-title">💬 "${quote.quote}"</div>
                    <div class="result-detail">— ${quote.author}</div>
                </div>`;
                return { html, searchText: quote.quote + " " + quote.author };
            }) || [];
            allResults.sort(() => Math.random() - 0.5);
            displayResults();
        })
        .catch(e => displayError("Failed to load quotes"));
}

// Fetch Activities
function fetchActivities() {
    fetch("https://opentdb.com/api.php?amount=20")
        .then(r => r.json())
        .then(data => {
            allResults = data.results?.map(q => {
                let text = q.question
                    .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>').replace(/&#039;/g, "'");
                
                let html = `<div class="result-card">
                    <div class="result-title">🎯 ${text}</div>
                    <div class="result-detail">📁 ${q.category}</div>
                    <div class="result-detail">⚡ ${q.difficulty.toUpperCase()}</div>
                </div>`;
                return { html, searchText: text + " " + q.category };
            }) || [];
            allResults.sort(() => Math.random() - 0.5);
            displayResults();
        })
        .catch(e => displayError("Failed to load activities"));
}

// Display Results
function displayResults() {
    if (allResults.length === 0) {
        displayError("No results found");
        return;
    }
    let html = allResults.map(r => r.html).join("");
    document.getElementById("resultsList").innerHTML = html;
}

// Display Error
function displayError(msg) {
    document.getElementById("resultsList").innerHTML = `<p class="no-results">❌ ${msg}</p>`;
}

//  BACK & RESET 
function backToMood() {
    selectedOption = null;
    showPage(2);
}

function resetApp() {
    selectedMood = null;
    selectedOption = null;
    allResults = [];
    document.getElementById("moodDisplay").innerText = "";
    document.getElementById("selectionInfo").innerText = "";
    document.getElementById("searchInput").value = "";
    showPage(1);
}

// SEARCH 
function handleSearch() {
    let query = document.getElementById("searchInput").value.toLowerCase();
    
    if (query === "") {
        let html = allResults.map(r => r.html).join("");
        document.getElementById("resultsList").innerHTML = html;
        return;
    }

    let filtered = allResults.filter(r => r.searchText.toLowerCase().includes(query));
    let html = filtered.length === 0 ? '<p class="no-results">❌ No results found</p>' : filtered.map(r => r.html).join("");
    document.getElementById("resultsList").innerHTML = html;
}

// SORT 
function sortAZ() {
    allResults.sort((a, b) => a.searchText.localeCompare(b.searchText));
    document.getElementById("resultsList").innerHTML = allResults.map(r => r.html).join("");
    document.getElementById("searchInput").value = "";
}

function sortZA() {
    allResults.sort((a, b) => b.searchText.localeCompare(a.searchText));
    document.getElementById("resultsList").innerHTML = allResults.map(r => r.html).join("");
    document.getElementById("searchInput").value = "";
}

function toggleSortMenu() {
    let menu = document.getElementById("sortMenu");
    menu.style.display = menu.style.display === "none" ? "block" : "none";
}
