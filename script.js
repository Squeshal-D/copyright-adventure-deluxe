var textSpeed = 30;
var playerName = "";
var playerDesc = "";
var timeouts = [];

var party = [];
var fightPool = [];
                                        // Characters
function Character() {
    this.name = playerName;
    this.description = playerDesc;
    this.quest = "";
    this.entrance = "";
    this.maxhp = 50;
    this.hp = 50;
    this.displayhp = 50;

    this.boss = false;
    this.charging = false;
    this.special = 0;

    this.move1name = "Punch";
    this.move1desc = "How normal.<br>(15-20 dmg)";
    this.move2name = "Juul";
    this.move2desc = "A sophomore classic.<br>50% chance to trigger a Bowers attack (30 dmg).";

    this.changehp = function(damage) {
        this.hp += damage;
        if (this.hp > this.maxhp) this.hp = this.maxhp;
        else if (this.hp < 0) this.hp = 0;
    }

    this.refresh = function() {
        this.hp = this.maxhp;
        this.displayhp = this.maxhp;
        this.charging = false;
        this.special = 0;
    }

    this.attack1 = function(user, target) {
        let randInt = 15 + Math.floor(Math.random()* 11);
        target.changehp(-randInt);
        return typeText(`${user.name} punches ${target.name} for ${randInt} damage!`, true);
    }

    this.attack2 = function(user, target) {
        let randInt = Math.floor(Math.random() * 2);
        if (randInt == 1) {
            target.changehp(-30);
            return typeText(`Bowers senses the vape and springs out of nowhere! He annihilates ${target.name} for 30 dmg!`, true);
        }
        else return typeText(`${user.name} vapes undisturbed. ${target.name} is jealous.`, true);
    }
}

function Blart() {
    Character.call(this);

    this.name = "Paul Blart";
    this.description = "Mall Cop";
    this.quest = "Take a trip to the mall.";
    this.entrance = "Many of the people in the mall don't seem to be positively responding to you trying to pick a fight."
    + " It's no wonder you've been reported. Then you see him. \"I swore an oath to protect this mall.\"";
    this.maxhp = 80;

    this.move1name = "Segway Slam";
    this.move1desc = "An all-out rollout.\nHas a 50% chance to hit (40 dmg), as well as a 50% chance to recoil (20 self dmg).";
    this.move2name = "Headbutt";
    this.move2desc = "\"Nobody wins with a headbutt.\"\n(25 dmg) (15 self dmg).";

    this.attack1 = function(user, target) {
        let message = "";
        let hit = Math.floor(Math.random() * 2);
        let recoil = Math.floor(Math.random() * 2);

        if (hit == 1) {
            message += `${user.name} slams their Segway into ${target.name} successfully for 40 dmg... `;
            target.changehp(-40);
        }
        else message += `${user.name} flies past ${target.name} on their Segway... `;

        if (recoil == 1) {
            message += `and crashes for 20 dmg!`;
            user.changehp(-20);
        }
        else message += `and stays on!`;

        return typeText(message, true);
    }

    this.attack2 = function(user, target) {
        target.changehp(-25);
        user.changehp(-15);
        return typeText(`${user.name} headbutts ${target.name} for 25 dmg, but recieves 15 dmg in recoil!`, true);
    }
}

