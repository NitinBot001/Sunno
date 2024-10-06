document.addEventListener('DOMContentLoaded', function() {
    const songContainer = document.getElementById('song-container');
    const playerModal = document.getElementById('player-modal');
    const backBtn = document.getElementById('back-btn');
    const audioPlayer = document.getElementById('audio-player');
    const progressBar = document.getElementById('progress-bar');
    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const controlPanel = document.getElementById('music-control-panel');
    const controlPlayBtn = document.getElementById('control-play-btn');
    const controlNextBtn = document.getElementById('control-next-btn');
    const controlThumbnail = document.getElementById('control-thumbnail');
    const controlTitle = document.getElementById('control-song-title');
    let playlist = [];
    let currentSongIndex = 0;
    let isPlaying = false;
    let preFetchedUrls = {};  // To store pre-fetched audio URLs

    // Fetch the song data from the server
    fetch('https://apparent-karyn-nitinbhujwa-86b8a47b.koyeb.app/charts')
        .then(response => response.json())
        .then(data => {
            displaySongs(data);
            prefetchAllSongsAudio(data);  // Prefetch all songs' audio URLs
        })
        .catch(error => console.error('Error fetching the song data:', error));

    function displaySongs(songs) {
        songs.forEach(song => {
            const songCard = document.createElement('div');
            songCard.classList.add('song-card');

            const thumbnailWrapper = document.createElement('div');
            thumbnailWrapper.classList.add('song-thumbnail-wrapper');

            const songThumbnail = document.createElement('img');
            songThumbnail.src = `https://i.ytimg.com/vi/${song.videoId}/sddefault.jpg`;
            songThumbnail.alt = song.title;
            songThumbnail.classList.add('song-thumbnail');
            thumbnailWrapper.appendChild(songThumbnail);

            songCard.appendChild(thumbnailWrapper);

            const songDetails = document.createElement('div');
            songDetails.classList.add('song-details');

            const songTitle = document.createElement('p');
            songTitle.textContent = song.title;
            songTitle.classList.add('song-title');
            songDetails.appendChild(songTitle);

            const songViews = document.createElement('p');
            songViews.textContent = `Views: ${song.views}`;
            songViews.classList.add('song-views');
            songDetails.appendChild(songViews);

            const songArtists = document.createElement('p');
            songArtists.textContent = `Artists: ${song.artists.join(', ')}`;
            songArtists.classList.add('song-artists');
            songDetails.appendChild(songArtists);

            songCard.appendChild(songDetails);

            songCard.addEventListener('click', () => openPlayer(song));
            songContainer.appendChild(songCard);
        });
    }

    // Prefetch all songs' audio URLs in parallel
    async function prefetchAllSongsAudio(songs) {
        const prefetchPromises = songs.map(song => {
            return getAudioUrl(song.videoId).then((url) => {
                if (url) {
                    preFetchedUrls[song.videoId] = url;  // Store the pre-fetched URL
                }
            });
        });
        await Promise.all(prefetchPromises);  // Wait for all prefetches to complete
        console.log('All songs pre-fetched!');
    }

    function openPlayer(song) {
        // Set player data
        document.getElementById('player-title').textContent = song.title;
        document.getElementById('player-artists').textContent = song.artists.join(', ');

        // Set control panel info
        document.getElementById('control-song-title').textContent = song.title;

        // Show player modal
        playerModal.style.display = 'flex';

        // Add entry to history for handling back button
        history.pushState(null, null, 'player');

        // Fetch audio and related songs to form a playlist
        fetchAudio(song.videoId);
        fetchRelatedSongs(song.videoId);
    }

    // Handle mobile back button to close the player
    window.addEventListener('popstate', function() {
        if (playerModal.style.display === 'flex') {
            playerModal.style.display = 'none';
        }
    });

    // Close modal but keep song playing in control panel
    backBtn.addEventListener('click', () => {
        playerModal.style.display = 'none';
        history.back();  // Go back to the previous page (if opened via the history)
    });

    // Add click event to open player popup from control panel
    controlThumbnail.addEventListener('click', openCurrentPlayer);
    controlTitle.addEventListener('click', openCurrentPlayer);

    function openCurrentPlayer() {
        playerModal.style.display = 'flex';
        history.pushState(null, null, 'player');  // Add entry to history when opening player again
    }

    // Fetch audio using the provided getAudioUrl function
    async function fetchAudio(videoId) {
        let streamUrl = preFetchedUrls[videoId];  // Check if the URL is already pre-fetched

        if (!streamUrl) {
            streamUrl = await getAudioUrl(videoId);  // Fetch if not pre-fetched
        }

        if (streamUrl) {
            audioPlayer.src = streamUrl;
            document.getElementById('control-thumbnail').src = `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`;
            document.getElementById('player-thumbnail').src = `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`;
            audioPlayer.play();
            isPlaying = true;
            playBtn.textContent = 'Pause';
            controlPlayBtn.textContent = 'Pause';

            // Synchronize progress bar
            audioPlayer.addEventListener('timeupdate', () => {
                const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
                progressBar.value = progress;
            });

            playBtn.addEventListener('click', togglePlayPause);
            controlPlayBtn.addEventListener('click', togglePlayPause);
        } else {
            console.error('Failed to retrieve stream URL');
        }
    }

    // Allow progress bar seeking
    progressBar.addEventListener('input', (e) => {
        const seekTime = (audioPlayer.duration * e.target.value) / 100;
        audioPlayer.currentTime = seekTime;
    });

    // Fetch related songs
    function fetchRelatedSongs(videoId) {
        fetch(`https://get-related-songs.onrender.com/related_songs?video_id=${videoId}`)
            .then(response => response.json())
            .then(relatedSongs => {
                playlist = relatedSongs;
                currentSongIndex = 0;
            })
            .catch(error => console.error('Error fetching related songs:', error));
    }

    // Play/pause toggle
    function togglePlayPause() {
        if (isPlaying) {
            audioPlayer.pause();
            playBtn.textContent = 'Play';
            controlPlayBtn.textContent = 'Play';
        } else {
            audioPlayer.play();
            playBtn.textContent = 'Pause';
            controlPlayBtn.textContent = 'Pause';
        }
        isPlaying = !isPlaying;
    }

    // Play next song
    controlNextBtn.addEventListener('click', playNextSong);
    nextBtn.addEventListener('click', playNextSong);

    function playNextSong() {
        if (playlist.length > 0) {
            currentSongIndex = (currentSongIndex + 1) % playlist.length;
            playSongFromPlaylist(currentSongIndex);
        }
    }

    // Play a song from the playlist
    function playSongFromPlaylist(index) {
        const song = playlist[index];
        document.getElementById('player-thumbnail').src = song.thumbnail;
        document.getElementById('player-title').textContent = song.title;
        document.getElementById('player-artists').textContent = song.artists;

        document.getElementById('control-thumbnail').src = song.thumbnail;
        document.getElementById('control-song-title').textContent = song.title;

        fetchAudio(song.videoId);
    }

    // Function to get the audio stream URL for a given YouTube video ID
    async function getAudioUrl(videoId) {
        try {
            const apiUrl = `https://ytdlp-direct-url.onrender.com/get-audio-url/${videoId}`;
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`Failed to fetch data from API: ${response.status}`);
            }

            const data = await response.json();
            return data.streamUrl;
        } catch (error) {
            console.error("Error:", error.message);
            return null;
        }
    }

});
