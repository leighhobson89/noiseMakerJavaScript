import {
    localize
} from './localization.js';
import {
    setAverageAlreadyBoosted,
    getAverageAlreadyBoosted,
    getInitializingMic,
    setInitializingMic,
    getAllTimeAverageData,
    setAllTimeAverageData,
    setCurrentAveragedB,
    getCurrentAveragedB,
    getAveragedBs,
    setAveragedBs,
    getDBValues,
    setDBValues,
    setHighestdBSuffered,
    getHighestdBSuffered,
    setThresholdDecibelLevel,
    setMicrophonePermissionGranted,
    getMicrophonePermissionGranted,
    setTemporaryStopCheckingMicrophone,
    getTemporaryStopCheckingMicrophone,
    getThresholdDecibelLevel,
    getDecibelLevel,
    setDecibelLevel,
    getMaxWaitTime,
    setMaxWaitTime,
    getMinWaitTime,
    setMinWaitTime,
    getMaxSessionTime,
    setMaxSessionTime,
    getMinSessionTime,
    setMinSessionTime,
    setRemainingTimeSession,
    getRemainingTimeSession,
    getCurrentSoundName,
    setCurrentSoundName,
    getSampleURLS,
    getSessionDuration,
    setSessionActive,
    setSessionTimer,
    setSessionDuration,
    getCurrentSound,
    setCurrentSound,
    setBeginGameStatus,
    setGameStateVariable,
    getBeginGameStatus,
    getMenuState,
    getGameVisiblePaused,
    getGameVisibleActive,
    getElements,
    getLanguage,
    gameState,
    setWaitTimerActive,
    getSessionActive,
    getWaitTimerActive,
    getTemperament,
    setTemperament
} from './constantsAndGlobalVars.js';
import {
    updateCanvas
} from './ui.js';

let sessionTimer;
let waitTimer;
let sessionStartTime;
let sessionDuration;

let averageGraphFrameCounter = 0;
let averageGraphUpdateFramesFrequency = 10;

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

function updateHighestdB() {
    const currentdB = getDecibelLevel();
    setHighestdBSuffered(currentdB);
}


export async function gameLoop() {
    const ctx = getElements().canvas.getContext('2d');


    if (gameState === getGameVisibleActive() || gameState === getGameVisiblePaused()) {
        ctx.clearRect(0, 0, getElements().canvas.width, getElements().canvas.height); // Clear the canvas every frame

        if (getInitializingMic()) {
            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.fillText(`Deciding whether to yap...not this time...🤣🤣`, 10, 30);
        }
        
        if (gameState === getGameVisibleActive() && !getInitializingMic()) {
            if (!getSessionActive() && !getTemporaryStopCheckingMicrophone()) {
                updateDecibelLevel();
                if (getDecibelLevel() > getThresholdDecibelLevel() && getTemperament() === 2) {
                    setTemporaryStopCheckingMicrophone(true);
                    setRemainingTimeSession(0);
                    clearInterval(waitTimer);
                    setWaitTimerActive(false);
                    stopMicrophone();
                    startSession();
                } else if (getDecibelLevel() > getThresholdDecibelLevel()) {
                    if (!getAverageAlreadyBoosted()) {
                        const allTimeAverageData = getAllTimeAverageData();
                        const newAverage = parseFloat((allTimeAverageData.average * 1.2).toFixed(1));
                        
                        allTimeAverageData.sum = newAverage * allTimeAverageData.count;
                        allTimeAverageData.average = newAverage;
                        
                        setAllTimeAverageData(allTimeAverageData);
                        setAverageAlreadyBoosted(true);                    }           
                }
                updateHighestdB();

                averageGraphFrameCounter++;

                if (averageGraphFrameCounter >= averageGraphUpdateFramesFrequency) {
                    const averagedDB = getCurrentAveragedB();
                    const averagedBs = getAveragedBs();
                    averagedBs.push(averagedDB);
                    setAveragedBs(averagedBs);
    
                    averageGraphFrameCounter = 0;
    
                    if (getAveragedBs().length > 30) {
                        const tempAveragedB = getAveragedBs();
                        tempAveragedB.shift();
                        setAveragedBs(tempAveragedB);
                    }
    
                    updateAllTimeAverage(getCurrentAveragedB());
                    setAverageAlreadyBoosted(false);
                }
            }
            updateCanvas();
            updateInputFieldValues();
        }

        requestAnimationFrame(gameLoop);
    }
}

export function calculateMood() {
    const allTimeAverage = getAllTimeAverageData().average;
    const threshold = getThresholdDecibelLevel();
    const highestdB = getHighestdBSuffered();

    let mood = "None.";

    if (allTimeAverage < (threshold * 0.5)) {
        mood = "None.";
    } else if (allTimeAverage < (threshold * 0.9)) {
        mood = "So-so, certainly possible!";
    } else {
        mood = "On the verge!";
    }

    return mood;
}


export function updateAllTimeAverage(newValue) {
    let allTimeAverageData = getAllTimeAverageData();

    allTimeAverageData.sum += newValue;
    allTimeAverageData.count += 1;

    if (allTimeAverageData.count > 0) {
        allTimeAverageData.average = parseFloat((allTimeAverageData.sum / allTimeAverageData.count).toFixed(1));
    }

    console.log(allTimeAverageData.average);

    setAllTimeAverageData(allTimeAverageData);
}

