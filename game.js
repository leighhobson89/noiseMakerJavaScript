import {
    getOnlyMicModeOn,
    setOnlyMicModeOn,
    setReactionCounter,
    getReactionCounter,
    getNoiseType, setButtonClickYap, getUpArrowURL,
    getDownArrowURL,
    setTrendingMood,
    getTrendingMood,
    getHappyURL,
    getFrustratedURL,
    getAngryURL, setCurrentImage,
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
    getSampleURLS,
    setSessionActive,
    getCurrentSound,
    setCurrentSound,
    setBeginGameStatus,
    setGameStateVariable,
    getBeginGameStatus,
    getMenuState,
    getGameVisibleActive,
    getElements,
    getLanguage,
    gameState,
    setWaitTimerActive,
    getSessionActive,
    getTemperament,
    getMicrophoneModeActive
} from './constantsAndGlobalVars.js';
import {
    updateCanvas,
    setAngryImageForTimerMode
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
    let canvasAlreadyUpdatedThisFrame = false;

    const ctx = getElements().canvas.getContext('2d');


    if (gameState === getGameVisibleActive()) {
        ctx.clearRect(0, 0, getElements().canvas.width, getElements().canvas.height);

        if (getInitializingMic() && getMicrophoneModeActive()) {
            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.fillText(`Reinitializing Microphone...😕`, 10, 30);

            getElements().yappingDogImg.classList.add('d-none');
            getElements().floatingMoodContainer.classList.add('d-none');
        }

        getMicrophoneModeActive() ? getElements().onlyMicToggleButton.classList.remove('disable-button') : getElements().onlyMicToggleButton.classList.add('disable-button');
        
        if (gameState === getGameVisibleActive() && !getInitializingMic()) {
            if (!getSessionActive() && !getTemporaryStopCheckingMicrophone() && getMicrophoneModeActive()) {
                updateDecibelLevel();
                if ((getDecibelLevel() > getThresholdDecibelLevel() && getTemperament() === 2) || (getDecibelLevel() > getThresholdDecibelLevel() * 3)) {
                    setTemporaryStopCheckingMicrophone(true);
                    setRemainingTimeSession(0);
                    clearInterval(waitTimer);
                    setWaitTimerActive(false);
                    stopMicrophone();
                    startSession(false, true);
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
                    const averagedB = getCurrentAveragedB();

                    if (getAllTimeAverageData().average > averagedB) {
                        setTrendingMood('improving');
                    } else {
                        setTrendingMood('worsening');
                    }

                    const averagedBs = getAveragedBs();
                    averagedBs.push(averagedB);
                    setAveragedBs(averagedBs);
    
                    averageGraphFrameCounter = 0;
    
                    if (getAveragedBs().length > 30) {
                        const tempAveragedB = getAveragedBs();
                        tempAveragedB.shift();
                        setAveragedBs(tempAveragedB);
                    }
    
                    updateAllTimeAverage(getCurrentAveragedB());
                    setAverageAlreadyBoosted(false);

                    updateCanvas();
                    canvasAlreadyUpdatedThisFrame = true;

                    updateMoodImage();
                }
            }
            
            if (!canvasAlreadyUpdatedThisFrame) {
                updateCanvas();
            }

            updateInputFieldValues();
        }

        console.log(getOnlyMicModeOn());
        requestAnimationFrame(gameLoop);
    }
}

function updateMoodImage() {
    const moodImageContainer = getElements().floatingMoodContainerRight;
    const upArrowSection = getElements().floatingMoodContainerLeftUp;
    const downArrowSection = getElements().floatingMoodContainerLeftDown;

    let imageUrl;
    let imageUrlTrending;

    switch (getTemperament()) {
        case 0:
            imageUrl = getHappyURL();
            break;
        case 1:
            imageUrl = getFrustratedURL();
            break;
        case 2:
            imageUrl = getAngryURL();
            break;
    }

    setCurrentImage(imageUrl);
    moodImageContainer.innerHTML = '';

    const moodImage = document.createElement('img');
    moodImage.src = imageUrl;
    moodImage.alt = 'Mood Image';
    moodImage.style.width = '100%';
    moodImage.style.height = '100%';
    moodImage.style.objectFit = 'cover';

    moodImageContainer.appendChild(moodImage);

    const trendingMood = getTrendingMood();

    if (trendingMood === 'improving') {
        imageUrlTrending = getUpArrowURL();
        upArrowSection.innerHTML = '';
        const upArrowImage = document.createElement('img');
        upArrowImage.src = imageUrlTrending;
        upArrowImage.alt = 'Up Arrow Image';
        upArrowImage.style.width = '100%';
        upArrowImage.style.height = '100%';
        upArrowImage.style.objectFit = 'cover';
        upArrowSection.appendChild(upArrowImage);

        downArrowSection.innerHTML = '';

    } else if (trendingMood === 'worsening') {
        imageUrlTrending = getDownArrowURL();
        downArrowSection.innerHTML = '';
        const downArrowImage = document.createElement('img');
        downArrowImage.src = imageUrlTrending;
        downArrowImage.alt = 'Down Arrow Image';
        downArrowImage.style.width = '100%';
        downArrowImage.style.height = '100%';
        downArrowImage.style.objectFit = 'cover';
        downArrowSection.appendChild(downArrowImage);

        upArrowSection.innerHTML = '';
    } else {
        upArrowSection.innerHTML = '';
        downArrowSection.innerHTML = '';
    }
}


