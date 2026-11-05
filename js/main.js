import { getPlayerName, displayPlayerName } from './playerNameGetter.js';
import { startTimer, stopTimer } from './timer.js';
import { initializeGame, connectionsGroup, nodesGroup } from './gameinit.js';
import { loadGameData, renderStations } from './stationsManager.js';
import { drawCard, getCurrentCard, shuffleDeck } from './cardManager.js';

// jatek valtozok
let kor = 1;
let lap = 1;
let kartya = null;
let kezdoAll = null;
let aktualisVonal = null;
let lines = [];
let stations = [];
let jelenlegiSzakaszok = [];
let osszesVonalSzakasz = [];
let pontok = [];
let vonatAll = [];
let vonalRendezes = [];
let vege = false;

// game init
async function gameInit() {
    displayPlayerName(getPlayerName());
    startTimer();
    initializeGame();

    const drawBtn = document.querySelector('#draw_card_btn');
    const skipBtn = document.querySelector('#skip_turn_btn');
    drawBtn.addEventListener('click', kartaHuzas);
    skipBtn.addEventListener('click', korSkip);

    try {
        const data = await loadGameData();
        lines = data.linesData;
        stations = data.stationsData;
        // vonalak keverese
        vonalRendezes = [...lines];
        for(let i = vonalRendezes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [vonalRendezes[i], vonalRendezes[j]] = [vonalRendezes[j], vonalRendezes[i]];
        }
        renderStations(nodesGroup, stations, lines);
        korIndikatorok();
        pontokFrissit();
        ujKor();
        nodeClickSetup();
    } catch(err) {
        console.error('hiba:', err);
    }
}

gameInit();

const vonalSzin = () => aktualisVonal ? aktualisVonal.color : '#333';

function nodeClickSetup() {
    import('./game.js').then(m => {
        nodesGroup.querySelectorAll('.node').forEach(n => {
            n.addEventListener('click', ev => {
                if(vege) return;
                m.handleNodeClick(
                    ev, connectionsGroup, getCurrentCard(),
                    kezdoAll ? kezdoAll.id : null,
                    jelenlegiSzakaszok, osszesVonalSzakasz, vonalSzin, vonatUpdate, szakaszKesz
                );
            });
        });
    });
}

function szakaszKesz() {
    if(lap >= 8) {
        pontok.push(korPontSzamol());
        pontokFrissit();
        const db = document.querySelector('#draw_card_btn');
        const sb = document.querySelector('#skip_turn_btn');
        db.disabled = true;
        sb.disabled = true;
        setTimeout(() => {
            db.disabled = false;
            sb.disabled = false;
            kor++;
            ujKor();
        }, 100);
    } else {
        kartya = drawCard();
        kartyaKiir(kartya);
        lap++;
        lapKiir();
    }
}

function vonatUpdate(allId) {
    const all = stations.find(s => s.id === allId);
    if(all && all.train && !vonatAll.includes(allId)) {
        vonatAll.push(allId);
        pontokFrissit();
    }
}

function ujKor() {
    if(kor > 4) {
        jatekVege();
        return;
    }
    lap = 0;
    jelenlegiSzakaszok = [];
    shuffleDeck();
    aktualisVonal = vonalRendezes[kor - 1];
    kezdoAll = stations.find(s => s.id === aktualisVonal.start);
    kartya = drawCard();
    lap = 1;

    // clear selection
    import('./connectsManager.js').then(m => {
        m.clearSelectedNode();
    });

    korKiir();
    kartyaKiir(kartya);
    lapKiir();
    kezdoKiemel();
}

function kartaHuzas() {
    if(lap >= 8) return;
    kartya = drawCard();
    kartyaKiir(kartya);
    lap++;
    lapKiir();
}

function korSkip() {
    if(lap > 8) return;
    lap++;
    lapKiir();
    if(lap > 8) {
        pontok.push(korPontSzamol());
        pontokFrissit();
        const db = document.querySelector('#draw_card_btn');
        const sb = document.querySelector('#skip_turn_btn');
        db.disabled = true;
        sb.disabled = true;
        setTimeout(() => {
            db.disabled = false;
            sb.disabled = false;
            kor++;
            ujKor();
        }, 100);
    }
}

function korIndikatorok() {
    document.querySelectorAll('.round_indicator').forEach((ind, idx) => {
        const vonal = vonalRendezes[idx];
        if(vonal) {
            ind.style.backgroundColor = vonal.color;
            ind.title = vonal.name;
        }
    });
}

function korKiir() {
    const korEl = document.querySelector('#round_value');
    const startEl = document.querySelector('#start_station');
    if(korEl) korEl.textContent = `${kor}/4`;
    if(startEl && kezdoAll && aktualisVonal) {
        startEl.textContent = `Station ${kezdoAll.id} (${aktualisVonal.name})`;
        startEl.style.color = aktualisVonal.color;
        startEl.style.fontWeight = 'bold';
    }
    document.querySelectorAll('.round_indicator').forEach((ind, idx) => {
        ind.classList.remove('current', 'completed');
        if(idx + 1 < kor) ind.classList.add('completed');
        else if(idx + 1 === kor) ind.classList.add('current');
    });
}

const lapKiir = () => {
    const el = document.querySelector('#turn_value');
    if(el) el.textContent = `${lap}/8`;
};

const kartyaKiir = k => {
    const el = document.querySelector('#card_type');
    if(el) el.textContent = k;
};

