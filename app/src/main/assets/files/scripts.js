document.addEventListener('DOMContentLoaded', function() {
    const songContainer = document.getElementById('song-container');
    const playerModal = document.getElementById('player-modal');
    const backBtn = document.getElementById('back-btn');
    const audioPlayer = document.getElementById('audio-player');
    const audioPlayersrc = document.getElementById('audio-player-src');
    const progressBar = document.getElementById('progress-bar');
    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const controlPanel = document.getElementById('music-control-panel');
    const controlPlayBtn = document.getElementById('control-play-btn');
    const controlNextBtn = document.getElementById('control-next-btn');
    const controlThumbnail = document.getElementById('control-thumbnail');
    const controlTitle = document.getElementById('control-song-title');
    const searchIcon = document.getElementById('search-icon');
    const searchPopup = document.getElementById('search-popup');
    const searchCloseBtn = document.getElementById('search-close-btn');
    const searchInput = document.getElementById('search-input');
    const searchResultsContainer = document.getElementById('search-results-container');
    let playlist = [];
    let currentSongIndex = 0;
    let isPlaying = false;

    // Fetch song data from the charts web server
    fetch('https://apparent-karyn-nitinbhujwa-86b8a47b.koyeb.app/charts')
        .then(response => response.json())
        .then(data => {
            displaySongs(data);
        })
        .catch(error => console.error('Error fetching song data:', error));

    // Display songs dynamically on the homepage
    function displaySongs(songs) {
        const fragment = document.createDocumentFragment();
        songs.forEach(song => {
            const songCard = createSongCard(song);
            fragment.appendChild(songCard);
        });
        songContainer.appendChild(fragment);
    }

    function createSongCard(song) {
        const songCard = document.createElement('div');

        songCard.classList.add('song-card');

        const thumbnailWrapper = document.createElement('div');
        thumbnailWrapper.classList.add('song-thumbnail-wrapper');

        const songThumbnail = document.createElement('img');
        songThumbnail.src = song.thumbnail;
        let ghd = song.title;
        songThumbnail.alt = ghd.length > 20 ? ghd.substring(0, 20) + "..." : ghd;
        songThumbnail.classList.add('song-thumbnail');
        thumbnailWrapper.appendChild(songThumbnail);

        songCard.appendChild(thumbnailWrapper);

        const songTitle = document.createElement('p');
        songTitle.textContent = ghd.length > 20 ? ghd.substring(0, 20) + "..." : ghd;
        songCard.appendChild(songTitle);

        const songViews = document.createElement('p');
        songViews.textContent = `Views: ${song.views}`;
        songCard.appendChild(songViews);

        const songArtists = document.createElement('p');
        songArtists.textContent = `Artists: ${song.artists}`;
        songCard.appendChild(songArtists);

        songCard.addEventListener('click', () => {
            createPlaylistAndPlay(song.videoId, song);
        });

        return songCard;
    }

    // Create a playlist using the clicked song's videoId and play it
    async function createPlaylistAndPlay(videoId, song) {
        updatePlayerAndControlPanel(song.thumbnail, song.title, song.artists, song.videoId);
        showControlPanel();
        openPlayerModal();
        stopCurrentSong();
        const relatedSongs = await fetchRelatedSongs(videoId);
        playlist = [...relatedSongs];
        await playSong(song);
        currentSongIndex = 0;
    }

    async function fetchRelatedSongs(videoId) {
        try {
            const response = await fetch(`https://get-related-songs.onrender.com/related_songs?video_id=${videoId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching related songs:', error);
            return [];
        }
    }

    async function playSong(song) {
        try {
            const audioUrl = await getAudioUrl(song.videoId);
            if (audioUrl) {
                audioPlayer.src = audioUrl;
                audioPlayer.play();
                isPlaying = true;
                playBtn.innerHTML = '<img class="div-button" src="pause-button.png">';
                controlPlayBtn.innerHTML = '<img class="div-button" src="pause-button.png">';
                audioPlayer.addEventListener('ended', playNextSong);
                playBtn.addEventListener('click', togglePlayPause);
                controlPlayBtn.addEventListener('click', togglePlayPause);
                syncProgressBar();
            } else {
                throw new Error('Failed to get audio URL');
            }
        } catch (error) {
            console.error('Error playing song:', error);
            // Handle the error (e.g., show a message to the user)
        }
    }

    function stopCurrentSong() {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        audioPlayer.src = '';
        playBtn.innerHTML = '<img class="div-button" src="play-button.png">';
        controlPlayBtn.innerHTML = '<img class="div-button" src="play-button.png">';
        isPlaying = false;
        audioPlayer.removeEventListener('ended', playNextSong);
    }

    function togglePlayPause() {
        if (isPlaying) {
            audioPlayer.pause();
            playBtn.innerHTML = '<img class="div-button" src="play-button.png">';
            controlPlayBtn.innerHTML = '<img class="div-button" src="play-button.png">';
        } else {
            audioPlayer.play();
            playBtn.innerHTML = '<img class="div-button" src="pause-button.png">';
            controlPlayBtn.innerHTML = '<img class="div-button" src="pause-button.png">';
        }
        isPlaying = !isPlaying;
    }

    async function playNextSong() {
        currentSongIndex = (currentSongIndex + 1) % playlist.length;
        const nextSong = playlist[currentSongIndex];
        updatePlayerAndControlPanel(nextSong.thumbnail, nextSong.title, nextSong.artists, nextSong.videoId);
        await playSong(nextSong);
    }

    prevBtn.addEventListener('click', async function() {
        currentSongIndex = (currentSongIndex === 0) ? playlist.length - 1 : currentSongIndex - 1;
        const prevSong = playlist[currentSongIndex];
        updatePlayerAndControlPanel(prevSong.thumbnail, prevSong.title, prevSong.artists, prevSong.videoId);
        await playSong(prevSong);
    });

    function updatePlayerAndControlPanel(thumbnail, title, artists, videoId) {
        document.getElementById('player-thumbnail').src = `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`;
        document.getElementById('player-title').textContent = title.length > 20 ? title.substring(0, 20) + "..." : title;
        document.getElementById('player-artists').textContent = artists;
        document.getElementById('control-thumbnail').src = `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`;
        document.getElementById('control-song-title').textContent = title.length > 20 ? title.substring(0, 20) + "..." : title;
    }

    async function getAudioUrl(videoId) {
        try {
            const apiUrl = `https://ytdlp-direct-url.onrender.com/get-audio-url/${videoId}`;
            console.log(videoId);
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch data from API: ${response.status}`);
            }
            const data = await response.json();
            console.log('Stream URL:', data.streamUrl); // Logging the stream URL
            return data.streamUrl;
        } catch (error) {
            console.error("Error:", error.message);
            return null;
        }
    }

    function openPlayerModal() {
        playerModal.style.display = 'flex';
        history.pushState(null, null, 'player');
        window.addEventListener('popstate', function() {
            if (playerModal.style.display === 'flex') {
                closePlayerModal();
            }
        });
    }

    function closePlayerModal() {
        playerModal.style.display = 'none';
        history.back();
    }

    backBtn.addEventListener('click', closePlayerModal);

    function showControlPanel() {
        controlPanel.style.display = 'flex';
    }

    controlThumbnail.addEventListener('click', openPlayerModal);
    controlTitle.addEventListener('click', openPlayerModal);
    controlNextBtn.addEventListener('click', playNextSong);
    nextBtn.addEventListener('click', playNextSong);

    function syncProgressBar() {
        audioPlayer.addEventListener('timeupdate', () => {
            const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progressBar.value = progress;
        });
        progressBar.addEventListener('input', (e) => {
            const seekTime = (audioPlayer.duration * e.target.value) / 100;
            audioPlayer.currentTime = seekTime;
        });
    }

    // Search popup logic
    searchIcon.addEventListener('click', function() {
        searchPopup.style.display = 'flex';
    });

    searchCloseBtn.addEventListener('click', function() {
        searchPopup.style.display = 'none';
        searchResultsContainer.innerHTML = '';
        searchInput.value = '';
    });

    searchInput.addEventListener('input', debounce(function() {
        const query = searchInput.value.trim();
        if (query) {
            fetchSongsByQuery(query);
        } else {
            searchResultsContainer.innerHTML = '';
        }
    }, 300));

    async function fetchSongsByQuery(query) {
        try {
            const response = await fetch(`https://get-related-songs.onrender.com/search_songs?query=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            displaySearchResults(data);
        } catch (error) {
            console.error('Error fetching search results:', error);
            searchResultsContainer.innerHTML = '<p>An error occurred while searching. Please try again.</p>';
        }
    }

    function displaySearchResults(songs) {
        searchResultsContainer.innerHTML = '';
        if (songs.length === 0) {
            searchResultsContainer.innerHTML = '<p>No results found.</p>';
            return;
        }

        const fragment = document.createDocumentFragment();
        songs.forEach(song => {
            const songCard = createSearchResultCard(song);
            fragment.appendChild(songCard);
        });
        searchResultsContainer.appendChild(fragment);
    }

    function createSearchResultCard(song) {
        const songCard = document.createElement('div');
        songCard.classList.add('search-result-card');

        const thumbnailImg = document.createElement('img');
        thumbnailImg.src = `https://i.ytimg.com/vi/${song.videoId}/default.jpg`;
        thumbnailImg.alt = song.title;
        thumbnailImg.classList.add('search-result-thumbnail');

        const songInfo = document.createElement('div');
        songInfo.classList.add('search-result-info');

        const titleEl = document.createElement('h3');
        titleEl.textContent = song.title.length > 50 ? song.title.substring(0, 50) + "..." : song.title;
        titleEl.classList.add('search-result-title');

        const artistsEl = document.createElement('p');
        artistsEl.textContent = song.artists;
        artistsEl.classList.add('search-result-artists');

        songInfo.appendChild(titleEl);
        songInfo.appendChild(artistsEl);

        songCard.appendChild(thumbnailImg);
        songCard.appendChild(songInfo);

        songCard.addEventListener('click', () => {
            searchPopup.style.display = 'none';
            createPlaylistAndPlay(song.videoId, song);
        });

        return songCard;
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
});