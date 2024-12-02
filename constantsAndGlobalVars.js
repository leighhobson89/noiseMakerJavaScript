//DEBUG
export let debugFlag = false;
export let debugOptionFlag = false;
export let stateLoading = false;

//ELEMENTS
let elements;
let localization = {};
let language = 'en';
let languageSelected = 'en';
let oldLanguage = 'en';

//CONSTANTS
export let gameState;
export const MENU_STATE = 'menuState';
export const GAME_VISIBLE_PAUSED = 'gameVisiblePaused';
export const GAME_VISIBLE_ACTIVE = 'gameVisibleActive';

const samplesURLS = {
    samples: {
      1: { name: "dog1", url: "./resources/sounds/dog1.mp3" },
      2: { name: "dog2", url: "./resources/sounds/dog2.mp3" },
      3: { name: "dog3", url: "./resources/sounds/dog3.mp3" },
      4: { name: "dog4", url: "./resources/sounds/dog4.mp3" },
      5: { name: "dog5", url: "./resources/sounds/dog5.mp3" },
      6: { name: "dog6", url: "./resources/sounds/dog6.mp3" },
      7: { name: "dog7", url: "./resources/sounds/dog7.mp3" },
      8: { name: "dog8", url: "./resources/sounds/dog8.mp3" },
      9: { name: "dog9", url: "./resources/sounds/dog9.mp3" }
    }
  };

//GLOBAL VARIABLES
let sessionDuration = 0;
let currentSound = null;
let currentSoundName = '';
let remainingTimeSession = null;
let decibelValue = 0;
let maxWaitTime = 120;
let minWaitTime = 60;
let maxSessionTime = 6;
let minSessionTime = 5;
let thresholdDecibelLevelToStartYapping = 60;
let highestdBSuffered = 0.0;

//FLAGS
let audioMuted = false;
let languageChangedFlag = false;
let beginGameState = true;
let gameInProgress = false;
let temporaryStopCheckingMicrophone = false;
let waitTimerActive = false;
let sessionActive = false;
let microphonePermissionGranted = false;

let autoSaveOn = false;
export let pauseAutoSaveCountdown = true;

//GETTER SETTER METHODS
export function setElements() {
    elements = {
        menu: document.getElementById('menu'),
        menuTitle: document.getElementById('menuTitle'),
        newGameMenuButton: document.getElementById('newGame'),
        canvas: document.getElementById('canvas'),
        canvasContainer: document.getElementById('canvasContainer'),
        buttonRow: document.getElementById('buttonRow'),
        overlay: document.getElementById('overlay'),
        button1: document.getElementById('button1'),
        button2: document.getElementById('button2'),
        yappingDogImg: document.getElementById('yappingDogImg'),
        waitingDogImg: document.getElementById('waitingDogImg'),
        minWaitTimeLabel: document.querySelector('label[for="minWaitTimeField"]'),
        maxWaitTimeLabel: document.querySelector('label[for="maxWaitTimeField"]'),
        minSessionTimeLabel: document.querySelector('label[for="minSessionTimeField"]'),
        maxSessionTimeLabel: document.querySelector('label[for="maxSessionTimeField"]'),
        minWaitTimeField: document.getElementById('minWaitTimeField'),
        maxWaitTimeField: document.getElementById('maxWaitTimeField'),
        minSessionTimeField: document.getElementById('minSessionTimeField'),
        maxSessionTimeField: document.getElementById('maxSessionTimeField'),
        thresholddBLabel: document.querySelector('label[for="thresholddBField"]'),
        thresholddB: document.getElementById('thresholddBField')
    };
}

export function setGameStateVariable(value) {
    gameState = value;
}

export function getGameStateVariable() {
    return gameState;
}

export function getElements() {
    return elements;
}

export function getLanguageChangedFlag() {
    return languageChangedFlag;
}

export function setLanguageChangedFlag(value) {
    languageChangedFlag = value;
}

export function resetAllVariables() {
    // GLOBAL VARIABLES

    // FLAGS
}