export function calculateMood() {
    const allTimeAverage = getAllTimeAverageData().average;
    const threshold = getThresholdDecibelLevel();

    let mood = "None";

    if (allTimeAverage < (threshold * 0.5)) {
        mood = "None";
    } else if (allTimeAverage < (threshold * 0.9)) {
        mood = "Elevated";
    } else {
        mood = "On the verge!";
    }

    return mood;
}

export function updateAllTimeAverage(newValue) {
    let allTimeAverageData = getAllTimeAverageData();

    allTimeAverageData.values.push(newValue);
    allTimeAverageData.sum += newValue;
    allTimeAverageData.count += 1;

    if (allTimeAverageData.values.length > 50) {
        const removedValue = allTimeAverageData.values.shift();
        allTimeAverageData.sum -= removedValue;
        allTimeAverageData.count -= 1;
    }

    const weights = allTimeAverageData.values.map((_, index) => index > allTimeAverageData.count - 10 ? 2 : 1);
    const weightedSum = allTimeAverageData.values.reduce(
        (acc, val, i) => acc + val * weights[i], 
        0
    );
    const totalWeight = weights.reduce((acc, val) => acc + val, 0);
    const weightedAverage = weightedSum / totalWeight;

    const previousSmoothedAverage = allTimeAverageData.smoothedAverage || weightedAverage;
    allTimeAverageData.smoothedAverage = parseFloat(((previousSmoothedAverage * 2 + weightedAverage) / 3).toFixed(1));

    allTimeAverageData.average = allTimeAverageData.smoothedAverage;

    setAllTimeAverageData(allTimeAverageData);
}

export function drawDecibelLineChart() {
    const ctx = getElements().canvas.getContext('2d');
    const averagedBs = getAveragedBs();
    const canvasWidth = getElements().canvas.width;
    const canvasHeight = getElements().canvas.height;

    const threshold = getThresholdDecibelLevel();
    const currentdB = getCurrentAveragedB();
    let currentDbColor;

    if (currentdB < threshold / 2) {
        ctx.strokeStyle = 'green';
        currentDbColor = 'green';
    } else if (currentdB < threshold * 0.9) {
        ctx.strokeStyle = 'orange';
        currentDbColor = 'orange';
    } else {
        ctx.strokeStyle = 'red';
        currentDbColor = 'red';
    }

    ctx.lineWidth = 2;

    ctx.beginPath();
    const spacing = canvasWidth / averagedBs.length;

    const maxGraphHeight = canvasHeight * 0.67;
    const baseLine = canvasHeight;

    averagedBs.forEach((value, index) => {
        const x = index * spacing;
        const y = baseLine - (value * maxGraphHeight / 100);
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();

    const highestdB = getHighestdBSuffered();
    const highestdBPosition = baseLine - (highestdB * maxGraphHeight / 100);

    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, highestdBPosition);
    ctx.lineTo(canvasWidth, highestdBPosition);
    ctx.stroke();

    const allTimeAverage = getAllTimeAverageData().average;
    const allTimeAveragePosition = baseLine - (allTimeAverage * maxGraphHeight / 100);

    let averageColor;
    if (allTimeAverage < threshold / 2) {
        averageColor = 'lime';
    } else if (allTimeAverage < threshold * 0.9) {
        averageColor = 'orangered';
    } else {
        averageColor = 'red';
    }

    ctx.strokeStyle = averageColor;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, allTimeAveragePosition);
    ctx.lineTo(canvasWidth, allTimeAveragePosition);
    ctx.stroke();

    const thresholdPosition = baseLine - (threshold * maxGraphHeight / 100);

    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, thresholdPosition);
    ctx.lineTo(canvasWidth, thresholdPosition);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'blue';
    ctx.fillText(`Threshold: ${threshold}dB`, canvasWidth - 150, thresholdPosition - 5);

    ctx.fillStyle = 'red';
    ctx.fillText(`Highest: ${highestdB}dB`, canvasWidth - 150, highestdBPosition - 5);

    ctx.fillStyle = averageColor;
    ctx.fillText(`Ave: ${allTimeAverage}dB`, canvasWidth - 150, allTimeAveragePosition - 5);

    ctx.fillStyle = currentDbColor;
    ctx.fillText(`Current: ${Math.round(currentdB)}dB`, canvasWidth - 150, baseLine - (currentdB * maxGraphHeight / 100) - 5);
}

