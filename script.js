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

for (let i = 0; i < length * width; i++) {
    const clone = template.content.cloneNode(true);
    const item = clone.firstElementChild;
    let randomLetter = letters[Math.floor(Math.random() * letters.length)];
    const tile = { ...randomLetter, index: i };

    item.querySelector('.block-text').textContent = tile.letter;
    container.appendChild(clone);

    item.addEventListener('pointerdown', (e) => {
        console.log(`Pointer Down on ${tile.letter}`);
        currentWord.add(tile);
        isDragging = true;
        updateBorders()
    });

    item.addEventListener('pointerenter', (e) => {
        if (isDragging) {
            if (currentWord.has(tile)) {
                if ([...currentWord].at(-1) === tile) {
                    console.log(`Removed ${tile.letter}`);
                    currentWord.delete(tile);
                }
            } else {
                console.log(`Pointer Enter on ${tile.letter}`);
                currentWord.add(tile);
            }
            updateBorders()
        }
    });
}

window.addEventListener('pointerup', () => {
    isDragging = false;
    console.log([...currentWord].map(block => block.letter).join(''))
    currentWord.clear();
    updateBorders()
});

function updateBorders() {
    const activeIndices = new Set([...currentWord].map(tile => tile.index));
    for (let i = 0; i < container.children.length; i++) {
        const block = container.children[i];
        block.classList.toggle('selected', activeIndices.has(i));
    }
}