function Wick() {
    Character.call(this);

    this.name = "John Wick";
    this.description = "Character from Fortnite";
    this.quest = "Hire an assassin to fight you.";
    this.entrance = "You pick up the phone and dial 1-800-KILL. \"Give me one of your finest hitmen. What? Who should their target be? Me.\""
    + "\nWithing seconds, an assassin does a cool combat roll toward you. \"I've come for everything they said I couldn't have, even you.\"";
    this.maxhp = 60;

    this.move1name = "Pencil Shank";
    this.move1desc = "A school classic.<br>Keeps attacking (5 dmg) until John Wick misses (30% chance).";
    this.move2name = "Neck Snap";
    this.move2desc = "Anticlimactic Finisher. Could instantly kill an enemy, chance increases as enemy's HP gets low.";

    this.attack1 = function(user, target) {
        let hits = 0;
        let swings = 0;
        let message1 = `${user.name} brandishes a pencil! It hits ${hits}/${swings}`;
        let message1Time = typeText(message1, true);
        let message2 = " times!";
        let message2Time = getTypeTextTime(message2);
        const missChance = 0.3;
        let roll = Math.random();
        
        while (roll > missChance) {
            hits++;
            swings++;
            target.hp -= 5;
            let oldText = `${hits - 1}/${swings - 1}`;
            let newText = `${hits - 1}/${swings - 1}`;
            timeouts.push(setTimeout(replaceText, message1Time + swings*5*textSpeed, `${hits - 1}/${swings - 1}`, `${hits}/${swings}`));
            if (target.hp == 0) {
                break;
            }
            roll = Math.random();
        }
        if (target.hp > 0) {
            swings++;
            timeouts.push(setTimeout(replaceText, message1Time + swings*5*textSpeed, `/${swings-1}`, `/${swings}`));
        }
        timeouts.push(setTimeout(typeText, message1Time + (swings + 1)*5*textSpeed, message2, false));
        return message1Time + (swings + 1)*5*textSpeed + message2Time;
    }

    this.attack2 = function(user, target) {
        let chance = 10/target.hp;
        let roll = Math.random();
        if (roll <= chance) {
            target.changehp(-target.hp);
            return typeText(`${user.name} snaps ${target.name}'s neck!`, true);
        }
        else return typeText(`${user.name} only manages to turn ${target.name}'s head.`, true);
        
    }
}
                                        // Utility Functions
function clearAllTimeouts() {
    console.log(`There were ${timeouts.length} timeouts.`);
    for (let i = 0; i < timeouts.length; i++) {
        clearTimeout(timeouts[i]);
    }
    timeouts = [];
}

function setStartConditions() {
    clearAllTimeouts();
    party = [];
    addAllEnemiesToPool();
    clearTextBox();
    displayNameEntry(false);
    displayAreaSelection([]);
    hideBattleButtons();
}

function setOptionButtonFunctions() {
    const restartButton = document.querySelector("#restart");

    restartButton.onclick = function() {startNewGame()};
}

function addAllEnemiesToPool() {
    fightPool = [];
    const blart = new Blart(); blart.refresh(); fightPool.push(blart);
    const wick = new Wick(); wick.refresh(); fightPool.push(wick);
}

function removeEnemyFromPool(enemy) {
    fightPool.splice(fightPool.indexOf(enemy), 1);
}
                                        // UI Functions
// This function can be used as a `delay` parameter for setTimeout, to set an action after the message has been typed.
function typeText(message, newLine) {
    let specialCharDelay = 0;
    let text = $("#text");
    if (message.length > 0 && newLine) text.append("<br>>> ");

    for (let i = 0; i < message.length; i++) {
        timeouts.push(setTimeout(function() {text.append(message[i]);}, i*textSpeed + specialCharDelay*textSpeed));
        if (message[i] == '.' || message[i] == '?'|| message[i] == '!') specialCharDelay += 9;
        else if (message[i] == ',') specialCharDelay += 4;
    }

    let messageLengthTime = message.length*textSpeed + specialCharDelay*textSpeed;
    return messageLengthTime;
}

function getTypeTextTime(message) {
    let specialCharDelay = 0;
    for (let i = 0; i < message.length; i++) {
        if (message[i] == '.' || message[i] == '?' || message[i] == '!') specialCharDelay += 9;
        else if (message[i] == ',') specialCharDelay += 4;
    }
    let messageLengthTime = message.length*textSpeed + specialCharDelay*textSpeed;
    return messageLengthTime;
}

function replaceText(oldText, newText) {
    wholeText = $("#text").html();
    replaceIndex = wholeText.lastIndexOf(oldText);
    modifiedText = wholeText.substring(0, replaceIndex) + newText + wholeText.substring(replaceIndex + oldText.length);
    $("#text").html(modifiedText);
}

function clearTextBox() {
    const text = document.querySelector("#text");

    text.innerHTML = "";
}

function displayNameEntry(display) {
    if (display) $("#nameEntryContainer").css("display", "block");
    else $("#nameEntryContainer").css("display", "none");
}

