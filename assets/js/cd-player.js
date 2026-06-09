const cdAudio = document.getElementById('cd-audio-element');
const cdStatus = document.getElementById('cd-track-status');
const cdTime = document.getElementById('cd-time-display');

// Control DOM Node references
const btnPlay = document.getElementById('btn-cd-play');
const btnPause = document.getElementById('btn-cd-pause');
const btnStop = document.getElementById('btn-cd-stop');

let displayInterval = null;

// Helper to toggle active visibility stack state
function setCDButtonActive(activeBtn) {
    [btnPlay, btnPause, btnStop].forEach(btn => btn.classList.remove('win-active'));
    if (activeBtn) {
        activeBtn.classList.add('win-active');
    }
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(Math.floor(seconds % 60)).padStart(2, '0');
    return `${mins}:${secs}`;
}

function startTimerDisplay() {
    if (displayInterval) clearInterval(displayInterval);
    displayInterval = setInterval(() => {
        cdTime.textContent = formatTime(cdAudio.currentTime);
    }, 250);
}

function stopTimerDisplay() {
    clearInterval(displayInterval);
}

function playCDAudio() {
    cdAudio.play().then(() => {
        cdStatus.textContent = "[TRACK 01] PLAYING";
        setCDButtonActive(btnPlay);
        startTimerDisplay();
    }).catch(err => {
        console.error("Audio playback blocked or failed:", err);
        cdStatus.textContent = "[ERR CODE 0x5]";
        setCDButtonActive(btnStop);
    });
}

function pauseCDAudio() {
    cdAudio.pause();
    cdStatus.textContent = "[PAUSED]";
    setCDButtonActive(btnPause);
    stopTimerDisplay();
}

function stopCDAudio() {
    cdAudio.pause();
    cdAudio.currentTime = 0;
    cdStatus.textContent = "[STOPPED]";
    cdTime.textContent = "00:00";
    setCDButtonActive(btnStop);
    stopTimerDisplay();
}

// Reset tracking if track reaches physical EOF naturally
cdAudio.addEventListener('ended', () => {
    stopCDAudio();
});

// Intercept standard window closure to coordinate state resets
const standardCloseWindow = closeWindow;
closeWindow = function(id) {
    if (id === 'win-cdplayer') {
        stopCDAudio();
    }
    if (typeof standardCloseWindow === 'function') {
        standardCloseWindow(id);
    }
};