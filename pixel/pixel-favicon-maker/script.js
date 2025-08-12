// Canvas Setup
const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const gridCanvas = document.getElementById('gridCanvas');
const gridCtx = gridCanvas.getContext('2d');
const guideCanvas = document.getElementById('guideCanvas');
const guideCtx = guideCanvas.getContext('2d');

// State
let canvasSize = 16;
let pixelSize = 20;
let currentTool = 'pen';
let currentColor = '#000000';
let secondaryColor = '#FFFFFF';
let isDrawing = false;
let isRightClick = false;
let lastPixel = null;
let selectedEmoji = '';
let currentFont = 'Inter';

// Drawing modes
let drawingMode = 'normal';
let colorMode = 'solid';
let gradientDirection = 'horizontal';
let gradientColors = ['#000000', '#FFFFFF'];
let currentGradientColorIndex = 0;

// Shape drawing
let shapeStartX, shapeStartY;
let isDrawingShape = false;
let tempCanvas = null;

// Move tool
let moveStartX, moveStartY;
let moveCanvas = null;

// History
let history = [];
let historyStep = -1;
const maxHistory = 50;

// Color state
let currentHue = 0;
let currentBrightness = 50;
let currentSaturation = 100;

// Emoji pagination
let currentEmojiPage = 0;
let currentEmojiCategory = 'popular';
const emojisPerPage = 20;

// 토글 패널 관리
let activePanels = {
    size: false,
    color: false
};

// Emoji categories
const emojiCategories = {
    popular: ['😀', '😍', '🤣', '😊', '😎', '😭', '😡', '👍', '❤️', '🔥', '✨', '💯', '🎉', '✅', '⭐', '💖', '🎯', '💪', '🙏', '👏', '🚀', '💎', '🌟', '⚡', '🎨'],
    face: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🫢', '🫣'],
    hand: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '🫵', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '🫶', '🤝'],
    heart: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '❤️‍🔥', '❤️‍🩹', '💔', '💋', '💌', '💐', '🌹', '🥀', '🌺', '🌸', '🌼', '🌻'],
    animal: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🦋', '🐌'],
    food: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅'],
    nature: ['🌸', '🌷', '🌹', '🥀', '🌺', '🌻', '🌼', '🌵', '🌲', '🌳', '🌴', '🌱', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🌾', '🌙', '☀️', '⭐', '🌟', '✨', '⚡', '🔥', '💧', '🌊', '🌈', '❄️'],
    object: ['⌚', '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '💽', '💾', '💿', '📀', '📷', '📸', '📹', '🎥', '📞', '☎️', '📺', '📻', '🎙️', '🎧', '🎮', '🕹️', '🎯', '🎲', '🎰', '🎨', '🖌️', '🖍️', '📝'],
    symbol: ['⚡', '💧', '🔥', '✨', '💫', '🌟', '⭐', '🌈', '☀️', '🌤️', '⛅', '☁️', '🌧️', '⛈️', '❄️', '💨', '💢', '💥', '💦', '💤', '🎵', '🎶', '🔔', '🔕', '📣', '📢', '💬', '💭', '🗨️', '🗯️']
};

// Korean consonants
const CHOSUNG_LIST = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

// Mobile check
function isMobile() {
    return window.innerWidth <= 768;
}

// Initialize
function init() {
    setupCanvas();
    
    if (isMobile()) {
        setupMobileEventListeners();
    } else {
        setupEventListeners();
    }
    
    loadEmojiCategory('popular');
    saveHistory();
    updatePreviews();
    
    if (!isMobile()) {
        updateGradientPreview();
        updateColorSliders();
    }
}

// Setup Canvas
function setupCanvas() {
    const totalSize = canvasSize * pixelSize;
    
    canvas.width = totalSize;
    canvas.height = totalSize;
    ctx.imageSmoothingEnabled = false;
    
    gridCanvas.width = totalSize;
    gridCanvas.height = totalSize;
    
    guideCanvas.width = totalSize;
    guideCanvas.height = totalSize;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, totalSize, totalSize);
    
    drawGrid();
    
    if (!isMobile()) {
        drawGuides();
    }
}

// Draw grid
function drawGrid() {
    gridCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
    gridCtx.strokeStyle = '#333';
    gridCtx.lineWidth = 1;
    
    for (let i = 0; i <= canvasSize; i++) {
        const pos = i * pixelSize;
        gridCtx.beginPath();
        gridCtx.moveTo(pos, 0);
        gridCtx.lineTo(pos, gridCanvas.height);
        gridCtx.stroke();
        
        gridCtx.beginPath();
        gridCtx.moveTo(0, pos);
        gridCtx.lineTo(gridCanvas.width, pos);
        gridCtx.stroke();
    }
}

// Draw guides for drawing modes
function drawGuides() {
    guideCtx.clearRect(0, 0, guideCanvas.width, guideCanvas.height);
    
    if (drawingMode === 'mirror') {
        guideCtx.strokeStyle = '#4ecdc4';
        guideCtx.lineWidth = 2;
        guideCtx.setLineDash([5, 5]);
        const centerX = (canvasSize / 2) * pixelSize;
        guideCtx.beginPath();
        guideCtx.moveTo(centerX, 0);
        guideCtx.lineTo(centerX, guideCanvas.height);
        guideCtx.stroke();
    } else if (drawingMode === 'grid') {
        guideCtx.strokeStyle = '#ff6b6b';
        guideCtx.lineWidth = 2;
        guideCtx.setLineDash([5, 5]);
        
        const centerX = (canvasSize / 2) * pixelSize;
        const centerY = (canvasSize / 2) * pixelSize;
        
        guideCtx.beginPath();
        guideCtx.moveTo(centerX, 0);
        guideCtx.lineTo(centerX, guideCanvas.height);
        guideCtx.stroke();
        
        guideCtx.beginPath();
        guideCtx.moveTo(0, centerY);
        guideCtx.lineTo(guideCanvas.width, centerY);
        guideCtx.stroke();
    }
}

// 크기 패널 토글
function toggleSizePanel() {
    const panel = document.getElementById('sizePanel');
    const toggle = document.querySelector('.size-toggle');
    const colorPanel = document.getElementById('colorPanel');
    const colorToggle = document.querySelector('.color-toggle');
    
    if (activePanels.size) {
        panel.style.display = 'none';
        toggle.classList.remove('active');
        activePanels.size = false;
    } else {
        panel.style.display = 'block';
        toggle.classList.add('active');
        activePanels.size = true;
        
        // 색상 패널 닫기
        if (activePanels.color) {
            colorPanel.style.display = 'none';
            colorToggle.classList.remove('active');
            activePanels.color = false;
        }
    }
}

