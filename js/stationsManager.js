let stationsData = [];
let linesData = [];

export async function loadGameData() {
    try {
        const [linesResponse, stationsResponse] = await Promise.all([
            fetch('data/lines.json'),
            fetch('data/stations.json')
        ]);

        linesData = await linesResponse.json();
        stationsData = await stationsResponse.json();

        return { linesData, stationsData };
    } catch (error) {
        console.error('Error loading game data:', error);
        throw error;
    }
}


export function getStationsData() {
    return stationsData;
}

export function getLinesData() {
    return linesData;
}

export function renderStations(nodesGroup, stations, lines) {
    // colors base on lines
    const stationColors = {};
    lines.forEach(line => {
        stationColors[line.start] = line.color;
    });

    stations.forEach(station => {
        const svgX = station.x * 10 + 5;
        const svgY = station.y * 10 + 5;
        //  node
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', svgX);
        circle.setAttribute('cy', svgY);
        circle.setAttribute('r', 4);
        circle.setAttribute('class', 'node');
        circle.setAttribute('data-x', svgX);
        circle.setAttribute('data-y', svgY);
        circle.setAttribute('data-id', station.id);
        circle.setAttribute('data-type', station.type);

        // line color -> starting station
        if (stationColors[station.id]) {
            circle.setAttribute('data-line-color', stationColors[station.id]);
        }

        // grey if no color
        circle.setAttribute('fill', stationColors[station.id] || '#666');

        //  text
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', svgX);
        text.setAttribute('y', svgY);
        text.setAttribute('class', 'node_text');
        text.textContent = station.type;

        nodesGroup.appendChild(circle);
        nodesGroup.appendChild(text);
        //train station indicator if  train station
        if (station.train) {
            const trainIndicator = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            trainIndicator.setAttribute('x', svgX + 2);
            trainIndicator.setAttribute('y', svgY + 2);
            trainIndicator.setAttribute('width', 3);
            trainIndicator.setAttribute('height', 3);
            trainIndicator.setAttribute('class', 'train_indicator');
            trainIndicator.setAttribute('fill', '#2196F3');
            trainIndicator.setAttribute('stroke', '#fff');
            trainIndicator.setAttribute('stroke-width', '0.3');
            trainIndicator.setAttribute('rx', '0.5');
            nodesGroup.appendChild(trainIndicator);

            const trainEmoji = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            trainEmoji.setAttribute('x', svgX + 3.5);
            trainEmoji.setAttribute('y', svgY + 4.5);
            trainEmoji.setAttribute('class', 'train_emoji');
            trainEmoji.setAttribute('font-size', '2.5');
            trainEmoji.setAttribute('text-anchor', 'middle');
            trainEmoji.textContent = '🚂';
            nodesGroup.appendChild(trainEmoji);
        }
    });
}