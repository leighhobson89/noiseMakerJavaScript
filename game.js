import { localize } from './localization.js';
import { setThresholdDecibelLevel, setMicrophonePermissionGranted, getMicrophonePermissionGranted, setTemporaryStopCheckingMicrophone, getTemporaryStopCheckingMicrophone, getThresholdDecibelLevel, getDecibelLevel, setDecibelLevel, getMaxWaitTime, setMaxWaitTime, getMinWaitTime, setMinWaitTime, getMaxSessionTime, setMaxSessionTime, getMinSessionTime, setMinSessionTime, setRemainingTimeSession, getRemainingTimeSession, getCurrentSoundName, setCurrentSoundName, getSampleURLS, getSessionDuration, setSessionActive, setSessionTimer, setSessionDuration, getCurrentSound, setCurrentSound, setBeginGameStatus, setGameStateVariable, getBeginGameStatus, getMenuState, getGameVisiblePaused, getGameVisibleActive, getElements, getLanguage, gameState, setWaitTimerActive, getSessionActive } from './constantsAndGlobalVars.js';
import { updateCanvas } from './ui.js';

let sessionTimer;
let waitTimer;
let sessionStartTime;
let sessionDuration;

export async function startGame() {
    const ctx = getElements().canvas.getContext('2d');
    const container = getElements().canvasContainer;

    function updateCanvasSize() {
        const canvasWidth = container.clientWidth * 0.7;
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
        initialiseSideBarElements();
    }
    setGameState(getGameVisibleActive());

    await checkMicrophonePermission();
    gameLoop();
}

function initialiseSideBarElements() {

  getElements().minWaitTimeField.value = getMinWaitTime();
  getElements().maxWaitTimeField.value = getMaxWaitTime();
  getElements().minSessionTimeField.value = getMinSessionTime();
  getElements().maxSessionTimeField.value = getMaxSessionTime();
  getElements().thresholddB.value = getThresholdDecibelLevel();

  getElements().minWaitTimeLabel.classList.remove('d-none');
  getElements().maxWaitTimeLabel.classList.remove('d-none');
  getElements().minSessionTimeLabel.classList.remove('d-none');
  getElements().maxSessionTimeLabel.classList.remove('d-none');
  
  getElements().minWaitTimeField.classList.remove('d-none');
  getElements().maxWaitTimeField.classList.remove('d-none');
  getElements().minSessionTimeField.classList.remove('d-none');
  getElements().maxSessionTimeField.classList.remove('d-none');

  getElements().thresholddBLabel.classList.remove('d-none');
  getElements().thresholddB.classList.remove('d-none');

}

export function updateInputFieldValues() {
    const minWaitTimeField = getElements().minWaitTimeField;
    const maxWaitTimeField = getElements().maxWaitTimeField;
    const minSessionTimeField = getElements().minSessionTimeField;
    const maxSessionTimeField = getElements().maxSessionTimeField;
    const thresholddBField = getElements().thresholddB;
  
    const minWaitTimeValue = parseInt(minWaitTimeField.value);
    const maxWaitTimeValue = parseInt(maxWaitTimeField.value);
    const minSessionTimeValue = parseInt(minSessionTimeField.value);
    const maxSessionTimeValue = parseInt(maxSessionTimeField.value);
    const thresholddBValue = parseInt(thresholddBField.value);
  
    // Check for valid min/max values and update accordingly
    let validMinWait = true;
    let validMaxWait = true;
    let validMinSession = true;
    let validMaxSession = true;
  
    // Validate Wait Time values
    if (!isNaN(minWaitTimeValue) && minWaitTimeValue > maxWaitTimeValue) {
        minWaitTimeField.style.color = 'red';
        validMinWait = false;
    } else {
        minWaitTimeField.style.color = 'black';
    }
  
    if (!isNaN(maxWaitTimeValue) && maxWaitTimeValue < minWaitTimeValue) {
        maxWaitTimeField.style.color = 'red';
        validMaxWait = false;
    } else {
        maxWaitTimeField.style.color = 'black';
    }
  
    // Validate Session Time values
    if (!isNaN(minSessionTimeValue) && minSessionTimeValue > maxSessionTimeValue) {
        minSessionTimeField.style.color = 'red';
        validMinSession = false;
    } else {
        minSessionTimeField.style.color = 'black';
    }
  
    if (!isNaN(maxSessionTimeValue) && maxSessionTimeValue < minSessionTimeValue) {
        maxSessionTimeField.style.color = 'red';
        validMaxSession = false;
    } else {
        maxSessionTimeField.style.color = 'black';
    }
  
    // Update values only if valid
    if (validMinWait) {
        setMinWaitTime(minWaitTimeValue);
    }
  
    if (validMaxWait) {
        setMaxWaitTime(maxWaitTimeValue);
    }
  
    if (validMinSession) {
        setMinSessionTime(minSessionTimeValue);
    }
  
    if (validMaxSession) {
        setMaxSessionTime(maxSessionTimeValue);
    }
  
    // Update the threshold decibel level (no validation needed)
    if (!isNaN(thresholddBValue)) {
        setThresholdDecibelLevel(thresholddBValue);
    }
  }
  



export async function gameLoop() {
    const ctx = getElements().canvas.getContext('2d');
    if (gameState === getGameVisibleActive() || gameState === getGameVisiblePaused()) {
        ctx.clearRect(0, 0, getElements().canvas.width, getElements().canvas.height);

        if (gameState === getGameVisibleActive()) {
          if (!getSessionActive() && !getTemporaryStopCheckingMicrophone()) {
            updateDecibelLevel();
            if (getDecibelLevel() > getThresholdDecibelLevel()) {
                console.log("Going To Yap because decibels are " + getDecibelLevel() + " which is higher than the threshold of " + getThresholdDecibelLevel());
                setTemporaryStopCheckingMicrophone(true);
                setRemainingTimeSession(0);
                clearInterval(waitTimer);
                setWaitTimerActive(false);
                stopMicrophone();
                
                startSession();
            }
          }
          updateCanvas();
          updateInputFieldValues();
        }

        requestAnimationFrame(gameLoop);
    }
}

