const MODEL_URL = 'https://teachablemachine.withgoogle.com/models/A2izVFHqf/';

const startWebcamButton = document.getElementById('start-webcam');
const imageUploadInput = document.getElementById('image-upload');
const webcamContainer = document.getElementById('webcam-container');
const uploadPreview = document.getElementById('upload-preview');
const statusText = document.getElementById('status-text');
const labelContainer = document.getElementById('label-container');
const animalTitle = document.getElementById('animal-title');
const animalSummary = document.getElementById('animal-summary');
const topMatchCard = document.getElementById('top-match-card');
const animalMatch = document.getElementById('animal-match');
const animalDescription = document.getElementById('animal-description');

const lang = document.body.dataset.lang === 'en' ? 'en' : 'ko';

const content = {
    ko: {
        loading: '모델을 불러오는 중입니다...',
        ready: '준비 완료. 웹캠을 켜거나 사진을 업로드해 보세요.',
        loadingWebcam: '웹캠을 준비하는 중입니다...',
        webcamLive: '실시간 분석 중입니다.',
        uploadAnalyzing: '업로드한 사진을 분석하고 있습니다...',
        cameraError: '웹캠을 시작하지 못했습니다. 브라우저 권한을 확인해 주세요.',
        modelError: '모델을 불러오지 못했습니다. 네트워크 연결 상태를 확인해 주세요.',
        waitingTitle: '분석 대기 중',
        waitingSummary: '웹캠을 켜거나 사진을 업로드하면 강아지상/고양이상 확률을 보여드립니다.',
        topMatchLabel: '당신은',
        liveMeta: '웹캠 프레임 기준 실시간 예측',
        uploadMeta: '업로드한 사진 기준 예측',
        interpretations: {
            dog: {
                title: '강아지상',
                summary: '밝고 친근한 인상으로 읽힐 가능성이 높습니다.',
                description: '부드럽고 편안한 분위기, 순한 이미지, approachable한 무드가 강하게 잡혔습니다.'
            },
            cat: {
                title: '고양이상',
                summary: '도회적이고 또렷한 인상으로 읽힐 가능성이 높습니다.',
                description: '세련되고 시크한 분위기, 선명한 눈매, 독립적인 무드가 더 강하게 잡혔습니다.'
            }
        }
    },
    en: {
        loading: 'Loading the model...',
        ready: 'Ready. Start the webcam or upload a photo.',
        loadingWebcam: 'Preparing the webcam...',
        webcamLive: 'Analyzing the live webcam feed.',
        uploadAnalyzing: 'Analyzing the uploaded photo...',
        cameraError: 'Could not start the webcam. Check your browser permissions.',
        modelError: 'Could not load the model. Check your network connection.',
        waitingTitle: 'Waiting for analysis',
        waitingSummary: 'Start the webcam or upload a photo to see your puppy-face vs cat-face score.',
        topMatchLabel: 'You match',
        liveMeta: 'Prediction from the live webcam frame',
        uploadMeta: 'Prediction from the uploaded photo',
        interpretations: {
            dog: {
                title: 'Puppy Face',
                summary: 'Your impression reads warmer, softer, and more approachable.',
                description: 'The model sees a friendly, gentle, easygoing vibe with soft facial energy.'
            },
            cat: {
                title: 'Cat Face',
                summary: 'Your impression reads sharper, cooler, and more refined.',
                description: 'The model sees a chic, defined, self-possessed vibe with more striking facial energy.'
            }
        }
    }
};

const ui = content[lang];

let model;
let webcam;
let isModelLoading = false;

statusText.textContent = ui.loading;
animalTitle.textContent = ui.waitingTitle;
animalSummary.textContent = ui.waitingSummary;

const normalizeKey = (name) => {
    const lowered = name.toLowerCase();

    if (lowered.includes('dog') || lowered.includes('puppy') || lowered.includes('강아지')) {
        return 'dog';
    }

    if (lowered.includes('cat') || lowered.includes('고양이')) {
        return 'cat';
    }

    return lowered;
};

const ensureModel = async () => {
    if (model || isModelLoading) {
        while (!model && isModelLoading) {
            await new Promise((resolve) => window.setTimeout(resolve, 50));
        }
        return model;
    }

    isModelLoading = true;

    try {
        model = await tmImage.load(MODEL_URL + 'model.json', MODEL_URL + 'metadata.json');
        statusText.textContent = ui.ready;
        return model;
    } catch (error) {
        statusText.textContent = ui.modelError;
        throw error;
    } finally {
        isModelLoading = false;
    }
};

