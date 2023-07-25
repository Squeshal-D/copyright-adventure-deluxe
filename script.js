var gameSpeed = 0;  // 0-2, 2 is fastest
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
    this.picture = "cad icon.png";
    this.maxhp = 50;
    this.hp = 50;
    this.displayhp = 50;

    this.boss = false;
    this.charging = 0;
    this.special = 0;  // miscellaneous integer for any complex move that may need it

    this.move1name = "Punch";
    this.move1desc = "How normal. <br>(15-25 dmg)";
    this.move2name = "Juul";
    this.move2desc = "A sophomore classic. <br>50% chance to trigger a Bowers attack (30 dmg).";

    this.changehp = function(damage) {
        this.hp += damage;
        if (this.hp > this.maxhp) this.hp = this.maxhp;
        else if (this.hp < 0) this.hp = 0;
    }

    this.refresh = function() {
        this.hp = this.maxhp;
        this.displayhp = this.maxhp;
        this.charging = 0;
        this.special = 0;
    }

    this.afterFight = function() {
        this.charging = 0;
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
    this.move1desc = "An all-out rollout. <br>Has a 50% chance to hit (40 dmg), as well as a 50% chance to recoil (20 self dmg).";
    this.move2name = "Headbutt";
    this.move2desc = "\"Nobody wins with a headbutt.\" <br>(25 dmg) (15 self dmg).";

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
    + " Within seconds, an assassin does a cool combat roll toward you. \"I've come for everything they said I couldn't have, even you.\"";
    this.maxhp = 60;

    this.move1name = "Pencil Shank";
    this.move1desc = "A school classic. <br>Keeps attacking (5 dmg) until John Wick misses (30% chance).";
    this.move2name = "Neck Snap";
    this.move2desc = "Anticlimactic Finisher. <br>Could instantly kill an enemy. <br>Chance increases as enemy's HP gets low.";

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
            target.changehp(-5);
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

function Derrek() {
    Character.call(this);

    this.name = "Derrek";
    this.description = "Sharks Fan";
    this.quest = "Go to Derrek's house.";
    this.entrance = "You go up to Derrek's house and knock on the door. Derrek's mom answers the door. She is very nice, and you ask her if Derrek is home."
        + " She invites you in and gives you some hot cocoa. You are rudely interrupted by Derrek, though. You put down the cocoa and tell Derrek's mom, "
        + " \"Sorry, but I'm going to have to kick your son's bootay.\"";
    this.maxhp = 50;

    this.move1name = "Baseball Smash";
    this.move1desc = "A joke Derrek and I have. <br>(15 dmg) <br>Finishes an enemy that's 30 hp or lower.";
    this.move2name = "Airplane Smash";
    this.move2desc = "Watch yo jet! <br>(25 dmg) <br>20% chance Derrek crashes the plane...";

    this.attack1 = function(user, target) {
        if (target.hp <= 30) {
            target.changehp(-target.hp);
            return typeText(`${user.name} smashes ${target.name}'s head clean off! Eww...`, true);
        }
        else {
            target.changehp(-15);
            return typeText(`${user.name} bats ${target.name} for 15 damage!`, true);
        }
    }

    this.attack2 = function(user, target) {
        let message = `${user.name} clips ${target.name} with a freaking airplane for 25 damage...`;
        target.changehp(-25);
        if (Math.floor(Math.random()*5) == 0) {
            message += " and crashes the plane in a blaze of glory!";
            user.changehp(-user.hp);
        }
        else message += " and lands the plane safely!";

        return typeText(message, true);
    }
}

function Bowers() {
    Character.call(this);

    this.name = "John Bowers";
    this.description = "Disher of Discipline";
    this.quest = "Visit CVCHS";
    this.entrance = "You've arrived in the senior lot. Something isn't right. The gate is closed. You look at the time."
    + " Would anyone be willing to fight at 8:01? You turn around when, \"HEY! I've caught you!\"";
    this.maxhp = 50;

    this.move1name = "Ambush";
    this.move1desc = "You can never expect it. <br>(15 dmg) <br>(30 dmg) on full hp opponents.";
    this.move2name = "Words of Encouragement";
    this.move2desc = "Word Diarrhea. <br>20% chance to defeat the opponent. <br>Otherwise, fully heals the opponent.";

    this.attack1 = function(user, target) {
        if (target.hp == target.maxhp) {
            target.changehp(-30);
            return typeText(`Surprise! ${user.name} ambushed ${target.name} when they weren't expecting it for 30 damage!`, true);
        }
        else {
            target.changehp(-15);
            return typeText(`${user.name} ambushed ${target.name}. They weren't surprised, but got a fat spank for 15 damage.`, true);
        }
    }

    this.attack2 = function(user, target) {
        let message = `${user.name} spread words of encouragement.`;
        if (Math.floor(Math.random()*5) == 0) {
            target.changehp(-target.hp);
            message += ` ${target.name} couldn't stand the cheesy dialogue and died.`;
        }
        else {
            target.changehp(target.maxhp);
            message += ` ${target.name} was inspired deeply and healed fully.`;
        }
        return typeText(message, true);
    }
}

function Chief() {
    Character.call(this);

    this.name = "Master Chief";
    this.description = "AKA Halo";
    this.quest = "Hijack a space vessel.";
    this.entrance = "Hijacking a space vessel would surely cause the government to send special forces to stop you, and they do!"
    + " As soon as the armored warrior approaches you, he informs you that what you are doing is 'illegal' and that he needs a weapon.";
    this.maxhp = 100;

    this.move1name = "Assault Rifle";
    this.move1desc = "Low damage, inaccurate, but iconic! <br>Each of the 32 bullets have a 50% chance of hitting.";
    this.move2name = "Spartan Laser";
    this.move2desc = "Very bad-A w*rd. <br>(40 dmg) <br>Has to charge for one turn.";

    this.attack1 = function(user, target) {
        let hits = 0;
        let shots = 0;
        let message1 = `${user.name} unloads an assault rifle on ${target.name} and hits ${hits}/${shots}`;
        let message1Time = typeText(message1, true);
        let message2 = " shots!";
        let message2Time = getTypeTextTime(message2);
        const missChance = 0.5;
        
        for (let i = 0; i < 32; i++) {
            shots++;
            if (Math.random() > missChance) {
                hits++;
                timeouts.push(setTimeout(replaceText, message1Time + shots*textSpeed, `${hits - 1}/${shots - 1}`, `${hits}/${shots}`));
            }
            else timeouts.push(setTimeout(replaceText, message1Time + shots*textSpeed, `${hits}/${shots - 1}`, `${hits}/${shots}`));
        }
        timeouts.push(setTimeout(typeText, message1Time + (shots + 1)*textSpeed, message2, false));
        target.changehp(-hits);
        return message1Time + (shots + 1)*textSpeed + message2Time;
    }

    this.attack2 = function(user, target) {
        if (this.charging == 0) {
            this.charging = 2;
            return typeText(`${user.name} charges the spartan laser!`, true);
        }
        else {
            this.charging = 0;
            target.changehp(-40);
            return typeText(`${user.name} fires the spartan laser at ${target.name} for 40 damage!`, true);
        }
    }
}

function Lennie() {
    Character.call(this);

    this.name = "Lennie Small";
    this.description = "Pro Rabbit Tender";
    this.quest = "Go into that big ol barn over there.";
    this.entrance = "The huge barn door slowly opens and you peek inside. By the light through the door you can see the figure of a large man"
    + " petting a small mouse. \"You're lookin' pretty soft.\" He drops the lifeless rodent and lumbers toward you.";
    this.maxhp = 80;

    this.move1name = "Hair Pull";
    this.move1desc = "Lennie can't resist! <br>Gets stronger as Lennie's hp drops (0-40 dmg).";
    this.move2name = "Hand Crusher";
    this.move2desc = "With a glove fulla vaseline. <br>Does more damage on characters with low max hp (0-25 dmg).";

    this.attack1 = function(user, target) {
        let damage = 40 - Math.floor(40*user.hp/user.maxhp);
        target.changehp(-damage);
        return typeText(`${user.name} pulls on ${target.name}'s hair for ${damage} damage!`, true);
    }

    this.attack2 = function(user, target) {
        let damage = Math.floor(1250/target.maxhp);
        target.changehp(-damage);
        return typeText(`${user.name} crushes ${target.name}'s hand for ${damage} damage!`, true);
    }
}

function Shrek() {
    Character.call(this);

    this.name = "Shrek";
    this.description = "Dreamwork's All-Star";
    this.quest = "Go hunt in the swamp.";
    this.entrance = "Swamps are dangerous places. What makes this swamp even more dangerous, though, is that it is HIS swamp."
    + " \"Oh hello there! Shrek here, and I'm ticked off!\"";
    this.maxhp = 80;

    this.move1name = "Shrek Superslam";
    this.move1desc = "Wombo Combo. <br>(5 dmg) <br>+5 extra damage per party member.";
    this.move2name = "Onion Onslaught";
    this.move2desc = "O n i o n. <br>Throw 5 onions. <br>50% chance to hit an onion (6 dmg).";

    this.attack1 = function(user, target) {
        let allies = 0;
        if (!party.includes(user)) allies = Math.floor(Math.random()*5);
        else allies = party.length - 1;

        let damage = 5*(allies + 1);
        target.changehp(-damage);
        return typeText(`${user.name} calls upon ${allies} allies and executes a Wombo Combo on ${target.name} for ${damage} damage!`, true);
    }

    this.attack2 = function(user, target) {
        let hits = 0;
        let shots = 0;
        let message1 = `${user.name} gets the onions! They hit ${hits}/${shots}`;
        let message1Time = typeText(message1, true);
        let message2 = " onions!";
        let message2Time = getTypeTextTime(message2);
        const missChance = 0.5;
        
        for (let i = 0; i < 6; i++) {
            shots++;
            if (Math.random() > missChance) {
                hits++;
                timeouts.push(setTimeout(replaceText, message1Time + shots*5*textSpeed, `${hits - 1}/${shots - 1}`, `${hits}/${shots}`));
            }
            else timeouts.push(setTimeout(replaceText, message1Time + shots*5*textSpeed, `${hits}/${shots - 1}`, `${hits}/${shots}`));
        }
        timeouts.push(setTimeout(typeText, message1Time + (shots + 1)*5*textSpeed, message2, false));
        target.changehp(-6*hits);
        return message1Time + (shots + 1)*5*textSpeed + message2Time;
    }
}

function Washington() {
    Character.call(this);

    this.name = "George Washington";
    this.description = "Father of our Country";
    this.quest = "Break into the Whitehouse.";
    this.entrance = "You get past securty like a watermelon knife going through a stick of butter that has been in the oven for 5 hours."
    + " You're expecting to see Trump aren't you? That would be too unoriginal, even for Copyright Adventure Deluxe."
    + " \"What have they done to my country? Look at this debt!\"";
    this.maxhp = 50;

    this.move1name = "Cherry Chop";
    this.move1desc = "It's no lie. <br>More damage against tougher enemies. <br>(10-40 dmg).";
    this.move2name = "Musket Blast";
    this.move2desc = "Go Minuteman mode. <br>(40 dmg) <br>Must reload after firing.";

    this.attack1 = function(user, target) {
        let damage = -20 + Math.floor(0.6*target.maxhp);
        if (damage > 40) damage = 40;
        target.changehp(-damage);
        return typeText(`${user.name} swings an axe on ${target.name} for ${damage} damage!`, true);
    }

    this.attack2 = function(user, target) {
        if (user.special == 0) {
            target.changehp(-40);
            user.special = 1;
            return typeText(`${user.name} fires a musket at ${target.name} for 40 damage!`, true);
        }
        else {
            user.special = 0;
            return typeText(`${user.name} reloads their musket.`, true);
        }
    }
}

function Ramsay() {
    Character.call(this);

    this.name = "Gordon Ramsay";
    this.description = "Aggressive Chef";
    this.quest = "Enter the kitchen.";
    this.entrance = "You're feeling a little hungry, so you take a trip to the local kitchen. Using the equipment available, you make a PB&J."
    + " A man dressed in white approaches as you chomp away. \"Do you have any idea where you are? You're in Hell's Kitchen!\"";
    this.maxhp = 50;

    this.move1name = "Pan Slam";
    this.move1desc = "Very unoriginal. <br>(15 dmg)";
    this.move2name = "Gordonmet";
    this.move2desc = "Exquisitely gourmet. <br>Cook a meal for Gordon or a teammate (+20 hp)!";

    function clickToHeal(currentFighter, thisPartyMember, enemy) {
        displayParty(currentFighter, enemy, false, null);
        hideBattleButtons();
        thisPartyMember.changehp(20);
        let message = `${currentFighter.name} cooks a gourmet meal for ${thisPartyMember.name}. They recover 20 hp.`;
        timeouts.push(setTimeout(damageAnimation, typeText(message, true), currentFighter, enemy, true));
        ramsaySetDefault(currentFighter);
    }

    function ramsaySetDefault(char) {
        char.move1name = "Pan Slam";
        char.move1desc = "Very unoriginal. <br>(15 dmg)";
        char.move2name = "Gordonmet";
        char.move2desc = "Exquisitely gourmet. <br>Cook a meal for Gordon or a teammate (+20 hp)!";
        char.attack1 = defaultAttack1;
        char.attack2 = defaultAttack2;
    }

    function ramsaySetAltered(char) {
        char.move1name = "Heal Self";
        char.move1desc = "Let Gordon eat the meal. <br>(+20 hp)";
        char.move2name = "Cancel";
        char.move2desc = "Go back to move selection.";
        char.attack1 = alteredAttack1;
        char.attack2 = alteredAttack2;
    }

    function defaultAttack1(user, target) {
        target.changehp(-15);
        return typeText(`${user.name} hits ${target.name} with a frying pan for 15 damage!`, true);
    }

    function alteredAttack1(user, target) {
        user.changehp(20);
        ramsaySetDefault(user);
        return typeText(`${user.name} cooks a gourmet meal for themself. They recover 20 hp.`, true);
    }

    function defaultAttack2(user, target) {
        if (!party.includes(user)) {
            user.changehp(20);
            return typeText(`${user.name} cooks a gourmet meal for themself. They recover 20 hp.`, true);
        }
        else {
            displayParty(user, target, false, clickToHeal);
            ramsaySetAltered(user);
            displayBattleButtons(user, target, true);
        }
        return 9999999999;
    }

    function alteredAttack2(user, target) {
        displayParty(user, target, true, changeCharacterEnemyFirst);
        ramsaySetDefault(user);
        displayBattleButtons(user, target, true);
        return 9999999999;
    }

    this.attack1 = defaultAttack1;

    this.attack2 = defaultAttack2;
}
                                        // Utility Functions
function clearAllTimeouts() {
    // console.log(`There were ${timeouts.length} timeouts.`);
    for (let i = 0; i < timeouts.length; i++) {
        clearTimeout(timeouts[i]);
    }
    timeouts = [];
}

function setStartConditions() {
    clearAllTimeouts();
    party = [];
    displayParty(null, null, false, null);
    addAllEnemiesToPool();
    clearTextBox();
    displayNameEntry(false);
    displayAreaSelection([]);
    hideBattleButtons();
    hideCurrentFighters();
}

function setOptionButtonFunctions() {
    const restartButton = $("#restart");
    restartButton.off("click").on("click", startNewGame);

    const gameSpeedButtons = [$("#normal"), $("#fast"), $("#ultra")];
    gameSpeedButtons[gameSpeed].css("background-color", "grey");
    for (let i = 0; i < gameSpeedButtons.length; i++) {
        gameSpeedButtons[i].off("mouseenter").on("mouseenter", function() {
            gameSpeedButtons[i].css("background-color", "grey");
        });
        gameSpeedButtons[i].off("mouseleave").on("mouseleave", function() {
            if (gameSpeed != i) gameSpeedButtons[i].css("background-color", "lightgrey");
        });
        gameSpeedButtons[i].off("click").on("click", function() {
            changeGameSpeed(i);
            for (let x = 0; x < gameSpeedButtons.length; x++) {
                gameSpeedButtons[x].css("background-color", "lightgrey");
            }
            gameSpeedButtons[i].css("background-color", "grey");
        });
    }
}

function changeGameSpeed(speed) {
    gameSpeed = speed;
    if (speed == 0) {
        textSpeed = 30;
    }
    else if (speed == 1) {
        textSpeed = 15;
    }
    else {
        textSpeed = 5;
    }
}

function addAllEnemiesToPool() {
    fightPool = [];
    const blart = new Blart(); blart.refresh(); fightPool.push(blart);
    const wick = new Wick(); wick.refresh(); fightPool.push(wick);
    const derrek = new Derrek(); derrek.refresh(); fightPool.push(derrek);
    const bowers = new Bowers(); bowers.refresh(); fightPool.push(bowers);
    const chief = new Chief(); chief.refresh(); fightPool.push(chief);
    const lennie = new Lennie(); lennie.refresh(); fightPool.push(lennie);
    const shrek = new Shrek(); shrek.refresh(); fightPool.push(shrek);
    const washington = new Washington(); washington.refresh(); fightPool.push(washington);
    const ramsay = new Ramsay(); ramsay.refresh(); fightPool.push(ramsay);
}

function removeEnemyFromPool(enemy) {
    fightPool.splice(fightPool.indexOf(enemy), 1);
}

function getHealthBarColor(hp, maxhp) {
    let float = hp/maxhp;
    if (float > 0.6666) return "lightgreen";
    else if (float > 0.3333) return "orange";
    else return "red";
}
                                        // UI Functions
// This function can be used as a `delay` parameter for setTimeout, to set an action after the message has been typed.
function typeText(message, newLine) {
    let specialCharDelay = 0;
    let text = $("#text");
    if (message.length > 0 && newLine) text.append("<br>>> ");

    for (let i = 0; i < message.length; i++) {
        timeouts.push(setTimeout(function() {text.append(message[i])}, i*textSpeed + specialCharDelay*textSpeed));
        if (message[i] == '.' || message[i] == '?'|| message[i] == '!') {
            if (i + 1 < message.length && (message[i + 1] == "\"" || message[i + 1] == "'")) {
                i++;
                let lastItem = timeouts.length - 1;
                clearTimeout(timeouts[lastItem]);
                timeouts[lastItem] = setTimeout(function() {text.append(message[i-1])}, (i-1)*textSpeed + specialCharDelay*textSpeed)
                timeouts.push(setTimeout(function() {text.append(message[i])}, i*textSpeed + specialCharDelay*textSpeed));
            }
            specialCharDelay += 9;
        }
        else if (message[i] == ',') specialCharDelay += 4;
    }
    
    let messageLengthTime = message.length*textSpeed + specialCharDelay*textSpeed;
    if (message.length > 0) timeouts.push(setTimeout(trimTextBox, messageLengthTime));
    return messageLengthTime;
}

function getTypeTextTime(message) {
    let specialCharDelay = 0;
    let specialQuotes = 0;
    for (let i = 0; i < message.length; i++) {
        if (message[i] == '.' || message[i] == '?' || message[i] == '!') {
            if (i < message.length - 1 && (message[i + 1] == "\"" || message[i + 1] == "'")) {
                specialQuotes++;
            }
            specialCharDelay += 9;
        }
        else if (message[i] == ',') specialCharDelay += 4;
    }
    let messageLengthTime = message.length*textSpeed + specialCharDelay*textSpeed - specialQuotes*textSpeed;
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

function trimTextBox() {
    let textBox = $("#text");
    let textString = textBox.html();
    if (textString.length > 1500) textBox.html(textString.substring(textString.length - 1500));
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
        $("#areaSelectDisplay").css("display", "none");
        return;
    }

    let areaSelectButtons = [$("#areaButton1"), $("#areaButton2"), $("#areaButton3")];
    for (let i = 0; i < 3; i++) {
        $(`#areaButton${i + 1}`).css("display", "none");
        $(`#area${i + 1}`).css("display", "none");
    }
    for (let i = 0; i < pickedFights.length && i < 3; i++) {
        areaSelectButtons[i].html(pickedFights[i].quest);
        areaSelectButtons[i].off("click").on("click", function () {
            displayAreaSelection([]);
            removeEnemyFromPool(pickedFights[i]);
            enemyEntrance(pickedFights[i]);
        });
        // Setting image for area goes here
        $(`#areaButton${i + 1}`).css("display", "inline-block");
        $(`#area${i + 1}`).css("display", "inline-block");
    }
    $("#areaSelectButtonContainer").css("display", "flex");
    $("#areaSelectDisplay").css("display", "flex");
}

function displayCurrentFighters(player, enemy) {
    if (enemy == null) console.log("In no situation should there be a null enemy during a battle.");
    if (player == null) {
        $("#currentFighterName").html("...");
        $("#currentFighterDesc").html("...");
        $("#currentFighterPicture").attr("src", "characterPictures/empty character.png");
        $("#currentFighterBarLabel").html("");
        $("#currentFighterBar").css("width", "0");
    }
    else {
        $("#currentFighterName").html(player.name);
        $("#currentFighterDesc").html(player.description);
        $("#currentFighterPicture").attr("src", player.picture);
        let displayhp = player.displayhp; let maxhp = player.maxhp;
        let healthBarColor = getHealthBarColor(displayhp, maxhp);
        $("#currentFighterBarLabel").html(`${displayhp}/${maxhp}`);
        $("#currentFighterBar").css({"width":`${100*displayhp/maxhp}%`,"background-color":healthBarColor});
    }
    $("#currentEnemyName").html(enemy.name);
    $("#currentEnemyDesc").html(enemy.description);
    $("#currentEnemyPicture").attr("src", enemy.picture);
    let displayhp = enemy.displayhp; let maxhp = enemy.maxhp;
    let healthBarColor = getHealthBarColor(displayhp, maxhp);
    $("#currentEnemyBarLabel").html(`${displayhp}/${maxhp}`);
    $("#currentEnemyBar").css({"width":`${100*displayhp/maxhp}%`,"background-color":healthBarColor});

    $("#battleDisplay").css("display", "grid");
}

function hideCurrentFighters() {
    $("#battleDisplay").css("display", "none");
}

function displayBattleButtons(fighter, enemy, setButtonFunctions) {
    buttons = [$("#attack1button"), $("#attack2button")];
    labels = [$("#attack1label"), $("#attack2label")];

    if (fighter == null) {   
        buttons[0].html("");
        buttons[1].html("");
        labels[0].html("");
        labels[1].html("");

        if (setButtonFunctions) {
            buttons[0].off("click");
            buttons[1].off("click");
        }
    }

    else {
        buttons[0].html(fighter.move1name);
        buttons[1].html(fighter.move2name);
        labels[0].html(fighter.move1desc);
        labels[1].html(fighter.move2desc);

        if (setButtonFunctions) {
            buttons[0].off("click").on("click", function() {
                hideBattleButtons(); 
                displayParty(fighter, enemy, false, null);
                timeouts.push(setTimeout(damageAnimation, fighter.attack1(fighter, enemy), fighter, enemy, true));
            });
            buttons[1].off("click").on("click", function() {
                hideBattleButtons(); 
                displayParty(fighter, enemy, false, null);
                timeouts.push(setTimeout(damageAnimation, fighter.attack2(fighter, enemy), fighter, enemy, true));
            });
        }
    }
    $("#battleButtonContainer").css("display", "grid");
}

function hideBattleButtons() {
    $("#battleButtonContainer").css("display", "none");
}
                                        // Game Logic/Flow Functions
// Enter 'null' as onClickFunction if you want the buttons to do nothing
function displayParty(currentFighter, enemy, previewOnHover, onClickFunction) {
    $("#partyMemberContainer").off("mouseleave");
    let partyDivContents = "";
    for (let i = 0; i < party.length; i++) {
        $(`#party${i}`).off();
        $(`#party${i} *`).css("cursor", "default");
        if (currentFighter != null && currentFighter == party[i]) continue;

        let healthBarColor = getHealthBarColor(party[i].displayhp, party[i].maxhp);
        partyDivContents += 
        `<div class="partyMemberContainer" id="party${i}">
            <img src="${party[i].picture}"></img>
            <div class="progressBarBackground" style="background-color:whitesmoke;"></div>
            <div class="progressBar" id="progress${i}" style="background-color:${healthBarColor}; width:calc(100% * ${party[i].displayhp}/${party[i].maxhp});"></div>
            <label class="progressBarLabel">${party[i].displayhp}/${party[i].maxhp}</label>
            <label class="partyName">${party[i].name}</label>
        </div>`;
    }
    $("#partyList").html(partyDivContents);

    if (onClickFunction != null) {
        if (previewOnHover) $(".partyMemberContainer").on("mouseleave", function() {
            displayBattleButtons(currentFighter, enemy, true);
            displayCurrentFighters(currentFighter, enemy);
        });
        for (let i = 0; i < party.length; i++) {
            if (currentFighter != null && party[i] == currentFighter) continue;

            $(`#party${i} *`).css("cursor", "pointer");
            $(`#party${i}`).on("click", function() {onClickFunction(currentFighter, party[i], enemy)});
            $(`#party${i}`).on("mouseenter", function() {$(`#party${i}`).css("border", "1px solid black")});
            if (previewOnHover) $(`#party${i}`).on("mouseenter", function() {
                displayBattleButtons(party[i], enemy, false);
                displayCurrentFighters(party[i], enemy, false);
            });
            $(`#party${i}`).on("mouseleave", function() {$(`#party${i}`).css("border", "3px solid black")});
        }
    }
}

function changeCharacterPlayerFirst(currentFighter, thisPartyMember, enemy) {
    displayParty(thisPartyMember, enemy, false, null);
    hideBattleButtons();
    timeouts.push(setTimeout(playerTurn, typeText(`${thisPartyMember.name} enters the ring!`, true), thisPartyMember, enemy));
}

function changeCharacterEnemyFirst(currentFighter, thisPartyMember, enemy) {
    displayParty(thisPartyMember, enemy, false, null);
    hideBattleButtons();
    timeouts.push(setTimeout(enemyTurn, typeText(`${thisPartyMember.name} takes ${currentFighter.name}'s place.`, true), thisPartyMember, enemy));
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
                enemy.refresh();
                party.push(enemy);
            }
        }
        else {
            if (enemy.boss) enemyDead = `${enemy.name} annihilated themselves. You won!`;
            else {
                enemyDead = `${enemy.name} died during their own attack and joined the party!`;
                enemy.refresh();
                party.push(enemy);
            }
        }
        afterFightWholeParty();
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
    else if (playerDead != "") timeouts.push(setTimeout(playerTurn, totalMessageTime, null, enemy));
    else if (wasPlayerTurn) timeouts.push(setTimeout(enemyTurn, totalMessageTime, player, enemy));
    else timeouts.push(setTimeout(playerTurn, totalMessageTime, player, enemy));
}