// 색상 패널 토글
function toggleColorPanel() {
    const panel = document.getElementById('colorPanel');
    const toggle = document.querySelector('.color-toggle');
    const sizePanel = document.getElementById('sizePanel');
    const sizeToggle = document.querySelector('.size-toggle');
    
    if (activePanels.color) {
        panel.style.display = 'none';
        toggle.classList.remove('active');
        activePanels.color = false;
    } else {
        panel.style.display = 'block';
        toggle.classList.add('active');
        activePanels.color = true;
        
        // 크기 패널 닫기
        if (activePanels.size) {
            sizePanel.style.display = 'none';
            sizeToggle.classList.remove('active');
            activePanels.size = false;
        }
    }
}

// 크기 선택
function selectSize(size) {
    // 크기 변경
    changeSize(size);
    
    // UI 업데이트
    document.getElementById('currentSize').textContent = `${size}×${size}`;
    
    // 활성 버튼 표시
    document.querySelectorAll('.size-option').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.size) === size);
    });
    
    // 패널 닫기
    setTimeout(() => {
        document.getElementById('sizePanel').style.display = 'none';
        document.querySelector('.size-toggle').classList.remove('active');
        activePanels.size = false;
    }, 200);
}

// 모바일 색상 선택
function selectMobileColor(color, colorName) {
    // 색상 적용
    selectColor(color);
    
    // UI 업데이트
    document.getElementById('currentColorPreview').style.background = color;
    document.getElementById('currentColorText').textContent = colorName;
    
    // 활성 버튼 표시 - 먼저 모든 active 제거
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 현재 선택된 버튼만 active 추가
    const selectedBtn = document.querySelector(`.color-option[data-color="${color}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }
    
    // 패널 닫기
    setTimeout(() => {
        document.getElementById('colorPanel').style.display = 'none';
        document.querySelector('.color-toggle').classList.remove('active');
        activePanels.color = false;
    }, 200);
}

// 화면 클릭시 패널 닫기
document.addEventListener('click', function(e) {
    if (!e.target.closest('.control-toggle') && !e.target.closest('.mobile-panel')) {
        // 모든 패널 닫기
        if (activePanels.size) {
            document.getElementById('sizePanel').style.display = 'none';
            document.querySelector('.size-toggle').classList.remove('active');
            activePanels.size = false;
        }
        if (activePanels.color) {
            document.getElementById('colorPanel').style.display = 'none';
            document.querySelector('.color-toggle').classList.remove('active');
            activePanels.color = false;
        }
    }
});

// Change canvas size
function changeSize(newSize) {
    if (canvasSize === newSize) return;
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasSize;
    tempCanvas.height = canvasSize;
    const tempCtx = tempCanvas.getContext('2d');
    
    for (let y = 0; y < canvasSize; y++) {
        for (let x = 0; x < canvasSize; x++) {
            const pixelData = ctx.getImageData(x * pixelSize + pixelSize/2, y * pixelSize + pixelSize/2, 1, 1);
            if (pixelData.data[3] > 0) {
                tempCtx.fillStyle = `rgba(${pixelData.data[0]}, ${pixelData.data[1]}, ${pixelData.data[2]}, ${pixelData.data[3]/255})`;
                tempCtx.fillRect(x, y, 1, 1);
            }
        }
    }
    
    const oldSize = canvasSize;
    canvasSize = newSize;
    pixelSize = canvasSize === 32 ? 10 : 20;
    
    setupCanvas();
    
    if (oldSize === 16 && newSize === 32) {
        for (let y = 0; y < oldSize; y++) {
            for (let x = 0; x < oldSize; x++) {
                const pixelData = tempCtx.getImageData(x, y, 1, 1);
                if (pixelData.data[3] > 0) {
                    ctx.fillStyle = `rgba(${pixelData.data[0]}, ${pixelData.data[1]}, ${pixelData.data[2]}, ${pixelData.data[3]/255})`;
                    ctx.fillRect(x * 2 * pixelSize, y * 2 * pixelSize, pixelSize * 2, pixelSize * 2);
                }
            }
        }
    } else if (oldSize === 32 && newSize === 16) {
        for (let y = 0; y < newSize; y++) {
            for (let x = 0; x < newSize; x++) {
                const pixelData = tempCtx.getImageData(x * 2, y * 2, 1, 1);
                if (pixelData.data[3] > 0) {
                    ctx.fillStyle = `rgba(${pixelData.data[0]}, ${pixelData.data[1]}, ${pixelData.data[2]}, ${pixelData.data[3]/255})`;
                    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                }
            }
        }
    }
    
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.size) === newSize);
    });
    
    // 모바일 버튼 active 상태 업데이트 추가!
    document.querySelectorAll('.size-btn-mobile').forEach(btn => {
        if (btn.textContent.includes(newSize.toString())) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    saveHistory();
    updatePreviews();
}

// Setup event listeners for desktop
function setupEventListeners() {
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    
    document.querySelectorAll('.tool-btn').forEach(btn => {
        const tool = btn.dataset.tool;
        if (tool) {
            btn.addEventListener('click', () => selectTool(tool));
        }
    });
    
    document.querySelectorAll('input[name="drawMode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            drawingMode = e.target.value;
            document.querySelectorAll('.mode-option').forEach(opt => {
                opt.classList.toggle('active', opt.querySelector('input').value === drawingMode);
            });
            drawGuides();
        });
    });
    
    document.querySelectorAll('.color-preset').forEach(preset => {
        preset.addEventListener('click', () => selectColor(preset.dataset.color));
    });
    
    document.getElementById('primaryColor').addEventListener('click', () => {
        document.getElementById('colorPicker').click();
    });
    
    document.getElementById('colorPicker').addEventListener('change', (e) => {
        selectColor(e.target.value);
    });
    
    document.getElementById('hueSlider').addEventListener('input', updateColorFromSliders);
    document.getElementById('brightnessSlider').addEventListener('input', updateColorFromSliders);
    document.getElementById('saturationSlider').addEventListener('input', updateColorFromSliders);
    
    document.getElementById('gradientHueSlider').addEventListener('input', updateGradientColor);
    
    document.getElementById('emojiDirectInput').addEventListener('input', (e) => {
        const emoji = e.target.value;
        if (emoji && emoji.length > 0) {
            emojiToFavicon(emoji);
        }
    });
    
    document.addEventListener('keydown', handleKeyboard);
}

// Setup event listeners for mobile
function setupMobileEventListeners() {
    // Color presets
    document.querySelectorAll('.color-preset').forEach(preset => {
        preset.addEventListener('click', () => selectColor(preset.dataset.color));
    });
    
    // Emoji input
    document.getElementById('emojiDirectInput').addEventListener('input', (e) => {
        const emoji = e.target.value;
        if (emoji && emoji.length > 0) {
            emojiToFavicon(emoji);
        }
    });
    
    // Basic keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey) {
            switch (e.key) {
                case 'z':
                    e.preventDefault();
                    undo();
                    break;
                case 'y':
                    e.preventDefault();
                    redo();
                    break;
            }
        }
    });
}

// Mouse handlers
function handleMouseDown(e) {
    if (isMobile()) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pixelX = Math.floor(x / pixelSize);
    const pixelY = Math.floor(y / pixelSize);
    
    isRightClick = e.button === 2;
    isDrawing = true;
    
    if (currentTool === 'move') {
        moveStartX = pixelX;
        moveStartY = pixelY;
        moveCanvas = document.createElement('canvas');
        moveCanvas.width = canvas.width;
        moveCanvas.height = canvas.height;
        const moveCtx = moveCanvas.getContext('2d');
        moveCtx.drawImage(canvas, 0, 0);
    } else if (['line', 'rect', 'circle', 'ellipse', 'triangle', 'diamond', 'star', 'heart'].includes(currentTool)) {
        shapeStartX = pixelX;
        shapeStartY = pixelY;
        isDrawingShape = true;
        tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(canvas, 0, 0);
    } else {
        handlePixelAction(pixelX, pixelY);
    }
    
    lastPixel = { x: pixelX, y: pixelY };
}

function handleMouseMove(e) {
    if (!isDrawing || isMobile()) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pixelX = Math.floor(x / pixelSize);
    const pixelY = Math.floor(y / pixelSize);
    
    if (currentTool === 'move' && moveCanvas) {
        const dx = (pixelX - moveStartX) * pixelSize;
        const dy = (pixelY - moveStartY) * pixelSize;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(moveCanvas, dx, dy);
    } else if (isDrawingShape && tempCanvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);
        drawShape(currentTool, shapeStartX, shapeStartY, pixelX, pixelY);
    } else if (!isDrawingShape && (currentTool === 'pen' || currentTool === 'eraser')) {
        drawLine(lastPixel.x, lastPixel.y, pixelX, pixelY);
    }
    
    lastPixel = { x: pixelX, y: pixelY };
}

function handleMouseUp(e) {
    isDrawing = false;
    isDrawingShape = false;
    tempCanvas = null;
    moveCanvas = null;
    
    saveHistory();
    updatePreviews();
}

function handleMouseLeave() {
    isDrawing = false;
    isDrawingShape = false;
}

// Pixel actions
function handlePixelAction(x, y) {
    if (x < 0 || x >= canvasSize || y < 0 || y >= canvasSize) return;
    
    switch (currentTool) {
        case 'pen':
            drawPixel(x, y, isRightClick ? secondaryColor : currentColor);
            break;
        case 'eraser':
            erasePixel(x, y);
            break;
        case 'fill':
            floodFill(x, y, isRightClick ? secondaryColor : currentColor);
            break;
        case 'eyedropper':
            pickColor(x, y);
            break;
    }
}

// Draw pixel with mode support
function drawPixel(x, y, color) {
    if (x < 0 || x >= canvasSize || y < 0 || y >= canvasSize) return;
    
    if (colorMode === 'gradient' && !isMobile()) {
        color = getGradientColor(x, y);
    }
    
    ctx.fillStyle = color;
    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    
    if (drawingMode === 'mirror' && !isMobile()) {
        const mirrorX = canvasSize - 1 - x;
        ctx.fillRect(mirrorX * pixelSize, y * pixelSize, pixelSize, pixelSize);
    } else if (drawingMode === 'grid' && !isMobile()) {
        const halfSize = canvasSize / 2;
        const quadX = x % halfSize;
        const quadY = y % halfSize;
        
        ctx.fillRect((halfSize + quadX) * pixelSize, quadY * pixelSize, pixelSize, pixelSize);
        ctx.fillRect(quadX * pixelSize, (halfSize + quadY) * pixelSize, pixelSize, pixelSize);
        ctx.fillRect((halfSize + quadX) * pixelSize, (halfSize + quadY) * pixelSize, pixelSize, pixelSize);
    }
}

// Erase pixel
function erasePixel(x, y) {
    if (x < 0 || x >= canvasSize || y < 0 || y >= canvasSize) return;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    
    if (drawingMode === 'mirror' && !isMobile()) {
        const mirrorX = canvasSize - 1 - x;
        ctx.fillRect(mirrorX * pixelSize, y * pixelSize, pixelSize, pixelSize);
    } else if (drawingMode === 'grid' && !isMobile()) {
        const halfSize = canvasSize / 2;
        const quadX = x % halfSize;
        const quadY = y % halfSize;
        
        ctx.fillRect((halfSize + quadX) * pixelSize, quadY * pixelSize, pixelSize, pixelSize);
        ctx.fillRect(quadX * pixelSize, (halfSize + quadY) * pixelSize, pixelSize, pixelSize);
        ctx.fillRect((halfSize + quadX) * pixelSize, (halfSize + quadY) * pixelSize, pixelSize, pixelSize);
    }
}

// Draw line
function drawLine(x0, y0, x1, y1) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    
    while (true) {
        handlePixelAction(x0, y0);
        
        if (x0 === x1 && y0 === y1) break;
        
        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x0 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y0 += sy;
        }
    }
}

// Shape drawing functions
function drawShape(type, x1, y1, x2, y2) {
    const color = isRightClick ? secondaryColor : currentColor;
    
    switch (type) {
        case 'line':
            drawShapeLine(x1, y1, x2, y2, color);
            break;
        case 'rect':
            drawRectangle(x1, y1, x2, y2, color);
            break;
        case 'circle':
            drawCircle(x1, y1, x2, y2, color);
            break;
        case 'ellipse':
            drawEllipse(x1, y1, x2, y2, color);
            break;
        case 'triangle':
            drawTriangle(x1, y1, x2, y2, color);
            break;
        case 'diamond':
            drawDiamond(x1, y1, x2, y2, color);
            break;
        case 'star':
            drawStar(x1, y1, x2, y2, color);
            break;
        case 'heart':
            drawHeart(x1, y1, x2, y2, color);
            break;
    }
}

function drawShapeLine(x1, y1, x2, y2, color) {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;
    let x = x1;
    let y = y1;
    
    while (true) {
        drawPixel(x, y, color);
        
        if (x === x2 && y === y2) break;
        
        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x += sx;
        }
        if (e2 < dx) {
            err += dx;
            y += sy;
        }
    }
}

function drawRectangle(x1, y1, x2, y2, color) {
    const minX = Math.min(x1, x2);
    const minY = Math.min(y1, y2);
    const maxX = Math.max(x1, x2);
    const maxY = Math.max(y1, y2);
    
    for (let x = minX; x <= maxX; x++) {
        drawPixel(x, minY, color);
        drawPixel(x, maxY, color);
    }
    for (let y = minY + 1; y < maxY; y++) {
        drawPixel(minX, y, color);
        drawPixel(maxX, y, color);
    }
}

function drawCircle(x1, y1, x2, y2, color) {
    const centerX = Math.floor((x1 + x2) / 2);
    const centerY = Math.floor((y1 + y2) / 2);
    const radius = Math.floor(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) / 2);
    
    let x = radius;
    let y = 0;
    let err = 0;
    
    while (x >= y) {
        drawPixel(centerX + x, centerY + y, color);
        drawPixel(centerX + y, centerY + x, color);
        drawPixel(centerX - y, centerY + x, color);
        drawPixel(centerX - x, centerY + y, color);
        drawPixel(centerX - x, centerY - y, color);
        drawPixel(centerX - y, centerY - x, color);
        drawPixel(centerX + y, centerY - x, color);
        drawPixel(centerX + x, centerY - y, color);
        
        if (err <= 0) {
            y += 1;
            err += 2 * y + 1;
        }
        if (err > 0) {
            x -= 1;
            err -= 2 * x + 1;
        }
    }
}

function drawEllipse(x1, y1, x2, y2, color) {
    const centerX = Math.floor((x1 + x2) / 2);
    const centerY = Math.floor((y1 + y2) / 2);
    const radiusX = Math.abs(x2 - x1) / 2;
    const radiusY = Math.abs(y2 - y1) / 2;
    
    for (let angle = 0; angle <= 360; angle += 2) {
        const rad = angle * Math.PI / 180;
        const x = Math.round(centerX + radiusX * Math.cos(rad));
        const y = Math.round(centerY + radiusY * Math.sin(rad));
        drawPixel(x, y, color);
    }
}

function drawTriangle(x1, y1, x2, y2, color) {
    const centerX = Math.floor((x1 + x2) / 2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    
    drawShapeLine(centerX, minY, minX, maxY, color);
    drawShapeLine(minX, maxY, maxX, maxY, color);
    drawShapeLine(maxX, maxY, centerX, minY, color);
}

function drawDiamond(x1, y1, x2, y2, color) {
    const centerX = Math.floor((x1 + x2) / 2);
    const centerY = Math.floor((y1 + y2) / 2);
    const halfWidth = Math.floor(Math.abs(x2 - x1) / 2);
    const halfHeight = Math.floor(Math.abs(y2 - y1) / 2);
    
    drawShapeLine(centerX, centerY - halfHeight, centerX + halfWidth, centerY, color);
    drawShapeLine(centerX + halfWidth, centerY, centerX, centerY + halfHeight, color);
    drawShapeLine(centerX, centerY + halfHeight, centerX - halfWidth, centerY, color);
    drawShapeLine(centerX - halfWidth, centerY, centerX, centerY - halfHeight, color);
}

function drawStar(x1, y1, x2, y2, color) {
    const centerX = Math.floor((x1 + x2) / 2);
    const centerY = Math.floor((y1 + y2) / 2);
    const outerRadius = Math.floor(Math.min(Math.abs(x2 - x1), Math.abs(y2 - y1)) / 2);
    const innerRadius = Math.floor(outerRadius * 0.4);
    
    const points = [];
    for (let i = 0; i < 10; i++) {
        const angle = (i * 36 - 90) * Math.PI / 180;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        points.push({
            x: Math.round(centerX + radius * Math.cos(angle)),
            y: Math.round(centerY + radius * Math.sin(angle))
        });
    }
    
    for (let i = 0; i < 10; i++) {
        const next = (i + 1) % 10;
        drawShapeLine(points[i].x, points[i].y, points[next].x, points[next].y, color);
    }
}

// Fixed heart drawing function (윤곽선만)
function drawHeart(x1, y1, x2, y2, color) {
    const minX = Math.min(x1, x2);
    const minY = Math.min(y1, y2);
    const maxX = Math.max(x1, x2);
    const maxY = Math.max(y1, y2);
    const width = maxX - minX + 1;
    const height = maxY - minY + 1;
    
    // 픽셀 아트 하트 윤곽선 패턴 (0: 빈칸, 1: 테두리)
    const heartOutlinePatterns = {
        // 3x3 하트 윤곽선
        3: [
            [0,1,0,1,0],
            [1,0,0,0,1],
            [0,1,0,1,0],
            [0,0,1,0,0]
        ],
        // 5x5 하트 윤곽선
        5: [
            [0,1,0,0,1,0],
            [1,0,1,1,0,1],
            [1,0,0,0,0,1],
            [0,1,0,0,1,0],
            [0,0,1,1,0,0]
        ],
        // 7x7 하트 윤곽선
        7: [
            [0,1,1,0,0,1,1,0],
            [1,0,0,1,1,0,0,1],
            [1,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,1],
            [0,1,0,0,0,0,1,0],
            [0,0,1,0,0,1,0,0],
            [0,0,0,1,1,0,0,0]
        ],
        // 9x9 하트 윤곽선
        9: [
            [0,0,1,1,0,0,0,1,1,0,0],
            [0,1,0,0,1,0,1,0,0,1,0],
            [1,0,0,0,0,1,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,1],
            [0,1,0,0,0,0,0,0,0,1,0],
            [0,0,1,0,0,0,0,0,1,0,0],
            [0,0,0,1,0,0,0,1,0,0,0],
            [0,0,0,0,1,0,1,0,0,0,0],
            [0,0,0,0,0,1,0,0,0,0,0]
        ],
        // 11x11 하트 윤곽선
        11: [
            [0,0,1,1,1,0,0,0,1,1,1,0,0],
            [0,1,0,0,0,1,0,1,0,0,0,1,0],
            [1,0,0,0,0,0,1,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,1],
            [0,1,0,0,0,0,0,0,0,0,0,1,0],
            [0,0,1,0,0,0,0,0,0,0,1,0,0],
            [0,0,0,1,0,0,0,0,0,1,0,0,0],
            [0,0,0,0,1,0,0,0,1,0,0,0,0],
            [0,0,0,0,0,1,0,1,0,0,0,0,0],
            [0,0,0,0,0,0,1,0,0,0,0,0,0]
        ]
    };
    
    // 크기에 따라 가장 적합한 패턴 선택
    let pattern;
    let patternWidth;
    let patternHeight;
    
    if (width <= 3 || height <= 3) {
        pattern = heartOutlinePatterns[3];
        patternWidth = 5;
        patternHeight = pattern.length;
    } else if (width <= 5 || height <= 5) {
        pattern = heartOutlinePatterns[5];
        patternWidth = 6;
        patternHeight = pattern.length;
    } else if (width <= 7 || height <= 7) {
        pattern = heartOutlinePatterns[7];
        patternWidth = 8;
        patternHeight = pattern.length;
    } else if (width <= 9 || height <= 9) {
        pattern = heartOutlinePatterns[9];
        patternWidth = 11;
        patternHeight = pattern.length;
    } else {
        pattern = heartOutlinePatterns[11];
        patternWidth = 13;
        patternHeight = pattern.length;
    }
    
    // 패턴을 실제 캔버스 크기에 맞게 스케일링
    const scaleX = width / patternWidth;
    const scaleY = height / patternHeight;
    
    // 패턴을 그리기
    for (let py = 0; py < pattern.length; py++) {
        for (let px = 0; px < pattern[py].length; px++) {
            if (pattern[py][px] === 1) {
                // 스케일링된 위치 계산
                const drawX = minX + Math.floor(px * scaleX);
                const drawY = minY + Math.floor(py * scaleY);
                
                // 스케일에 따라 여러 픽셀 채우기
                const endX = minX + Math.floor((px + 1) * scaleX);
                const endY = minY + Math.floor((py + 1) * scaleY);
                
                for (let dy = drawY; dy < endY && dy <= maxY; dy++) {
                    for (let dx = drawX; dx < endX && dx <= maxX; dx++) {
                        if (dx >= minX && dx <= maxX && dy >= minY && dy <= maxY) {
                            drawPixel(dx, dy, color);
                        }
                    }
                }
            }
        }
    }
}

// Color functions
function pickColor(x, y) {
    const centerX = x * pixelSize + pixelSize / 2;
    const centerY = y * pixelSize + pixelSize / 2;
    
    const imageData = ctx.getImageData(centerX, centerY, 1, 1);
    const data = imageData.data;
    
    const hex = rgbToHex(data[0], data[1], data[2]);
    selectColor(hex);
}

function selectColor(color) {
    currentColor = color;
    
    if (!isMobile()) {
        document.getElementById('primaryColor').style.backgroundColor = color;
        document.getElementById('colorPicker').value = color;
        
        const rgb = hexToRgb(color);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        currentHue = hsl.h;
        currentSaturation = hsl.s;
        currentBrightness = hsl.l;
        updateColorSliders();
    }
}

// 모바일 Hue 슬라이더 토글 - 새로 추가!
function toggleMobileHue() {
    const panel = document.getElementById('mobileHuePanel');
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
    } else {
        panel.style.display = 'none';
    }
}

// 모바일 색상 업데이트 - 새로 추가!
function updateMobileColor(hueValue) {
    let color;
    
    // 슬라이더 값에 따라 색상 결정
    if (hueValue < 20) {
        // 0-20: 검은색 영역
        color = '#000000';
    } else if (hueValue > 340) {
        // 340-360: 흰색 영역  
        color = '#FFFFFF';
    } else {
        // 20-340: 정상 색조 (320도 범위를 360도로 확장)
        const adjustedHue = ((hueValue - 20) / 320) * 360;
        color = hslToHex(adjustedHue, 100, 50);
    }
    
    selectColor(color);
    document.getElementById('mobileColorPreview').style.background = color;
}

function swapColors() {
    [currentColor, secondaryColor] = [secondaryColor, currentColor];
    document.getElementById('primaryColor').style.backgroundColor = currentColor;
    document.getElementById('secondaryColor').style.backgroundColor = secondaryColor;
}

function swapCanvasColors() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let mainColor = null;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        
        if (a > 0 && !(r === 255 && g === 255 && b === 255)) {
            mainColor = { r, g, b };
            break;
        }
    }
    
    if (!mainColor) {
        const rgb = hexToRgb(currentColor);
        mainColor = { r: rgb.r, g: rgb.g, b: rgb.b };
    }
    
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        
        if (a > 0) {
            if (r === 255 && g === 255 && b === 255) {
                data[i] = mainColor.r;
                data[i + 1] = mainColor.g;
                data[i + 2] = mainColor.b;
            }
            else if (Math.abs(r - mainColor.r) < 10 && 
                     Math.abs(g - mainColor.g) < 10 && 
                     Math.abs(b - mainColor.b) < 10) {
                data[i] = 255;
                data[i + 1] = 255;
                data[i + 2] = 255;
            }
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
    saveHistory();
    updatePreviews();
}

// Color mode functions
function setColorMode(mode) {
    if (isMobile()) return;
    
    colorMode = mode;
    document.querySelectorAll('.color-mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.includes(mode === 'solid' ? '단색' : '그라데이션'));
    });
    
    document.querySelector('.solid-color-controls').classList.toggle('active', mode === 'solid');
    document.querySelector('.gradient-controls').classList.toggle('active', mode === 'gradient');
    
    if (mode === 'gradient') {
        updateGradientPreview();
    }
}

function updateColorFromSliders() {
    if (isMobile()) return;
    
    currentHue = parseInt(document.getElementById('hueSlider').value);
    currentBrightness = parseInt(document.getElementById('brightnessSlider').value);
    currentSaturation = parseInt(document.getElementById('saturationSlider').value);
    
    const color = hslToHex(currentHue, currentSaturation, currentBrightness);
    selectColor(color);
}

function updateColorSliders() {
    if (isMobile()) return;
    
    document.getElementById('hueSlider').value = currentHue;
    document.getElementById('brightnessSlider').value = currentBrightness;
    document.getElementById('saturationSlider').value = currentSaturation;
    
    const hueColor = hslToHex(currentHue, 100, 50);
    document.getElementById('brightnessSlider').style.background = 
        `linear-gradient(to right, #000, ${hueColor}, #fff)`;
    
    const grayColor = hslToHex(currentHue, 0, currentBrightness);
    const fullColor = hslToHex(currentHue, 100, currentBrightness);
    document.getElementById('saturationSlider').style.background = 
        `linear-gradient(to right, ${grayColor}, ${fullColor})`;
}

// Gradient functions
function selectGradientColor(index) {
    if (isMobile()) return;
    
    currentGradientColorIndex = index;
    document.querySelectorAll('.gradient-color-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });
}

function updateGradientColor() {
    if (isMobile()) return;
    
    const hue = parseInt(document.getElementById('gradientHueSlider').value);
    const color = hslToHex(hue, 100, 50);
    gradientColors[currentGradientColorIndex] = color;
    updateGradientPreview();
}

function setGradientDirection(direction) {
    if (isMobile()) return;
    
    gradientDirection = direction;
    document.querySelectorAll('.direction-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.dir === direction);
    });
    updateGradientPreview();
}

function updateGradientPreview() {
    if (isMobile()) return;
    
    const preview = document.getElementById('gradientPreview');
    if (!preview) return;
    
    let gradient;
    
    switch (gradientDirection) {
        case 'horizontal':
            gradient = `linear-gradient(to right, ${gradientColors[0]}, ${gradientColors[1]})`;
            break;
        case 'vertical':
            gradient = `linear-gradient(to bottom, ${gradientColors[0]}, ${gradientColors[1]})`;
            break;
        case 'diagonal':
            gradient = `linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]})`;
            break;
        case 'radial':
            gradient = `radial-gradient(circle, ${gradientColors[0]}, ${gradientColors[1]})`;
            break;
    }
    
    preview.style.background = gradient;
}

function getGradientColor(x, y) {
    let t = 0;
    
    switch (gradientDirection) {
        case 'horizontal':
            t = x / (canvasSize - 1);
            break;
        case 'vertical':
            t = y / (canvasSize - 1);
            break;
        case 'diagonal':
            t = (x + y) / ((canvasSize - 1) * 2);
            break;
        case 'radial':
            const centerX = canvasSize / 2;
            const centerY = canvasSize / 2;
            const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
            const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
            t = dist / maxDist;
            break;
    }
    
    return interpolateColor(gradientColors[0], gradientColors[1], t);
}

function interpolateColor(color1, color2, t) {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    
    const r = Math.round(c1.r + (c2.r - c1.r) * t);
    const g = Math.round(c1.g + (c2.g - c1.g) * t);
    const b = Math.round(c1.b + (c2.b - c1.b) * t);
    
    return rgbToHex(r, g, b);
}

// Flood fill
function floodFill(startX, startY, fillColor) {
    if (startX < 0 || startX >= canvasSize || startY < 0 || startY >= canvasSize) return;
    
    const targetColor = getPixelColorAt(startX, startY);
    const fillRgb = hexToRgb(fillColor);
    
    if (colorsMatch(targetColor, fillRgb)) return;
    
    const stack = [[startX, startY]];
    const visited = new Set();
    const tolerance = 10;
    
    while (stack.length > 0) {
        const [x, y] = stack.pop();
        const key = `${x},${y}`;
        
        if (visited.has(key) || x < 0 || x >= canvasSize || y < 0 || y >= canvasSize) continue;
        
        const currentColor = getPixelColorAt(x, y);
        
        if (!colorsMatchWithTolerance(currentColor, targetColor, tolerance)) continue;
        
        visited.add(key);
        
        let color = fillColor;
        if (colorMode === 'gradient' && !isMobile()) {
            color = getGradientColor(x, y);
        }
        
        drawPixel(x, y, color);
        
        stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    
    updatePreviews();
}

function getPixelColorAt(x, y) {
    const centerX = x * pixelSize + pixelSize / 2;
    const centerY = y * pixelSize + pixelSize / 2;
    const imageData = ctx.getImageData(centerX, centerY, 1, 1);
    return {
        r: imageData.data[0],
        g: imageData.data[1],
        b: imageData.data[2],
        a: imageData.data[3]
    };
}

function colorsMatch(c1, c2) {
    return c1.r === c2.r && c1.g === c2.g && c1.b === c2.b;
}

function colorsMatchWithTolerance(c1, c2, tolerance) {
    return Math.abs(c1.r - c2.r) <= tolerance &&
           Math.abs(c1.g - c2.g) <= tolerance &&
           Math.abs(c1.b - c2.b) <= tolerance;
}

// Edit functions
function rotateCanvas() {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCtx.save();
    tempCtx.translate(canvas.width / 2, canvas.height / 2);
    tempCtx.rotate(Math.PI / 2);
    tempCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
    tempCtx.restore();
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tempCanvas, 0, 0);
    
    saveHistory();
    updatePreviews();
}

function flipHorizontal() {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCtx.save();
    tempCtx.scale(-1, 1);
    tempCtx.drawImage(canvas, -canvas.width, 0);
    tempCtx.restore();
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tempCanvas, 0, 0);
    
    saveHistory();
    updatePreviews();
}

function flipVertical() {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCtx.save();
    tempCtx.scale(1, -1);
    tempCtx.drawImage(canvas, 0, -canvas.height);
    tempCtx.restore();
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tempCanvas, 0, 0);
    
    saveHistory();
    updatePreviews();
}