const clearPlaceholderState = (container) => {
    container.classList.remove('empty');
    container.innerHTML = '';
};

const createScoreRow = (prediction, metaText) => {
    const row = document.createElement('article');
    row.className = 'score-item';

    const header = document.createElement('div');
    header.className = 'score-head';

    const name = document.createElement('span');
    name.className = 'score-name';
    name.textContent = prediction.className;

    const percent = document.createElement('span');
    percent.className = 'score-percent';
    percent.textContent = Math.round(prediction.probability * 100) + '%';

    header.append(name, percent);

    const bar = document.createElement('div');
    bar.className = 'score-bar';

    const fill = document.createElement('div');
    fill.className = 'score-fill';
    fill.style.width = Math.max(4, prediction.probability * 100) + '%';

    bar.appendChild(fill);

    const meta = document.createElement('p');
    meta.className = 'score-meta';
    meta.textContent = metaText;

    row.append(header, bar, meta);
    return row;
};

const renderPrediction = (predictions, sourceType) => {
    const sorted = [...predictions].sort((a, b) => b.probability - a.probability);
    const best = sorted[0];
    const bestKey = normalizeKey(best.className);
    const interpretation = ui.interpretations[bestKey] || {
        title: best.className,
        summary: '',
        description: ''
    };

    animalTitle.textContent = interpretation.title;
    animalSummary.textContent = interpretation.summary;
    animalMatch.textContent = ui.topMatchLabel + ' ' + interpretation.title;
    animalDescription.textContent = interpretation.description;
    topMatchCard.classList.remove('is-hidden');

    labelContainer.innerHTML = '';
    sorted.forEach((prediction) => {
        const metaText = sourceType === 'webcam' ? ui.liveMeta : ui.uploadMeta;
        labelContainer.appendChild(createScoreRow(prediction, metaText));
    });
};

const predictFromElement = async (element, sourceType) => {
    const loadedModel = await ensureModel();
    const predictions = await loadedModel.predict(element);
    renderPrediction(predictions, sourceType);
};

const stopWebcam = () => {
    if (!webcam) {
        return;
    }

    webcam.stop();
    webcam = null;
};

const webcamLoop = async () => {
    if (!webcam) {
        return;
    }

    webcam.update();
    await predictFromElement(webcam.canvas, 'webcam');
    window.requestAnimationFrame(webcamLoop);
};

const startWebcam = async () => {
    startWebcamButton.disabled = true;
    statusText.textContent = ui.loadingWebcam;

    try {
        await ensureModel();
        stopWebcam();

        webcam = new tmImage.Webcam(320, 320, true);
        await webcam.setup();
        await webcam.play();

        clearPlaceholderState(webcamContainer);
        webcamContainer.appendChild(webcam.canvas);

        statusText.textContent = ui.webcamLive;
        startWebcamButton.textContent = lang === 'ko' ? '웹캠 다시 시작' : 'Restart Webcam';
        window.requestAnimationFrame(webcamLoop);
    } catch (error) {
        statusText.textContent = ui.cameraError;
    } finally {
        startWebcamButton.disabled = false;
    }
};

const handleImageUpload = async (event) => {
    const [file] = event.target.files || [];

    if (!file) {
        return;
    }

    statusText.textContent = ui.uploadAnalyzing;

    const image = document.createElement('img');
    image.alt = lang === 'ko' ? '업로드한 얼굴 이미지' : 'Uploaded face image';
    image.src = URL.createObjectURL(file);

    image.addEventListener('load', async () => {
        clearPlaceholderState(uploadPreview);
        uploadPreview.appendChild(image);

        try {
            await predictFromElement(image, 'upload');
            statusText.textContent = ui.ready;
        } finally {
            URL.revokeObjectURL(image.src);
        }
    }, { once: true });
};

startWebcamButton.addEventListener('click', startWebcam);
imageUploadInput.addEventListener('change', handleImageUpload);

ensureModel().catch(() => {
    animalTitle.textContent = ui.waitingTitle;
    animalSummary.textContent = ui.modelError;
});
