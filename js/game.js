import { getSelectedNode, setSelectedNode, clearSelectedNode, isValidConnection, createConnection } from './connectsManager.js';
import { isValidStationForCurrentCard } from './cardManager.js';

export function handleNodeClick(event, csoportKapcs, aktKartya, kezdoId, korSzakasz, osszSzakasz, szinFunc, vonatFrissit, kesz) {
    const node = event.target;
    const nodeId = parseInt(node.getAttribute('data-id'));
    const tipus = node.getAttribute('data-type');

    if(getSelectedNode() === null) {
        // elso kattintas -> kivalaszt egy allomast
        let joKezdo = false;
        if(korSzakasz.length === 0) {
            // elso szakasz
            if(nodeId === kezdoId) joKezdo = true;
            else return;
        } else {
            // tovabbi szakaszok
            const vegpontok = getVegpontok(korSzakasz);
            if(vegpontok.has(nodeId)) joKezdo = true;
            else return;
        }
        if(joKezdo) {
            setSelectedNode(node);
            node.classList.add('selected');
            ervenyesekKiemel(node, aktKartya, korSzakasz, osszSzakasz, csoportKapcs);
        }
    } else if(getSelectedNode() === node) {
        // ugyanarra kattintott->torol
        kiemelesTorol();
        clearSelectedNode();
    } else {
        // masik allomas ->megprobaljuk osszekotni
        if(!isValidStationForCurrentCard(tipus)) return;

        const x1 = parseFloat(getSelectedNode().getAttribute('data-x'));
        const y1 = parseFloat(getSelectedNode().getAttribute('data-y'));
        const x2 = parseFloat(node.getAttribute('data-x'));
        const y2 = parseFloat(node.getAttribute('data-y'));
        const id1 = parseInt(getSelectedNode().getAttribute('data-id'));
        const id2 = nodeId;

        const latogatott = new Set();
        korSzakasz.forEach(sz => {
            latogatott.add(sz.startId);
            latogatott.add(sz.endId);
        });
        if(latogatott.has(id2)) return clearSelectedNode();

        // parhuzamos ellenorzes jelenlegi korben
        const vanIlyenMar = korSzakasz.some(sz =>
            (sz.startId === id1 && sz.endId === id2) || (sz.startId === id2 && sz.endId === id1)
        );
        if(vanIlyenMar) return clearSelectedNode();

        // parhuzamos ellenorzes korabbi korokban
        const voltMarIlyen = osszSzakasz.some(sz =>
            (sz.startId === id1 && sz.endId === id2) || (sz.startId === id2 && sz.endId === id1)
        );
        if(voltMarIlyen) return clearSelectedNode();

        if(!isValidConnection(x1, y1, x2, y2)) return clearSelectedNode();
        if(keresztezes(x1, y1, x2, y2, csoportKapcs)) return clearSelectedNode();

        createConnection(x1, y1, x2, y2, csoportKapcs, szinFunc());
        korSzakasz.push({ startId: id1, endId: id2 });

        if(vonatFrissit) {
            vonatFrissit(id1);
            vonatFrissit(id2);
        }

        kiemelesTorol();
        if(kesz) kesz();
        clearSelectedNode();
    }
}

function ervenyesekKiemel(kivalasztott, aktKartya, korSzakasz, osszSzakasz, csoportKapcs) {
    const x1 = parseFloat(kivalasztott.getAttribute('data-x'));
    const y1 = parseFloat(kivalasztott.getAttribute('data-y'));
    const id1 = parseInt(kivalasztott.getAttribute('data-id'));

    const latogatott = new Set();
    korSzakasz.forEach(sz => {
        latogatott.add(sz.startId);
        latogatott.add(sz.endId);
    });

    const osszesNode = document.querySelectorAll('.node');




    osszesNode.forEach(n => {
        const nId = parseInt(n.getAttribute('data-id'));
        const nTipus = n.getAttribute('data-type');
        const nx = parseFloat(n.getAttribute('data-x'));
        const ny = parseFloat(n.getAttribute('data-y'));

        if(nId === id1) return;
        if(latogatott.has(nId)) return;
        if(!isValidStationForCurrentCard(nTipus)) return;

        // parhuzamos check jelenlegi
        const vanMar = korSzakasz.some(sz =>
            (sz.startId === id1 && sz.endId === nId) ||
            (sz.startId === nId && sz.endId === id1)
        );
        if(vanMar) return;

        // parhuzamos check korabbi
        const voltMar = osszSzakasz.some(sz =>
            (sz.startId === id1 && sz.endId === nId) ||
            (sz.startId === nId && sz.endId === id1)
        );
        if(voltMar) return;

        if(!isValidConnection(x1, y1, nx, ny)) return;
        if(keresztezes(x1, y1, nx, ny, csoportKapcs)) return;

        n.classList.add('valid_destination');
    });
}
function kiemelesTorol() {
    const kiemelt = document.querySelectorAll('.valid_destination');
    kiemelt.forEach(n => {
        n.classList.remove('valid_destination');
    });
}

function keresztezes(x1, y1, x2, y2, csoportKapcs) {
    const meglevoVonalak = csoportKapcs.querySelectorAll('line');

    for(let vonal of meglevoVonalak) {
        const x3 = parseFloat(vonal.getAttribute('x1'));
        const y3 = parseFloat(vonal.getAttribute('y1'));
        const x4 = parseFloat(vonal.getAttribute('x2'));
        const y4 = parseFloat(vonal.getAttribute('y2'));

        if(metszesVan(x1, y1, x2, y2, x3, y3, x4, y4)) {
            // vegpont check
            const vegpontnal =
                (Math.abs(x1 - x3) < 0.1 && Math.abs(y1 - y3) < 0.1) ||
                (Math.abs(x1 - x4) < 0.1 && Math.abs(y1 - y4) < 0.1) ||
                (Math.abs(x2 - x3) < 0.1 && Math.abs(y2 - y3) < 0.1) ||
                (Math.abs(x2 - x4) < 0.1 && Math.abs(y2 - y4) < 0.1);

            if(!vegpontnal) {
                return true;
            }
        }
    }
    return false;
}

function metszesVan(x1, y1, x2, y2, x3, y3, x4, y4) {
    const det = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3);

    if(Math.abs(det) < 0.0001) {
        return false;
    }

    const t = ((x3 - x1) * (y4 - y3) - (y3 - y1) * (x4 - x3)) / det;
    const u = ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) / det;

    return (t >= 0 && t <= 1 && u >= 0 && u <= 1);
}

function getVegpontok(szakaszok) {
    if(szakaszok.length === 0) return new Set();

    const kapcsolatok = {};
    szakaszok.forEach(sz => {
        if(!kapcsolatok[sz.startId]) kapcsolatok[sz.startId] = 0;
        if(!kapcsolatok[sz.endId]) kapcsolatok[sz.endId] = 0;
        kapcsolatok[sz.startId]++;
        kapcsolatok[sz.endId]++;
    });

    const vegek = new Set();
    Object.keys(kapcsolatok).forEach(id => {
        if(kapcsolatok[id] === 1) {
            vegek.add(parseInt(id));
        }
    });
    return vegek;
}