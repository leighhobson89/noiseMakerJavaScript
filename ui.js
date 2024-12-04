import { setOnlyMicModeOn, getOnlyMicModeOn, setCurrentImage, getAngryURL, getMicrophoneModeActive, setMicrophoneModeActive, getReactionCounter, setNoiseType, getButtonClickYap, setTemperament, getHighestdBSuffered, getDecibelLevel, setWaitTimerActive, getWaitTimerActive, getRemainingTimeSession, getSessionActive, getLanguage, setElements, getElements, setBeginGameStatus, getGameInProgress, setGameInProgress, getGameVisibleActive, getMenuState, getLanguageSelected, setLanguageSelected, setLanguage, getThresholdDecibelLevel, getMinWaitTime, getMaxWaitTime, getMinSessionTime, getMaxSessionTime, getTemporaryStopCheckingMicrophone } from './constantsAndGlobalVars.js';
import { initializeMicrophoneListener, stopMicrophone, calculateMood, drawDecibelLineChart, stopAllTimers, setGameState, startGame } from './game.js';
import { initLocalization, localize } from './localization.js';
import { startSession } from './game.js';

document.addEventListener('DOMContentLoaded', async () => {
    setElements();

    getElements().yappyDog.addEventListener('click', async () => {
        setNoiseType("yappyDog");
        initialiseGameFromMenuButtons();
    });

    getElements().noiseType2.addEventListener('click', async () => {
        setNoiseType("noiseType2");
        initialiseGameFromMenuButtons();
    });

    getElements().noiseType3.addEventListener('click', async () => {
        setNoiseType("noiseType3");
        initialiseGameFromMenuButtons();
    });

    getElements().noiseType4.addEventListener('click', async () => {
        setNoiseType("noiseType4");
        initialiseGameFromMenuButtons();
    });

    getElements().yapButton.addEventListener('click', () => {
        stopAllTimers();
        if (!getSessionActive()) {
            startSession(true, false);
            setWaitTimerActive(false);
        }
        getElements().yappingDogImg.classList.remove('d-none');
    });
23

    getElements().stopButton.addEventListener('click', () => {
        getElements().yappingDogImg.classList.add('d-none');

         stopAllTimers();
         setWaitTimerActive(false);
    });

    getElements().micModeToggleButton.addEventListener('click', async () => {
        if (getMicrophoneModeActive()) {
            setAngryImageForTimerMode();
            setMicrophoneModeActive(false);
            stopMicrophone();
            getElements().micModeToggleButton.classList.remove('btn-warning');
            getElements().micModeToggleButton.classList.add('btn-danger');
            getElements().floatingContainerRight.classList.add('d-none');
            getElements().floatingMoodContainerLeftUp.classList.add('d-none');
            getElements().floatingMoodContainerLeftDown.classList.add('d-none');

            setOnlyMicModeOn(false);
            getElements().onlyMicToggleButton.classList.remove('btn-success');
            getElements().onlyMicToggleButton.classList.remove('btn-danger');
            getElements().onlyMicToggleButton.classList.add('btn-secondary');
        } else {
            getElements().micModeToggleButton.classList.remove('btn-danger');
            getElements().micModeToggleButton.classList.add('btn-warning');
            
            setMicrophoneModeActive(true);
            if (getWaitTimerActive()) {
                getElements().micModeToggleButton.classList.add('disable-button'); //to stop messing up the system by rapid clicking while initializing microphone
                await initializeMicrophoneListener();
                getElements().micModeToggleButton.classList.remove('disable-button'); //reactivate disabled button after initialized mic
                getElements().floatingMoodContainer.classList.remove('d-none');
            }
            getElements().floatingContainerRight.classList.remove('d-none');
            getElements().floatingMoodContainerLeftUp.classList.remove('d-none');
            getElements().floatingMoodContainerLeftDown.classList.remove('d-none');
        }
    });

    getElements().onlyMicToggleButton.addEventListener('click', () => {
        if (getMicrophoneModeActive()) {
            if (getOnlyMicModeOn()) {
                getElements().onlyMicToggleButton.classList.remove('btn-success');
                getElements().onlyMicToggleButton.classList.add('btn-danger');
                setOnlyMicModeOn(false);
            } else {
                getElements().onlyMicToggleButton.classList.remove('btn-secondary');
                getElements().onlyMicToggleButton.classList.remove('btn-danger');
                getElements().onlyMicToggleButton.classList.add('btn-success');
                setOnlyMicModeOn(true);
            }
        }
    });

    setGameState(getMenuState());
    handleLanguageChange(getLanguageSelected());
});

