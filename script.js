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

const playerHP = document.getElementById('hp');
const playerEffects = document.getElementById('effects');

const manaNames = Object.keys(MANA);

let countersPicked = 0;
let totalPicked = 0;

let player = {counter: [], attack: [], hp: 1000,};
let enemy = {counter: [], attack: [], hp: 1000,};

playerHP.innerHTML = `${player.hp}`;

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
        pickEnemyAction();
    }
}

function counterManaPicked() {
    counterSelection.innerHTML += `${this.innerHTML}<br>`
    player.counter.push(this.innerHTML);
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
    player.attack.push(this.innerHTML);
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
    if (player.hp <= 0) {
        console.log('you lose!');
    } else if (enemy.hp <= 0) {
        console.log('you win!');
    } else {
        countersPicked = 0;
        totalPicked = 0;
        setCounterButtons('enable');
        setCastButtons('enable');
        castSelection.innerHTML = '';
        counterSelection.innerHTML = '';
        playerHP.innerHTML = `${player.hp}`;

        player.counter = [];
        player.attack = [];
    }
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

function counterEnemyMana(){
    player.counter.forEach(element => {
        let index = enemy.attack.indexOf(element);
        if (index != -1) {
            enemy.attack.splice(index,1);
        }
    });
}

function counterPlayerMana(){
    enemy.counter.forEach(element => {
        let index = player.attack.indexOf(element);
        if (index != -1) {
            player.attack.splice(index,1);
        }
    });
}

function displaySpellEffect(who, spell) {
    spell.polar = cartesian2Polar(spell.x, spell.y);
    const spellDisplay = document.getElementById(`${who}Spell`);
    spellDisplay.style.backgroundColor = 
                `hsl(${spell.polar.angle},${spell.polar.magnitude}%,50%)`;
}

function pickEnemyAction() {
    enemy.counter = [];
    enemy.attack = [];
    for (let i = 0; i < 6; i++) {
        if (enemy.counter.length < 2) {
            if (Math.random() < 0.5){
                enemy.counter.push(
                        manaNames[Math.floor(Math.random() * manaNames.length)]);
            } else {
                enemy.attack.push(
                        manaNames[Math.floor(Math.random() * manaNames.length)]);
            }
        } else {
            enemy.attack.push(
                    manaNames[Math.floor(Math.random() * manaNames.length)]);
        }
    }

    let spell = resolveSpell(enemy.attack);
    displaySpellEffect('enemy',spell)
    console.table(player.attack);
    counterPlayerMana();
    console.table(player.attack);
    applyPlayerSpell();
}

function cartesian2Polar(x,y){
    const magnitude = Math.sqrt(x*x + y*y)*25;
    const angle = Math.atan2(y, x) * (180/Math.PI);
    const polarCoord = {
        magnitude: magnitude,
        angle: angle,
    };
    return polarCoord;
}

function applyEnemySpell() {
    let spell = resolveSpell(enemy.attack);
    spell.polar = cartesian2Polar(spell.x, spell.y);
    player.hp -= Math.floor(spell.polar.magnitude);
}

function applyPlayerSpell() {
    let spell = resolveSpell(player.attack);
    spell.polar = cartesian2Polar(spell.x, spell.y);
    enemy.hp -= Math.floor(spell.polar.magnitude);
}

function playerCastsSpell() {
    let spell = resolveSpell(player.attack);
    displaySpellEffect('player', spell);
    counterEnemyMana();
    applyEnemySpell();
    pickEnemyAction();
    newRound();
}

startGame();