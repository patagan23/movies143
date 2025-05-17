const API_KEY = 'bc380f1e1f63773ba93930ab82ebca8e';
    const BASE_URL = 'https://api.themoviedb.org/3';
    const IMG_URL = 'https://image.tmdb.org/t/p/original';
    let currentItem;

    async function fetchTrending(type) {
      const res = await fetch(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`);
      const data = await res.json();
      return data.results;
    }

    async function fetchTrendingAnime() {
  let allResults = [];

  // Fetch from multiple pages to get more anime (max 3 pages for demo)
  for (let page = 1; page <= 3; page++) {
    const res = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${page}`);
    const data = await res.json();
    const filtered = data.results.filter(item =>
      item.original_language === 'ja' && item.genre_ids.includes(16)
    );
    allResults = allResults.concat(filtered);
  }

  return allResults;
}


    function displayBanner(item) {
      document.getElementById('banner').style.backgroundImage = `url(${IMG_URL}${item.backdrop_path})`;
      document.getElementById('banner-title').textContent = item.title || item.name;
    }

    function displayList(items, containerId) {
      const container = document.getElementById(containerId);
      container.innerHTML = '';
      items.forEach(item => {
        const img = document.createElement('img');
        img.src = `${IMG_URL}${item.poster_path}`;
        img.alt = item.title || item.name;
        img.onclick = () => showDetails(item);
        container.appendChild(img);
      });
    }

    function showDetails(item) {
      currentItem = item;
      document.getElementById('modal-title').textContent = item.title || item.name;
      document.getElementById('modal-description').textContent = item.overview;
      document.getElementById('modal-image').src = `${IMG_URL}${item.poster_path}`;
      document.getElementById('modal-rating').innerHTML = '★'.repeat(Math.round(item.vote_average / 2));
      changeServer();
      document.getElementById('modal').style.display = 'flex';
    }

    function changeServer() {
      const server = document.getElementById('server').value;
      const type = currentItem.media_type === "movie" ? "movie" : "tv";
      let embedURL = "";

      if (server === "vidsrc.cc") {
        embedURL = `https://vidsrc.cc/v2/embed/${type}/${currentItem.id}`;
      } else if (server === "vidsrc.me") {
        embedURL = `https://vidsrc.net/embed/${type}/?tmdb=${currentItem.id}`;
      } else if (server === "player.videasy.net") {
        embedURL = `https://player.videasy.net/${type}/${currentItem.id}`;
      }

      document.getElementById('modal-video').src = embedURL;
    }

    function closeModal() {
      document.getElementById('modal').style.display = 'none';
      document.getElementById('modal-video').src = '';
    }

    function openSearchModal() {
      document.getElementById('search-modal').style.display = 'flex';
      document.getElementById('search-input').focus();
    }

    function closeSearchModal() {
      document.getElementById('search-modal').style.display = 'none';
      document.getElementById('search-results').innerHTML = '';
    }

    async function searchTMDB() {
      const query = document.getElementById('search-input').value;
      if (!query.trim()) {
        document.getElementById('search-results').innerHTML = '';
        return;
      }

      const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${query}`);
      const data = await res.json();

      const container = document.getElementById('search-results');
      container.innerHTML = '';
      data.results.forEach(item => {
        if (!item.poster_path) return;
        const img = document.createElement('img');
        img.src = `${IMG_URL}${item.poster_path}`;
        img.alt = item.title || item.name;
        img.onclick = () => {
          closeSearchModal();
          showDetails(item);
        };
        container.appendChild(img);
      });
    }

    async function init() {
      const movies = await fetchTrending('movie');
      const tvShows = await fetchTrending('tv');
      const anime = await fetchTrendingAnime();

      displayBanner(movies[Math.floor(Math.random() * movies.length)]);
      displayList(movies, 'movies-list');
      displayList(tvShows, 'tvshows-list');
      displayList(anime, 'anime-list');
    }

    init();

// In js/home.js

// No longer need a modal for video playback if opening in new tab
// function closeModal() { /* ... */ }
// document.getElementById('modal').style.display = 'flex'; // Remove this from showDetails

function constructEmbedURL(item, serverValue) {
    if (!item || typeof item.id === 'undefined') {
        console.error("Item is not defined or has no ID for constructing embed URL.");
        return null;
    }
    const type = item.media_type === "movie" ? "movie" : "tv";
    const tmdbId = item.id;
    // const imdbId = item.imdb_id; // If you fetch and use IMDB ID

    let embedURL = "";

    if (serverValue === "vidsrc.cc") {
        embedURL = `https://vidsrc.cc/v2/embed/<span class="math-inline">\{type\}/</span>{tmdbId}`;
    } else if (serverValue === "vidsrc.me") {
        embedURL = `https://vidsrc.net/embed/<span class="math-inline">\{type\}/?tmdb\=</span>{tmdbId}`;
    } else if (serverValue === "player.videasy.net") {
        embedURL = `https://player.videasy.net/<span class="math-inline">\{type\}/</span>{tmdbId}`;
    }
    // Add other server logic here

    return embedURL;
}

async function showDetails(item) {
    currentItem = item; // Still useful if you display details on the main page before opening new tab

    // --- Display details on the main page if you still want to ---
    // (e.g., if you have a section that shows info before clicking a "Play" button)
    // document.getElementById('some-info-title').textContent = item.title || item.name;
    // ...

    // --- Logic to open in new tab ---
    // For simplicity, let's assume the first server in the dropdown is the default,
    // or you add a "Play" button that triggers this.
    // If you keep the server selector on the main page, the user would choose first.

    const selectedServer = document.getElementById('server') ? document.getElementById('server').value : "vidsrc.cc"; // Default or selected
    const finalEmbedUrl = constructEmbedURL(currentItem, selectedServer);

    if (finalEmbedUrl) {
        // Open player.html in a new tab with the embed_url as a query parameter
        const playerPageUrl = `player.html?embed_url=${encodeURIComponent(finalEmbedUrl)}`;
        window.open(playerPageUrl, '_blank');
    } else {
        alert("Could not determine video source. Please try another server or title.");
    }

    // Since we are opening in a new tab, we don't show the modal on this page
    // closeModal(); // If you had a modal for other things
}

// The 'changeServer' function in home.js would primarily be for if you still allow
// server selection on the main page *before* opening the new tab.
// If selection is only in the new tab, changeServer in home.js is less relevant for playback.
// However, the `constructEmbedURL` function above now holds the core logic.
