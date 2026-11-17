const container = document.getElementById('block-container');
const template = document.getElementById('block-template');

const length = 4;
const width = 4;
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
]

var isDragging = false;
var currentWord = new Set();
var board = [];

for (let i = 0; i < length * width; i++) {
    const clone = template.content.cloneNode(true);
    const item = clone.firstElementChild;
    let randomLetter = letters[Math.floor(Math.random() * letters.length)];
    const tile = { ...randomLetter, index: i };

    item.querySelector('.block-text').textContent = tile.letter;
    container.appendChild(clone);

    item.addEventListener('pointerdown', (e) => {
        isDragging = true;
        toggleSelection(tile)
    });

    item.addEventListener('pointerenter', (e) => {
        let lastTile = [...currentWord].at(-1)
        if (isDragging && isAdjacent(tile, lastTile)) toggleSelection(tile)
    });

    board.push(tile)
}

window.addEventListener('pointerup', () => {
    isDragging = false;
    let word = [...currentWord].map(block => block.letter).join('').toLocaleUpperCase()
    if (word.length < 2) return clearSelection();
    submitWord(word)
});

function toggleSelection(tile) {
    if (currentWord.has(tile)) {
        let = secondLastTile = [...currentWord].at(-2)
        let = lastTile = [...currentWord].at(-1)
        if (secondLastTile === tile) {
            console.log(board)
            console.log(`Removed ${board[board.indexOf(lastTile)].letter.toLocaleUpperCase()}`);
            currentWord.delete(board[board.indexOf(lastTile)]);
        }
    } else {
        console.log(`Added ${tile.letter.toLocaleUpperCase()}`);
        currentWord.add(tile);
    }

    updateBorders()
}

function isAdjacent(tile1, tile2) {
    // Turn into 0 indexed coords
    let tile1coord = [Math.floor(tile1.index / length), Math.floor(tile1.index % width)]
    let tile2coord = [Math.floor(tile2.index / length), Math.floor(tile2.index % width)]

    if (tile1coord == tile2coord) return false;
    if (Math.abs(tile2coord[0] - tile1coord[0]) <= 1 && Math.abs(tile2coord[1] - tile1coord[1]) <= 1) return true;

    return false;
}

function submitWord(word) {
    console.log(word)
    clearSelection()
}

function clearSelection() {
    currentWord.clear();
    updateBorders()
}

function updateBorders() {
    const activeIndices = new Set([...currentWord].map(tile => tile.index));
    for (let i = 0; i < container.children.length; i++) {
        const block = container.children[i];
        block.classList.toggle('selected', activeIndices.has(i));
    }
}