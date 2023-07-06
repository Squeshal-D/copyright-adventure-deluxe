var textSpeed = 40;
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
    fightPool.push(Blart);
}
                                        // UI Functions
function clearTextBox() {
    const text = document.querySelector("#text");

    text.innerHTML = "";
}

function displayNameEntry(display) {
    if (display) {
        $(".nameEntry").css("display", "block");
    }
    else {
        $(".nameEntry").css("display", "none");
    }
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
function askForNameAndDescription() {
    const inputLabel = document.querySelector("label.nameEntry");
    const nameField = document.querySelector("input.nameEntry");
    const submitButton = document.querySelector("button.nameEntry");

    let welcomePrompt = "Welcome to a game that cannot be monetized without legal repercussions. Please enter your name in the box below.";
    let descPrompt = "Wow, that's really your name? Now, describe yourself in 15 characters or less.";

    inputLabel.value = "Name:";
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
        inputLabel.value = "Description:";
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
    if (fightPool.length > 0) {
        
    }

    timeouts.push(setTimeout(function() {typeText(fightPool[0].name)}, typeText(party[0].name)));
}
                                        // Main Functions
function startNewGame() {
    setStartConditions();
    setOptionButtonFunctions();
    askForNameAndDescription();
}

$(function() {
    startNewGame();
})