export function drawDecibelLineChart() {
    const ctx = getElements().canvas.getContext('2d');
    const averagedBs = getAveragedBs();
    const canvasWidth = getElements().canvas.width;
    const canvasHeight = getElements().canvas.height;

    const highestdB = getHighestdBSuffered();
    const highestdBPosition = (canvasHeight) - (highestdB * (canvasHeight) / 100);

    const allTimeAverage = getAllTimeAverageData().average;
    const allTimeAveragePosition = (canvasHeight) - (allTimeAverage * (canvasHeight) / 100);

    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;

    ctx.beginPath();
    const spacing = canvasWidth / averagedBs.length;

    averagedBs.forEach((value, index) => {
        const x = index * spacing;
        const y = (canvasHeight) - (value * (canvasHeight) / 100);
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();

    // Plot the red line for the highest dB value
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, highestdBPosition);
    ctx.lineTo(canvasWidth, highestdBPosition);
    ctx.stroke();

    // Plot the yellow line for the all-time average value
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, allTimeAveragePosition);
    ctx.lineTo(canvasWidth, allTimeAveragePosition);
    ctx.stroke();
}

export async function startSession() {
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
            stopSession(false);
        } else {
            playRandomSound();
        }
    }, 1000);
}

export async function stopSession(setupMic) {

    if (setupMic) {
        await initializeMicrophoneListener();
    }

    clearInterval(sessionTimer);
    setSessionActive(false);
    stopAllSounds();

    if (!getElements().yappingDogImg.classList.contains('d-none')) {
        getElements().yappingDogImg.classList.add('d-none');
    }

    startWaitTimer();
    setTemporaryStopCheckingMicrophone(false);
}

export async function startWaitTimer() {
    let remainingWaitTime = Math.floor(Math.random() * (getMaxWaitTime() - getMinWaitTime() + 1)) + getMinWaitTime();
    setWaitTimerActive(true);

    waitTimer = setInterval(() => {
        remainingWaitTime--;
        setRemainingTimeSession(remainingWaitTime);
        if (remainingWaitTime <= 0) {
            clearInterval(waitTimer);
            setWaitTimerActive(false);
            stopMicrophone();
            if (getTemperament() === 2) {
                startSession();
            } else if (getTemperament() === 1) {
                const allTimeAverage = getAllTimeAverageData().average;
                const threshold = getThresholdDecibelLevel();
                const percentage = (allTimeAverage / threshold) * 100;
                const randomChance = Math.random() * 100;

                if (randomChance <= percentage) {
                    console.log("Will Yap");
                    startSession();
                } else {
                    console.log("No Yapping. Condition not met. Random chance:", randomChance.toFixed(2), ">");
                    stopSession(true);
                }
            } else {
                stopSession(true);
            }
        }
    }, 1000);
}

function playRandomSound() {
    const sampleURLs = getSampleURLS();
    const soundIds = Object.keys(sampleURLs.samples);
    const randomId = soundIds[Math.floor(Math.random() * soundIds.length)];
    const sound = sampleURLs.samples[randomId];

    const audio = new Audio(sound.url);
    setCurrentSound({
        sound: sound.name,
        audio: audio
    });
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
    const platform = Capacitor.getPlatform();

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
            if (platform === 'web') {
                console.log('Running on the web, skipping permission request');
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: true
                });
                if (stream) {
                    console.log('Microphone access granted on web');
                    setMicrophonePermissionGranted(true);
                    stream.getTracks().forEach(track => track.stop());
                }
            } else {
                console.log('Running on a native platform, attempting to access the microphone');

                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: true
                });

                if (stream) {
                    console.log('Microphone access granted on native platform');
                    setMicrophonePermissionGranted(true);
                    stream.getTracks().forEach(track => track.stop());
                } else {
                    console.log('Microphone access denied on native platform');
                }
            }

            if (getMicrophonePermissionGranted()) {
                console.log('You can now use the microphone');
            } else {
                console.log('Permission to access the microphone was denied');
            }

        } catch (err) {
            console.error('Error checking or requesting microphone permission:', err);
            console.error('Error name:', err.name);
            console.error('Error message:', err.message);
        }
    } else {
        console.error('Browser does not support getUserMedia');
    }
}


async function initializeMicrophoneListener() {
    setInitializingMic(true);

    if (getMicrophonePermissionGranted()) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });
            micStream = stream;
            audioContext = new(window.AudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            dataArray = new Uint8Array(analyser.frequencyBinCount);
            source.connect(analyser);

            await new Promise(resolve => setTimeout(resolve, 2500));

            console.log('Microphone initialized');
        } catch (err) {
            console.error('Error accessing microphone:', err);
        }
    } else {
        console.error('Microphone permission not granted');
    }

    setInitializingMic(false);
}

function updateDecibelLevel() {
    if (analyser) {
        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
        }
        const decibelLevel = parseFloat((sum / dataArray.length).toFixed(1));

        let dBValues = getDBValues();
        dBValues.push(decibelLevel);
        setDBValues(dBValues);

        if (dBValues.length === 10) {
            const totalDB = dBValues.reduce((acc, val) => acc + parseFloat(val), 0);
            const averageDB = parseFloat((totalDB / 10).toFixed(1));
            setCurrentAveragedB(averageDB);

            setDBValues([]);
        }

        setDecibelLevel(decibelLevel);
    }
}

function stopMicrophone() {
    if (micStream) {
        const tracks = micStream.getTracks();
        tracks.forEach(track => track.stop());
        micStream = null;
        console.log('Microphone stream stopped');
    }

    if (audioContext) {
        if (audioContext.state !== 'closed') {
            audioContext.close().then(() => {
                console.log('AudioContext closed');
            });
        }
        audioContext = null;
    }

    analyser = null;
    dataArray = null;

    console.log('Microphone and audio resources cleaned up');
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
            getElements().button1.classList.remove('d-none');
            getElements().button2.classList.remove('d-none');
            break;
    }
}