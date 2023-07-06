var textSpeed = 5;
var playerName = "";
var playerDesc = "";
var typing = false;
var timeouts = [];

var party = [];
var fightPool = [];
                                        // Characters
function Character(name, desc, quest, entrance, maxhp) {
    this.name = name;
    this.description = desc;
    this.quest = quest;
    this.entrance = entrance;
    this.maxhp = maxhp;
    this.hp = maxhp;

    function changehp(damage) {
        this.hp += damage;
        if (this.hp > this.maxhp) this.hp = this.maxhp;
        else if (this.hp < 0) this.hp = 0;
    }
}
                                        // Utility Functions
function clearAllTimeouts() {
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
    displayContinueButton(false);
    displayAreaSelection([]);
}

function setOptionButtonFunctions() {
    const restartButton = document.querySelector("#restart");

    restartButton.onclick = function() {startNewGame()};
}

function addAllEnemiesToPool() {
    fightPool = [];
    const blartEntrance = "Many of the people in the mall don't seem to be positively responding to you trying to pick a fight."
    + " It's no wonder you've been reported. Then you see him. \"I swore an oath to protect this mall.\"";
    const Blart = new Character("Paul Blart", "Mall Cop", "Take a trip to the mall.", blartEntrance, 80);
    fightPool.push(Blart, Blart);
}

function removeEnemyFromPool(enemy) {
    fightPool.splice(fightPool.indexOf(enemy), 1);
}
                                        // UI Functions
function clearTextBox() {
    const text = document.querySelector("#text");

    text.innerHTML = "";
}

function displayNameEntry(display) {
    if (display) $("#nameEntryContainer").css("display", "block");
    else $("#nameEntryContainer").css("display", "none");
}

function displayContinueButton(display) {
    if (display) $("#continueButtonContainer").css("display", "block");
    else $("#continueButtonContainer").css("display", "none");
}

// To hide area selection buttons, call this with an empty array as parameter
function displayAreaSelection(pickedFights) {
    console.log(pickedFights);
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

// This function can be used as a `delay` parameter for setTimeout, to set an action after the message has been typed.
function typeText(message) {
    typing = true;
    let specialCharDelay = 0;
    $("#text").append("<br>>> ");

    for (let i = 0; i < message.length; i++) {
        timeouts.push(setTimeout(function() {$("#text").append(message[i]);}, i*textSpeed + specialCharDelay*textSpeed));
        if (message[i] == '.' || message[i] == '?'|| message[i] == '!') specialCharDelay += 9;
        else if (message[i] == ',') specialCharDelay += 4;
    }

    let messageLengthTime = message.length*textSpeed + specialCharDelay*textSpeed;
    timeouts.push(setTimeout(function() {typing = false}, messageLengthTime));
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
                                        // Game Logic Functions
function selectCharacter(player, enemy) {
    typeText(party[0].name + " " + enemy.name);
}

function enemyEntrance(enemy) {
    timeouts.push(setTimeout(selectCharacter, typeText(enemy.entrance), null, enemy));
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
                party.push(new Character(playerName, playerDesc, "", "", 50));
                timeouts.push(setTimeout(areaSelect, typeText("Prepare to embark on your epicc quest...")));
            }
        };
        timeouts.push(setTimeout(displayNameEntry, typeText(descPrompt), true));
    }
    timeouts.push(setTimeout(displayNameEntry, typeText(welcomePrompt), true));
}

function areaSelect() {
    let message = "What an exhilarating battle! You're not done yet, though. There are still opponents to be conquered. Where will you go next?";
    if (fightPool.length == 1) { // Display different message for if the game has just started.
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
        timeouts.push(setTimeout(displayAreaSelection, typeText(message), pickedFights));
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
