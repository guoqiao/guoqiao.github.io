const state = {
    images: [] // Array of { id, file, src, width, height, offsetTop (overlap) }
};

// DOM Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const previewArea = document.getElementById('previewArea');
const controls = document.getElementById('controls');
const controlsBottom = document.getElementById('controlsBottom');
const downloadBtn = document.getElementById('downloadBtn');
const addMoreBtn = document.getElementById('addMoreBtn');
const resetBtn = document.getElementById('resetBtn');

const downloadBtnBottom = document.getElementById('downloadBtnBottom');
const addMoreBtnBottom = document.getElementById('addMoreBtnBottom');
const resetBtnBottom = document.getElementById('resetBtnBottom');

// Event Listeners
dropZone.addEventListener('click', () => fileInput.click());
addMoreBtn.addEventListener('click', () => fileInput.click());
addMoreBtnBottom.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', handleFiles);

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent global drop handler from firing twice
    dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
    }
});

resetBtn.addEventListener('click', () => {
    state.images = [];
    render();
    fileInput.value = '';
});

resetBtnBottom.addEventListener('click', () => {
    state.images = [];
    render();
    fileInput.value = '';
});

downloadBtn.addEventListener('click', generateAndDownload);
downloadBtnBottom.addEventListener('click', generateAndDownload);

function handleFiles(e) {
    if (e.target.files.length > 0) {
        processFiles(e.target.files);
    }
}

async function processFiles(fileList) {
    const files = Array.from(fileList);

    // Sort files by name naturally (so "img1" comes before "img10")
    files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    for (const file of files) {
        if (!file.type.startsWith('image/')) continue;

        try {
            const imgData = await loadImage(file);
            state.images.push({
                id: Date.now() + Math.random(),
                file: file,
                src: imgData.src,
                width: imgData.width,
                height: imgData.height,
                overlap: 0 // pixels to move UP (overlap previous)
            });
        } catch (err) {
            console.error("Error loading image", err);
        }
    }

    render();
}

function loadImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                resolve({
                    src: e.target.result,
                    width: img.width,
                    height: img.height
                });
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function render() {
    // Show/hide upload vs controls
    if (state.images.length > 0) {
        dropZone.classList.add('hidden');
        controls.classList.remove('hidden');
        controlsBottom.classList.remove('hidden');
    } else {
        dropZone.classList.remove('hidden');
        controls.classList.add('hidden');
        controlsBottom.classList.add('hidden');
        previewArea.innerHTML = '';
        return;
    }

    // Re-render list
    previewArea.innerHTML = '';

    state.images.forEach((imgObj, index) => {
        // Ensure trim properties exist
        if (typeof imgObj.trimTop === 'undefined') imgObj.trimTop = 0;
        if (typeof imgObj.trimBottom === 'undefined') imgObj.trimBottom = 0;

        const isFirst = index === 0;
        const isLast = index === state.images.length - 1;

        const card = document.createElement('div');
        card.className = 'image-card';
        card.dataset.index = index;
        card.dataset.id = imgObj.id;

        // Z-index: Inverted
        card.style.zIndex = 100 - index;

        // No extra card margin (Overlap handled by trim now)
        card.style.marginTop = '0px';

        // Right Toolbar HTML
        const upDisabled = isFirst ? 'disabled' : '';
        const downDisabled = isLast ? 'disabled' : '';

        const toolbarHtml = `
            <div class="right-toolbar">
                <button class="toolbar-btn up-btn" ${upDisabled} title="Move Up">▲</button>
                <button class="toolbar-btn delete-btn" title="Delete">🗑</button>
                <button class="toolbar-btn down-btn" ${downDisabled} title="Move Down">▼</button>
            </div>
        `;

        // Trim Handles
        const topTrimHtml = `<div class="trim-handle trim-handle-top" data-index="${index}"></div>`;
        const bottomTrimHtml = `<div class="trim-handle trim-handle-bottom" data-index="${index}"></div>`;

        // Image Styles for Trimming (Universal)
        const imgStyle = `margin-top: -${imgObj.trimTop || 0}px; margin-bottom: -${imgObj.trimBottom || 0}px`;

        card.innerHTML = `
            ${topTrimHtml}

            <div class="image-wrapper">
                <img src="${imgObj.src}" draggable="false" alt="Screenshot part ${index + 1}" style="${imgStyle}">
            </div>

            ${toolbarHtml}

            ${bottomTrimHtml}
        `;

        // Listeners for Toolbar
        card.querySelector('.up-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            moveImage(index, -1);
        });

        card.querySelector('.down-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            moveImage(index, 1);
        });

        card.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteImage(index);
        });

        // Trim Listeners (Universal)
        card.querySelector('.trim-handle-top').addEventListener('mousedown', (e) => handleTrimStart(e, index, 'top'));
        card.querySelector('.trim-handle-bottom').addEventListener('mousedown', (e) => handleTrimStart(e, index, 'bottom'));

        previewArea.appendChild(card);
    });
}

