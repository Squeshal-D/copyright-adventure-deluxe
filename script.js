var gameSpeed = 0;  // 0-2, 2 is fastest
var textSpeed = 30;
var damageSpeed = 1000;
var smartEnemies = 0;  // 0 = random, 1 = smart

const textScrollSound = new Audio("sounds/textScroll.wav");
const selectSound = new Audio("sounds/select.mp3");
const healSound = new Audio("sounds/heal.wav");
const damageSound = new Audio("sounds/damage.mp3");
const buttonHoverSound = new Audio("sounds/buttonHover.wav");
const victorySound = new Audio("sounds/win.wav");
const deathSound = new Audio("sounds/death.wav");
const gameOverSound = new Audio("sounds/gameOver.wav");
const secretSound = new Audio("sounds/secret.wav");

const PLAYER_ID = 0;
const BLART_ID = 1;
const WICK_ID = 2;
const DERREK_ID = 3;
const BOWERS_ID = 4;
const CHIEF_ID = 5;
const LENNIE_ID = 6;
const SHREK_ID = 7;
const WASHINGTON_ID = 8;
const RAMSAY_ID = 9;
const THANOS_ID = 10;
const HEROBRINE_ID = 11;
const SANS_ID = 12;
const HITSAT_ID = 13;

var playerName = "";
var playerDesc = "";
var timeouts = [];

var party = [];
var fightPool = [];
var minibossPool = [];
var finalBoss;

var partySwapDisabled = false;
var bowersStatus = 0; // 0 = not encountered, 1 = in party, 2 = dead

var turns = 0;
var enemyAttacksTotal = 0;
var enemyAttacksSmart = 0;
var fightsWon = 0;
var bossesKilled = 0;
var finalBossKilled = 0;
var scoreTotal = 0;
                                        // Characters
function Character() {
    this.id = 0;
    this.name = playerName;
    this.description = playerDesc;
    this.quest = "";
    this.questPicture = "icons/cad icon.png";
    this.entrance = "";
    this.picture = "characterPictures/empty character.png";
    this.maxhp = 50;
    this.hp = 50;
    this.displayhp = 50;

    this.boss = false;
    this.charging = 0;

    this.move1name = "Punch";
    this.move1desc = "How normal. <br>(15-25 dmg)";
    this.move2name = "Juul";
    this.move2desc = "A sophomore classic. <br>May trigger a Bowers attack (30 dmg).";

    this.changehp = function(damage) {
        this.hp += damage;
        if (this.hp > this.maxhp) this.hp = this.maxhp;
        else if (this.hp < 0) this.hp = 0;
    }

    this.refresh = function() {
        this.hp = this.maxhp;
        this.displayhp = this.maxhp;
        this.charging = 0;
    }

    this.afterFight = function() {
        this.charging = 0;
    }

    this.attack1 = function(user, target) {
        if (target.id == HEROBRINE_ID && !target.house) {
            stopPlaySound(secretSound);
            target.house = true;
            return typeText(`${user.name} punches... a tree! They build a house out of the wood, and the party is now safe from any monsters!`, true);
        }
        let randInt = 15 + Math.floor(Math.random()* 11);
        target.changehp(-randInt);
        return typeText(`${user.name} punches ${target.name} for ${randInt} damage!`, true);
    }

    this.attack1Info = function(user, target) {
        return "(15-25 dmg)";
    }

    this.attack2 = function(user, target) {
        if (target.id == BOWERS_ID) {
            user.changehp(-999);
            return typeText(`What have you done!? ${target.name} sends ${user.name} to the shadow realm for 999 damage! Remember, kids, Mr. Bowers ` + 
            `says that vaping is bad for you and can cause lung damage or something.`, true);
        }
        else if (bowersStatus == 0) {
            let randInt = Math.floor(Math.random() * 2);
            if (randInt == 1) {
                target.changehp(-30);
                return typeText(`Bowers senses the vape and springs out of nowhere! He annihilates ${target.name} for 30 dmg!`, true);
            }
            else return typeText(`${user.name} vapes undisturbed. ${target.name} is jealous.`, true);
        }
        else if (bowersStatus == 1) {
            target.changehp(-30);
            return typeText(`${user.name} vapes, and Bowers is enraged by the sight of the pen! He disciplines ${target.name} for 30 damage.`, true);
        }
        else {
            return typeText(`${user.name} vapes in memory of Mr. Bowers.`, true);
        }
    }

    this.attack2Info = function(user, target) {
        if (target.id == BOWERS_ID) return "(?)";
        else if (bowersStatus == 0) return "(50%)";
        else if (bowersStatus == 1) return "(100%)";
        return "(0%)";
    }

    this.smartAttack = function (user, target) {
        switch (bowersStatus) {
            case 1: return this.attack2(user, target);
            case 2: return this.attack1(user, target);
            default: 
                if (target.hp <= 20 || Math.floor(Math.random() * 2) == 0) return this.attack1(user, target);
                else return this.attack2(user, target);
        }
    }
}

function Blart() {
    Character.call(this);

    this.id = 1;
    this.name = "Paul Blart";
    this.description = "Mall Cop";
    this.quest = "Take a trip to the mall.";
    this.entrance = "Many of the people in the mall don't seem to be positively responding to you trying to pick a fight."
    + " It's no wonder you've been reported. Then you see him. \"I swore an oath to protect this mall.\"";
    this.maxhp = 80;

    this.move1name = "Segway Slam";
    this.move1desc = "An all-out rollout. <br>Has a 50% chance to hit (40 dmg), as well as a 50% chance to recoil (20 self dmg).";
    this.move2name = "Headbutt";
    this.move2desc = "\"Nobody wins with a headbutt.\" <br>(25 dmg) (10 self dmg).";

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

    this.attack1Info = function(user, target) {
        return "(0/40 dmg) (0/20 self dmg)";
    }

    this.attack2 = function(user, target) {
        target.changehp(-25);
        user.changehp(-10);
        if (target.id == THANOS_ID && !target.dazed) {
            stopPlaySound(secretSound);
            target.dazed = true;
            return typeText(`${user.name} went for the head. ${target.name} recieves 25 dmg, and is dazed to the point of impaired motor skills. ` +
            `${user.name} recieves 10 dmg in recoil.`, true);
        }
        return typeText(`${user.name} headbutts ${target.name} for 25 dmg, but recieves 10 dmg in recoil!`, true);
    }

    this.attack2Info = function(user, target) {
        return "(25 dmg) (10 self dmg)";
    }

    this.smartAttack = function (user, target) {
        if (target.hp <= 25 || (target.hp <= 50 && user.hp > 30)) return this.attack2(user, target);
        else if (target.hp <= 40 && user.hp <= 20) return this.attack1(user, target);
        else {
            if (Math.floor(Math.random() * 2) == 0) return this.attack1(user, target);
            else return this.attack2(user, target);
        }
    }
}

function Wick() {
    Character.call(this);

    this.id = 2;
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

    this.attack1Info = function(user, target) {
        return "(0-? dmg)";
    }

    this.attack2 = function(user, target) {
        if (target.id == SANS_ID && !target.snapped) {
            stopPlaySound(secretSound);
            target.snapped = true;
            return typeText(`${user.name} snaps ${target.name}'s neck! Wait, they actually just snapped ${target.name}'s whacking bone!`, true);
        }
        let chance = 10/target.hp;
        let roll = Math.random();
        if (roll <= chance) {
            target.changehp(-target.hp);
            return typeText(`${user.name} snaps ${target.name}'s neck!`, true);
        }
        else return typeText(`${user.name} only manages to turn ${target.name}'s head.`, true);
    }

    this.attack2Info = function(user, target) {
        let chance = Math.floor(1000/target.hp);
        if (chance > 100) chance = 100;
        return `(${chance}% kill)`
    }

    this.smartAttack = function(user, target) {
        if (10/target.hp >= 0.6 || (Math.random() < 10/target.hp)) return this.attack2(user, target);
        else return this.attack1(user, target);
    }
}