// Clear canvas
function clearCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistory();
    updatePreviews();
}

// History management
function saveHistory() {
    historyStep++;
    if (historyStep < history.length) {
        history.length = historyStep;
    }
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    history.push(imageData);
    
    if (history.length > maxHistory) {
        history.shift();
        historyStep--;
    }
}

function undo() {
    if (historyStep > 0) {
        historyStep--;
        ctx.putImageData(history[historyStep], 0, 0);
        updatePreviews();
    }
}

function redo() {
    if (historyStep < history.length - 1) {
        historyStep++;
        ctx.putImageData(history[historyStep], 0, 0);
        updatePreviews();
    }
}

// Tool selection
function selectTool(tool) {
    if (isMobile()) return;
    
    currentTool = tool;
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tool === tool);
    });
    canvas.style.cursor = tool === 'eyedropper' ? 'crosshair' : 'default';
}

// Keyboard shortcuts
function handleKeyboard(e) {
    if (isMobile()) {
        // Mobile only handles undo/redo
        if (e.ctrlKey) {
            switch (e.key) {
                case 'z':
                    e.preventDefault();
                    undo();
                    break;
                case 'y':
                    e.preventDefault();
                    redo();
                    break;
            }
        }
        return;
    }
    
    // Desktop shortcuts
    if (e.ctrlKey) {
        switch (e.key) {
            case 'z':
                e.preventDefault();
                undo();
                break;
            case 'y':
                e.preventDefault();
                redo();
                break;
        }
    } else {
        switch (e.key.toLowerCase()) {
            case 'p': selectTool('pen'); break;
            case 'e': selectTool('eraser'); break;
            case 'f': selectTool('fill'); break;
            case 'i': selectTool('eyedropper'); break;
            case 'm': selectTool('move'); break;
        }
    }
}