// To hide area selection buttons, call this with an empty array as parameter
function displayAreaSelection(pickedFights) {
    clearAllTimeouts();
    if (pickedFights.length < 1) {
        $("#areaSelectButtonContainer").css("display", "none");
        return;
    }

    let areaSelectButtons = [document.querySelector("#areaButton1"), document.querySelector("#areaButton2"), document.querySelector("#areaButton3")];
    for (let i = 0; i < 3; i++) {
        $(`#areaButton${i + 1}`).css("display", "none");
    }
    for (let i = 0; i < pickedFights.length && i < 3; i++) {
        areaSelectButtons[i].textContent = pickedFights[i].quest;
        areaSelectButtons[i].onclick = function() {
            displayAreaSelection([]);
            removeEnemyFromPool(pickedFights[i]);
            enemyEntrance(pickedFights[i]);
        }
        $(`#areaButton${i + 1}`).css("display", "inline-block");
    }
    $("#areaSelectButtonContainer").css("display", "block");
}

// To have a blank button pad, call this with null as parameter
function displayBattleButtons(fighter, enemy, setButtonFunctions) {
    clearAllTimeouts();
    console.log(fighter.hp, enemy.hp);
    buttons = [document.querySelector("#attack1button"), document.querySelector("#attack2button"), document.querySelector("#switch")];
    labels = [document.querySelector("#attack1label"), document.querySelector("#attack2label"), document.querySelector("#switchLabel")];

    if (fighter == null) {   
        buttons[0].innerHTML = "";
        buttons[1].innerHTML = "";
        labels[0].innerHTML = "";
        labels[1].innerHTML = "";

        if (setButtonFunctions) {
            buttons[0].onclick = function() {};
            buttons[1].onclick = function() {};
        }
        
    }
    else {
        buttons[0].innerHTML = fighter.move1name;
        buttons[1].innerHTML = fighter.move2name;
        labels[0].innerHTML = fighter.move1desc;
        labels[1].innerHTML = fighter.move2desc;

        if (setButtonFunctions) {
            buttons[0].onclick = function() {hideBattleButtons(); timeouts.push(setTimeout(damageAnimation, fighter.attack1(fighter, enemy), fighter, enemy, true))};
            buttons[1].onclick = function() {hideBattleButtons(); timeouts.push(setTimeout(damageAnimation, fighter.attack2(fighter, enemy), fighter, enemy, true))};
        }
    }

    buttons[2].textContent = "Switch";
    labels[2].textContent = "Choose a different fighter. The enemy will go first.";
    if (setButtonFunctions) {

    }

    $("#battleButtonContainer").css("display", "grid");
}

function hideBattleButtons() {
    $("#battleButtonContainer").css("display", "none");
}
                                        // Game Logic Functions
function chooseCharacter(currentFighter, enemy) {
    if (currentFighter == null) {

    }
    else {
        
    }
}

function checkBattleStatus(player, enemy, wasPlayerTurn) {
    let totalMessageTime = 0;
    let enemyDead = "";
    let playerDead = "";

    if (enemy.hp <= 0) {
        if (wasPlayerTurn) {
            if (enemy.boss) enemyDead = `${enemy.name} was defeated! You won!`;
            else {
                enemyDead = `${enemy.name} was defeated and has joined the party!`;
                party.push(enemy);
            }
        }
        else {
            if (enemy.boss) enemyDead = `${enemy.name} annihilated themselves. You won!`;
            else {
                enemyDead = `${enemy.name} died during their own attack and joined the party!`;
                party.push(enemy);
            }
        }
    }
    if (player.hp <= 0) {
        if (wasPlayerTurn) {
            if (enemyDead == "") {
                playerDead = `Bruh! ${player.name} died from that!`;
                party.splice(party.indexOf(player), 1);
            }
            else {
                playerDead = `But at what cost? ${player.name} is dead!`;
                party.splice(party.indexOf(player), 1);
            }
        }
        else {
            if (enemyDead == "") {
                playerDead = `Oh no! ${player.name} has passed away...`;
                party.splice(party.indexOf(player), 1);
            }
            else {
                playerDead = `But ${player.name} died tho lmao.`;
                party.splice(party.indexOf(player), 1);
            }
        }
    }

    timeouts.push(setTimeout(typeText, typeText(enemyDead, true), playerDead, true));
    totalMessageTime = getTypeTextTime(enemyDead) + getTypeTextTime(playerDead);

    if (party.length == 0) timeouts.push(setTimeout(gameOver, totalMessageTime));
    else if (enemyDead != "") timeouts.push(setTimeout(areaSelect, totalMessageTime));
    else if (wasPlayerTurn) timeouts.push(setTimeout(enemyTurn, totalMessageTime, player, enemy));
    else timeouts.push(setTimeout(playerTurn, totalMessageTime, player, enemy));
}