export async function startSession() {
    getElements().waitingDogImg.classList.add('d-none');
    getElements().yappingDogImg.classList.remove('d-none');
    sessionDuration = Math.floor(Math.random() * (getMaxSessionTime() - getMinSessionTime() + 1)) + getMinSessionTime();

    setSessionActive(true);
    sessionStartTime = Date.now();

    sessionTimer = setInterval(async () => {
        const elapsedTime = Math.floor((Date.now() - sessionStartTime) / 1000);
        setRemainingTimeSession(sessionDuration - elapsedTime);
        console.log("yapping for " + getRemainingTimeSession());

        if (getRemainingTimeSession() <= 0) {
            clearInterval(sessionTimer);
            await initializeMicrophoneListener();
            stopSession();
        } else {
            playRandomSound();
        }
    }, 1000);
}


export async function stopSession() {
  clearInterval(sessionTimer);
  setSessionActive(false);
  stopAllSounds();

  getElements().yappingDogImg.classList.add('d-none');
  getElements().waitingDogImg.classList.remove('d-none');

  startWaitTimer();
  setTemporaryStopCheckingMicrophone(false);
}

export function startWaitTimer() {
  let remainingWaitTime = Math.floor(Math.random() * (getMaxWaitTime() - getMinWaitTime() + 1)) + getMinWaitTime();
  setWaitTimerActive(true);

  waitTimer = setInterval(() => {
      remainingWaitTime--;
      setRemainingTimeSession(remainingWaitTime);
      console.log("waiting for " + getRemainingTimeSession());
      if (remainingWaitTime <= 0) {
          clearInterval(waitTimer);
          setWaitTimerActive(false);
          stopMicrophone();
          startSession();
      }
  }, 1000);
}

function playRandomSound() {
  const sampleURLs = getSampleURLS();
  const soundIds = Object.keys(sampleURLs.samples);
  const randomId = soundIds[Math.floor(Math.random() * soundIds.length)];
  const sound = sampleURLs.samples[randomId];

  const audio = new Audio(sound.url);
  setCurrentSound({ sound: sound.name, audio: audio });
  audio.play();
}

function stopAllSounds() {
  const currentSound = getCurrentSound();
  if (currentSound && currentSound.audio) {
    currentSound.audio.pause();
    currentSound.audio.currentTime = 0;
  }
}

export function stopSessionTimer() {
  clearInterval(sessionTimer);
  setSessionActive(false);
}

export function stopWaitTimer() {
  clearInterval(waitTimer);
}

export function stopAllTimers() {
  stopSessionTimer();
  stopWaitTimer();
}

//-------------------------------------MIC--------------------------------------------------
let audioContext;
let analyser;
let dataArray;
let micStream;

async function checkMicrophonePermission() {
    const platform = Capacitor.getPlatform();  // Get the current platform (web, android, ios)

    // Check if the browser supports mediaDevices.getUserMedia (for web platforms)
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
            // Check platform type and handle permissions accordingly
            if (platform === 'web') {
                console.log('Running on the web, skipping permission request');
                // On web, directly attempt to access the microphone without requesting permission
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                if (stream) {
                    console.log('Microphone access granted on web');
                    setMicrophonePermissionGranted(true);
                    stream.getTracks().forEach(track => track.stop());  // Stop the stream after access
                }
            } else {
                console.log('Running on a native platform, attempting to access the microphone');
                
                // For Android and iOS, try to access the microphone directly via getUserMedia
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

                if (stream) {
                    console.log('Microphone access granted on native platform');
                    setMicrophonePermissionGranted(true);
                    stream.getTracks().forEach(track => track.stop());  // Stop the stream after access
                } else {
                    console.log('Microphone access denied on native platform');
                }
            }

            // Handle the case where permission was granted or denied
            if (getMicrophonePermissionGranted()) {
                // Add any additional logic here, for example, starting a microphone recording, etc.
                console.log('You can now use the microphone');
            } else {
                console.log('Permission to access the microphone was denied');
            }

        } catch (err) {
            console.error('Error checking or requesting microphone permission:', err);
            // Optionally log error message and name for more details
            console.error('Error name:', err.name);
            console.error('Error message:', err.message);
        }
    } else {
        console.error('Browser does not support getUserMedia');
    }
}


async function initializeMicrophoneListener() {
    // First, check if the permission is granted

    // If permission is granted, initialize the microphone listener
    if (getMicrophonePermissionGranted()) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            micStream = stream;
            audioContext = new (window.AudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            dataArray = new Uint8Array(analyser.frequencyBinCount);
            source.connect(analyser);

            // Adding a 2.5-second timeout to allow the mic to normalize
            await new Promise(resolve => setTimeout(resolve, 2500));

            console.log('Microphone initialized');
        } catch (err) {
            console.error('Error accessing microphone:', err);
        }
    } else {
        console.error('Microphone permission not granted');
    }
}


function updateDecibelLevel() {
    if (analyser) {
        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
        }
        const decibelLevel = (sum / dataArray.length).toFixed(1);
        setDecibelLevel(decibelLevel);
    }
}

function stopMicrophone() {
    if (micStream) {
        const tracks = micStream.getTracks();
        tracks.forEach(track => track.stop());
        micStream = null;
        console.log('Microphone stopped');
    } else {
        console.log('No microphone stream to stop');
    }
}

//------------------------------------------------------------------------------------------

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
