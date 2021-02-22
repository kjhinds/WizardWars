const MANA = {
    'VOLATILITY': {
        x: 2,
        y: 0,
        hue: 0,
        damage: 0,
        effect: {critical: .15},
    },
    'FIRE': {
        x: Math.SQRT2,
        y: Math.SQRT2,
        hue: 45,
        damage: 25,
        effect: {burn: 2},
    },
    'PHYSICAL': {
        x: 0,
        y: 2,
        hue: 90,
        damage: 0,
        effect: {petrify: .1},
    },
    'EARTH': {
        x: -Math.SQRT2,
        y: Math.SQRT2,
        hue: 135,
        damage: 35,
        effect: {none: 0},
    },
    'STABILITY': {
        x: -2,
        y: 0,
        hue: 180,
        damage: 0,
        effect: {stable: .3},
    },
    'WATER': {
        x: -Math.SQRT2,
        y: -Math.SQRT2,
        hue: -135,
        damage: 15,
        effect: {slow: 1},
    },
    'MENTAL': {
        x: 0,
        y: -2,
        hue: -90,
        damage: 0,
        effect: {confuse: .15},
    },
    'AIR': {
        x: Math.SQRT2,
        y: -Math.SQRT2,
        hue: -45,
        damage: 25,
        effect: {daze: 1},
    },
}

const counterButtons = document.getElementById('counterButtons');
const castButtons = document.getElementById('castButtons');

const counterSelection = document.getElementById('counterSelection');
const castSelection = document.getElementById('castSelection');

const playerHP = document.getElementById('hp');
const playerEffects = document.getElementById('effects');

const log = document.getElementById('log');

const manaNames = Object.keys(MANA);

let countersPicked = 0;
let totalPicked = 0;

let player = {counter: [], attack: [], hp: 1000, effects: []};
let enemy = {counter: [], attack: [], hp: 1000, effects: []};

playerHP.innerHTML = `${player.hp}`;

function createButtons(type) {
    manaNames.forEach(mana => {
        const button = document.createElement("BUTTON");
        button.innerHTML = `${mana}`
        button.id = `${type.id}${mana}`;
        button.style.backgroundColor = `hsl(${MANA[mana].hue},100%,50%)`
        button.addEventListener('click', manaPicked);
        type.appendChild(button);
    });
}

function whoIsFirst(){
    return Math.random() < 0.5 ? 'player' : 'enemy';
}

function startGame() {
    createButtons(counterButtons);
    createButtons(castButtons);
    if (whoIsFirst() == 'enemy') {
        pickEnemyAction();
    }
}

function manaPicked() {
    if (this.id.includes('counter')) {
        counterSelection.innerHTML += `${this.innerHTML}<br>`
        player.counter.push(this.innerHTML);
        countersPicked++;
    } else {
        castSelection.innerHTML += `${this.innerHTML}<br>`
        player.attack.push(this.innerHTML);
    }
    totalPicked++;    
    if (totalPicked >= 6) {
        setButtonsDisabled('counterButtons',true);
        setButtonsDisabled('castButtons',true);
    } else if (countersPicked >= 2) {
        setButtonsDisabled('counterButtons',true);
    }
}

function setButtonsDisabled(type,status) {
    manaNames.forEach(mana => {
        const button = document.getElementById(`${type}${mana}`);
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
        setButtonsDisabled('counterButtons',false);
        setButtonsDisabled('castButtons',false);
        castSelection.innerHTML = '';
        counterSelection.innerHTML = '';
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

function counterMana(caster, target){
    caster.counter.forEach(element => {
        let index = target.attack.indexOf(element);
        if (index != -1) {
            target.attack.splice(index,1);
        }
    });
}

function displaySpellEffect(who, spell) {
    spell.polar = cartesian2Polar(spell.x, spell.y);
    const spellDisplay = document.getElementById(`${who}Spell`);
    spellDisplay.style.backgroundColor = 
                `hsl(${spell.polar.angle},${spell.polar.magnitude*25}%,50%)`;
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
    counterMana(enemy,player);
    applySpell(player, enemy);
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

function applySpell(caster, target) {
    let cast = resolveSpell(caster.attack);
    cast.polar = cartesian2Polar(cast.x, cast.y);
    console.log(cast.polar.angle);
    let spellDamage = 0;
    let spellEffect = {};
    manaNames.forEach(entry => {
        let mana = MANA[entry];
        if (Math.abs(cast.polar.angle - mana.hue) < 45) {
            console.log(mana);
            spellDamage += mana.damage * cast.polar.magnitude;
            let effect = Object.keys(mana.effect);
            spellEffect[effect] = mana.effect[effect] * cast.polar.magnitude;
        } else if (mana.hue == 180 && cast.polar.angle < -135) { // needed to correctly handle angles for STABILITY
            console.log(mana);
            spellDamage += mana.damage * cast.polar.magnitude;
            let effect = Object.keys(mana.effect);
            spellEffect[effect] = mana.effect[effect] * cast.polar.magnitude;
        }
    });
    target.hp -= Math.floor(spellDamage);
    Object.entries(spellEffect).forEach(element => {
        //console.log(element);
        if (element[0] == 'burn') {
            target.effects.push(element[0], Math.floor(element[1]));
        } else if (Math.random() <= element[1]) {
            target.effects.push(element[0]);
        }
    });
}

function playerCastsSpell() {
    let spell = resolveSpell(player.attack);
    displaySpellEffect('player', spell);
    counterMana(player,enemy);
    applySpell(enemy, player);
    playerHP.innerHTML = `${player.hp}`;
    playerEffects.innerHTML = `${player.effects.join('<br>')}<br>`;
    pickEnemyAction();
    newRound();
}

startGame();