export function captureGameStatusForSaving() {
    let gameState = {};

    // Game variables

    // Flags

    // UI elements

    gameState.language = getLanguage();

    return gameState;
}
export function restoreGameStatus(gameState) {
    return new Promise((resolve, reject) => {
        try {
            // Game variables

            // Flags

            // UI elements

            setLanguage(gameState.language);

            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

export function setLocalization(value) {
    localization = value;
}

export function getLocalization() {
    return localization;
}

export function setLanguage(value) {
    language = value;
}

export function getLanguage() {
    return language;
}

export function setOldLanguage(value) {
    oldLanguage = value;
}

export function getOldLanguage() {
    return oldLanguage;
}

export function setAudioMuted(value) {
    audioMuted = value;
}

export function getAudioMuted() {
    return audioMuted;
}

export function getMenuState() {
    return MENU_STATE;
}

export function getGameVisiblePaused() {
    return GAME_VISIBLE_PAUSED;
}

export function getGameVisibleActive() {
    return GAME_VISIBLE_ACTIVE;
}

export function getLanguageSelected() {
    return languageSelected;
}

export function setLanguageSelected(value) {
    languageSelected = value;
}

export function getBeginGameStatus() {
    return beginGameState;
}

export function setBeginGameStatus(value) {
    beginGameState = value;
}

export function getGameInProgress() {
    return gameInProgress;
}

export function setGameInProgress(value) {
    gameInProgress = value;
}

export function getSessionActive() {
    return sessionActive;
}
  
export function setSessionActive(value) {
    sessionActive = value;
}
  
export function setSessionTimer(value) {
    sessionTimer = value;
}
  
export function setSessionDuration(value) {
    sessionDuration = value;
}

export function getSessionDuration() {
    return sessionDuration;
}
  
export function getCurrentSound() {
    return currentSound;
}
  
export function setCurrentSound(value) {
    currentSound = value;
}

export function getSampleURLS() {
    return samplesURLS;
}

export function getCurrentSoundName() {
    return currentSoundName;
}

export function setCurrentSoundName(value) {
    currentSoundName = value;
}

export function getRemainingTimeSession() {
    return remainingTimeSession;
}

export function setRemainingTimeSession(value) {
    remainingTimeSession = value;
}

export function getWaitTimerActive() {
    return waitTimerActive;
}

export function setWaitTimerActive(value) {
    waitTimerActive = value;
}

export function getMaxWaitTime() {
    return maxWaitTime;
}

export function setMaxWaitTime(value) {
    maxWaitTime = value;
}

export function getMinWaitTime() {
    return minWaitTime;
}

export function setMinWaitTime(value) {
    minWaitTime = value;
}

export function getMaxSessionTime() {
    return maxSessionTime;
}

export function setMaxSessionTime(value) {
    maxSessionTime = value;
}

export function getMinSessionTime() {
    return minSessionTime;
}

export function setMinSessionTime(value) {
    minSessionTime = value;
}

export function getDecibelLevel() {
    return decibelValue;
}

export function setDecibelLevel(value) {
    decibelValue = value;
}

export function getThresholdDecibelLevel() {
    return thresholdDecibelLevelToStartYapping;
}

export function setThresholdDecibelLevel(value) {
    thresholdDecibelLevelToStartYapping = value;
}

export function setTemporaryStopCheckingMicrophone(value) {
    temporaryStopCheckingMicrophone = value;
}

export function getTemporaryStopCheckingMicrophone() {
    return temporaryStopCheckingMicrophone;
}

export function setMicrophonePermissionGranted(value) {
    microphonePermissionGranted = value;
}

export function getMicrophonePermissionGranted() {
    return microphonePermissionGranted;
}

export function setHighestdBSuffered(value) {
    // Ensure value is a number
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) {
        console.error("Invalid value passed to setHighestdBSuffered:", value);
        return;
    }
    // Update highest dB suffered
    highestdBSuffered = Math.max(highestdBSuffered, parseFloat(numericValue.toFixed(1)));
}


export function getHighestdBSuffered() {
    return highestdBSuffered;
}