function Derrek() {
    Character.call(this);

    this.id = 3;
    this.name = "Derrek";
    this.description = "Sharks Fan";
    this.quest = "Go to Derrek's house.";
    this.entrance = "You go up to Derrek's house and knock on the door. Derrek's mom answers the door. She is very nice, and you ask her if Derrek is home."
        + " She invites you in and gives you some hot cocoa. You are rudely interrupted by Derrek, though. You put down the cocoa and tell Derrek's mom, "
        + " \"Sorry, but I'm going to have to kick your son's bootay.\"";
    this.maxhp = 60;

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

    this.attack1Info = function(user, target) {
        if (target.hp < 30) return "(kill)";
        return "(15 dmg)";
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

    this.attack2Info = function(user, target) {
        return "(25 dmg) (20% death)";
    }

    this.smartAttack = function(user, target) {
        if (target.hp <= 30) return this.attack1(user, target);
        else if (user.hp <= 20) return this.attack2(user, target);
        else if (target.hp <= 45) return this.attack1(user, target);
        else {
            if (Math.floor(Math.random() * 3) < 2) return this.attack2(user, target);
            else return this.attack1(user, target);
        }
    }
}

function Bowers() {
    Character.call(this);

    this.id = 4;
    this.name = "John Bowers";
    this.description = "Disher of Discipline";
    this.quest = "Visit CVCHS.";
    this.questPicture = "places/cvchs.png";
    this.entrance = "You've arrived in the senior lot. Something isn't right. The gate is closed. You look at the time."
    + " Would anyone be willing to fight at 8:01? You turn around when, \"HEY! I've caught you!\"";
    this.maxhp = 50;

    this.move1name = "Ambush";
    this.move1desc = "You can never expect it. <br>(15 dmg) <br>(30 dmg) on full hp opponents.";
    this.move2name = "Words of Encouragement";
    this.move2desc = "Word Diarrhea. <br>Heals enemy (+15 hp) on first two uses. Claps enemy (120 dmg) on third use.";

    this.spokenTo = [];

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

    this.attack1Info = function(user, target) {
        if (target.hp == target.maxhp) return "(30 dmg)";
        return "(15 dmg)";
    }

    this.attack2 = function(user, target) {
        let spokenToEnemy = 0;
        for (let i = 0; i < user.spokenTo.length; i++) if (user.spokenTo[i] == target) spokenToEnemy++;
        let message = `${user.name} spread words of encouragement.`;
        if (spokenToEnemy%3 == 0) {
            target.changehp(10);
            message += ` ${target.name} was inspired deeply and healed 10 hp.`;
        }
        else if (spokenToEnemy%3 == 1) {
            target.changehp(10);
            message += ` ${target.name} was inspired a little and healed 10 hp.`;
        }
        else {
            target.changehp(-120);
            message += ` ${target.name} was so annoyed that they got CLAPPED for 120 damage!`;
        }
        user.spokenTo.push(target);
        return typeText(message, true);
    }

    this.attack2Info = function(user, target) {
        let spokenToEnemy = 0;
        for (let i = 0; i < user.spokenTo.length; i++) if (user.spokenTo[i] == target) spokenToEnemy++;
        return `(${spokenToEnemy%3 + 1} / 3)`
    }

    this.smartAttack = function(user, target) {
        return this.attack1(user, target);
    }
}

function Chief() {
    Character.call(this);

    this.id = 5;
    this.name = "Master Chief";
    this.description = "AKA Halo";
    this.quest = "Hijack a space vessel.";
    this.questPicture = "places/space.png";
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

    this.attack1Info = function(user, target) {
        return "(~16 dmg)";
    }

    this.attack2 = function(user, target) {
        if (user.charging == 0) {
            user.charging = 2;
            return typeText(`${user.name} charges the spartan laser!`, true);
        }
        else {
            user.charging = 0;
            if (target.id == SANS_ID) {
                stopPlaySound(secretSound);
                target.dodgesLeft -= 2;
                target.changehp(-40);
                return typeText(`${user.name} fires the Gaster Blaster at ${target.name} 3 times!`, true);
            }
            target.changehp(-40);
            return typeText(`${user.name} fires the spartan laser at ${target.name} for 40 damage!`, true);
        }
    }

    this.attack2Info = function(user, target) {
        return "(40 dmg) (2 turns)";
    }

    this.smartAttack = function(user, target) {
        if (target.hp <= 30 || user.hp <= 30) return this.attack1(user, target);
        else return this.attack2(user, target);
    }
}

function Lennie() {
    Character.call(this);

    this.id = 6;
    this.name = "Lennie Small";
    this.description = "Pro Rabbit Tender";
    this.quest = "Go into that big ol barn over there.";
    this.questPicture = "places/farm.png";
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

    this.attack1Info = function(user, target) {
        let damage = 40 - Math.floor(40*user.hp/user.maxhp);
        return `(${damage} dmg)`
    }

    this.attack2 = function(user, target) {
        let damage = Math.floor(1250/target.maxhp);
        if (damage > 25) damage = 25;
        target.changehp(-damage);
        if (target.id == THANOS_ID && !target.crushed) {
            stopPlaySound(secretSound);
            target.crushed = true;
            return typeText(`${user.name} crushes ${target.name}'s hand for ${damage} damage! ${target.name} can no longer snap!`, true);
        }
        return typeText(`${user.name} crushes ${target.name}'s hand for ${damage} damage!`, true);
    }

    this.attack2Info = function(user, target) {
        let damage = Math.floor(1250/target.maxhp);
        if (damage > 25) damage = 25;
        return `(${damage} dmg)`
    }

    this.smartAttack = function(user, target) {
        if (40 - Math.floor(40*user.hp/user.maxhp) > Math.floor(1250/target.maxhp)) return this.attack1(user, target);
        else return this.attack2(user, target);
    }
}

function Shrek() {
    Character.call(this);

    this.id = 7;
    this.name = "Shrek";
    this.description = "Dreamwork's All-Star";
    this.quest = "Go hunt in the swamp.";
    this.questPicture = "places/swamp.png";
    this.entrance = "Swamps are dangerous places. What makes this swamp even more dangerous, though, is that it is HIS swamp."
    + " \"Oh hello there! Shrek here, and I'm ticked off!\"";
    this.maxhp = 80;

    this.move1name = "Shrek Superslam";
    this.move1desc = "Wombo Combo. <br>(4 dmg) <br>+4 extra damage per party member.";
    this.move2name = "Onion Onslaught";
    this.move2desc = "O n i o n. <br>Throw 5 onions. <br>50% chance to hit an onion (6 dmg).";

    this.attack1 = function(user, target) {
        let allies = 0;
        if (!party.includes(user)) allies = Math.floor(Math.random()*5);
        else allies = party.length - 1;

        let damage = 4*(allies + 1);
        target.changehp(-damage);
        return typeText(`${user.name} calls upon ${allies} allies and executes a Wombo Combo on ${target.name} for ${damage} damage!`, true);
    }

    this.attack1Info = function(user, target) {
        let damage = party.length * 4;
        return `(${damage} dmg)`;
    }

    this.attack2 = function(user, target) {
        let hits = 0;
        let shots = 0;
        let message1 = `${user.name} gets the onions! They hit ${hits}/${shots}`;
        let message1Time = typeText(message1, true);
        let message2 = " onions!";
        let message2Time = getTypeTextTime(message2);
        const missChance = 0.5;
        
        for (let i = 0; i < 5; i++) {
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

    this.attack2Info = function(user, target) {
        return "(0-30 dmg)";
    }

    this.smartAttack = function(user, target) {
        if (party.includes(this)) {
            if (4 * party.length >= target.hp || 4 * party.length > 15) return this.attack2(user, target);
            else return this.attack1(user, target);
        }
        else if (target.hp <= 4) return this.attack1(user, target);
        else return this.attack2(user, target);
    }
}

function Washington() {
    Character.call(this);

    this.id = 8;
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

    this.musketLoaded = true;

    this.refresh = function() {
        this.hp = this.maxhp;
        this.displayhp = this.maxhp;
        this.charging = 0;
        this.musketLoaded = true;
    }

    this.attack1 = function(user, target) {
        let damage = -20 + Math.floor(0.6*target.maxhp);
        if (damage > 40) damage = 40;
        else if (damage < 10) damage = 10;
        target.changehp(-damage);
        return typeText(`${user.name} swings an axe on ${target.name} for ${damage} damage!`, true);
    }

    this.attack1Info = function(user, target) {
        let damage = -20 + Math.floor(0.6*target.maxhp);
        if (damage > 40) damage = 40;
        else if (damage < 10) damage = 10;
        return `(${damage} dmg)`
    }

    this.attack2 = function(user, target) {
        if (user.musketLoaded) {
            if (target.id == LENNIE_ID) {
                target.changehp(-300);
                user.musketLoaded = false;
                stopPlaySound(secretSound);
                let messages = [
                    `${user.name} and ${target.name} go down to the river and sit down.`,
                    `"Tell me about the rabbits, ${user.name}," said ${target.name}.`,
                    `"Well, we gonna get a little place. We'll have a cow..."`,
                    `${user.name} raises the musket with quivering hands.`,
                    `${user.name} continued, "an' down the flat we'll have a... little piece alfalfa..."`,
                    `"For the rabbits!" ${target.name} shouted.`,
                    `"For the rabbits," ${user.name} repeated.`,
                    `"And I get to tend the rabbits."`,
                    `"An' you get to tend the rabbits."`,
                    `${target.name} giggled with happiness. "An' live on the fatta the lan'."`,
                    `"Yes."`,
                    `${user.name} aims the musket where the spine and skull are joined.`,
                    `"When we gonna do it, ${user.name}?" asked ${target.name}.`,
                    `"Gonna do it soon."`,
                    `${user.name} pulled the trigger. The crash of the shot rolled up and down the hills.`
                ];
                continueMessage(0);
                function continueMessage(index) {
                    if (index >= messages.length) {
                        if (!party.includes(target)) damageAnimation(user, target, true);
                        else damageAnimation(user, target, false);
                    }
                    else {
                        timeouts.push(setTimeout(continueMessage, typeText(messages[index], true), index + 1));
                    }
                }
                return 9999999999;
            }
            target.changehp(-40);
            user.musketLoaded = false;
            return typeText(`${user.name} fires a musket at ${target.name} for 40 damage!`, true);
        }
        else {
            user.musketLoaded = true;
            return typeText(`${user.name} reloads their musket.`, true);
        }
    }

    this.attack2Info = function(user, target) {
        if (user.musketLoaded) return "(ready)";
        else return "(reload)";
    }

    this.smartAttack = function(user, target) {
        let damage = -20 + Math.floor(0.6 * target.maxhp);
        if (damage > 40) damage = 40;
        else if (damage < 10) damage = 10;
        if (target.hp <= damage) return this.attack1(user, target);
        else if (user.musketLoaded && damage < 40) return this.attack2(user, target);
        else if (damage >= 20) return this.attack1(user, target);
        else if (user.hp >= 30 && Math.floor(Math.random() * 2) == 0) return this.attack2(user, target);
        else return this.attack1(user, target);
    }
}

// Ramsay's Gordonmet move makes him function differently, since it is a multi-step move.
// We store his starting moveset with the 'default' functions.
// When Gordonmet is selected, we swap out the 'default' moveset with the 'altered' moveset and refresh the combat buttons.
// The reverse is done when Cancel is selected after Gordonmet.
function Ramsay() {
    Character.call(this);

    this.id = 9;
    this.name = "Gordon Ramsay";
    this.description = "Aggressive Chef";
    this.quest = "Enter the kitchen.";
    this.entrance = "You're feeling a little hungry, so you take a trip to the local kitchen. Using the equipment available, you make a PB&J."
    + " A man dressed in white approaches as you chomp away. \"Do you have any idea where you are? You're in Hell's Kitchen!\"";
    this.maxhp = 50;

    this.move1name = "Pan Slam";
    this.move1desc = "Very unoriginal. <br>(15 dmg)";
    this.move2name = "Gordonmet";
    this.move2desc = "Exquisitely gourmet. <br>Heal Gordon or a teammate! <br>(+20 hp) (5 uses/battle)";

    this.meals = 5;

    this.refresh = function() {
        this.hp = this.maxhp;
        this.displayhp = this.maxhp;
        this.charging = 0;
        this.meals = 5;
    }

    this.afterFight = function() {
        this.charging = 0;
        this.meals = 5;
    }

    function clickToHeal(currentFighter, thisPartyMember, enemy) {
        this.icon = "icons/heal icon.png";
        displayParty(currentFighter, enemy, false, null, null);
        hideBattleButtons();
        thisPartyMember.changehp(20);
        currentFighter.meals--;
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
        user.meals--;
        ramsaySetDefault(user);
        return typeText(`${user.name} cooks a gourmet meal for themself. They recover 20 hp.`, true);
    }

    this.attack1Info = function(user, target) {
        if (user.move1name == "Heal Self") return `(${user.meals} left)`;
        return "(15 dmg)";
    }

    function defaultAttack2(user, target) {
        if (!party.includes(user)) {
            if (user.meals < 1) return defaultAttack1(user, target);
            user.changehp(20);
            user.meals--;
            return typeText(`${user.name} cooks a gourmet meal for themself. They recover 20 hp.`, true);
        }
        else {
            if (user.meals > 0) {
                displayParty(user, target, false, clickToHeal, "icons/heal icon.png");
                ramsaySetAltered(user);
                displayBattleButtons(user, target, true);
            }
            else {
                displayParty(user, target, true, changeCharacterEnemyFirst, "icons/switch icon.png");
                displayBattleButtons(user, target, true);
            }
        }
        return 9999999999;
    }

    function alteredAttack2(user, target) {
        displayParty(user, target, true, changeCharacterEnemyFirst, "icons/switch icon.png");
        ramsaySetDefault(user);
        displayBattleButtons(user, target, true);
        return 9999999999;
    }

    this.attack2Info = function(user, target) {
        if (user.move2name == "Gordonmet") return `(${user.meals} left)`;
        return "";
    }

    this.attack1 = defaultAttack1;

    this.attack2 = defaultAttack2;

    this.smartAttack = function(user, target) {
        if (target.hp <= 15) return this.attack1(user, target);
        else if (user.hp <= 30 && Math.floor(Math.random * 3) < 2 &&
            ((target.id == BOWERS_ID && !target.spokenTo.includes(user)) || (target.id == DERREK_ID && user.hp > 10)|| 
            target.id == PLAYER_ID || (target.id == SHREK_ID && party.length < 5) || (target.id == WASHINGTON_ID && user.hp > 20) || target.id == WICK_ID))
                return this.attack2(user, target);
        else return this.attack1(user, target);
    }
}

function Thanos() {
    Character.call(this);

    this.id = 10;
    this.name = "Thanos";
    this.description = "Thicc Purple Man";
    this.quest = "Fight the Powerful One.";
    this.entrance = "The Powerful One rolls up to you in a purple truck and does a few donuts to demonstrate his power. "
        + "He steps out, wearing a bracelet so large it even "
        + "covers his whole hand. \"I once destroyed half the universe, and now I will destroy all of you.\"";
    this.maxhp = 200;

    this.boss = true;

    this.move1name = "Snap / Transform";
    this.move1desc = "Halve enemy hp / Use enemy move";
    this.move2name = "Thanos Car / Rearrange";
    this.move2desc = "20 damage / Put enemy at random hp";

    this.spokenTo = [];
    this.musketLoaded = true;
    this.meals = 5;

    this.stolenAttack = null;
    this.crushed = false;       // Snap
    this.dazed = false;         // Thanos Car

    this.subMove = 0;

    this.attack1 = function(user, target) {
        if (!smartEnemies) user.subMove = Math.floor(2 * Math.random());
        if (user.subMove == 0 && user.charging == 0) {
            if (!user.crushed) {
                target.changehp(-Math.ceil(target.hp/2));
                return typeText(`${user.name} snaps their fingers! ${target.name}'s hp has been halved.`, true);
            }
            else return typeText(`${user.name} tries to snap, but cannot due to a hand injury!`, true);
        }
        else {
            if (user.charging != 0) return user.stolenAttack(user, target);
            let messageTime = typeText(`${user.name} temporarily transforms into ${target.name}!`, true);

            if (smartEnemies && target.id != CHIEF_ID) {
                timeouts.push(setTimeout(function() {
                    timeouts.push(setTimeout(damageAnimation, target.smartAttack(user, target), target, user, false));
                }, messageTime));
            }
            else {
                if (Math.floor(Math.random()*2) == 0) user.stolenAttack = target.attack1;
                else user.stolenAttack = target.attack2;
                timeouts.push(setTimeout(function() {
                    timeouts.push(setTimeout(damageAnimation, user.stolenAttack(user, target), target, user, false));
                }, messageTime));
            }
            
            return 9999999999;
        }
    }

    this.attack2 = function(user, target) {
        if (user.charging != 0) return user.attack1(user, target);
        if (!smartEnemies) user.subMove = Math.floor(2 * Math.random());
        if (user.subMove == 0) {
            if (!user.dazed) {
                target.changehp(-20);
                return typeText(`${user.name} hits ${target.name} with the THANOS CAR for 20 damage!`, true);
            }
            else {
                user.changehp(-10);
                return typeText(`${user.name} tries to drive the THANOS CAR, but crashes and takes 10 damage!`, true)
            }
        }
        else {
            let newhp = Math.ceil(target.maxhp * Math.random());
            target.changehp(newhp - target.hp);
            return typeText(`${user.name} rearranges ${target.name}'s bodily particles! They now have ${newhp} hp.`, true);
        }
    }

    this.smartAttack = function(user, target) {
        if (target.hp <= 20 && !user.dazed) {
            user.subMove = 0;
            return this.attack2(user, target);
        }
        else if (target.hp >= 60 && !user.crushed) {
            user.subMove = 0;
            return this.attack1(user, target);
        }
        else if (target.hp/target.maxhp >= 0.9 && user.maxhp >= 80) {
            user.subMove = 1;
            return this.attack2(user, target);
        }
        else if (!user.crushed && 
            ((target.id == LENNIE_ID && user.hp > 100) || target.id == WICK_ID ||
            (target.id == DERREK_ID && target.hp > 30) || (target.id == BOWERS_ID && target.hp != target.maxhp) ||
            target.id == SHREK_ID || (target.id == WASHINGTON_ID && !user.musketLoaded) || user.id == RAMSAY_ID)) {
                user.subMove = 0;
                return this.attack2(user, target);
        }
        else {
            user.subMove = 1;
            return this.attack1(user, target);
        }
    }
}

function Herobrine() {
    Character.call(this);

    this.id = 11;
    this.name = "Herobrine";
    this.description = "Minecraft Boogeyman";
    this.quest = "Fight the Chaotic One.";
    this.entrance = "You lay eyes on the Chaotic One, but it seems that the second you focus your gaze upon them, they are gone. " 
        + "Someone says, \"He's right behind me, isn't he?\" After relieving the tension, everyone turns around.";
    this.maxhp = 200;

    this.boss = true;

    this.move1name = "Creeper / Grief";
    this.move1desc = "1 - 30 damage / 20 damage to random party member";
    this.move2name = "TNT / Noclip";
    this.move2desc = "4 damage to all party members / Make enemy attack random party member";

    this.house = false;  // Creeper

    this.subMove = 0;

    this.attack1 = function(user, target) {
        if (!smartEnemies) user.subMove = Math.floor(2 * Math.random());
        if (user.subMove == 0) {
            if (user.house) {
                return typeText(`${user.name} spawned a creeper, but ${target.name} was safe inside the house!`, true);
            }
            let damage = Math.ceil(30 * Math.random());
            target.changehp(-damage);
            return typeText(`${user.name} spawned a creeper behind ${target.name}! They take ${damage} damage from the explosion!`, true);
        }
        else {
            let victim = party[Math.floor(party.length * Math.random())];
            victim.changehp(-20);
            return typeText(`${user.name} griefed a random party member! ${victim.name} Takes 20 damage!`, true);
        }
    }

    this.attack2 = function(user, target) {
        if (!smartEnemies) user.subMove = Math.floor(2 * Math.random());
        if (user.subMove == 0) {
            for (let i = 0; i < party.length; i++) {
                party[i].changehp(-4);
            }
            return typeText(`${user.name} lights the TNT! Everyone Takes 4 damage!`, true);
        }
        else {
            let messageTime = typeText(`${user.name} noclips into ${target.name} and possesses them!`, true);
            let attackUsed = 0;
            let victim = party[Math.floor(Math.random() * party.length)];

            if (victim == target) {
                return typeText(`${target.name} resisted the influence!`, true);
            }
            else if (target.id == RAMSAY_ID) { // Can't use Ramsay 'Gordonmet'
                timeouts.push(setTimeout(damageAnimation, target.attack1(target, victim), target, user, false));
            }
            else if (smartEnemies && target.charging == 0) {
                timeouts.push(setTimeout(damageAnimation, target.smartAttack(target, victim), target, user, false));
            }
            else {
                if (target.charging != 0) attackUsed = charging;
                else if (Math.floor(Math.random()*2) == 0) attackUsed = 1;
                else attackUsed = 2;

                timeouts.push(setTimeout(function() {
                    if (attackUsed == 1) timeouts.push(setTimeout(damageAnimation, target.attack1(target, victim), target, user, false));
                    else timeouts.push(setTimeout(damageAnimation, target.attack2(target, victim), target, user, false));
                }, messageTime));
            }
            return 9999999999;
        }
    }

    this.smartAttack = function(user, target) {
        if (target.hp <= 4 || (party.length > 4 || Math.floor(Math.random() * 5) == 0)) {
            user.subMove = 0;
            return this.attack2(user, target);
        }
        else if (target.hp <= 15 && !user.house) {
            user.subMove = 0;
            return this.attack1(user, target);
        }
        else if (party.length > 3 &&
            (target.id == BLART_ID || (target.id == PLAYER_ID && bowersStatus == 1) || target.id == DERREK_ID ||
            (target.id == LENNIE_ID && target.hp <= 40) || (target.id == SHREK_ID && party.length >= 5) ||
            (target.id == WASHINGTON_ID && target.musketLoaded) || target.charging != 0)) {
                user.subMove = 1;
                return this.attack2(user, target);
        }
        else {
            user.subMove = 1;
            return this.attack1(user, target);
        }
    }
}

function Sans() {
    Character.call(this);

    this.id = 12;
    this.name = "Sans Undertale";
    this.description = "Silly Skeleton";
    this.quest = "Fight the Dead One.";
    this.entrance = "You go to fight the Dead One and he says, \"e e e e e e e e e e e e e e.\"";
    this.maxhp = 1;

    this.dodgesLeft = 8;
    this.lastDodges = 8;
    this.hitOnThisTurn = false;

    this.boss = true;

    this.move1name = "Bone Whack / Gravity";
    this.move1desc = "10 damage + 5 on use / 20 damage to enemy and random party member";
    this.move2name = "Lockup / Censored";
    this.move2desc = "Party swap disabled / Some random stuff";

    this.boneWhacks = 0;
    this.snapped = false;  // Bone Whack

    this.subMove = 0;

    function getDodgeMessage(dodger) {
        let message = "";
        if (dodger.dodgesLeft < dodger.lastDodges) {
            message += `Sike! ${dodger.name} dodged it, `;
            if (dodger.dodgesLeft > 6) message += "and seems very ready to dodge another.";
            else if (dodger.dodgesLeft > 4) message += "but seems to have slowed down a little.";
            else if (dodger.dodgesLeft > 2) message += "but is looking very tired.";
            else message += "but can't seem to keep up anymore.";
            dodger.lastDodges = dodger.dodgesLeft;
        }
        return message;
    }

    this.changehp = function(damage) {
        if (!this.hitOnThisTurn) {
            if (this.dodgesLeft < 1) this.hp += damage;
            else this.dodgesLeft--;
        }
        if (this.hp > this.maxhp) this.hp = this.maxhp;
        else if (this.hp < 0) this.hp = 0;
        this.hitOnThisTurn = true;
    }

    this.attack1 = function(user, target) {
        user.hitOnThisTurn = false;
        let dodgeMessage = getDodgeMessage(user);
        let dodgeMessageTime = getTypeTextTime(dodgeMessage);
        if (!smartEnemies) user.subMove = Math.floor(2 * Math.random());
        else if (user.snapped) user.subMove = 1;

        if (user.subMove == 0) {
            if (user.snapped) {
                let message = `${user.name} takes out their whacking bone, but it's snapped in half!`;
                let messageTime = getTypeTextTime(message);
                timeouts.push(setTimeout(typeText, typeText(dodgeMessage, true), message, true));
                return dodgeMessageTime + messageTime;
            }
            let damage = 10 + 5*user.boneWhacks;
            user.boneWhacks++;
            target.changehp(-damage);
            let message = `${user.name} whacks ${target.name} with a bone for ${damage} damage!`;
            let messageTime = getTypeTextTime(message);
            timeouts.push(setTimeout(typeText, typeText(dodgeMessage, true), message, true));
            return dodgeMessageTime + messageTime;
        }
        else {
            let victim = party[Math.floor(party.length * Math.random())];
            let message = `${user.name} rapidly changes the direction of gravity! `;
            if (victim == target) {
                message += `${target.name} didn't collide with anyone!`;
            }
            else {
                target.changehp(-20);
                victim.changehp(-20);
                message += `${target.name} collided with ${victim.name} and both take 20 damage!`;
            }
            let messageTime = getTypeTextTime(message);
            timeouts.push(setTimeout(typeText, typeText(dodgeMessage, true), message, true));
            return dodgeMessageTime + messageTime;
        }
    }

    this.attack2 = function(user, target) {
        user.hitOnThisTurn = false;
        let dodgeMessage = getDodgeMessage(user);
        let dodgeMessageTime = getTypeTextTime(dodgeMessage);
        if (!smartEnemies) user.subMove = Math.floor(2 * Math.random());

        if (user.subMove == 0 && !partySwapDisabled) {
            partySwapDisabled = true;
            let message = `${user.name} locks ${target.name} into the ring!`;
            let messageTime = getTypeTextTime(message);
            timeouts.push(setTimeout(typeText, typeText(dodgeMessage, true), message, true));
            return dodgeMessageTime + messageTime;
        }
        else {
            let message = `${user.name} has censored this attack.`;
            let messageTime = getTypeTextTime(message);
            for (let i = 0; i < party.length; i++) {
                if (party[i] != target && Math.floor(Math.random()*2) == 0) {
                    party[i].changehp(5 - Math.floor(Math.random()*21));
                }
            }
            target.changehp(10 - Math.random()*31);
            timeouts.push(setTimeout(typeText, typeText(dodgeMessage, true), message, true));
            return dodgeMessageTime + messageTime;
        }
    }

    this.smartAttack = function(user, target) {
        if (10 + 5*user.boneWhacks >= target.hp && !user.snapped) {
            user.subMove = 0;
            return this.attack1(user, target);
        }
        else if (target.hp <= 20 && party.length > 4) {
            user.subMove = 1;
            return this.attack1(user, target);
        }
        else if (partySwapDisabled && !snapped) {
            user.subMove = 0;
            return this.attack1(user, target);
        }
        else {
            user.subMove = Math.floor(Math.random() * 2);
            if (party.length < 4) user.subMove = 0;
            if (Math.floor(Math.random() * 2) == 0) return this.attack1(user, target);
            else return this.attack2(user, target);
        }
    }
}

function HitSat() {
    Character.call(this);

    this.id = 13;
    this.name = "Hitler Satan";
    this.description = "Worst Guy Ever Made";
    this.quest = "The Final Battle.";
    this.entrance = "";
    this.maxhp = 300;

    this.boss = true;

    this.move1name = "Devil's Lettuce / Laser Eyes / Nazi Punch";
    this.move1desc = "1/2 to do 30 dmg / 5 1/2 hit lasers, 8 dmg each / 10 - 30 damage";
    this.move2name = "Nazi Laser / Demon Headbutt / Words of Discouragement";
    this.move2desc = "charge 1 turn, 50 damage / 30 damage, 15 recoil / 10 damage, 10 heal";

    this.subMove = 0;

    this.attack1 = function(user, target) {
        if (!smartEnemies) user.subMove = Math.floor(3 * Math.random());
        if (user.subMove == 0) {
            let message = `${user.name} rips the devil's lettuce!`;
            if (bowersStatus == 1) {
                user.changehp(-1);
                message += ` John Bowers disapproves and slaps ${user.name} for 1 damage.`;
            }
            else if (Math.floor(Math.random() * 2) == 0) {
                message += ` John Bowers returns from the depths of Hell to spank ${target.name} for 30 damage.`;
                target.changehp(-30);
            }
            else {
                message += ` ${user.name}'s brain turned into an egg being fried in a skillet.`;
            }
            return typeText(message, true);
        }
        else if (user.subMove == 1) {
            let hits = 0;
            let shots = 0;
            let message1 = `${user.name} fires their laser eyes! They hit ${hits}/${shots}`;
            let message1Time = typeText(message1, true);
            let message2 = " lasers!";
            let message2Time = getTypeTextTime(message2);
            const missChance = 0.5;
            
            for (let i = 0; i < 5; i++) {
                shots++;
                if (Math.random() > missChance) {
                    hits++;
                    timeouts.push(setTimeout(replaceText, message1Time + shots*5*textSpeed, `${hits - 1}/${shots - 1}`, `${hits}/${shots}`));
                }
                else timeouts.push(setTimeout(replaceText, message1Time + shots*5*textSpeed, `${hits}/${shots - 1}`, `${hits}/${shots}`));
            }
            timeouts.push(setTimeout(typeText, message1Time + (shots + 1)*5*textSpeed, message2, false));
            target.changehp(-8*hits);
            return message1Time + (shots + 1)*5*textSpeed + message2Time;
        }
        else {
            let randInt = 15 + Math.floor(Math.random()* 16);
            target.changehp(-randInt);
            return typeText(`${user.name} nazi punches ${target.name} for ${randInt} damage!`, true);
        }
    }

    this.attack2 = function(user, target) {
        if (!smartEnemies) user.subMove = Math.floor(3 * Math.random());
        if (this.charging != 0) {
            target.changehp(-50);
            this.charging = 0;
            return typeText(`${user.name} fires the nazi laser of doom at ${target.name} for 50 damage!`, true);
        }
        else if (user.subMove == 0) {
            this.charging = 2;
            return typeText(`${user.name} charges the nazi laser of doom!`, true);
        }
        else if (user.subMove == 1) {
            target.changehp(-30);
            user.changehp(-15);
            return typeText(`${user.name} demon headbutts ${target.name} for 30 damage, and recieves 15 damage in recoil!`, true);
        }
        else {
            target.changehp(-10);
            user.changehp(10);
            return typeText(`${user.name} spread words of discouragement. They feed off of ${target.name}'s sadness in the form of 10 hp.`, true)
        }
    }

    this.smartAttack = function(user, target) {
        if (target.hp <= 10) {
            user.subMove = 2;
            return this.attack2(user, target);
        }
        else if (target.hp <= 20) {
            user.subMove = 1 + Math.floor(Math.random() * 2);
            return this.attack1(user, target);
        }
        else if (target.hp <= 30) {
            user.subMove = 1;
            return this.attack2(user, target);
        }
        else {
            let availableMoves = [[1, 0], [2, 0], [0, 1], [1, 1]];
            if (bowersStatus == 2) availableMoves.push([0, 0]);
            if (user.maxhp - user.hp > 10) availableMoves.push([2, 1]);
            let chosenMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            user.subMove = chosenMove[0];
            if (chosenMove[1] == 0) return this.attack1(user, target);
            else return this.attack2(user, target);
        }
    }
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
    partySwapDisabled = false;
    bowersStatus = 0;
    turns = 0;
    enemyAttacksTotal = 0;
    enemyAttacksSmart = 0;
    finalBossKilled = 0;
    bossesKilled = 0;
    fightsWon = 0;
    displayParty(null, null, false, null, null);
    addAllEnemiesToPool();
    clearTextBox();
    displayNameEntry(false);
    displayAreaSelection([], 0);
    hideBattleButtons();
    hideCurrentFighters();
    calculateScore();
}

function setOptionButtonFunctions() {
    const restartButton = $("#restart");
    restartButton.off("click").on("click", function() {
        startNewGame();
        stopPlaySound(selectSound);
    });

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

    const enemyAIButtons = [$("#random"), $("#smart")];
    enemyAIButtons[smartEnemies].css("background-color", "grey");
    for (let i = 0; i < enemyAIButtons.length; i++) {
        enemyAIButtons[i].off("mouseenter").on("mouseenter", function() {
            enemyAIButtons[i].css("background-color", "grey");
        });
        enemyAIButtons[i].off("mouseleave").on("mouseleave", function() {
            if (smartEnemies != i) enemyAIButtons[i].css("background-color", "lightgrey");
        });
        enemyAIButtons[i].off("click").on("click", function() {
            changeEnemyAI(i);
            for (let x = 0; x < enemyAIButtons.length; x++) {
                enemyAIButtons[x].css("background-color", "lightgrey");
            }
            enemyAIButtons[i].css("background-color", "grey");
        });
    }

    $(".optionButton").on("click", function() {stopPlaySound(buttonHoverSound)});

    const volumeSlider = $("#volume");
    volumeSlider.off("input").on("input", function() {setVolumes(volumeSlider.val())});
    volumeSlider.off("change").on("change", function() {setVolumes(volumeSlider.val())});
}

function setVolumes(vol) {
    textScrollSound.volume = vol/200;
    selectSound.volume = vol/100;
    healSound.volume = vol/100;
    damageSound.volume = vol/100;
    buttonHoverSound.volume = vol/100;
    victorySound.volume = vol/100;
    deathSound.volume = vol/100;
    gameOverSound.volume = vol/100;
    secretSound.volume = vol/100;
    buttonHoverSound.play();
}

function changeGameSpeed(speed) {
    gameSpeed = speed;
    if (speed == 0) {
        textSpeed = 30;
        damageSpeed = 1000;
    }
    else if (speed == 1) {
        textSpeed = 15;
        damageSpeed = 500;
    }
    else {
        textSpeed = 5;
        damageSpeed = 250;
    }
}

function changeEnemyAI(mode) {
    smartEnemies = mode;
}

function binaryAnimation() {
    const playerTurnIcon = $("#currentFighterTurnIcon");
    const enemyTurnIcon = $("#currentEnemyTurnIcon");
    tick(true);

    function tick(state) {
        if (state) {
            playerTurnIcon.css("margin-top", "5%");
            enemyTurnIcon.css("margin-top", "5%");
            $("#partyListIcon").css("margin-bottom", "5%");
            setTimeout(tick, 500, false);
        }
        else {
            playerTurnIcon.css("margin-top", "15%");
            enemyTurnIcon.css("margin-top", "15%");
            $("#partyListIcon").css("margin-bottom", "15%");
            setTimeout(tick, 500, true);
        }
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
    
    minibossPool = [];
    const thanos = new Thanos(); thanos.refresh(); minibossPool.push(thanos);
    const herobrine = new Herobrine(); herobrine.refresh(); minibossPool.push(herobrine);
    const sans = new Sans(); sans.refresh(); minibossPool.push(sans);
    
    const hitsat = new HitSat(); hitsat.refresh(); finalBoss = hitsat;

    // party = fightPool.slice(); bowersStatus = 1;
    // fightPool = [];
    // minibossPool = [];
}

function removeEnemyFromPool(enemy) {
    if (fightPool.includes(enemy)) fightPool.splice(fightPool.indexOf(enemy), 1);
    else if (minibossPool.includes(enemy)) minibossPool.splice(minibossPool.indexOf(enemy), 1);
}

function getHealthBarColor(hp, maxhp) {
    let float = hp/maxhp;
    if (float > 0.6666) return "lightgreen";
    else if (float > 0.3333) return "orange";
    else return "red";
}

function stopPlaySound(sound) {
    sound.currentTime = 0;
    sound.play();
}

function turnMultiplier() {
    return 2 * (0.99 ** turns);
}

function smartMultiplier() {
    if (enemyAttacksTotal == 0) return 1;
    else return 1 + (enemyAttacksSmart/enemyAttacksTotal);
}

function calculateScore() {
    scoreTotal = Math.floor((fightsWon + bossesKilled + finalBossKilled + (150 * party.length)) * turnMultiplier() * smartMultiplier());
    $(`#fightsWon`).html(fightsWon);
    $(`#partyMembers`).html(party.length * 150);
    $(`#bossesSlain`).html(bossesKilled);
    $(`#finalBossSlain`).html(finalBossKilled);
    $(`#turnBonus`).html("x" + turnMultiplier().toFixed(2));
    $(`#smartBonus`).html("x" + smartMultiplier().toFixed(2));
    $(`#scoreTop`).html(`Score: ${scoreTotal}`);
}
                                        // UI Functions
// This function can be used as a `delay` parameter for setTimeout, to set an action after the message has been typed.
function typeText(message, newLine) {
    let specialCharDelay = 0;
    let text = $("#text");
    if (message.length > 0 && newLine) text.append("<br>>> ");

    for (let i = 0; i < message.length; i++) {
        timeouts.push(setTimeout(function() {text.append(message[i]); textScrollSound.play();}, i*textSpeed + specialCharDelay*textSpeed));
        if (message[i] == '.' || message[i] == '?'|| message[i] == '!') {
            if (i + 1 < message.length && (message[i + 1] == "\"" || message[i + 1] == "'")) {
                i++;
                let lastItem = timeouts.length - 1;
                clearTimeout(timeouts[lastItem]);
                timeouts[lastItem] = setTimeout(function() {text.append(message[i-1]); textScrollSound.play();}, (i-1)*textSpeed + specialCharDelay*textSpeed)
                timeouts.push(setTimeout(function() {text.append(message[i]); textScrollSound.play();}, i*textSpeed + specialCharDelay*textSpeed));
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
    let wholeText = $("#text").html();
    let replaceIndex = wholeText.lastIndexOf(oldText);
    let modifiedText = wholeText.substring(0, replaceIndex) + newText + wholeText.substring(replaceIndex + oldText.length);
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
function displayAreaSelection(allFights, offset) {
    if (allFights.length < 1) {
        $("#areaSelectButtonContainer").css("display", "none");
        $("#areaSelectDisplay").css("display", "none");
        return;
    }

    let currentOffset = offset;
    let areaSelectButtons = [$("#areaButton1"), $("#areaButton2"), $("#areaButton3")];
    let areaSwapButtons = [$("#areaLeft"), $("#areaRight")];
    let areaPictures = [$("#area1"), $("#area2"), $("#area3")];
    for (let i = 0; i < 3; i++) {
        if (i < 2) areaSwapButtons[i].css("display", "none");
        areaSelectButtons[i].css("display", "none");
        areaPictures[i].css("display", "none");
    }
    areaSwapButtons[0].off("click").on("click", function() {
        stopPlaySound(selectSound);
        displayAreaSelection(allFights, offset - 3);
    });
    areaSwapButtons[1].off("click").on("click", function() {
        stopPlaySound(selectSound);
        displayAreaSelection(allFights, offset + 3);
    });
    
    for (let i = currentOffset; i < currentOffset + 3 && i < allFights.length; i++) {
        areaSelectButtons[i%3].html(allFights[i].quest);
        areaSelectButtons[i%3].off("click").on("click", function () {
            stopPlaySound(selectSound);
            displayAreaSelection([], 0);
            enemyEntrance(allFights[i]);
            removeEnemyFromPool(allFights[i]);
        });
        areaPictures[i%3].attr("src", `${allFights[i].questPicture}`);
        areaSelectButtons[i%3].css("display", "block");
        areaPictures[i%3].css("display", "block");
    }
    if (currentOffset - 3 >= 0) areaSwapButtons[0].css("display", "block");
    if (currentOffset + 3 < allFights.length) areaSwapButtons[1].css("display", "block");
    $("#areaSelectButtonContainer").css("display", "grid");
    $("#areaSelectDisplay").css("display", "grid");
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
        $("#currentFighterBarLabel").html(`${Math.floor(displayhp)}/${maxhp}`);
        $("#currentFighterBar").css({"width":`${100*displayhp/maxhp}%`,"background-color":healthBarColor});
    }
    $("#currentEnemyName").html(enemy.name);
    $("#currentEnemyDesc").html(enemy.description);
    $("#currentEnemyPicture").attr("src", enemy.picture);
    let displayhp = enemy.displayhp; let maxhp = enemy.maxhp;
    let healthBarColor = getHealthBarColor(displayhp, maxhp);
    $("#currentEnemyBarLabel").html(`${Math.floor(displayhp)}/${maxhp}`);
    $("#currentEnemyBar").css({"width":`${100*displayhp/maxhp}%`,"background-color":healthBarColor});

    $("#battleDisplay").css("display", "block");
}

function hideCurrentFighters() {
    $("#battleDisplay").css("display", "none");
}

function displayTurnIndicator(isPlayerTurn) {
    const playerIndicator = $("#currentFighterTurnIcon");
    const enemyIndicator = $("#currentEnemyTurnIcon");
    if (isPlayerTurn) {
        playerIndicator.css("display", "block");
        enemyIndicator.css("display", "none");
    }
    else {
        playerIndicator.css("display", "none");
        enemyIndicator.css("display", "block");
    }
}

function displayBattleButtons(fighter, enemy, setButtonFunctions) {
    buttons = [$("#attack1button"), $("#attack2button")];
    labels = [$("#attack1label"), $("#attack2label")];
    buttons[0].off("mouseenter");
    buttons[1].off("mouseenter");

    if (fighter == null) {   
        buttons[0].html("");
        buttons[1].html("");
        labels[0].html("");
        labels[1].html("");

        if (setButtonFunctions) {
            for (let i = 0; i < buttons.length; i++) {
                buttons[i].off("click");
                buttons[i].css("cursor", "default");
            }
        }
    }

    else {
        buttons[0].html(fighter.move1name);
        buttons[1].html(fighter.move2name);
        labels[0].html(fighter.move1desc);
        labels[1].html(fighter.move2desc);

        infos = [fighter.attack1Info(fighter, enemy), fighter.attack2Info(fighter, enemy)];
        for (let i = 0; i < infos.length; i++) {
            if (infos[i] != "") buttons[i].append(`<br>${infos[i]}`);
        }

        for (let i = 0; i < buttons.length; i++) {
            buttons[i].on("mouseenter", function() {
                stopPlaySound(buttonHoverSound);
                buttons[i].css("border", "1px solid black");
            });
            buttons[i].on("mouseleave", function() {buttons[i].css("border", "3px solid black")});
            buttons[i].css("cursor", "pointer");
        }

        if (setButtonFunctions) {
            buttons[0].off("click").on("click", function() {
                stopPlaySound(selectSound);
                clearAllTimeouts();
                hideBattleButtons();
                displayParty(fighter, enemy, false, null, null);
                timeouts.push(setTimeout(damageAnimation, fighter.attack1(fighter, enemy), fighter, enemy, true));
            });
            buttons[1].off("click").on("click", function() {
                stopPlaySound(selectSound);
                clearAllTimeouts();
                hideBattleButtons();
                displayParty(fighter, enemy, false, null, null);
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
function displayParty(currentFighter, enemy, previewOnHover, onClickFunction, icon) {
    $("#partyMemberContainer").off("mouseleave");
    let partyDivContents = "";  
    for (let i = 0; i < party.length; i++) {
        $(`#party${i}`).off();
        $(`#party${i} *`).css("cursor", "default");
        if (currentFighter != null && currentFighter == party[i]) continue;

        let healthBarColor = getHealthBarColor(party[i].displayhp, party[i].maxhp);
        partyDivContents += 
        `<div class="partyMemberContainer" id="party${i}">
            <div class="firefoxNonsense">
                <img src="${party[i].picture}"></img>
            </div>
            <div class="progressBarBackground" style="background-color:whitesmoke;"></div>
            <div class="progressBar" style="background-color:${healthBarColor}; width:calc(100% * ${party[i].displayhp}/${party[i].maxhp});"></div>
            <label class="progressBarLabel">${Math.floor(party[i].displayhp)}/${party[i].maxhp}</label>
            <label class="partyName">${party[i].name}</label>
        </div>`;
    }
    if (icon != null && partyDivContents != "") {
        partyDivContents =
        `<div id="partyListIconContainer">
            <img id="partyListIcon" src="${icon}" style="margin-bottom: ${$("#currentEnemyTurnIcon").css("margin-top")};"></img>
        </div>` + partyDivContents;
    }

    $("#partyList").html(partyDivContents);

    if (onClickFunction != null) {
        if (previewOnHover) $(".partyMemberContainer").on("mouseleave", function() {
            displayBattleButtons(currentFighter, enemy, true);
            displayCurrentFighters(currentFighter, enemy);
            displayTurnIndicator(true);
        });
        for (let i = 0; i < party.length; i++) {
            if (currentFighter != null && party[i] == currentFighter) continue;

            $(`#party${i} *`).css("cursor", "pointer");
            $(`#party${i}`).on("click", function() {
                stopPlaySound(selectSound);
                onClickFunction(currentFighter, party[i], enemy);
            });
            $(`#party${i}`).on("mouseenter", function() {
                stopPlaySound(buttonHoverSound);
                $(`#party${i}`).css("border", "1px solid black");
            });
            if (previewOnHover) $(`#party${i}`).on("mouseenter", function() {
                displayBattleButtons(party[i], enemy, false);
                displayCurrentFighters(party[i], enemy, false);
                if (currentFighter == null) displayTurnIndicator(true);
                else displayTurnIndicator(false);
            });
            $(`#party${i}`).on("mouseleave", function() {$(`#party${i}`).css("border", "3px solid black")});
        }
    }
}

function changeCharacterPlayerFirst(currentFighter, thisPartyMember, enemy) {
    displayParty(thisPartyMember, enemy, false, null, null);
    hideBattleButtons();
    timeouts.push(setTimeout(playerTurn, typeText(`${thisPartyMember.name} enters the ring!`, true), thisPartyMember, enemy));
}

function changeCharacterEnemyFirst(currentFighter, thisPartyMember, enemy) {
    turns++;
    console.log(`Turn ${turns}`);
    displayParty(thisPartyMember, enemy, false, null, null);
    hideBattleButtons();
    timeouts.push(setTimeout(enemyTurn, typeText(`${thisPartyMember.name} takes ${currentFighter.name}'s place.`, true), thisPartyMember, enemy));
}

function checkBattleStatus(player, enemy, wasPlayerTurn) {
    let enemyDeadTime = 0;
    let partyMembersDeadTime = 0;
    let playerDeadTime = 0;
    let totalMessageTime = 0;
    let enemyDead = "";
    let partyMembersDead = "";
    let playerDead = "";

    if (enemy.hp <= 0) {
        if (enemy.id == BOWERS_ID) bowersStatus = 1;
        if (wasPlayerTurn) {
            if (enemy.boss) {
                enemyDead = `${enemy.name} was defeated! You won!`;
                if (enemy == finalBoss) finalBossKilled = 1500;
                else bossesKilled += 500;
            }
            else {
                enemyDead = `${enemy.name} was defeated and has joined the party!`;
                enemy.refresh();
                party.push(enemy);
                fightsWon += 100;
            }
        }
        else {
            if (enemy.boss) {
                enemyDead = `${enemy.name} annihilated themselves. You won!`;
                if (enemy == finalBoss) finalBossKilled = 1500;
                else bossesKilled += 500;
            }
            else {
                enemyDead = `${enemy.name} died during their own attack and joined the party!`;
                enemy.refresh();
                party.push(enemy);
                fightsWon += 100;
            }
        }
    }
    enemyDeadTime = getTypeTextTime(enemyDead);

    let dead = [];
    for (let i = party.length - 1; i >= 0; i--) {
        if (party[i].hp <= 0 && party[i] != player) {
            if (party[i].id == BOWERS_ID) bowersStatus = 2;
            dead.push(party[i]);
            party.splice(i, 1);
        }
    }
    if (dead.length > 0 && enemyDead != "") partyMembersDead += "However ";
    for (let i = 0; i < dead.length; i++) {
        if (dead.length > 1 && i == dead.length - 1) partyMembersDead += " and ";
        partyMembersDead += `${dead[i].name}`;
        if (dead.length > 2 && i != dead.length - 1) partyMembersDead += ", ";
    }
    if (dead.length > 1) partyMembersDead += " have tragically died in the background.";
    else if (dead.length > 0) partyMembersDead += " has tragically died in the background.";
    partyMembersDeadTime = getTypeTextTime(partyMembersDead);

    if (player.hp <= 0) {
        if (player.id == BOWERS_ID) bowersStatus = 2;
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
    playerDeadTime = getTypeTextTime(playerDead);

    typeText(enemyDead, true);
    if (enemyDead != "") {
        victorySound.play();
    }
    timeouts.push(setTimeout(function() {
        typeText(partyMembersDead, true);
        if (partyMembersDead != "") {
            stopPlaySound(deathSound);
        }
    }, enemyDeadTime));
    timeouts.push(setTimeout(function() {
        typeText(playerDead, true);
        if (playerDead != "") {
            stopPlaySound(deathSound);
        }
    }, enemyDeadTime + partyMembersDeadTime));

    totalMessageTime = enemyDeadTime + partyMembersDeadTime + playerDeadTime;
    if (party.length == 0) timeouts.push(setTimeout(gameOver, totalMessageTime));
    else if (enemyDead != "") timeouts.push(setTimeout(areaSelect, totalMessageTime));
    else if (playerDead != "") timeouts.push(setTimeout(playerTurn, totalMessageTime, null, enemy));
    else if (wasPlayerTurn) timeouts.push(setTimeout(enemyTurn, totalMessageTime, player, enemy));
    else timeouts.push(setTimeout(playerTurn, totalMessageTime, player, enemy));
}

function afterFightWholeParty() {
    partySwapDisabled = false;
    for (let i = 0; i < party.length; i++) {
        party[i].afterFight();
    }
}

function healParty() {
    for (let i = 0; i < party.length; i++) {
        party[i].hp = party[i].maxhp;
    }
}

function gameOver() {
    calculateScore();
    gameOverSound.play();
    let message1 = "You are out of party members.";
    let message2 = "GAME OVER - Press the restart button to try again.";
    let message3 = `Final Score: ${scoreTotal}`;
    typeText(message1, true);
    timeouts.push(setTimeout(typeText, getTypeTextTime(message1), message2, true));
    timeouts.push(setTimeout(typeText, getTypeTextTime(message1) + getTypeTextTime(message2), message3, true));
}

function victory() {
    timeouts.push(setTimeout(typeText, typeText("You won good job.", true), `Final Score: ${scoreTotal}`, true));
}

function damageAnimation(player, enemy, wasPlayerTurn) {
    let currentDamageSpeed = damageSpeed;
    if (player != null && enemy != null) {
        displayCurrentFighters(player, enemy);
        displayParty(player, enemy, false, null, null);
    }
    let animationUsed = false;
    
    for (let i = 0; i < party.length; i++) {
        let partyMember = party[i];
        if ((player == null || partyMember != player) && partyMember.hp != partyMember.displayhp)
            animateBar(partyMember, $(`#party${i} .progressBar`), $(`#party${i} .progressBarLabel`));
    }
    if (player != null && player.hp != player.displayhp) animateBar(player, $("#currentFighterBar"), $("#currentFighterBarLabel"));
    if (enemy != null && enemy.hp != enemy.displayhp) animateBar(enemy, $("#currentEnemyBar"), $("#currentEnemyBarLabel"));

    function animateBar(character, bar, label) {
        const TICK_RATE = 25;
        let difference = character.hp - character.displayhp;
        if (difference > 0) healSound.play();
        else if (difference < 0) damageSound.play();
        for (let tick = 0; tick < currentDamageSpeed; tick += TICK_RATE) {
            timeouts.push(setTimeout(function() {
                if (tick + TICK_RATE >= currentDamageSpeed) character.displayhp = character.hp;
                else character.displayhp += TICK_RATE*difference/currentDamageSpeed;
                let maxhp = character.maxhp;
                let displayhp = character.displayhp;
                let healthBarColor = getHealthBarColor(displayhp, maxhp);
                bar.css({"width":`${100*displayhp/maxhp}%`,"background-color":healthBarColor});
                label.html(`${Math.floor(displayhp)}/${maxhp}`)
            }, tick));
        }
        animationUsed = true;
    }

    if (wasPlayerTurn != null && wasPlayerTurn) {
        turns++;
        console.log(`Turn ${turns}`);
    }
    if (animationUsed && (player != null || enemy != null)) timeouts.push(setTimeout(checkBattleStatus, currentDamageSpeed, player, enemy, wasPlayerTurn));
    else if (player != null || enemy != null) checkBattleStatus(player, enemy, wasPlayerTurn);
    else if (animationUsed) return currentDamageSpeed;
    return 0;
}

function playerTurn(player, enemy) {
    calculateScore();
    displayCurrentFighters(player, enemy);
    displayTurnIndicator(true);
    if (player == null) {
        partySwapDisabled = false;
        displayParty(player, enemy, true, changeCharacterPlayerFirst, "icons/switch icon.png");
        displayBattleButtons(player, enemy, true);
    } 
    else if (player.charging == 0) {
        if (partySwapDisabled) displayParty(player, enemy, true, null, null);
        else displayParty(player, enemy, true, changeCharacterEnemyFirst, "icons/switch icon.png");
        displayBattleButtons(player, enemy, true);
    }
    else {
        displayParty(player, enemy, false, null, null);
        if (player.charging == 1) timeouts.push(setTimeout(damageAnimation, player.attack1(player, enemy), player, enemy, true));
        else timeouts.push(setTimeout(damageAnimation, player.attack2(player, enemy), player, enemy, true));
    }
    
}

function enemyTurn(player, enemy) {
    calculateScore();
    displayCurrentFighters(player, enemy);
    displayTurnIndicator(false);
    displayParty(player, enemy, false, null, null);
    if (enemy.charging == 0) {
        enemyAttacksTotal++;
        if (smartEnemies == 0) {
            let randAttack = Math.floor(Math.random() * 2);
            if (randAttack == 0) timeouts.push(setTimeout(damageAnimation, enemy.attack1(enemy, player), player, enemy, false));
            else timeouts.push(setTimeout(damageAnimation, enemy.attack2(enemy, player), player, enemy, false));
        }
        else {
            enemyAttacksSmart++;
            timeouts.push(setTimeout(damageAnimation, enemy.smartAttack(enemy, player), player, enemy, false));
        }
        console.log(`Smart attack ratio: ${enemyAttacksSmart}/${enemyAttacksTotal}`);
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
            stopPlaySound(selectSound);
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
                stopPlaySound(selectSound);
            }
        };
        timeouts.push(setTimeout(displayNameEntry, typeText(descPrompt, true), true));
    }
    timeouts.push(setTimeout(displayNameEntry, typeText(welcomePrompt, true), true));
}

function areaSelect() {
    calculateScore();
    clearAllTimeouts();
    afterFightWholeParty();
    displayParty(null, null, false, null, null);
    hideCurrentFighters();
    if (fightPool.length > 0) {
        let message = "What an exhilarating battle! You're not done yet, though. There are still opponents to be conquered. What will you do next?";
        if (fightPool.length == 9) {
            message = "There comes a time in every man's life when they must embark on an epic quest to defeat numerous people."
                + " Today, " + playerName + " begins their quest. The " + playerDesc + " walks outside their house. They consider their options.";
        }
        timeouts.push(setTimeout(displayAreaSelection, typeText(message, true), fightPool, 0));
    }
    else if (minibossPool.length > 0) {
        
        if (minibossPool.length == 3) {
            let message1 = "All beings worthy of a fight on earth have been defeated and recruited to support your cause. You are not satisfied, though."
                + " You know what you must do. You must fight... him... You and your warriors rest to prepare for the final battle. Everyone is fully healed.";
            healParty();
            let message2 = "You've ascended to the grand entrance of his dwelling place. Three powerful guards protect the entrance.";
            timeouts.push(setTimeout(function() {
                timeouts.push(setTimeout(function() {
                    timeouts.push(setTimeout(displayAreaSelection, typeText(message2, true), minibossPool, 0));
                }, damageAnimation(null, null, null)));
            }, typeText(message1, true)));
        }
        else {
            let message = `${3 - minibossPool.length} down, ${minibossPool.length} to go.`;
            timeouts.push(setTimeout(displayAreaSelection, typeText(message, true), minibossPool, 0));
        }
        
    }
    else {
        if (finalBoss.hp == 0) {
            victory();
        }
        else {
            let message1 = "The three guards have been defeated, and the gate is wide open. Your party heals with confidence.";
            healParty();
            let message2 = "You enter a giant room, at the end is a throne of fire seating the most evil looking dude you ever laid eyes on. " +
            '"So you have come to defeat me. Mwahaha! The day I am defeated is the day I laugh at an iFunny (c) meme!"';
            timeouts.push(setTimeout(function() {
                timeouts.push(setTimeout(function() {
                    timeouts.push(setTimeout(playerTurn, typeText(message2, true), null, finalBoss));
                }, damageAnimation(null, null, null)));
            }, typeText(message1, true)));
        }
    }
}
                                        // Main Functions
function startNewGame() {
    setStartConditions();
    askForNameAndDescription();
}

$(function() {
    setOptionButtonFunctions();
    setVolumes($("#volume").val());
    binaryAnimation();
    startNewGame();
})