function moveImage(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= state.images.length) return;

    // Swap
    const temp = state.images[index];
    state.images[index] = state.images[newIndex];
    state.images[newIndex] = temp;

    // Note: Overlaps and Trims stick to the object, effectively moving with it.

    render();
}

function deleteImage(index) {
    state.images.splice(index, 1);
    render();
}

// --- Global Drag & Drop (File Upload) ---
document.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy'; // Indicate file copy
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
    }
});


// --- Reordering Logic ---
let draggedItemIndex = null;

function handleDragStart(e) {
    draggedItemIndex = Number(this.dataset.index);
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedItemIndex);
    e.dataTransfer.setData('application/x-long-screenshot-item', draggedItemIndex);
}

function handleDragOver(e) {
    e.preventDefault();
    if (e.dataTransfer.types.includes('Files')) {
        e.dataTransfer.dropEffect = 'copy';
    } else {
        e.dataTransfer.dropEffect = 'move';
    }
    return false;
}

function handleDragEnter(e) {
    e.preventDefault();
    if (draggedItemIndex !== null && this.dataset.index != draggedItemIndex) {
        this.classList.add('drag-over-target');
    }
}

function handleDragLeave(e) {
    if (this.contains(e.relatedTarget)) return;
    this.classList.remove('drag-over-target');
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over-target');

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        e.stopPropagation();
        processFiles(e.dataTransfer.files);
        return false;
    }

    const targetIndex = Number(this.dataset.index);
    if (draggedItemIndex !== null && draggedItemIndex !== targetIndex) {
        e.stopPropagation();
        const itemToMove = state.images[draggedItemIndex];
        state.images.splice(draggedItemIndex, 1);
        state.images.splice(targetIndex, 0, itemToMove);
        render();
    }
    return false;
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.image-card').forEach(card => card.classList.remove('drag-over-target'));
    draggedItemIndex = null;
}


// --- Trim Logic ---
let isTrimming = false;
let trimType = null; // 'top' or 'bottom'
let currentTrimIndex = null;
let trimStartY = 0;
let startTrimValue = 0;
let currentHandle = null;

function handleTrimStart(e, index, type) {
    e.preventDefault();
    e.stopPropagation();

    isTrimming = true;
    trimType = type;
    currentTrimIndex = index;
    trimStartY = e.clientY;
    currentHandle = e.target;
    currentHandle.classList.add('active');

    // Get current value
    const imgObj = state.images[index];
    startTrimValue = type === 'top' ? (imgObj.trimTop || 0) : (imgObj.trimBottom || 0);

    document.body.style.cursor = type === 'top' ? 's-resize' : 'n-resize';

    document.addEventListener('mousemove', handleTrimMove);
    document.addEventListener('mouseup', handleTrimEnd);
}

