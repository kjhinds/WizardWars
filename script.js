const MANA = {
    'VOLATILITY': {
        x: 2,
        y: 0,
        hue: 0,
        damage: 5,
        effect: {critical: .1},
    },
    'FIRE': {
        x: Math.SQRT2,
        y: Math.SQRT2,
        hue: 45,
        damage: 20,
        effect: {burning: 4},
    },
    'PHYSICAL': {
        x: 0,
        y: 2,
        hue: 90,
        damage: 5,
        effect: {petrified: .08},
    },
    'EARTH': {
        x: -Math.SQRT2,
        y: Math.SQRT2,
        hue: 135,
        damage: 30,
        effect: {none: 0},
    },
    'STABILITY': {
        x: -2,
        y: 0,
        hue: 180,
        damage: 5,
        effect: {stable: .2},
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
        damage: 5,
        effect: {confused: .10},
    },
    'AIR': {
        x: Math.SQRT2,
        y: -Math.SQRT2,
        hue: -45,
        damage: 20,
        effect: {dazed: 1},
    },
}

const OPPOSITES = {
    'VOLATILITY': 'STABILITY',
    'STABILITY': 'VOLATILITY',
    'MENTAL': 'PHYSICAL',
    'PHYSICAL': 'MENTAL',
    'FIRE': 'WATER',
    'WATER': 'FIRE',
    'AIR': 'EARTH',
    'EARTH': 'AIR',
}

const counterButtons = document.getElementById('counterButtons');
const castButtons = document.getElementById('castButtons');

const counterSelection = document.getElementById('counterSelection');
const castSelection = document.getElementById('castSelection');

const log = document.getElementById('log');

const manaNames = Object.keys(MANA);

let countersPicked = 0;
let totalPicked = 0;

let player = {counter: [], attack: [], hp: 1000, effects: [],
            actions: 6, stable: false, petrified: false, slow: false,
            dazed: false, burning: false, confused: false};
let enemy = {counter: [], attack: [], hp: 1000, effects: [],
            actions: 6, stable: false, petrified: false, slow: false,
            dazed: false, burning: false, confused: false};

player.HPdisplay = document.getElementById('hp');          
player.effectDisplay = document.getElementById('effects');

enemy.HPdisplay = document.getElementById('enemyhp');          
enemy.effectDisplay = document.getElementById('enemyEffects');

player.HPdisplay.innerHTML = `${player.hp}`;
enemy.HPdisplay.innerHTML = `${enemy.hp}`;

function reduceHP(target, change) {
    target.hp -= Math.floor(change);
    if (target.hp < 0) target.hp = 0;
    target.HPdisplay.innerHTML = `${target.hp}`;
}

function combatLog(message, clear=false) {
    if (clear) {
        log.innerHTML = `${message}`;
    } else {
        log.innerHTML += `<br>${message}`;
    }
}

