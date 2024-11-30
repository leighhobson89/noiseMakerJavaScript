import { localize } from './localization.js';
import { getSampleURLS, getSessionDuration, setSessionActive, setSessionTimer, setSessionDuration, getCurrentSound, setCurrentSound, setBeginGameStatus, setGameStateVariable, getBeginGameStatus, getMenuState, getGameVisiblePaused, getGameVisibleActive, getElements, getLanguage, gameState } from './constantsAndGlobalVars.js';
import { updateCanvas } from './ui.js';

let sessionTimer;

//--------------------------------------------------------------------------------------------------------

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

function draw(ctx) {
    const canvasWidth = getElements().canvas.width;
    const canvasHeight = getElements().canvas.height;

    // Clear the previous drawing
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

}

export async function gameLoopFunction() {

}

export async function startSession() {
    const randomTime = Math.floor(Math.random() * (60 - 30 + 1)) + 30; // Random time between 30s and 60s
    setSessionDuration(randomTime);  // Store the duration in the global variable
    setSessionActive(true);  // Set session status to active
  
    const timer = setInterval(() => {
      const remainingTime = getSessionDuration() - Math.floor(Date.now() / 1000);  // Get the session duration with the getter
      if (remainingTime <= 0) {
        stopSession();  // Stop session when time is up
      } else {
        updateCanvasWithTime(remainingTime);  // Update canvas with the remaining time
      }
    }, 1000);
  
    setSessionTimer(timer);  // Set the session timer
    playRandomSound();  // Start playing a random sound
  }
  
  export async function stopSession() {
    clearInterval(sessionTimer);
    setSessionActive(false);
    updateCanvasWithTime(0);
  }
  
  export function updateCanvasWithTime(time) {
    const ctx = getElements().canvas.getContext('2d');
    const width = getElements().canvas.width;
    const height = getElements().canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Time left: ${time} seconds`, 10, 30);
  
    const currentSound = getCurrentSound();
  
    if (currentSound) {
      ctx.fillText(`Playing: ${currentSound.name}`, 10, 60);
    }
  }
  
  function playRandomSound() {
    const sampleURLs = getSampleURLS();  // Get the sample URLs from the getter
    const soundIds = Object.keys(sampleURLs.samples);  // Get the available sound IDs
    const randomId = soundIds[Math.floor(Math.random() * soundIds.length)];  // Choose a random sound ID
    const sound = sampleURLs.samples[randomId];  // Get the sound data for the random ID
  
    setCurrentSound(sound);  // Set the current sound to be played
  
    const audio = new Audio(sound.url);  // Create a new Audio object with the sound's URL
    audio.loop = true;  // Play the sound on loop
    audio.play();
  }
  

//===============================================================================================================


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