export function setAngryImageForTimerMode() {
    const moodImageContainer = getElements().floatingMoodContainerRight;
    const imageUrl = getAngryURL();

    setCurrentImage(imageUrl);
    moodImageContainer.innerHTML = '';

    const moodImage = document.createElement('img');
    moodImage.src = imageUrl;
    moodImage.alt = 'Mood Image';
    moodImage.style.width = '100%';
    moodImage.style.height = '100%';
    moodImage.style.objectFit = 'cover';

    moodImageContainer.appendChild(moodImage);
}

function initialiseGameFromMenuButtons() {
    setBeginGameStatus(true);
    if (!getGameInProgress()) {
        setGameInProgress(true);
    }
    setGameState(getGameVisibleActive());
    startGame();
}

async function setElementsLanguageText() {
    getElements().menuTitle.innerHTML = `<h2>${localize('menuTitle', getLanguage())}</h2>`;
    getElements().yappyDog.innerHTML = `${localize('yappyDog', getLanguage())}`;
    getElements().noiseType2.innerHTML = `${localize('noiseType2', getLanguage())}`;
    getElements().noiseType3.innerHTML = `${localize('noiseType3', getLanguage())}`;
    getElements().noiseType4.innerHTML = `${localize('noiseType4', getLanguage())}`;
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

    const drawTextWithBackground = (text, x, y) => {
        const textMetrics = ctx.measureText(text);
        const padding = 4; // Add some padding around the text
        const backgroundWidth = textMetrics.width + padding * 2;
        const backgroundHeight = parseInt(ctx.font, 10) + padding * 2;

        // Draw the black background
        ctx.fillStyle = 'black';
        ctx.fillRect(x - padding, y - backgroundHeight + padding, backgroundWidth, backgroundHeight);

        // Draw the text
        ctx.fillStyle = 'white';
        ctx.fillText(text, x, y);
    };

    if (getSessionActive()) {
        ctx.font = '20px Arial';

        if (!getButtonClickYap()) {
            drawTextWithBackground(`Yapping Session Active...🤣🤣🤣`, 10, 30);
        } else {
            drawTextWithBackground(`Calibrate Your Volume Yap...`, 10, 30);
        }

        if (getRemainingTimeSession() !== null) {
            drawTextWithBackground(`Yapping for the next ${getRemainingTimeSession()} seconds`, 10, 60);
        }

    } else if (getWaitTimerActive()) {
        const remainingWaitTime = getRemainingTimeSession();
        ctx.font = '20px Arial';

        if (getMicrophoneModeActive()) {
            drawDecibelLineChart();

            drawTextWithBackground(`Listening Mode:`, 10, 30);
            if (getOnlyMicModeOn()) {
                drawTextWithBackground(`Yap only from repeated noise`, 10, 60);
            } else {
                drawTextWithBackground(`Yap based on mood after timer`, 10, 60);
            }

            drawTextWithBackground(`Total Yapping Sessions: ${getReactionCounter()}`, 10, 90);
            drawTextWithBackground(`Yapping Decision...${remainingWaitTime} s`, 10, 120);

            let highestdBColor;

            const highestdB = getHighestdBSuffered();
            const threshold = getThresholdDecibelLevel();

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

            drawTextWithBackground(`Desire to Yap: ${mood}`, 10, 150);
        } else {
            drawTextWithBackground(`Timer Mode (Yap after timer)`, 10, 30);
            drawTextWithBackground(`Total Yapping Sessions: ${getReactionCounter()}`, 10, 90);
            drawTextWithBackground(`Yapping In...${remainingWaitTime} s`, 10, 120);
            drawTextWithBackground(`Cooldown Between: ${getMinWaitTime()}s and ${getMaxWaitTime()}s`, 10, 180);
            drawTextWithBackground(`Yap Sessions Between: ${getMinSessionTime()}s and ${getMaxSessionTime()}s`, 10, 210);
        }
    }
}