// Font update
function updateFont() {
    currentFont = document.getElementById('fontSelect').value;
}

// Text to favicon
function textToFavicon() {
    const text = document.getElementById('textInput').value;
    if (!text) return;
    
    const font = document.getElementById('fontSelect').value;
    const mode = document.getElementById('textMode').value;
    
    let displayText = text;
    
    if (mode === 'first') {
        displayText = text.charAt(0);
    } else if (mode === 'chosung' && isKorean(text)) {
        displayText = getChosung(text);
    }
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    const scale = 4;
    tempCanvas.width = canvasSize * scale;
    tempCanvas.height = canvasSize * scale;
    
    tempCtx.fillStyle = 'white';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    let fontSize;
    if (canvasSize === 16) {
        fontSize = displayText.length === 1 ? 48 : (displayText.length === 2 ? 36 : 24);
    } else {
        fontSize = displayText.length === 1 ? 96 : (displayText.length === 2 ? 72 : 48);
    }
    
    tempCtx.fillStyle = currentColor;
    tempCtx.font = `${fontSize}px "${font}"`;
    tempCtx.textAlign = 'center';
    tempCtx.textBaseline = 'middle';
    tempCtx.imageSmoothingEnabled = false;
    
    tempCtx.fillText(displayText, tempCanvas.width / 2, tempCanvas.height / 2);
    
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const pixels = imageData.data;
    
    for (let y = 0; y < canvasSize; y++) {
        for (let x = 0; x < canvasSize; x++) {
            let r = 0, g = 0, b = 0, a = 0;
            let count = 0;
            
            for (let sy = 0; sy < scale; sy++) {
                for (let sx = 0; sx < scale; sx++) {
                    const sourceX = x * scale + sx;
                    const sourceY = y * scale + sy;
                    const idx = (sourceY * tempCanvas.width + sourceX) * 4;
                    
                    if (pixels[idx + 3] > 0) {
                        r += pixels[idx];
                        g += pixels[idx + 1];
                        b += pixels[idx + 2];
                        a += pixels[idx + 3];
                        count++;
                    }
                }
            }
            
            if (count > 0 && a / count > 128) {
                r = Math.round(r / count);
                g = Math.round(g / count);
                b = Math.round(b / count);
                
                if (!(r > 240 && g > 240 && b > 240)) {
                    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                }
            }
        }
    }
    
    saveHistory();
    updatePreviews();
}

