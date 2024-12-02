import { getDecibelLevel, getMinWaitTime, getMaxWaitTime, getMinSessionTime, getMaxSessionTime, setWaitTimerActive, getWaitTimerActive, getCurrentSound, getRemainingTimeSession, getSessionActive, getLanguage, setElements, getElements, setBeginGameStatus, getGameInProgress, setGameInProgress, getGameVisiblePaused, getMenuState, getLanguageSelected, setLanguageSelected, setLanguage, getThresholdDecibelLevel } from './constantsAndGlobalVars.js';
import { stopAllTimers, setGameState, startGame } from './game.js';
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

    getElements().returnToMenuButton.addEventListener('click', () => {
        setGameState(getMenuState());
    });

    getElements().button1.addEventListener('click', () => {
        stopAllTimers();
        if (!getSessionActive()) {
            startSession();
            setWaitTimerActive(false);
        }
        getElements().yappingDogImg.classList.remove('d-none');
        getElements().waitingDogImg.classList.add('d-none');
    });

    getElements().button2.addEventListener('click', () => {
        getElements().yappingDogImg.classList.add('d-none');
        getElements().waitingDogImg.classList.add('d-none');
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

    // Start by clearing the canvas
    ctx.clearRect(0, 0, getElements().canvas.width, getElements().canvas.height);

    // Display session status
    if (getSessionActive()) {
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(`Yapping Session Active...🤣🤣🤣`, 10, 30);
        ctx.fillText(`I'm going to be Yapping for the next ${getRemainingTimeSession()} seconds`, 10, 60);

        const currentSound = getCurrentSound();
        if (currentSound) {
            const currentSoundName = currentSound.sound;
            if (currentSoundName) {
                ctx.fillText(`Playing: ${currentSoundName}`, 10, 90);
            }
        }

        const minSessionTime = getMinSessionTime();
        const maxSessionTime = getMaxSessionTime();
        ctx.fillText(`Min Session Time: ${minSessionTime} seconds`, 10, 120);
        ctx.fillText(`Max Session Time: ${maxSessionTime} seconds`, 10, 150);
    } 
    // Display wait timer status
    else if (getWaitTimerActive()) {
        const remainingWaitTime = getRemainingTimeSession();
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(`Countdown To Next Yapping Session...🤣🤣`, 10, 30);
        ctx.fillText(`Time left: ${remainingWaitTime} seconds`, 10, 60);
        ctx.fillText(`Will Yap at: ${getThresholdDecibelLevel()}dB`, 10, 120);

        const decibelLevel = getDecibelLevel();
        let noiseColor = 'white';  // Default color

        const threshold = getThresholdDecibelLevel();
        if (decibelLevel < threshold / 2) {
            noiseColor = 'green'; // Green if less than half of the threshold
        } else if (decibelLevel < threshold * 0.9) {
            noiseColor = 'orange'; // Orange if less than 90% of the threshold
        } else if (decibelLevel <= threshold) {
            noiseColor = 'red'; // Red if the decibel level is at or above the threshold
        }

        ctx.fillStyle = noiseColor;
        ctx.fillText(`Current Noise Level: ${Math.round(decibelLevel)} dB`, 10, 150);
    }
}

