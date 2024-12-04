let localization = {};
let language = 'en';
let languageSelected = 'en';
let oldLanguage = 'en';

//ELEMENTS
let elements;

//CONSTANTS
export let gameState;
const MENU_STATE = 'menuState';
const GAME_VISIBLE_ACTIVE = 'gameVisibleActive';
const HAPPY_IMAGE_URL = "./resources/images/happy.png";
const FRUSTRATED_IMAGE_URL = "./resources/images/frustrated.png";
const ANGRY_IMAGE_URL = "./resources/images/angry.png";
const UP_ARROW_URL = "./resources/images/upArrow.png";
const DOWN_ARROW_URL = "./resources/images/downArrow.png";

const samplesURLS = {
    samples: {
      yappyDog: {
        1: { name: "yappyDog1", url: "./resources/sounds/dog1.mp3" },
        2: { name: "yappyDog2", url: "./resources/sounds/dog2.mp3" },
        3: { name: "yappyDog3", url: "./resources/sounds/dog3.mp3" },
        4: { name: "yappyDog4", url: "./resources/sounds/dog4.mp3" },
        5: { name: "yappyDog5", url: "./resources/sounds/dog5.mp3" },
        6: { name: "yappyDog6", url: "./resources/sounds/dog6.mp3" },
        7: { name: "yappyDog7", url: "./resources/sounds/dog7.mp3" },
        8: { name: "yappyDog8", url: "./resources/sounds/dog8.mp3" }
      },
      noiseType2: {
        1: { name: "noiseType21", url: "./resources/sounds/dog1.mp3" },
        2: { name: "noiseType22", url: "./resources/sounds/dog2.mp3" },
        3: { name: "noiseType23", url: "./resources/sounds/dog3.mp3" },
        4: { name: "noiseType24", url: "./resources/sounds/dog4.mp3" },
        5: { name: "noiseType25", url: "./resources/sounds/dog5.mp3" },
        6: { name: "noiseType26", url: "./resources/sounds/dog6.mp3" },
        7: { name: "noiseType27", url: "./resources/sounds/dog7.mp3" },
        8: { name: "noiseType28", url: "./resources/sounds/dog8.mp3" }
      },
      noiseType3: {
        1: { name: "noiseType31", url: "./resources/sounds/dog1.mp3" },
        2: { name: "noiseType32", url: "./resources/sounds/dog2.mp3" },
        3: { name: "noiseType33", url: "./resources/sounds/dog3.mp3" },
        4: { name: "noiseType34", url: "./resources/sounds/dog4.mp3" },
        5: { name: "noiseType35", url: "./resources/sounds/dog5.mp3" },
        6: { name: "noiseType36", url: "./resources/sounds/dog6.mp3" },
        7: { name: "noiseType37", url: "./resources/sounds/dog7.mp3" },
        8: { name: "noiseType38", url: "./resources/sounds/dog8.mp3" }
      },
      noiseType4: {
        1: { name: "noiseType41", url: "./resources/sounds/dog1.mp3" },
        2: { name: "noiseType42", url: "./resources/sounds/dog2.mp3" },
        3: { name: "noiseType43", url: "./resources/sounds/dog3.mp3" },
        4: { name: "noiseType44", url: "./resources/sounds/dog4.mp3" },
        5: { name: "noiseType45", url: "./resources/sounds/dog5.mp3" },
        6: { name: "noiseType46", url: "./resources/sounds/dog6.mp3" },
        7: { name: "noiseType47", url: "./resources/sounds/dog7.mp3" },
        8: { name: "noiseType48", url: "./resources/sounds/dog8.mp3" }
      }
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
let dBValues = [];
let averagedBs = [];
let currentAveragedB = 0;
let temperament = 0;
let currentImage = null;
let trendingMood = 'improving';
let noiseType = null;
let reactionCounter = 0;

let allTimeAverageData = {
    sum: 0,
    count: 0,
    average: 0
};

//FLAGS
let languageChangedFlag = false;
let beginGameState = true;
let gameInProgress = false;
let temporaryStopCheckingMicrophone = false;
let waitTimerActive = false;
let sessionActive = false;
let microphonePermissionGranted = false;
let initializingMic = false;
let averageAlreadyBoosted = false;
let buttonClickYap = false;
let microphoneModeActive = true;

//GETTER SETTER METHODS
export function setElements() {
    elements = {
        menu: document.getElementById('menu'),
        menuTitle: document.getElementById('menuTitle'),
        yappyDog: document.getElementById('yappyDog'),
        noiseType2: document.getElementById('noiseType2'),
        noiseType3: document.getElementById('noiseType3'),
        noiseType4: document.getElementById('noiseType4'),
        canvas: document.getElementById('canvas'),
        canvasContainer: document.getElementById('canvasContainer'),
        buttonRow: document.getElementById('buttonRow'),
        overlay: document.getElementById('overlay'),
        yapButton: document.getElementById('yapButton'),
        stopButton: document.getElementById('stopButton'),
        micModeToggleButton: document.getElementById('micModeToggleButton'),
        yappingDogImg: document.getElementById('yappingDogImg'),
        minWaitTimeLabel: document.querySelector('label[for="minWaitTimeField"]'),
        maxWaitTimeLabel: document.querySelector('label[for="maxWaitTimeField"]'),
        minSessionTimeLabel: document.querySelector('label[for="minSessionTimeField"]'),
        maxSessionTimeLabel: document.querySelector('label[for="maxSessionTimeField"]'),
        minWaitTimeField: document.getElementById('minWaitTimeField'),
        maxWaitTimeField: document.getElementById('maxWaitTimeField'),
        minSessionTimeField: document.getElementById('minSessionTimeField'),
        maxSessionTimeField: document.getElementById('maxSessionTimeField'),
        thresholddBLabel: document.querySelector('label[for="thresholddBField"]'),
        thresholddB: document.getElementById('thresholddBField'),
        floatingMoodContainer: document.getElementById('floatingMoodContainer'),
        floatingMoodContainerRight: document.getElementById('floatingMoodContainerRight'),
        floatingMoodContainerLeftUp: document.getElementById('floatingMoodContainerLeftUp'),
        floatingMoodContainerLeftDown: document.getElementById('floatingMoodContainerLeftDown')
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

export function getMenuState() {
    return MENU_STATE;
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

export function getDBValues() {
    return dBValues;
}

export function setDBValues(value) {
    dBValues = value; 
}

export function getAveragedBs() {
    return averagedBs;
}

export function setAveragedBs(value) {
    averagedBs = value;
}

export function getCurrentAveragedB() {
    return currentAveragedB;
}

export function setCurrentAveragedB(value) {
    currentAveragedB = value;
}

export function getAllTimeAverageData() {
    return allTimeAverageData;
}

export function setAllTimeAverageData(value) {
    allTimeAverageData = value;
}

export function getTemperament() {
    return temperament;
}

export function setTemperament(value) {
    temperament = value;
}

export function getInitializingMic() {
    return initializingMic;
}

export function setInitializingMic(value) {
    initializingMic = value;
}

export function getAverageAlreadyBoosted() {
    return averageAlreadyBoosted;
}

export function setAverageAlreadyBoosted(value) {
    averageAlreadyBoosted = value;
}

export function setCurrentImage(value) {
    currentImage = value;
}

export function getCurrentImage() {
    return currentImage;
}

export function getHappyURL() {
    return HAPPY_IMAGE_URL;
}

export function getFrustratedURL() {
    return FRUSTRATED_IMAGE_URL;
}

export function getAngryURL() {
    return ANGRY_IMAGE_URL;
}

export function setTrendingMood(value) {
    trendingMood = value;
}

export function getTrendingMood() {
    return trendingMood;
}

export function getUpArrowURL() {
    return UP_ARROW_URL;
}

export function getDownArrowURL() {
    return DOWN_ARROW_URL;
}

export function setButtonClickYap(value) {
    buttonClickYap = value;
}

export function getButtonClickYap() {
    return buttonClickYap;
}

export function setNoiseType(value) {
    noiseType = value;
}

export function getNoiseType() {
    return noiseType;
}

export function setReactionCounter(value) {
    reactionCounter = value;
}

export function getReactionCounter() {
    return reactionCounter;
}

export function setMicrophoneModeActive(value) {
    microphoneModeActive = value;
}

export function getMicrophoneModeActive() {
    return microphoneModeActive;
}