function pontokFrissit() {
    const scoreEl = document.querySelector('#score_value');
    const roundScoresEl = document.querySelector('#round_scores');
    const trainEl = document.querySelector('#train_score');
    const trainPointsEl = document.querySelector('#train_points');
    const trainMarker = document.querySelector('#train_marker');

    if(scoreEl) {
        let ossz = 0;
        pontok.forEach(p => ossz += p.total);
        scoreEl.textContent = ossz;
    }
    if(roundScoresEl) {
        if(pontok.length > 0) {
            roundScoresEl.textContent = pontok.map(p => p.total).join(', ');
        } else {
            roundScoresEl.textContent = '-';
        }
    }
    if(trainEl) trainEl.textContent = vonatAll.length;

    const skala = [0, 1, 2, 4, 6, 8, 11, 14, 17, 21, 25];
    const db = vonatAll.length;
    const pont = db < skala.length ? skala[db] : 25;

    if(trainPointsEl) trainPointsEl.textContent = pont;
    if(trainMarker) trainMarker.style.left = Math.min(db, 10) * 10 + '%';
}

function kezdoKiemel() {
    nodesGroup.querySelectorAll('.node').forEach(n => n.classList.remove('start_station'));
    if(kezdoAll && aktualisVonal) {
        const el = nodesGroup.querySelector(`[data-id="${kezdoAll.id}"]`);
        if(el) {
            el.classList.add('start_station');
            el.setAttribute('data-line-color', aktualisVonal.color);
        }
    }
}

function korPontSzamol() {
    const lategetett = new Set();
    const keruletSzam = {};

    jelenlegiSzakaszok.forEach(sz => {
        lategetett.add(sz.startId);
        lategetett.add(sz.endId);
    });

    lategetett.forEach(id => {
        const all = stations.find(s => s.id === id);
        if(all) {
            if(!keruletSzam[all.district]) keruletSzam[all.district] = 0;
            keruletSzam[all.district]++;
            if(all.train && !vonatAll.includes(id)) vonatAll.push(id);
        }
    });

    const keruletek = Object.keys(keruletSzam).length;
    const maxKerulet = keruletSzam && Object.keys(keruletSzam).length > 0 ?
        Math.max(...Object.values(keruletSzam)) : 0;
    let dunaKelt = 0;

    jelenlegiSzakaszok.forEach(sz => {
        const a1 = stations.find(s => s.id === sz.startId);
        const a2 = stations.find(s => s.id === sz.endId);
        if(a1 && a2 && a1.side !== a2.side) dunaKelt++;
    });

    osszesVonalSzakasz.push(...jelenlegiSzakaszok.map(sz => {
        return { ...sz, line: aktualisVonal.id };
    }));

    return {
        districts: keruletek,
        maxInDistrict: maxKerulet,
        danubeCrossings: dunaKelt,
        total: (keruletek * maxKerulet) + dunaKelt
    };
}
function vegsoSzamolas() {
    let korOsszeg = 0;
    pontok.forEach(p => korOsszeg += p.total);

    const skala = [0, 1, 2, 4, 6, 8, 11, 14, 17, 21, 25];
    const vonatPont = vonatAll.length < skala.length ? skala[vonatAll.length] : 25;

    const csomopontok = {};
    osszesVonalSzakasz.forEach(sz => {
        if(!csomopontok[sz.startId]) csomopontok[sz.startId] = new Set();
        if(!csomopontok[sz.endId]) csomopontok[sz.endId] = new Set();
        csomopontok[sz.startId].add(sz.line);
        csomopontok[sz.endId].add(sz.line);
    });
    let ket = 0, harom = 0, negy = 0;
    Object.values(csomopontok).forEach(lines => {
        if(lines.size === 2) ket++;
        else if(lines.size === 3) harom++;
        else if(lines.size === 4) negy++;
    });

    const csPont = (ket * 2) + (harom * 5) + (negy * 9);
    return {
        roundTotal: korOsszeg,
        trainPoints: vonatPont,
        trainCount: vonatAll.length,
        junctions2: ket,
        junctions3: harom,
        junctions4: negy,
        junctionPoints: csPont,
        totalScore: korOsszeg + vonatPont + csPont
    };
}

function jatekVege() {
    vege = true;
    stopTimer();
    const eredmeny = vegsoSzamolas();
    console.log('Jatek vege!');
    pontok.forEach((p, i) => console.log(`${i + 1}. kor: ${p.total} pont`));
    console.log(`Korok: ${eredmeny.roundTotal} | Vonatok (${eredmeny.trainCount}): ${eredmeny.trainPoints} | 2J: ${eredmeny.junctions2 * 2} | 3J: ${eredmeny.junctions3 * 5} | 4J: ${eredmeny.junctions4 * 9} | VEGSO: ${eredmeny.totalScore}`);

    const drawBtn = document.querySelector('#draw_card_btn');
    const skipBtn = document.querySelector('#skip_turn_btn');
    skipBtn.style.display = 'none';
    drawBtn.textContent = 'New Game';
    drawBtn.onclick = ujJatek;
}
function ujJatek() {
    // reset
    kor = 1;
    lap = 1;
    kartya = null;
    kezdoAll = null;
    aktualisVonal = null;
    lines = [];
    stations = [];
    jelenlegiSzakaszok = [];
    osszesVonalSzakasz = [];
    pontok = [];
    vonatAll = [];
    vonalRendezes = [];
    vege = false;

    // gombok vissza
    const drawBtn = document.querySelector('#draw_card_btn');
    const skipBtn = document.querySelector('#skip_turn_btn');
    drawBtn.textContent = 'Draw Card';
    drawBtn.onclick = null;
    skipBtn.style.display = '';

    // tabla torlese
    connectionsGroup.innerHTML = '';
    nodesGroup.innerHTML = '';

    gameInit();
}