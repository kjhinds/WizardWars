const MANA = {
    'VOLATILITY': {
        x: 1,
        y: 0,
        hue: 0,
    },
    'AIR': {
        x: Math.SQRT2,
        y: Math.SQRT2,
        hue: 45,
    },
    'MENTAL': {
        x: 0,
        y: 1,
        hue: 90,
    },
    'WATER': {
        x: -Math.SQRT2,
        y: Math.SQRT2,
        hue: 135,
    },
    'STABILITY': {
        x: -1,
        y: 0,
        hue: 180,
    },
    'EARTH': {
        x: -Math.SQRT2,
        y: -Math.SQRT2,
        hue: 225,
    },
    'PHYSICAL': {
        x: -1,
        y: -1,
        hue: 270,
    },
    'FIRE': {
        x: Math.SQRT2,
        y: -Math.SQRT2,
        hue: 315,
    },
}

const counterButtons = document.getElementById('counterButtons');
const castButtons = document.getElementById('castButtons');

const counterSelection = document.getElementById('counterSelection');
const castSelection = document.getElementById('castSelection');

const manaNames = Object.keys(MANA);

let countersPicked = 0;
let totalPicked = 0;
let playerMana = [];
let playerCounter = [];

manaNames.forEach(mana => {
    const button = document.createElement("BUTTON");
    button.innerHTML = `${mana}`
    button.id = `counter${mana}Button`;
    button.style.backgroundColor = `hsl(${MANA[mana].hue},100%,50%)`
    button.addEventListener('click', counterManaPicked);
    counterButtons.appendChild(button);
});

manaNames.forEach(mana => {
    const button = document.createElement("BUTTON");
    button.innerHTML = `${mana}`
    button.id = `cast${mana}Button`;
    button.style.backgroundColor = `hsl(${MANA[mana].hue},100%,50%)`
    button.addEventListener('click', spellManaPicked);
    castButtons.appendChild(button);
});

function whoIsFirst(){
    return Math.random() < 0.5 ? 'player' : 'enemy';
}

function startGame() {
    if (whoIsFirst() == 'enemy') {
        let enemyAction = pickEnemyAction();
        let spell = resolveSpell(enemyAction.attack);
        displaySpellEffect('enemy',spell)
    }
}

function counterManaPicked() {
    counterSelection.innerHTML += `${this.innerHTML}<br>`
    playerCounter.push(this.innerHTML);
    countersPicked++;
    totalPicked++;
    if (totalPicked >= 6) {
        setCounterButtons('disable');
        setCastButtons('disable');
    } else if (countersPicked >= 2) {
        setCounterButtons('disable');
    }

}

function spellManaPicked() {
    castSelection.innerHTML += `${this.innerHTML}<br>`
    playerMana.push(this.innerHTML);
    totalPicked++;
    if (totalPicked >= 6) {
        setCounterButtons('disable');
        setCastButtons('disable');
    }
}

function setCounterButtons(status) {
    status = status == 'disable' ? true : false;
    manaNames.forEach(mana => {
        const button = document.getElementById(`counter${mana}Button`);
        button.disabled = status;
    });
}

function setCastButtons(status) {
    status = status == 'disable' ? true : false;
    manaNames.forEach(mana => {
        const button = document.getElementById(`cast${mana}Button`);
        button.disabled = status;
    });
}

function newRound() {
    countersPicked = 0;
    totalPicked = 0;
    setCounterButtons('enable');
    setCastButtons('enable');
    castSelection.innerHTML = '';
    counterSelection.innerHTML = '';
    playerMana = [];
    playerCounter = [];
    enemyMana = [];
    enemyCounter = [];
}

function resolveSpell(mana) {
    let spell = {
        x: 0,
        y: 0,
    }
    mana.forEach(element => {
        spell.x += MANA[element].x;
        spell.y += MANA[element].y;
    });
    return spell;
}

function counterMana(counter, mana){

}

function displaySpellEffect(who, spell) {
    spell.polar = cartesian2Polar(spell.x, spell.y);
    const spellDisplay = document.getElementById(`${who}Spell`);
    spellDisplay.style.backgroundColor = 
                `hsl(${spell.polar.angle},${spell.polar.magnitude*25}%,50%)`;
    console.table(spell);
}

function pickEnemyAction() {
    let counters = 0;
    let enemyAction = {
        counter: [],
        attack: [],
    }
    for (let i = 0; i < 6; i++) {
        if (counters < 2) {
            if (Math.random < 0.5){
                enemyAction.counter.push(
                        manaNames[Math.floor(Math.random() * manaNames.length)]);
            } else {
                enemyAction.attack.push(
                        manaNames[Math.floor(Math.random() * manaNames.length)]);
            }
        } else {
            enemyAction.attack.push(
                    manaNames[Math.floor(Math.random() * manaNames.length)]);
        }
    }
    return enemyAction;
}

function cartesian2Polar(x,y){
    const magnitude = Math.sqrt(x*x + y*y);
    const angle = Math.atan2(y, x) * (180/Math.PI);
    const polarCoord = {
        magnitude: magnitude,
        angle: angle,
    };
    return polarCoord;
}

function playerCastsSpell() {
    console.log(playerMana);
    let spell = resolveSpell(playerMana);
    displaySpellEffect('player', spell);
    newRound();
}

startGame();