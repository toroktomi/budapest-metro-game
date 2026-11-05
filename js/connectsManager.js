import { getStationsData } from './stationsManager.js';

let selectedNode = null;

export function getSelectedNode() {
    return selectedNode;
}

export function setSelectedNode(node) {
    selectedNode = node;
}

export function clearSelectedNode() {
    if (selectedNode) {
        selectedNode.classList.remove('selected');
        selectedNode = null;
    }
}
export function isValidConnection(startX, startY, endX, endY) {
    const stationsData = getStationsData();
    
    //horizontal,vertical, or 45° diagonal??
    const dx = Math.abs(endX - startX);
    const dy = Math.abs(endY - startY);
    
    //allow horizontal, vertical, or 45° diagonal movement
    if (dx !== 0 && dy !== 0 && dx !== dy) {
        return false;
    }
    
    //passes through any other station
    const stepCount = Math.max(dx, dy) / 10;
    const stepX = (endX - startX) / stepCount;
    const stepY = (endY - startY) / stepCount;
    
    for (let i = 1; i < stepCount; i++) {
        const checkX = startX + stepX * i;
        const checkY = startY + stepY * i;
        //   station at this position (excluding start and end)
        const hasStation = stationsData.some(station => {
            const stationX = station.x * 10 + 5;
            const stationY = station.y * 10 + 5;
            return Math.abs(stationX - checkX) < 2 && Math.abs(stationY - checkY) < 2 &&
                   !(Math.abs(stationX - startX) < 2 && Math.abs(stationY - startY) < 2) &&
                   !(Math.abs(stationX - endX) < 2 && Math.abs(stationY - endY) < 2);
        });
        
        if (hasStation) {
            return false;
        }
    }
    
    return true;
}
export function createConnection(startX, startY, endX, endY, connectionsGroup, color = '#333') {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', startX);
    line.setAttribute('y1', startY);
    line.setAttribute('x2', endX);
    line.setAttribute('y2', endY);
    line.setAttribute('class', 'connection_line');
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', '3'); 
    connectionsGroup.appendChild(line);
    return line;
}