// Emoji to favicon
function emojiToFavicon(emoji) {
    selectedEmoji = emoji;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    const scale = 8;
    tempCanvas.width = canvasSize * scale;
    tempCanvas.height = canvasSize * scale;
    
    tempCtx.fillStyle = 'white';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    const fontSize = canvasSize === 16 ? 110 : 220;
    tempCtx.font = `${fontSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    tempCtx.textAlign = 'center';
    tempCtx.textBaseline = 'middle';
    
    const centerX = tempCanvas.width / 2;
    const centerY = tempCanvas.height / 2;
    tempCtx.fillText(emoji, centerX, centerY + fontSize * 0.05);
    
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const pixels = imageData.data;
    
    for (let y = 0; y < canvasSize; y++) {
        for (let x = 0; x < canvasSize; x++) {
            let r = 0, g = 0, b = 0, a = 0;
            let count = 0;
            
            for (let sy = 0; sy < scale; sy++) {
                for (let sx = 0; sx < scale; sx++) {
                    const sourceX = x * scale + sx;
                    const sourceY = y * scale + sy;
                    const idx = (sourceY * tempCanvas.width + sourceX) * 4;
                    
                    if (pixels[idx + 3] > 0) {
                        r += pixels[idx];
                        g += pixels[idx + 1];
                        b += pixels[idx + 2];
                        a += pixels[idx + 3];
                        count++;
                    }
                }
            }
            
            if (count > 0 && a / count > 50) {
                r = Math.round(r / count);
                g = Math.round(g / count);
                b = Math.round(b / count);
                
                if (!(r > 240 && g > 240 && b > 240)) {
                    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                }
            }
        }
    }
    
    saveHistory();
    updatePreviews();
}

// Emoji functions
function loadEmojiCategory(category) {
    currentEmojiCategory = category;
    currentEmojiPage = 0;
    displayEmojis();
}

function displayEmojis() {
    const grid = document.getElementById('emojiGrid');
    const emojis = emojiCategories[currentEmojiCategory];
    const start = currentEmojiPage * emojisPerPage;
    const end = Math.min(start + emojisPerPage, emojis.length);
    
    grid.innerHTML = '';
    
    for (let i = start; i < end; i++) {
        const btn = document.createElement('button');
        btn.className = 'emoji-btn';
        btn.textContent = emojis[i];
        btn.onclick = () => emojiToFavicon(emojis[i]);
        grid.appendChild(btn);
    }
    
    for (let i = end - start; i < emojisPerPage; i++) {
        const btn = document.createElement('button');
        btn.className = 'emoji-btn empty';
        grid.appendChild(btn);
    }
    
    const totalPages = Math.ceil(emojis.length / emojisPerPage);
    document.getElementById('emojiPageInfo').textContent = `${currentEmojiPage + 1} / ${totalPages}`;
}

function prevEmojiPage() {
    const emojis = emojiCategories[currentEmojiCategory];
    const totalPages = Math.ceil(emojis.length / emojisPerPage);
    
    if (currentEmojiPage > 0) {
        currentEmojiPage--;
        displayEmojis();
    }
}

function nextEmojiPage() {
    const emojis = emojiCategories[currentEmojiCategory];
    const totalPages = Math.ceil(emojis.length / emojisPerPage);
    
    if (currentEmojiPage < totalPages - 1) {
        currentEmojiPage++;
        displayEmojis();
    }
}

// Reset functions
function resetTextAndCanvas() {
    document.getElementById('textInput').value = '';
    clearCanvas();
}

function resetEmojiAndCanvas() {
    document.getElementById('emojiCategory').selectedIndex = 0;
    document.getElementById('emojiDirectInput').value = '';
    loadEmojiCategory('popular');
    clearCanvas();
}

// Preview updates
function updatePreviews() {
    const preview16 = document.getElementById('preview16').getContext('2d');
    preview16.imageSmoothingEnabled = false;
    preview16.clearRect(0, 0, 16, 16);
    
    const preview32 = document.getElementById('preview32').getContext('2d');
    preview32.imageSmoothingEnabled = false;
    preview32.clearRect(0, 0, 32, 32);
    
    const previewTab = document.getElementById('previewTab').getContext('2d');
    previewTab.imageSmoothingEnabled = false;
    previewTab.clearRect(0, 0, 16, 16);
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasSize;
    tempCanvas.height = canvasSize;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.imageSmoothingEnabled = false;
    
    for (let y = 0; y < canvasSize; y++) {
        for (let x = 0; x < canvasSize; x++) {
            const centerX = x * pixelSize + pixelSize / 2;
            const centerY = y * pixelSize + pixelSize / 2;
            const pixelData = ctx.getImageData(centerX, centerY, 1, 1).data;
            
            if (pixelData[3] > 0) {
                tempCtx.fillStyle = `rgba(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}, ${pixelData[3]/255})`;
                tempCtx.fillRect(x, y, 1, 1);
            }
        }
    }
    
    preview16.drawImage(tempCanvas, 0, 0, canvasSize, canvasSize, 0, 0, 16, 16);
    preview32.drawImage(tempCanvas, 0, 0, canvasSize, canvasSize, 0, 0, 32, 32);
    previewTab.drawImage(tempCanvas, 0, 0, canvasSize, canvasSize, 0, 0, 16, 16);
}

// Export functions
function downloadICO() {
    const link = document.createElement('a');
    link.download = 'favicon.ico';
    
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvasSize;
    exportCanvas.height = canvasSize;
    const exportCtx = exportCanvas.getContext('2d');
    
    for (let y = 0; y < canvasSize; y++) {
        for (let x = 0; x < canvasSize; x++) {
            const centerX = x * pixelSize + pixelSize / 2;
            const centerY = y * pixelSize + pixelSize / 2;
            const pixelData = ctx.getImageData(centerX, centerY, 1, 1).data;
            
            exportCtx.fillStyle = `rgba(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}, ${pixelData[3]/255})`;
            exportCtx.fillRect(x, y, 1, 1);
        }
    }
    
    exportCanvas.toBlob(blob => {
        link.href = URL.createObjectURL(blob);
        link.click();
    });
}

function downloadPNG() {
    const link = document.createElement('a');
    link.download = 'favicon.png';
    
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvasSize;
    exportCanvas.height = canvasSize;
    const exportCtx = exportCanvas.getContext('2d');
    
    for (let y = 0; y < canvasSize; y++) {
        for (let x = 0; x < canvasSize; x++) {
            const centerX = x * pixelSize + pixelSize / 2;
            const centerY = y * pixelSize + pixelSize / 2;
            const pixelData = ctx.getImageData(centerX, centerY, 1, 1).data;
            
            exportCtx.fillStyle = `rgba(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}, ${pixelData[3]/255})`;
            exportCtx.fillRect(x, y, 1, 1);
        }
    }
    
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
}

function downloadWebP() {
    const link = document.createElement('a');
    link.download = 'favicon.webp';
    
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvasSize;
    exportCanvas.height = canvasSize;
    const exportCtx = exportCanvas.getContext('2d');
    
    for (let y = 0; y < canvasSize; y++) {
        for (let x = 0; x < canvasSize; x++) {
            const centerX = x * pixelSize + pixelSize / 2;
            const centerY = y * pixelSize + pixelSize / 2;
            const pixelData = ctx.getImageData(centerX, centerY, 1, 1).data;
            
            exportCtx.fillStyle = `rgba(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}, ${pixelData[3]/255})`;
            exportCtx.fillRect(x, y, 1, 1);
        }
    }
    
    link.href = exportCanvas.toDataURL('image/webp');
    link.click();
}

function downloadAll() {
    alert('ZIP 패키지 다운로드 기능은 추가 구현이 필요합니다.');
}

function copyCode() {
    const code = document.getElementById('htmlCode').textContent;
    navigator.clipboard.writeText(code);
    alert('코드가 복사되었습니다!');
}

// Helper functions
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: 255
    } : null;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function hslToHex(h, s, l) {
    h = h / 360;
    s = s / 100;
    l = l / 100;
    
    let r, g, b;
    
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    
    return rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

function isKorean(text) {
    return /[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(text);
}

function getChosung(text) {
    let result = '';
    
    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        
        if (code >= 0xAC00 && code <= 0xD7A3) {
            const chosungIndex = Math.floor((code - 0xAC00) / 588);
            result += CHOSUNG_LIST[chosungIndex];
        } else if (code >= 0x3131 && code <= 0x314E) {
            result += text[i];
        } else {
            result += text[i];
        }
    }
    
    return result;
}

// Modal functions
function showHelp() {
    document.getElementById('helpModal').style.display = 'flex';
}

function showGuide() {
    document.getElementById('guideModal').style.display = 'flex';
}

function showExamples() {
    alert('갤러리 기능은 추가 구현이 필요합니다.');
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Mobile Menu Functions
function toggleMobileMenu() {
    const nav = document.querySelector('.mobile-nav');
    const overlay = document.querySelector('.mobile-nav-overlay');
    nav.classList.toggle('active');
    overlay.classList.toggle('active');
}

function closeMobileMenu() {
    const nav = document.querySelector('.mobile-nav');
    const overlay = document.querySelector('.mobile-nav-overlay');
    nav.classList.remove('active');
    overlay.classList.remove('active');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    init();
});
