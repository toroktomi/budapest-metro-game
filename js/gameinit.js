//init
const container = document.querySelector('#grid_container');
const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg.setAttribute('viewBox', '0 0 100 100');

// csoportok csinálása hogy lehessen rendezni mi mögött mi van
const connectionsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
const nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');


export { container, svg, connectionsGroup, nodesGroup };

// inti grid és a kov elementeket
export function initializeGame() {
    createGrid();
    createRiver();
    
    // appeand SVG
    svg.appendChild(connectionsGroup);
    svg.appendChild(nodesGroup);
    container.appendChild(svg);
}

function createGrid() {
    for (let y = 0; y <= 100; y += 10) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', '0');
        line.setAttribute('y1', y);
        line.setAttribute('x2', '100');
        line.setAttribute('y2', y);
        line.setAttribute('class', 'grid_line');
        svg.appendChild(line);
    }

    for (let x = 0; x <= 100; x += 10) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x);
        line.setAttribute('y1', '0');
        line.setAttribute('x2', x);
        line.setAttribute('y2', '100');
        line.setAttribute('class', 'grid_line');
        svg.appendChild(line);
    }
}

function createRiver() {
    const river = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    river.setAttribute('class', 'river');
    river.setAttribute('d', 'M60,0 L60,30 L50,40 L50,70 L60,80 L70,90 L70,100');
    svg.appendChild(river);
}