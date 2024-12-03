import { setTemperament, getTemperament, getHighestdBSuffered, getDecibelLevel, getMinWaitTime, getMaxWaitTime, getMinSessionTime, getMaxSessionTime, setWaitTimerActive, getWaitTimerActive, getCurrentSound, getRemainingTimeSession, getSessionActive, getLanguage, setElements, getElements, setBeginGameStatus, getGameInProgress, setGameInProgress, getGameVisiblePaused, getMenuState, getLanguageSelected, setLanguageSelected, setLanguage, getThresholdDecibelLevel, setSessionActive, getAllTimeAverageData } from './constantsAndGlobalVars.js';
import { calculateMood, drawDecibelLineChart, stopAllTimers, setGameState, startGame } from './game.js';
import { initLocalization, localize } from './localization.js';
import { startSession } from './game.js';

document.addEventListener('DOMContentLoaded', async () => {

    setElements();
    getElements().newGameMenuButton.addEventListener('click', async () => {
        setBeginGameStatus(true);
        if (!getGameInProgress()) {
            setGameInProgress(true);
        }
        setGameState(getGameVisiblePaused());
        startGame();
    });

    getElements().button1.addEventListener('click', () => {
        stopAllTimers();
        if (!getSessionActive()) {
            startSession();
            setWaitTimerActive(false);
        }
        getElements().yappingDogImg.classList.remove('d-none');
    });

    getElements().button2.addEventListener('click', () => {
        getElements().yappingDogImg.classList.add('d-none');

         stopAllTimers();
         setWaitTimerActive(false);
    });

    setGameState(getMenuState());
    handleLanguageChange(getLanguageSelected());
});

async function setElementsLanguageText() {
    getElements().menuTitle.innerHTML = `<h2>${localize('menuTitle', getLanguage())}</h2>`;
    getElements().newGameMenuButton.innerHTML = `${localize('newGame', getLanguage())}`;
}

export async function handleLanguageChange(languageCode) {
    setLanguageSelected(languageCode);
    await setupLanguageAndLocalization();
    setElementsLanguageText();
}

async function setupLanguageAndLocalization() {
    setLanguage(getLanguageSelected());
    await initLocalization(getLanguage());
}

export function disableActivateButton(button, action, activeClass) {
    switch (action) {
        case 'active':
            button.classList.remove('disabled');
            button.classList.add(activeClass);
            break;
        case 'disable':
            button.classList.remove(activeClass);
            button.classList.add('disabled');
            break;
    }
}

export function updateCanvas() {
    const ctx = getElements().canvas.getContext('2d');
    ctx.clearRect(0, 0, getElements().canvas.width, getElements().canvas.height);

    let currentnoiseColor;

    if (getSessionActive()) {
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(`Yapping Session Active...🤣🤣🤣`, 10, 30);
        if (getRemainingTimeSession() !== null) {
            ctx.fillText(`Yapping for the next ${getRemainingTimeSession()} seconds`, 10, 60);
        }
    } else if (getWaitTimerActive()) {
        const remainingWaitTime = getRemainingTimeSession();
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(`Yapping Decision...${remainingWaitTime} s`, 10, 30);

        const highestdB = getHighestdBSuffered();
        const threshold = getThresholdDecibelLevel();
        let highestdBColor = 'white';

        if (highestdB < threshold / 2) {
            highestdBColor = 'green';
        } else if (highestdB < threshold * 0.9) {
            highestdBColor = 'orange';
        } else {
            highestdBColor = 'red';
        }

        const decibelLevel = getDecibelLevel();

        if (decibelLevel < threshold / 2) {
            currentnoiseColor = 'green';
        } else if (decibelLevel < threshold * 0.9) {
            currentnoiseColor = 'orange';
        } else {
            currentnoiseColor = 'red';
        }

        const mood = calculateMood();

        if (mood === "None") {
            setTemperament(0);
            ctx.fillStyle = 'green';
        } else if (mood === "Elevated") {
            setTemperament(1);
            ctx.fillStyle = 'orange';
        } else if (mood === "On the verge!") {
            setTemperament(2);
            ctx.fillStyle = 'red';
        }

        ctx.fillText(`Desire to Yap: ${mood}`, 10, 60);

        drawDecibelLineChart();
    }    
}