function handleTrimMove(e) {
    if (!isTrimming) return;

    const deltaY = e.clientY - trimStartY;
    let newTrim = 0;

    const imgObj = state.images[currentTrimIndex];
    if (!imgObj) return;

    if (trimType === 'top') {
        newTrim = startTrimValue + deltaY;
    } else {
        newTrim = startTrimValue - deltaY;
    }

    if (newTrim < 0) newTrim = 0;
    const maxTrim = imgObj.height - 20;
    if (newTrim > maxTrim) newTrim = maxTrim;

    if (trimType === 'top') {
        imgObj.trimTop = newTrim;
    } else {
        imgObj.trimBottom = newTrim;
    }

    const card = document.querySelector(`.image-card[data-index="${currentTrimIndex}"]`);
    if (card) {
        const img = card.querySelector('img');
        if (img) {
            if (trimType === 'top') {
                img.style.marginTop = `-${newTrim}px`;
            } else {
                img.style.marginBottom = `-${newTrim}px`;
            }
        }
    }
}

function handleTrimEnd(e) {
    isTrimming = false;
    currentTrimIndex = null;
    trimType = null;

    if (currentHandle) {
        currentHandle.classList.remove('active');
        currentHandle = null;
    }

    document.body.style.cursor = 'default';
    document.removeEventListener('mousemove', handleTrimMove);
    document.removeEventListener('mouseup', handleTrimEnd);
}

// --- Overlap Logic REMOVED ---


async function generateAndDownload() {
    if (state.images.length === 0) return;

    const downloadBtn = document.getElementById('downloadBtn');
    const originalText = downloadBtn.innerText;
    downloadBtn.innerText = "Generating...";
    downloadBtn.disabled = true;

    try {
        const loadedImages = await Promise.all(state.images.map(imgObj => loadImageBlob(imgObj.src)));

        const processedImages = state.images.map((imgObj, i) => {
            const domCard = document.querySelector(`.image-card[data-id="${imgObj.id}"]`);
            const domImg = domCard ? domCard.querySelector('img') : null;

            let scale = 1;
            if (domImg) {
                const rect = domImg.getBoundingClientRect();
                if (rect.width > 0) {
                    scale = imgObj.width / rect.width;
                }
            }

            const trimTop = imgObj.trimTop || 0;
            const trimBottom = imgObj.trimBottom || 0;

            const scaledTrimTop = Math.round(trimTop * scale);
            const scaledTrimBottom = Math.round(trimBottom * scale);

            return {
                ...imgObj,
                imgElem: loadedImages[i],
                scaledTrimTop: scaledTrimTop,
                scaledTrimBottom: scaledTrimBottom
            };
        });

        const maxWidth = Math.max(...processedImages.map(img => img.width));

        // Total = Sum(Heights - Trims)
        const totalHeight = processedImages.reduce((acc, img, i) => {
            const effectiveHeight = img.height - img.scaledTrimTop - img.scaledTrimBottom;
            return acc + effectiveHeight;
        }, 0);

        const canvas = document.createElement('canvas');
        canvas.width = maxWidth;
        canvas.height = totalHeight;
        const ctx = canvas.getContext('2d');

        // Fill with white background to handle transparency/shadows
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let currentY = 0;

        for (let i = 0; i < processedImages.length; i++) {
            const imgItem = processedImages[i];

            const sWidth = imgItem.width;
            const sHeight = imgItem.height - imgItem.scaledTrimTop - imgItem.scaledTrimBottom;
            const sy = imgItem.scaledTrimTop;

            ctx.drawImage(
                imgItem.imgElem,
                0, sy, sWidth, sHeight,
                0, currentY, sWidth, sHeight
            );

            currentY += sHeight;
        }

        const link = document.createElement('a');
        link.download = `long-screenshot-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

    } catch (err) {
        console.error("Error generating image:", err);
        alert("Failed to generate image. See console.");
    } finally {
        downloadBtn.innerText = originalText;
        downloadBtn.disabled = false;
    }
}

function loadImageBlob(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}
