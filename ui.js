import { getSessionActive, setSessionActive, getLanguage, setElements, getElements, setBeginGameStatus, getGameInProgress, setGameInProgress, getGameVisiblePaused, getBeginGameStatus, getGameVisibleActive, getMenuState, getLanguageSelected, setLanguageSelected, setLanguage } from './constantsAndGlobalVars.js';
import { setGameState, startGame, gameLoop } from './game.js';
import { initLocalization, localize } from './localization.js';
import { startSession } from './game.js';

document.addEventListener('DOMContentLoaded', async () => {
    setElements();
    // Event listeners
    getElements().newGameMenuButton.addEventListener('click', async () => {
        setBeginGameStatus(true);
        if (!getGameInProgress()) {
            setGameInProgress(true);
        }
        setGameState(getGameVisiblePaused());
        //PRE GAME START CODE HERE AFTER NEW GAME CLICKED
        startGame();
    });

    getElements().returnToMenuButton.addEventListener('click', () => {
        setGameState(getMenuState());
    });

    getElements().button1.addEventListener('click', () => {
        if (!getSessionActive()) {
            startSession();
        }
    });

    getElements().button2.addEventListener('click', () => {
        if (getSessionActive()) {
            stopSession();
        }
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
    if (getSessionActive()) {
      const ctx = getElements().canvas.getContext('2d');
      ctx.clearRect(0, 0, getElements().canvas.width, getElements().canvas.height);
      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.fillText(`Session active...`, 10, 30);
    }
  }