function createButtons(type) {
    manaNames.forEach(mana => {
        const button = document.createElement("BUTTON");
        button.innerHTML = `${mana}`
        button.id = `${type.id}${mana}`;
        button.style.backgroundColor = `hsl(${MANA[mana].hue},100%,50%)`
        button.style.width = '90%';
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
        combatLog("An enemy wizard is casting a spell! Counter it and cast your own!", true);
        pickEnemyAction();
    } else {
        combatLog("You catch an enemy wizard off guard! Cast a spell to attack!", true);
    }
}

function manaPicked() {
    var mana = this.innerHTML;
    if (player.confused) {
        mana = manaNames[Math.floor(Math.random() * manaNames.length)];
    } 
    if (this.id.includes('counter')) {
        counterSelection.innerHTML += `${mana}<br>`
        player.counter.push(mana);
        countersPicked++;
    } else {
        castSelection.innerHTML += `${mana}<br>`
        player.attack.push(mana);
    }
    totalPicked++;    
    if (totalPicked >= player.actions) {
        setButtonsDisabled('counterButtons',true);
        setButtonsDisabled('castButtons',true);
    } else if (countersPicked >= 2) {
        setButtonsDisabled('counterButtons',true);
    }
}

function setButtonsDisabled(type,status) {
    if (player.petrified) {
        manaNames.forEach(mana => {
            const button = document.getElementById(`${type}${mana}`);
            button.disabled = true;
        });
        const castButton = document.getElementById('castButton');
        castButton.innerText = "Petrified!";
    } else {
        manaNames.forEach(mana => {
            const button = document.getElementById(`${type}${mana}`);
            button.disabled = status;
        });
        if (player.dazed) {
            const button = document.getElementById(`${type}${player.dazed}`);
            button.disabled = true;
        }
    }
}

function newRound() {
    if (player.hp <= 0) {
        combatLog("You were defeated by the enemy wizard...", true);
    } else if (enemy.hp <= 0) {
        combatLog("You have triumphed over the enemy wizard!", true);
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
    if (target.stable != true) {
        caster.counter.forEach(element => {
            target.attack.push(element);
        });
    }
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
    var castableMana = manaNames;
    if (enemy.petrified != true) {
        if (enemy.dazed) {
            castableMana.splice(Math.floor(Math.random()*castableMana.length),1);
        }
        for (let i = 0; i < enemy.actions; i++) {
            if (enemy.confused == true) {
                enemy.attack.push(
                        castableMana[Math.floor(Math.random() * castableMana.length)]);
            } else if (enemy.counter.length < 2 &&
                            player.attack.length > 0 &&
                            Math.random() < 0.5) {
                var mana = player.attack[Math.floor(Math.random() * player.attack.length)];
                mana = OPPOSITES[mana];
                if (!castableMana.includes(mana)) {
                    mana = castableMana[Math.floor(Math.random() * castableMana.length)];
                }
                enemy.counter.push(mana);
            } else if (enemy.attack.length > 0 && Math.random() < 0.8) {
                enemy.attack.push(
                        enemy.attack[Math.floor(Math.random() * enemy.attack.length)]);
            } else {
                enemy.attack.push(
                        castableMana[Math.floor(Math.random() * castableMana.length)]);
            }
        }
    }
    restoreStatus(enemy);
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

function removeEffect(target, effect) {
    let index = target.effects.indexOf(effect);
    target.effects.splice(index,1);
}

function applySpell(caster, target) {
    let cast = resolveSpell(caster.attack);
    cast.polar = cartesian2Polar(cast.x, cast.y);
    let spellDamage = 0;
    let spellEffect = {};
    let effectsList = [];
    manaNames.forEach(entry => {
        let mana = MANA[entry];
        if (Math.abs(cast.polar.angle - mana.hue) < 45) {
            spellDamage += mana.damage * cast.polar.magnitude;
            let effect = Object.keys(mana.effect);
            spellEffect[effect] = mana.effect[effect] * cast.polar.magnitude;
        } else if (mana.hue == 180 && cast.polar.angle < -135) { // needed to correctly handle angles for STABILITY
            spellDamage += mana.damage * cast.polar.magnitude;
            let effect = Object.keys(mana.effect);
            spellEffect[effect] = mana.effect[effect] * cast.polar.magnitude;
        }
    });
    reduceHP(target, spellDamage);
    Object.entries(spellEffect).forEach(element => {
        if (element[0] == 'burning') {
            target.burning = Math.floor(element[1]);
            reduceHP(target, target.burning);
            effectsList.push(element[0]);
        } else if (element[0] == 'critical') {
            target.hp -= (Math.random() <= element[1]) ? Math.floor(spellDamage) : 0;
        } else if (element[0] == 'slow' && Math.random() <= element[1]) {
            target.actions = 5;
            target.slow = true;
            effectsList.push(element[0]);
        } else if (element[0] == 'stable' && Math.random() <= element[1]) {
            caster.stable = true;
        } else if (element[0] == 'dazed' && Math.random() <= element[1]) {
            target[element[0]] = manaNames[Math.floor(Math.random() * manaNames.length)];
            effectsList.push(element[0]);
        } else if (Math.random() <= element[1]) {
            target[element[0]] = true;
            effectsList.push(element[0]);
        }
    });
    displayStatus(target);
    if (target == enemy && spellDamage != 0 && effectsList.length != 0) {
        combatLog(`You did ${Math.floor(spellDamage)} damage and inflicted ${effectsList.join(' and ')}`);
    } else if (target == enemy && spellDamage != 0) {
        combatLog(`You did ${Math.floor(spellDamage)} damage`);
    } else if (target == player && spellDamage != 0 && effectsList.length != 0) {
        combatLog(`The enemy did ${Math.floor(spellDamage)} damage and inflicted ${effectsList.join(' and ')}`);
    } else if (target == player && spellDamage != 0) {
        combatLog(`The enemy did ${Math.floor(spellDamage)} damage`);
    }
}

function restoreStatus(target) {
    target.actions = 6;
    target.slow = false;
    target.dazed = false;
    target.confused = false;
    target.petrified = false;
    const castButton = document.getElementById('castButton');
    castButton.innerText = "Cast!";
    target.stable = false;
    if (target.burning <= 2) {
        target.burning = false;
    } else {
        target.burning = Math.floor(target.burning / 2);
    }
}

function displayStatus(target) {
    target.effectDisplay.innerHTML = '';
    if (target.burning) {
        target.effectDisplay.innerHTML += `Burning: ${target.burning}<br>`;
    }
    if (target.petrified) {
        target.effectDisplay.innerHTML += `Petrified<br>`;
    }
    if (target.slow) {
        target.effectDisplay.innerHTML += `Slowed<br>`;
    }
    if (target.confused) {
        target.effectDisplay.innerHTML += `Confused<br>`;
    }
    if (target.dazed) {
        target.effectDisplay.innerHTML += `dazed<br>`;
    }
}

function playerCastsSpell() {
    combatLog('',true);
    restoreStatus(player);
    let spell = resolveSpell(player.attack);
    displaySpellEffect('player', spell);
    counterMana(player,enemy);
    applySpell(enemy, player);
    pickEnemyAction();
    newRound();
}

startGame();