function afterFightWholeParty() {
    for (let i = 0; i < party.length; i++) {
        party[i].afterFight();
    }
}

function gameOver() {
    timeouts.push(setTimeout(typeText, typeText("You are out of party members.", true), "GAME OVER - Press the restart button to try again.", true));
}

function damageAnimation(player, enemy, wasPlayerTurn) {
    for (let i = 0; i < party.length; i++) {
        party[i].displayhp = party[i].hp;
    }
    displayCurrentFighters(player, enemy);
    displayParty(player, enemy, false, null);
    checkBattleStatus(player, enemy, wasPlayerTurn);
}

function playerTurn(player, enemy) {
    displayCurrentFighters(player, enemy);
    if (player == null) {
        displayParty(player, enemy, true, changeCharacterPlayerFirst);
        displayBattleButtons(player, enemy, true);
    } 
    else if (player.charging == 0) {
        displayParty(player, enemy, true, changeCharacterEnemyFirst);
        displayBattleButtons(player, enemy, true);
    }
    else {
        displayParty(player, enemy, false, null);
        if (player.charging == 1) timeouts.push(setTimeout(damageAnimation, player.attack1(player, enemy), player, enemy, true));
        else timeouts.push(setTimeout(damageAnimation, player.attack2(player, enemy), player, enemy, true));
    }
    
}

