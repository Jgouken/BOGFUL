const container = document.getElementById('block-container');
const template = document.getElementById('block-template');

const length = 4;
const width = 4;

for (i = 0; i < length * width; i++) {
    const clone = template.content.cloneNode(true);
    clone.querySelector('.block-text').textContent = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    container.appendChild(clone);
}