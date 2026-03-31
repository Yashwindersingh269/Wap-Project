const TMDB_API_KEY = "de77c6d1779b5eb456c35ad08326563e";
const LASTFM_API_KEY = "c312df4bd59568f4f657216ef67a8abd";

let selectedMood = null;
let selectedOption = null;

const moodMap = {
    happy: "comedy",
    sad: "drama",
    excited: "action",
    relaxed: "romance"
};

const moodEmojis = {
    happy: "😊",
    sad: "😢",
    excited: "🤩",
    relaxed: "😌"
};

function showPage(pageNum) {
    document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
    document.getElementById("page" + pageNum).classList.add("active");
}

function selectMood(mood) {
    selectedMood = mood;
    document.getElementById("moodDisplay").innerText = 
        `You selected: ${moodEmojis[mood]} ${mood.charAt(0).toUpperCase() + mood.slice(1)}`;
    showPage(2);
}

function selectOption(option) {
    selectedOption = option;
    const optionEmojis = {
        movie: "🎬",
        music: "🎵",
        quote: "💬",
        activity: "🎯"
    };
    
    document.getElementById("selectionInfo").innerText = 
        `${moodEmojis[selectedMood]} ${selectedMood.toUpperCase()} - ${optionEmojis[option]} ${option.toUpperCase()}`;
    
    showPage(3);
    fetchRecommendation();
}

async function fetchRecommendation() {
    const keyword = moodMap[selectedMood];
    
    switch(selectedOption) {
        case "movie":
            await getMovie(keyword);
            break;
        case "music":
            await getMusic(keyword);
            break;
        case "quote":
            await getQuote();
            break;
        case "activity":
            await getActivity();
            break;
    }
}

async function getMovie(keyword) {
    try {
        let res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${keyword}`);
        
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        let data = await res.json();

        if (data.results && data.results.length > 0) {
            const movie = data.results[0];
            document.getElementById("recommendation").innerHTML = 
                `<strong>${movie.title}</strong><br/><em>${movie.release_date || 'N/A'}</em><br/><p>${movie.overview || 'No description available'}</p>`;
        } else {
            document.getElementById("recommendation").innerText = "❌ No movie found for this mood";
        }
    } catch (error) {
        console.error("Movie API Error:", error);
        document.getElementById("recommendation").innerText = "❌ Failed to load movie. Please try again.";
    }
}

async function getMusic(keyword) {
    try {
        let res = await fetch(`https://ws.audioscrobbler.com/2.0/?method=track.search&track=${keyword}&api_key=${LASTFM_API_KEY}&format=json`);
        
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        let data = await res.json();

        if (data.results && data.results.trackmatches && data.results.trackmatches.track && data.results.trackmatches.track.length > 0) {
            let track = data.results.trackmatches.track[0];
            document.getElementById("recommendation").innerHTML = 
                `<strong>${track.name}</strong><br/><em>Artist: ${track.artist}</em><br/><a href="${track.url}" target="_blank">Listen on Last.fm →</a>`;
        } else {
            document.getElementById("recommendation").innerText = "❌ No track found for this mood";
        }
    } catch (error) {
        console.error("Music API Error:", error);
        document.getElementById("recommendation").innerText = "❌ Failed to load music. Please try again.";
    }
}

async function getQuote() {
    try {
        let res = await fetch("https://zenquotes.io/api/random");
        
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        let data = await res.json();

        if (data && data.length > 0) {
            document.getElementById("recommendation").innerHTML = 
                `<strong>"${data[0].q}"</strong><br/><em>— ${data[0].a}</em>`;
        } else {
            document.getElementById("recommendation").innerText = "❌ No quote found";
        }
    } catch (error) {
        console.error("Quote API Error:", error);
        document.getElementById("recommendation").innerText = "❌ Failed to load quote. Please try again.";
    }
}

async function getActivity() {
    try {
        let res = await fetch("https://opentdb.com/api.php?amount=1");
        
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        let data = await res.json();

        if (data.results && data.results.length > 0) {
            const question = data.results[0].question
                .replace(/&quot;/g, '"')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>');
            const difficulty = data.results[0].difficulty.toUpperCase();
            
            document.getElementById("recommendation").innerHTML = 
                `<strong>${question}</strong><br/><em>Difficulty: ${difficulty}</em>`;
        } else {
            document.getElementById("recommendation").innerText = "❌ No question found";
        }
    } catch (error) {
        console.error("Activity API Error:", error);
        document.getElementById("recommendation").innerText = "❌ Failed to load question. Please try again.";
    }
}

function backToMood() {
    selectedOption = null;
    showPage(1);
}

function resetApp() {
    selectedMood = null;
    selectedOption = null;
    showPage(1);
    document.getElementById("moodDisplay").innerText = "";
    document.getElementById("selectionInfo").innerText = "";
    document.getElementById("recommendation").innerHTML = 'Loading your recommendation...';
}