function enemyTurn(player, enemy) {
    displayCurrentFighters(player, enemy);
    displayParty(player, enemy, false, null);
    if (enemy.charging == 0) {
        let randAttack = Math.floor(Math.random() * 2);
        if (randAttack == 0) timeouts.push(setTimeout(damageAnimation, enemy.attack1(enemy, player), player, enemy, false));
        else timeouts.push(setTimeout(damageAnimation, enemy.attack2(enemy, player), player, enemy, false));
    }
    else {
        if (enemy.charging == 1) timeouts.push(setTimeout(damageAnimation, enemy.attack1(enemy, player), player, enemy, false));
        else timeouts.push(setTimeout(damageAnimation, enemy.attack2(enemy, player), player, enemy, false));
    }
}

function enemyEntrance(enemy) {
    timeouts.push(setTimeout(playerTurn, typeText(enemy.entrance, true), null, enemy));
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
                const playerChar = new Character();
                playerChar.name = playerName;
                playerChar.description = playerDesc;
                party.push(playerChar);
                timeouts.push(setTimeout(areaSelect, typeText("Prepare to embark on your epicc quest...", true)));
            }
        };
        timeouts.push(setTimeout(displayNameEntry, typeText(descPrompt, true), true));
    }
    timeouts.push(setTimeout(displayNameEntry, typeText(welcomePrompt, true), true));
}

function areaSelect() {
    displayParty(null, null, false, null);
    hideCurrentFighters();
    let message = "What an exhilarating battle! You're not done yet, though. There are still opponents to be conquered. What will you do next?";
    if (fightPool.length == 9) { // Display different message for if the game has just started.
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
