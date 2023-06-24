var textSpeed = 40;
var playerName = "";
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

function typeText(message) {
    typing = true;
    let specialDelay = 0;
    $("#text").append("<br>>>");

    for (let i = 0; i < message.length; i++) {
        setTimeout(function() {$("#text").append(message[i]);}, i*textSpeed + specialDelay*textSpeed);
        if (message[i] == '.') specialDelay += 10;
    }
    setTimeout(function() {typing = false}, message.length*textSpeed + specialDelay*textSpeed);
}

function setStartConditions() {
    $("#nameEntry").css("display", "none");
}

function begin() {
    typeText("Welcome to a game that cannot be monetized without legal repercussions. Please enter your name in the box below.");
}

$(function() {
    begin();
})
