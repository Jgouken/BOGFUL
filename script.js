const container = document.getElementById('block-container') || document.querySelector('.block-container');
const template = document.getElementById('block-template');
const wordList = document.getElementById('wordList');
const length = 4;
const width = 4;

const svgNS = "http://www.w3.org/2000/svg";
const svgOverlay = document.createElementNS(svgNS, "svg");
svgOverlay.classList.add("drag-line-overlay");
const dragLine = document.createElementNS(svgNS, "polyline");
dragLine.classList.add("drag-line");
svgOverlay.appendChild(dragLine);

const drawer = document.getElementById('rightDrawer');
document.getElementById('openDrawer').addEventListener('click', () => {
    if (drawer.open) {
        drawer.close();
    } else {
        drawer.show();
    }
});
document.getElementById('closeDrawer').addEventListener('click', () => drawer.close());

const letters = [
    { letter: "A", value: 1 },
    { letter: "B", value: 3 },
    { letter: "C", value: 3 },
    { letter: "D", value: 2 },
    { letter: "E", value: 1 },
    { letter: "F", value: 4 },
    { letter: "G", value: 2 },
    { letter: "H", value: 4 },
    { letter: "I", value: 1 },
    { letter: "J", value: 8 },
    { letter: "K", value: 5 },
    { letter: "L", value: 1 },
    { letter: "M", value: 3 },
    { letter: "N", value: 1 },
    { letter: "O", value: 1 },
    { letter: "P", value: 3 },
    { letter: "Qu", value: 10 },
    { letter: "R", value: 1 },
    { letter: "S", value: 1 },
    { letter: "T", value: 1 },
    { letter: "U", value: 1 },
    { letter: "V", value: 4 },
    { letter: "W", value: 4 },
    { letter: "X", value: 8 },
    { letter: "Y", value: 4 },
    { letter: "Z", value: 10 }
];

const letterBagValues = [
    { letter: "E", amount: 11, letterIndex: 4 },
    { letter: "T", amount: 9, letterIndex: 19 },
    { letter: "O", amount: 7, letterIndex: 14 },
    { letter: "A", amount: 6, letterIndex: 0 },
    { letter: "I", amount: 6, letterIndex: 8 },
    { letter: "N", amount: 6, letterIndex: 13 },
    { letter: "S", amount: 6, letterIndex: 18 },
    { letter: "H", amount: 5, letterIndex: 7 },
    { letter: "R", amount: 5, letterIndex: 17 },
    { letter: "L", amount: 4, letterIndex: 11 },
    { letter: "D", amount: 3, letterIndex: 3 },
    { letter: "U", amount: 3, letterIndex: 20 },
    { letter: "W", amount: 3, letterIndex: 22 },
    { letter: "Y", amount: 3, letterIndex: 24 },
    { letter: "B", amount: 2, letterIndex: 1 },
    { letter: "C", amount: 2, letterIndex: 2 },
    { letter: "F", amount: 2, letterIndex: 5 },
    { letter: "G", amount: 2, letterIndex: 6 },
    { letter: "M", amount: 2, letterIndex: 12 },
    { letter: "P", amount: 2, letterIndex: 15 },
    { letter: "V", amount: 2, letterIndex: 21 },
    { letter: "J", amount: 1, letterIndex: 9 },
    { letter: "K", amount: 1, letterIndex: 10 },
    { letter: "Qu", amount: 1, letterIndex: 16 },
    { letter: "X", amount: 1, letterIndex: 23 },
    { letter: "Z", amount: 1, letterIndex: 25 }
];

var letterBag = [];
var wordSet = null;
var pointerPos = null;
var isDragging = false;
var currentWord = new Set();
var book = new Set();
var wordEntries = new Map();
var wordPreviewTimer = null;
var previewTiles = [];
var board = [];

async function loadDictionary() {
    const response = await fetch('./words.txt');
    const text = await response.text();

    const words = text.split(/\r?\n/);
    wordSet = new Set(words.map(w => w.trim().toLowerCase()).filter(Boolean));
}

function setLetterBag() {
    letterBag = [];
    letterBagValues.forEach((lbv) => {
        for (let i = 0; i < lbv.amount; i++) {
            letterBag.push(letters[lbv.letterIndex]);
        }
    });
}

loadDictionary();
setLetterBag();

for (let i = 0; i < length * width; i++) {
    const clone = template.content.cloneNode(true);
    const item = clone.firstElementChild;

    let randomLetter = letterBag[Math.floor(Math.random() * letterBag.length)];
    const tile = { ...randomLetter, index: i, element: item };

    item.querySelector('.block-text').textContent = tile.letter;
    container.appendChild(clone);

    item.addEventListener('pointerdown', (e) => {
        if (item.hasPointerCapture(e.pointerId)) {
            item.releasePointerCapture(e.pointerId);
        }
        isDragging = true;
        updatePointerPos(e);
        toggleSelection(tile);
    });

    item.addEventListener('pointerenter', (e) => {
        let lastTile = [...currentWord].at(-1);
        if (isDragging && isAdjacent(tile, lastTile)) {
            toggleSelection(tile);
        }
    });

    board.push(tile);
}

container.appendChild(svgOverlay);

window.addEventListener('pointerup', () => {
    if (!isDragging) return;
    isDragging = false;
    pointerPos = null;

    let word = [...currentWord].map(block => block.letter).join('').toLocaleUpperCase();
    if (word.length < 3) {
        clearSelection();
        return;
    }
    submitWord(word);
});

function toggleSelection(tile) {
    if (currentWord.has(tile)) {
        let secondLastTile = [...currentWord].at(-2);
        let lastTile = [...currentWord].at(-1);
        if (secondLastTile === tile) {
            currentWord.delete(lastTile);
        }
    } else {
        currentWord.add(tile);
    }

    let word = [...currentWord].map(block => block.letter).join(' ').toLocaleUpperCase();
    document.getElementById("word-display").innerText = word
    updateBorders();
    updateVectorLine();
}