function gameOver() {
    timeouts.push(setTimeout(typeText, typeText("You are out of party members.", true), "GAME OVER - Press the restart button to try again.", true));
}

function damageAnimation(player, enemy, wasPlayerTurn) {
    checkBattleStatus(player, enemy, wasPlayerTurn);
}

function playerTurn(player, enemy) {
    displayBattleButtons(player, enemy, true);
}

function enemyTurn(player, enemy) {
    let randAttack = Math.floor(Math.random() * 2);
    if (randAttack == 0) timeouts.push(setTimeout(damageAnimation, enemy.attack1(enemy, player), player, enemy, false));
    else timeouts.push(setTimeout(damageAnimation, enemy.attack2(enemy, player), player, enemy, false));
}

function enemyEntrance(enemy) {
    timeouts.push(setTimeout(playerTurn, typeText(enemy.entrance, true), party[0], enemy));
}

function askForNameAndDescription() {
    const inputLabel = document.querySelector("label.nameEntry");
    const nameField = document.querySelector("input.nameEntry");
    const submitButton = document.querySelector("button.nameEntry");

    let welcomePrompt = "Welcome to a game that cannot be monetized without legal repercussions. Please enter your name in the box below.";
    let descPrompt = "Wow, that's really your name? Now, describe yourself in 15 characters or less.";

    inputLabel.textContent = "Name:";
    nameField.maxLength = "10";
    nameField.value = playerName;
    submitButton.onclick = function() {
        if (nameField.value.trim().length != 0) {
            playerName = nameField.value.trim();
            displayNameEntry(false);
            askForDescription();
        }
    };

    function askForDescription()
    {
        inputLabel.textContent = "Description:";
        nameField.maxLength = "15";
        nameField.value = playerDesc;
        submitButton.onclick = function() {
            if (nameField.value.trim().length != 0) {
                playerDesc = nameField.value.trim();
                displayNameEntry(false);
                party.push(new Character());
                party[0].name = playerName;
                party[0].description = playerDesc;
                timeouts.push(setTimeout(areaSelect, typeText("Prepare to embark on your epicc quest...", true)));
            }
        };
        timeouts.push(setTimeout(displayNameEntry, typeText(descPrompt, true), true));
    }
    timeouts.push(setTimeout(displayNameEntry, typeText(welcomePrompt, true), true));
}

function areaSelect() {
    let message = "What an exhilarating battle! You're not done yet, though. There are still opponents to be conquered. What will you do next?";
    if (fightPool.length == 2) { // Display different message for if the game has just started.
        message = "There comes a time in every man's life when they must embark on an epic quest to defeat numerous people."
        + " Today, " + playerName + " begins their quest. The " + playerDesc + " walks outside their house. They consider their options.";
    }

    if (fightPool.length > 0) {
        let potentialFights = fightPool.slice();
        let pickedFights = [];
        for (let i = 0; i < 3 && potentialFights.length > 0; i++) {
            let randInt = Math.floor(Math.random()*potentialFights.length);
            pickedFights.push(potentialFights[randInt]);
            potentialFights.splice(randInt, 1);
        }
        timeouts.push(setTimeout(displayAreaSelection, typeText(message, true), pickedFights));
    }
}
                                        // Main Functions
function startNewGame() {
    setStartConditions();
    askForNameAndDescription();
}

$(function() {
    setOptionButtonFunctions();
    startNewGame();
})