export async function startSession(buttonClickYap, countYapTrueNotFalse) {
    if (countYapTrueNotFalse) {
        setReactionCounter(getReactionCounter() + 1);
    }

    if (buttonClickYap) {
        setButtonClickYap(true);
    }
    getElements().yappingDogImg.classList.remove('d-none');
    getElements().floatingMoodContainer.classList.add('d-none');

    sessionDuration = Math.floor(Math.random() * (getMaxSessionTime() - getMinSessionTime() + 1)) + getMinSessionTime();

    setSessionActive(true);
    sessionStartTime = Date.now();

    sessionTimer = setInterval(async () => {
        const elapsedTime = Math.floor((Date.now() - sessionStartTime) / 1000);
        setRemainingTimeSession(sessionDuration - elapsedTime);

        if (getRemainingTimeSession() <= 0) {
            clearInterval(sessionTimer);
            if (getMicrophoneModeActive()) {
                await initializeMicrophoneListener();
            }
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

    getElements().floatingMoodContainer.classList.remove('d-none');

    startWaitTimer();
    setTemporaryStopCheckingMicrophone(false);
}

export async function startWaitTimer() {
    let remainingWaitTime = Math.floor(Math.random() * (getMaxWaitTime() - getMinWaitTime() + 1)) + getMinWaitTime();
    setWaitTimerActive(true);

    if (!getMicrophoneModeActive()) {
        setAngryImageForTimerMode();
    }

    waitTimer = setInterval(() => {
        remainingWaitTime--;
        setRemainingTimeSession(remainingWaitTime);
        if (remainingWaitTime <= 0) {
            clearInterval(waitTimer);
            setWaitTimerActive(false);
            stopMicrophone();
            if (!getOnlyMicModeOn()) {
                if (getTemperament() === 2) {
                    startSession(false, true);
                } else if (getTemperament() === 1) {
                    const allTimeAverage = getAllTimeAverageData().average;
                    const threshold = getThresholdDecibelLevel();
                    const percentage = (allTimeAverage / threshold) * 100;
                    const randomChance = Math.random() * 100;
    
                    if (randomChance <= percentage) {
                        console.log("Will Yap");
                        startSession(false, true);
                    } else {
                        console.log("No Yapping. Condition not met. Random chance:", randomChance.toFixed(2), ">");
                        stopSession(true);
                    }
                } else {
                    if (getMicrophoneModeActive()) {
                        stopSession(true);
                    } else {
                        startSession(false, true);
                    }
                }
            } else {
                stopSession(true);
            }
        }
    }, 1000);
}

function playRandomSound() {
    const noisetype = getNoiseType();
    const sampleURLs = getSampleURLS();
    const soundIds = Object.keys(sampleURLs.samples[noisetype]);
    const randomId = soundIds[Math.floor(Math.random() * soundIds.length)];
    const sound = sampleURLs.samples[noisetype][randomId];

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


export async function initializeMicrophoneListener() {
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

        if (dBValues.length > 10) {
            const totalDB = dBValues.slice(-10).reduce((acc, val) => acc + parseFloat(val), 0);
            const averageDB = parseFloat((totalDB / 10).toFixed(1));
            setCurrentAveragedB(averageDB);
        } else {
            setCurrentAveragedB(decibelLevel);
        }

        setDecibelLevel(decibelLevel);
    }
}

export function stopMicrophone() {
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
            getElements().yapButton.classList.add('d-none');
            getElements().stopButton.classList.add('d-none');
            getElements().micModeToggleButton.classList.add('d-none');

            console.log("Language is " + getLanguage());
            break;
        case getGameVisibleActive():
            getElements().menu.classList.remove('d-flex');
            getElements().menu.classList.add('d-none');
            getElements().buttonRow.classList.remove('d-none');
            getElements().buttonRow.classList.add('d-flex');
            getElements().canvasContainer.classList.remove('d-none');
            getElements().canvasContainer.classList.add('d-flex');
            getElements().yapButton.classList.remove('d-none');
            getElements().stopButton.classList.remove('d-none');
            getElements().micModeToggleButton.classList.remove('d-none');
            break;
    }
}