function isAdjacent(tile1, tile2) {
    if (!tile1 || !tile2) return false;
    let r1 = Math.floor(tile1.index / length);
    let c1 = tile1.index % width;
    let r2 = Math.floor(tile2.index / length);
    let c2 = tile2.index % width;

    if (r1 === r2 && c1 === c2) return false;
    return Math.abs(r2 - r1) <= 1 && Math.abs(c2 - c1) <= 1;
}

function isValidWord(word) {
    if (!wordSet) return false;
    return wordSet.has(word.trim().toLowerCase());
}

function submitWord(word) {
    let wordArray = [...currentWord]
    let score = wordArray.reduce((sum, letter) => sum + letter.value, 0);
    let bookObject = {
        letters: wordArray,
        word,
        score
    }

    if (book.has(JSON.stringify(bookObject))) {
        console.log(`Duplicate word path: ${word}`);
        board.forEach(tile => {
            if (currentWord.has(tile)) tile.element.style.backgroundColor = "rgb(100, 93, 0)";
        });
        document.getElementById("word-display").innerText = `${word} 🔁`;
    } else if (isValidWord(word)) {
        console.log(`Valid word: ${word}`);
        board.forEach(tile => {
            if (currentWord.has(tile)) tile.element.style.backgroundColor = "rgb(0, 112, 6)";
        });
        document.getElementById("word-display").innerText = `${word} ✅`
        addWordToBook(bookObject);
        book.add(JSON.stringify(bookObject));
    } else {
        console.log(`Invalid word: ${word}`);
        board.forEach(tile => {
            if (currentWord.has(tile)) tile.element.style.backgroundColor = "rgb(100, 0, 0)";
        });
        document.getElementById("word-display").innerText = `${word} ❌`
    }

    clearSelection();
}

function clearSelection() {
    setTimeout(() => {
        board.forEach(tile => {
            tile.element.style.backgroundColor = "var(--no-streak)";
        });
    }, 250)
    currentWord.clear();
    updateBorders();
    updateVectorLine();
}

function updateBorders() {
    board.forEach(tile => {
        tile.element.classList.toggle('selected', currentWord.has(tile));
    });
}

window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    updatePointerPos(e);
    updateVectorLine();
});

function updatePointerPos(e) {
    const rect = container.getBoundingClientRect();
    pointerPos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function updateVectorLine(tiles = [...currentWord], includePointer = true) {
    if (tiles.length === 0) {
        dragLine.setAttribute("points", "");
        return;
    }

    const containerRect = container.getBoundingClientRect();
    svgOverlay.setAttribute("width", containerRect.width);
    svgOverlay.setAttribute("height", containerRect.height);
    svgOverlay.setAttribute("viewBox", `0 0 ${containerRect.width} ${containerRect.height}`);

    const points = tiles.map(tile => {
        const blockRect = tile.element.getBoundingClientRect();
        const centerX = (blockRect.left - containerRect.left) + (blockRect.width / 2);
        const centerY = (blockRect.top - containerRect.top) + (blockRect.height / 2);
        return `${centerX},${centerY}`;
    });

    if (includePointer && isDragging && pointerPos) {
        points.push(`${pointerPos.x},${pointerPos.y}`);
    }

    dragLine.setAttribute("points", points.join(" "));
}

function addWordToBook(bookObject) {
    const wordKey = bookObject.word.toLocaleUpperCase();
    let entry = wordEntries.get(wordKey);
    if (!entry) {
        const p = document.createElement('p');
        const score = document.createElement('span');
        const multiplier = document.createElement('span');
        p.textContent = bookObject.word;
        p.appendChild(score);
        p.appendChild(multiplier);
        wordList.appendChild(p);

        entry = {
            paths: [],
            multiplier,
            score
        };
        wordEntries.set(wordKey, entry);

        p.addEventListener('mouseenter', () => showFoundWord(entry));
        p.addEventListener('mouseleave', clearFoundWord);
    }

    entry.paths.push(bookObject.letters.map((tile) => tile.index));
    entry.score.textContent = ` - ${bookObject.score}`;
    entry.multiplier.textContent = entry.paths.length > 1 ? ` x${entry.paths.length}` : "";

    const totalScore = document.getElementById('totalScore');
    if (totalScore) totalScore.textContent = String((Number(totalScore.textContent) || 0) + bookObject.score);

    const setsFound = document.getElementById('setsFound');
    if (setsFound) setsFound.textContent = String((Number(setsFound.textContent) || 0) + 1);
}

function showFoundWord(entry) {
    clearFoundWord();
    let pathIndex = 0;
    const showPath = () => {
        previewTiles.forEach((tile) => {
            tile.element.style.backgroundColor = "var(--no-streak)";
        });
        const wordTiles = entry.paths[pathIndex].map((index) => board[index]);
        wordTiles.forEach((tile) => {
            tile.element.style.backgroundColor = "rgb(0, 112, 6)";
        });
        previewTiles = wordTiles;
        updateVectorLine(wordTiles, false);
        pathIndex = (pathIndex + 1) % entry.paths.length;
    };

    showPath();
    if (entry.paths.length > 1) {
        wordPreviewTimer = setInterval(showPath, 700);
    }
}

function clearFoundWord() {
    if (wordPreviewTimer !== null) {
        clearInterval(wordPreviewTimer);
        wordPreviewTimer = null;
    }
    previewTiles.forEach((tile) => {
        tile.element.style.backgroundColor = "var(--no-streak)";
    });
    previewTiles = [];
    updateVectorLine([]);
}