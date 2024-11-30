import { localize } from './localization.js';
import { setRemainingTimeSession, getRemainingTimeSession, getCurrentSoundName, setCurrentSoundName, getSampleURLS, getSessionDuration, setSessionActive, setSessionTimer, setSessionDuration, getCurrentSound, setCurrentSound, setBeginGameStatus, setGameStateVariable, getBeginGameStatus, getMenuState, getGameVisiblePaused, getGameVisibleActive, getElements, getLanguage, gameState } from './constantsAndGlobalVars.js';
import { updateCanvas } from './ui.js';

let sessionTimer;

export function startGame() {
    const ctx = getElements().canvas.getContext('2d');
    const container = getElements().canvasContainer;

    function updateCanvasSize() {
        const canvasWidth = container.clientWidth * 0.8;
        const canvasHeight = container.clientHeight * 0.8;

        getElements().canvas.style.width = `${canvasWidth}px`;
        getElements().canvas.style.height = `${canvasHeight}px`;

        getElements().canvas.width = canvasWidth;
        getElements().canvas.height = canvasHeight;
        
        ctx.scale(1, 1);
    }

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    if (getBeginGameStatus()) {
        setBeginGameStatus(false);
    }
    setGameState(getGameVisibleActive());

    gameLoop();
}

export async function gameLoop() {
    const ctx = getElements().canvas.getContext('2d');
    if (gameState === getGameVisibleActive() || gameState === getGameVisiblePaused()) {
        ctx.clearRect(0, 0, getElements().canvas.width, getElements().canvas.height);

        if (gameState === getGameVisibleActive()) {
            updateCanvas();
        }

        requestAnimationFrame(gameLoop);
    }
}

let sessionStartTime;
let sessionDuration;

export async function startSession() {
  sessionDuration = Math.floor(Math.random() * (60 - 30 + 1)) + 30;
  
  setSessionActive(true);
  sessionStartTime = Date.now();
  
  sessionTimer = setInterval(() => {
    const elapsedTime = Math.floor((Date.now() - sessionStartTime) / 1000);
    setRemainingTimeSession(sessionDuration - elapsedTime);
    console.log(getRemainingTimeSession());
    
    if (getRemainingTimeSession() <= 0) {
      stopSession();
    } else {
      playRandomSound();  // Sound playing logic commented out
    }
  }, 1000);
}

export async function stopSession() {
  clearInterval(sessionTimer);
  setSessionActive(false);
  stopAllSounds();  // Sound stopping logic commented out
}

// Function to play a random sound
function playRandomSound() {
  const sampleURLs = getSampleURLS();  // Get the sample URLs from the getter
  const soundIds = Object.keys(sampleURLs.samples);  // Get the available sound IDs
  const randomId = soundIds[Math.floor(Math.random() * soundIds.length)];  // Choose a random sound ID
  const sound = sampleURLs.samples[randomId];  // Get the sound data for the random ID

  const audio = new Audio(sound.url);  // Create a new Audio object with the sound's URL
  setCurrentSound({ sound: sound.name, audio: audio }); // Set the current sound to be played
  audio.play();
}

// Function to stop all sounds
function stopAllSounds() {
  const currentSound = getCurrentSound();  // Get the current sound (which includes the audio object)
  if (currentSound && currentSound.audio) {
    currentSound.audio.pause();  // Pause the audio
    currentSound.audio.currentTime = 0;  // Reset the audio to the start
  }
}

export function setGameState(newState) {
    console.log("Setting game state to " + newState);
    setGameStateVariable(newState);

    switch (newState) {
        case getMenuState():
            getElements().menu.classList.remove('d-none');
            getElements().menu.classList.add('d-flex');
            getElements().buttonRow.classList.add('d-none');
            getElements().buttonRow.classList.remove('d-flex');
            getElements().canvasContainer.classList.remove('d-flex');
            getElements().canvasContainer.classList.add('d-none');
            getElements().returnToMenuButton.classList.remove('d-flex');
            getElements().returnToMenuButton.classList.add('d-none');
            getElements().button1.classList.add('d-none');
            getElements().button2.classList.add('d-none');

            console.log("Language is " + getLanguage());
            break;
        case getGameVisiblePaused():
            getElements().menu.classList.remove('d-flex');
            getElements().menu.classList.add('d-none');
            getElements().buttonRow.classList.remove('d-none');
            getElements().buttonRow.classList.add('d-flex');
            getElements().canvasContainer.classList.remove('d-none');
            getElements().canvasContainer.classList.add('d-flex');
            getElements().returnToMenuButton.classList.remove('d-none');
            getElements().returnToMenuButton.classList.add('d-flex');
            getElements().returnToMenuButton.innerHTML = `${localize('menuTitle', getLanguage())}`;
            getElements().button1.classList.add('d-none');
            getElements().button2.classList.add('d-none');
            break;
        case getGameVisibleActive():
            getElements().menu.classList.remove('d-flex');
            getElements().menu.classList.add('d-none');
            getElements().buttonRow.classList.remove('d-none');
            getElements().buttonRow.classList.add('d-flex');
            getElements().canvasContainer.classList.remove('d-none');
            getElements().canvasContainer.classList.add('d-flex');
            getElements().returnToMenuButton.classList.remove('d-none');
            getElements().returnToMenuButton.classList.add('d-flex');
            getElements().returnToMenuButton.innerHTML = `${localize('menuTitle', getLanguage())}`;
            getElements().button1.classList.remove('d-none');
            getElements().button2.classList.remove('d-none');
            break;
    }
}
