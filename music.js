const songTitle = document.getElementById('song-title');
const playPauseBtn = document.getElementById('play-pause-btn');
const muteBtn = document.getElementById('mute-btn');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('previous-btn');

let currentTrackIndex = 0;
let isPlaying = false;
let isMuted = false;

let audioPlayer;

/**
 * Initializes the music player
 */
function initializeMusicPlayer() {
    // No tracks available
    if (config.musicList.length === 0) {
        songTitle.textContent = 'No themes available';
        toggleButtons(true);
        return;
    }

    // Initialize audio player
    currentTrackIndex = Math.floor(Math.random() * config.musicList.length);
    audioPlayer = new Audio(config.musicList[currentTrackIndex]);
    audioPlayer.autoplay = config.audioPlayer.autoplay;
    audioPlayer.loop = config.audioPlayer.loop;
    audioPlayer.volume = config.audioPlayer.volume;

    // Event Listeners
    audioPlayer.addEventListener('ended', playNextTrack);

    // Update song title and autoplay
    updateSongTitle();
    audioPlayer.load();
    isPlaying = audioPlayer.autoplay;
    playPauseBtn.querySelector('i').className = isPlaying
        ? 'fas fa-pause'
        : 'fas fa-play';
}

/**
 * Plays the audio player
 */
function play() {
    if (!audioPlayer) {
        return;
    }
    isPlaying = true;
    audioPlayer.play();
    playPauseBtn.querySelector('i').className = 'fas fa-pause';
}

/**
 * Pauses the audio player
 */
function pause() {
    if (!audioPlayer) {
        return;
    }
    isPlaying = false;
    audioPlayer.pause();
    playPauseBtn.querySelector('i').className = 'fas fa-play';
}

/**
 * Toggles play/pause
 */
function togglePlayPause() {
    if (isPlaying) {
        pause();
    } else {
        play();
    }
}

/**
 * Fades out the current track and changes to the next track
 * @param {number} nextTrack - Index of the next track
 */
function fadeOutAndChangeTrack(nextTrack) {
    if (!audioPlayer) {
        return;
    }

    const fadeOutDuration = config.audioPlayer.fadeOutDuration / 1000;
    const updateInterval = 50;
    const steps = fadeOutDuration / (updateInterval / 1000);
    const stepSize = audioPlayer.volume / steps;

    let currentVolume = audioPlayer.volume;

    toggleButtons(true);
    let fadeOutInterval = setInterval(() => {
        if (audioPlayer.volume > 0) {
            audioPlayer.volume = Math.max(0, audioPlayer.volume - stepSize);
        } else {
            clearInterval(fadeOutInterval);
            pause();
            audioPlayer.currentTime = 0;
            audioPlayer.volume = currentVolume;
            audioPlayer.src = config.musicList[nextTrack];
            play();
            toggleButtons(false);
        }
    }, updateInterval);
}

/**
 * Play next track
 */
function playNextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % config.musicList.length;
    fadeOutAndChangeTrack(currentTrackIndex);
    updateSongTitle(true);
}

/**
 * Play previous track
 */
function playPreviousTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + config.musicList.length) % config.musicList.length;
    fadeOutAndChangeTrack(currentTrackIndex);
    updateSongTitle(true);
}

/**
 * Toggles mute
 */
function toggleMute() {
    if (!audioPlayer) {
        return;
    }
    audioPlayer.muted = !audioPlayer.muted;
    muteBtn.querySelector('i').className = audioPlayer.muted
        ? 'fas fa-volume-mute'
        : 'fas fa-volume-up';
}

/**
 * Toggles the disabled state of the buttons
 * @param {boolean} isDisabled - Whether the buttons should be disabled or not
 */
function toggleButtons(isDisabled) {
    playPauseBtn.disabled = isDisabled;
    muteBtn.disabled = isDisabled;
    nextBtn.disabled = isDisabled;
    prevBtn.disabled = isDisabled;
}

/**
 * Updates the song title
 */
function updateSongTitle(fade = false) {
    const trackName = config.musicList[currentTrackIndex].split('/').pop().replace('.mp3', '');

    if (fade === false) {
        updateTitleText(trackName);
        return;
    }

    const fadeOutDuration = config.audioPlayer.fadeOutDuration / 1000;
    const fadeInDuration = config.audioPlayer.fadeInDuration / 1000;
    const updateInterval = 50;

    const fadeOutSteps = fadeOutDuration / (updateInterval / 1000);
    const fadeOutStepSize = 1 / fadeOutSteps;

    let originalOpacity = window.getComputedStyle(songTitle).getPropertyValue('opacity');
    let currentOpacity = originalOpacity;

    let fadeOutInterval = setInterval(() => {
        if (currentOpacity > 0) {
            currentOpacity = Math.max(0, currentOpacity - fadeOutStepSize);
            songTitle.setAttribute('style', 'opacity: ' + currentOpacity);
        } else {
            clearInterval(fadeOutInterval);
            updateTitleText(trackName);

            const fadeInSteps = fadeInDuration / (updateInterval / 1000);
            const fadeInStepSize = 1 / fadeInSteps;

            let fadeInInterval = setInterval(() => {
                if (currentOpacity < originalOpacity) {
                    currentOpacity = Math.min(1, currentOpacity + fadeInStepSize);
                    songTitle.setAttribute('style', 'opacity: ' + currentOpacity);
                } else {
                    clearInterval(fadeInInterval);
                }
            }, updateInterval);
        }
    }, updateInterval);
}

/**
 * Updates the text of the song title and toggles the scrolling effect.
 * @param {string} trackName - The name of the current track.
 */
function updateTitleText(trackName) {
    songTitle.textContent = trackName;

    // Measure the width of the title and its container
    const containerWidth = songTitle.offsetWidth;
    const textWidth = songTitle.scrollWidth;

    if (textWidth > containerWidth) {
        // Enable scrolling if the text is wider than the container
        songTitle.classList.add('scrolling');
        const scrollDuration = textWidth / 50;
        songTitle.style.animationDuration = `${scrollDuration}s`;
    } else {
        // Disable scrolling if the text fits within the container
        songTitle.classList.remove('scrolling');
        songTitle.style.animationDuration = '';
    }
}

/**
 * Sets up event listeners
 */
function setupEventListeners() {
    playPauseBtn.addEventListener('click', togglePlayPause);
    muteBtn.addEventListener('click', toggleMute);
    nextBtn.addEventListener('click', playNextTrack);
    prevBtn.addEventListener('click', playPreviousTrack);
}

// Initialize
setupEventListeners();
initializeMusicPlayer();
