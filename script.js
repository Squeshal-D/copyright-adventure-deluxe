var textSpeed = 40;
var playerName = "";
var playerDesc = "";
var typing = false;

class Character {
    constructor () {
        this.name = "default";
    }
}

class Blart extends Character {
    constructor () {
        super();
        this.name = "blart";
    }
}

// This function can be used as a `delay` parameter for setTimeout, to set an action after the text has been typed.
function typeText(message) {
    typing = true;
    let specialCharDelay = 0;
    $("#text").append("<br>>>");

    for (let i = 0; i < message.length; i++) {
        setTimeout(function() {$("#text").append(message[i]);}, i*textSpeed + specialCharDelay*textSpeed);
        if (message[i] == '.' || message[i] == '?') specialCharDelay += 9;
        else if (message[i] == ',') specialCharDelay += 4;
    }

    let messageLengthTime = message.length*textSpeed + specialCharDelay*textSpeed;
    setTimeout(function() {typing = false}, messageLengthTime);
    return messageLengthTime;
}

function getTypeTextTime(message) {
    let specialCharDelay = 0;
    for (let i = 0; i < message.length; i++) {
        if (message[i] == '.' || message[i] == '?') specialCharDelay += 9;
        else if (message[i] == ',') specialCharDelay += 4;
    }
    let messageLengthTime = message.length*textSpeed + specialCharDelay*textSpeed;
    return messageLengthTime;
}

function setStartConditions() {
    displayNameEntry(false);
}

function askForName() {
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
                typeText(playerName + " - " + playerDesc);
            }
        };
        setTimeout(displayNameEntry, typeText(descPrompt), true)
    }

    setTimeout(displayNameEntry, typeText(welcomePrompt), true);
}

function displayNameEntry(display) {
    if (display) {
        $(".nameEntry").css("display", "block");
    }
    else {
        $(".nameEntry").css("display", "none");
    }
    
}

$(function() {
    setStartConditions();
    askForName();
})
