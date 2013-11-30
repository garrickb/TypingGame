/**
 * Created by Garrick on 11/25/13.
 */
var canvas = document.getElementById('game');
var ctx = canvas.getContext('2d');
var infoCanvas = document.getElementById('gameInfo');
var ctxInfo = infoCanvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;
infoCanvas.width = 800;
infoCanvas.height = 100;
canvas.focus();
window.requestAnimationFrame(run);

// Check if a new cache is available on page load.

window.addEventListener('load', function () {

    window.applicationCache.addEventListener('updateready', function () {
        if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
            // Browser downloaded a new app cache.
            if (confirm('A new version is available. Load it?')) {
                window.location.reload();
            }
        }
    }, false);

}, false);


//Global Variables
ScreenEnum = {
    MainMenu: 0,
    Game: 1,
    Inventory: 2,
    Store: 3
};
var activeScreen = ScreenEnum.Game;
var focus = true;
var tickTime = 0;
var tickRate = 0.05;

var speedMod = 0.65;

var time = Date.now();
var imgScale = 2.5;
var player = {
    health: 100,
    damage: 6,
    exp: 0,
    gold: 0
};

var currentWord = "";
var bgReady = false;
//Background Image
var bgObj = new Image();
bgObj.onload = function () {
    bgReady = true;
};
bgObj.width = 800;
bgObj.height = 600;
bgObj.src = "resources/img/room.png";


//Events
canvas.addEventListener('click', onGameClick, false);
infoCanvas.addEventListener('click', onInfoClick, false);
var activeMonster;
document.onkeypress = function (e) {
    if (focus) {
        if (e.keyCode == 13) {
            currentWord = "";
            activeMonster = undefined;
        } else {
            currentWord += String.fromCharCode(e.keyCode);
        }
        getMonster();
    }
};
document.onkeydown = function (e) {
    if (focus) {
        if (e.keyCode == 8) {
            currentWord = currentWord.substr(0, currentWord.length - 1);
            if (currentWord.length == 0)
                activeMonster = undefined;
            return false;
        }
    }
    return true;
};

//Handle tab changes
window.onblur = function () {
    focus = false;
};
document.onblur = window.onblur;

function onGameClick(e) {
    if (focus) {
        if (Math.floor(Math.random() * 2) == 0)
            monsters.push(new Monster(1, e.clientX, e.clientY));
        else
            monsters.push(new Monster(2, e.clientX, e.clientY));
    }
}

function onInfoClick(e) {
    if (focus) {
        if (e.clientX > 740 && e.clientY > 700)
            focus = false;
    } else {
        focus = true;
    }
}

var loadedMonsters = [];
var monsters = [];

AttributeEnum = {
    NAME: 0,
    SRC: 1,
    HP: 2,
    MOVE_SPEED: 3,
    ATTK_SPEED: 4,
    DAMAGE: 5,
    EXP: 6,
    GOLD: 7
};
//Monster Object
function Monster(difficulty, x, y) {
    this.difficulty = difficulty;
    this.attributes = getAttributes(difficulty);
    //Load the image if it's not already.
    if (loadedMonsters[this.attributes[AttributeEnum.SRC]] == null) {
        var img = new Image();
        img.src = this.attributes[AttributeEnum.SRC];
        loadedMonsters[this.attributes[AttributeEnum.SRC]] = img;
    }
    this.x = x - loadedMonsters[this.attributes[AttributeEnum.SRC]].width * imgScale / 2;
    this.y = y - loadedMonsters[this.attributes[AttributeEnum.SRC]].height * imgScale / 2;
    this.startX = this.x;
    this.currentHP = this.attributes[AttributeEnum.HP];
    this.destX = this.x;
    this.destY = 500;
    //Set the word.
    this.word = getWord(difficulty);
    if (activeMonster == undefined) //Check if new monster matches current words
        getMonster();

}

Monster.prototype.hit = function () {
    if (this == activeMonster)
        activeMonster = null;
    this.currentHP -= player.damage;
    if (this.currentHP > 0) {
        this.word = getWord(this.difficulty);
    }
};

Monster.prototype.kill = function () {
    player.exp += this.attributes[AttributeEnum.EXP];
    player.gold += this.attributes[AttributeEnum.GOLD];
    this.destroy();
};


Monster.prototype.destroy = function () {
    if (this == activeMonster)
        activeMonster = undefined;
    monsters.splice(monsters.indexOf(this), 1);
};

Monster.prototype.update = function () {
    //Check if dead
    if (this.currentHP <= 0) {
        this.kill();
        return;
    }
    //Move towards destination
    var xDist = this.destX - this.x;
    var yDist = this.destY - this.y;
    //var dist = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
    var speed = this.attributes[AttributeEnum.MOVE_SPEED];
    if (yDist != 0) {
        if (xDist > 0) {
            this.x += ((xDist > speed / 2 * speedMod) ? speed / 2 * speedMod : xDist);
        } else if (xDist < 0) {
            this.x -= ((xDist < speed / 2 * speedMod) ? speed / 2 * speedMod : -xDist);
        } else if (Math.random() * 100 > 95)
            this.destX = this.startX - 75 + Math.random() * 150;
    }
    if (yDist > 0)
        this.y += speed * speedMod;
    else {
        this.y = this.destY;
    }

};


Monster.prototype.draw = function () {
    if (this.currentHP > 0) {
        try {
            //Draw Image
            var monsterImg = loadedMonsters[this.attributes[AttributeEnum.SRC]];
            var width = monsterImg.width * imgScale;
            var height = monsterImg.height * imgScale;
            ctx.drawImage(monsterImg, this.x, this.y, width, height);
        } catch (e) {
            console.log(this.attributes);
        }
        //Draw HP Bar
        ctx.beginPath();
        ctx.fillStyle = 'green';
        ctx.rect(this.x, this.y - 5, (this.currentHP / this.attributes[AttributeEnum.HP])
            * width, 15);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'black';
        ctx.stroke();
        ctx.beginPath();
        ctx.fillStyle = 'red';
        ctx.rect(this.x + (this.currentHP / this.attributes[AttributeEnum.HP]) * width, this.y - 5, width - ((this.currentHP / this.attributes[AttributeEnum.HP])
            * width), 15);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'black';
        ctx.stroke();
    }
};

Monster.prototype.drawWord = function () {
    if (this.currentHP > 0) {
        var selectedFont = "25pt MarkerFelt-Thin, Comic Sans MS";
        var font = "20pt MarkerFelt-Thin, Comic Sans MS";
        var boxWidth = 0;
        var x = this.x;
        var y = this.y - 17;
        if (activeMonster == this) {
            var parts = wordCorrectness();
            //When i == 0 it's drawing the box surrounding text, when 2 it's drawing the text.
            for (var i = 0; i < 2; i++) {
                ctx.font = selectedFont;
                ctx.fillStyle = 'green';
                for (var l = 0; l < parts[0].length; l++) {
                    var ch = parts[0].charAt(l);
                    if (i == 0)
                        boxWidth += ctx.measureText(ch).width;
                    else {
                        ctx.fillText(ch, x, y);
                        x += ctx.measureText(ch).width;
                    }
                }
                ctx.font = font;
                ctx.fillStyle = 'black';
                for (l = 0; l < parts[1].length; l++) {
                    ch = parts[1].charAt(l);
                    if (i == 0)
                        boxWidth += ctx.measureText(ch).width;
                    else {
                        ctx.fillText(ch, x, y);
                        x += ctx.measureText(ch).width;
                    }
                }
                if (i == 0) {
                    //Draw the box surrounding text
                    ctx.fillStyle = "white";
                    ctx.beginPath();
                    ctx.rect(x - 5, y - 30, boxWidth + 10, 40);
                    ctx.fill();
                    ctx.lineWidth = 5;
                    ctx.strokeStyle = 'black';
                    ctx.stroke();
                }
            }
            ctx.font = "12pt Arial";
        } else {
            //Draw the box surrounding text
            ctx.font = font;
            boxWidth = ctx.measureText(this.word).width;
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.rect(x - 5, y - 30, boxWidth + 10, 40);
            ctx.fill();
            ctx.lineWidth = 5;
            ctx.strokeStyle = 'black';
            ctx.stroke();
            //Draw word
            ctx.fillStyle = '#000';
            ctx.fillText(this.word, x, y);
            ctx.font = "12pt Arial";
        }
    }
};

function getAttributes(difficulty) {
    //Name, src, hp, move spd, attk spd, damage, exp, gold
    var attributes = new Array(8);
    var monsters;
    var monsterID = -1;
    var exp;
    var gold = 0;
    switch (difficulty) {
        case 0:
        case 1:
            monsters =
                [
                    //Slime
                    ["Slime", ["resources/img/monster/LivingMoundGreen.PNG", "resources/img/monster/LivingMoundGreenBrown.PNG",
                        "resources/img/monster/LivingMoundMagenta.PNG", "resources/img/monster/LivingMoundOrange.PNG",
                        "resources/img/monster/LivingMoundTeal.PNG"], 10, 5, 4, 5],
                    //Bat
                    ["Bat", ["resources/img/monster/BatBrown.PNG"], 5, 7, 2, 4],
                    //Centipede
                    ["Centipede", ["resources/img/monster/CentipedeBlue.PNG", "resources/img/monster/CentipedeBrown.PNG",
                        "resources/img/monster/CentipedeGreenDark.PNG",
                        "resources/img/monster/CentipedeGrey.PNG", "resources/img/monster/CentipedePink.PNG",
                        "resources/img/monster/CentipedeRed.PNG", "resources/img/monster/CentipedeSilver.PNG"], 12, 4, 4, 7]
                ];
            monsterID = Math.floor(Math.random() * monsters.length);
            exp = 5;
            if (Math.floor(Math.random() * 100) > 60)
                gold = Math.floor(Math.random() * 5) + 1;
            break;
        case 2:
            monsters =
                [
                    //Slime
                    ["Spiky Slime", ["resources/img/monster/LivingMoundBrown.PNG", "resources/img/monster/LivingMoundBrownGreen.PNG",
                        "resources/img/monster/LivingMoundFlesh.PNG", "resources/img/monster/LivingMoundLightGreen.PNG",
                        "resources/img/monster/LivingMoundRed.PNG"], 20, 6, 4, 8],
                    //Centipede
                    ["Tentacle Centipede", ["resources/img/monster/CentipedeBlueTentacles.PNG", "resources/img/monster/CentipedeGreenTentacles.PNG",
                        "resources/img/monster/CentipedeGreenTentacles2.PNG", "resources/img/monster/CentipedeRedTentacles.PNG"], 16, 8, 4, 14]
                ];
            monsterID = Math.floor(Math.random() * monsters.length);
            exp = 5;
            if (Math.floor(Math.random() * 100) > 60)
                gold = Math.floor(Math.random() * 5) + 1;
            break;
        default:
            console.error("THIS MONSTER DIFFICULTY IS NOT YET SUPPORTED!");
            break;
    }
    for (var i = 0; i < 8; i++) {
        switch (i) {
            case 1:
                attributes[i] = monsters[monsterID][i][Math.floor(Math.random() * monsters[monsterID][i].length)];
                break;
            case 6:
                attributes[i] = exp;
                break;
            case 7:
                attributes[i] = gold;
                break;
            default:
                attributes[i] = monsters[monsterID][i];
                break;
        }
    }
    return attributes;

}

function getWord(difficulty) {
    var activeLetters = [monsters.length];
    for (var i = 0; i < monsters.length; i++)
        if (monsters[i].word !== undefined)
            activeLetters[i] = monsters[i].word[0];
    var words;
    switch (difficulty) {
        case 0:
        case 1:
            words = ["mom", "dad", "eye", "leg", "arm", "pig", "hen", "cat", "dog", "god", "well",
                "tree", "yes", "no", "sun", "food", "snow", "day", "tall", "short", "hot", "warm",
                "poor", "rich", "bull", "ox", "elk", "lion", "bear", "wolf", "goat", "hand", "neck",
                "nail", "mad", "evil", "here", "over", "back", "there", "why", "how", "now", "time",
                "moo", "beep", "what", "lap", "coin", "cup", "box", "show", "more", "less",
                "kill", "kills", "bar", "bars", "barn", "loud", "lord", "sword", "rat", "bag", "war", "axe",
                "hello", "apple", "pear", "liar", "the", "zen"];
            break;
        case 2:
            words = ["bottle", "spooky", "snatch", "squat", "control", "satchel", "sanitize",
                "keyboard", "lights", "poster", "sword", "battle", "hatchet", "helmet", "plate", "nobody",
                "shirt", "underwear", "hello there", "scrape", "the cat", "a bat", "an apple", "banana",
                "lying", "squire", "knight", "boulder", "rocking", "living", "hitting", "dying",
                "paper cut", "wounded", "zen"];
            break;
        default:
            return "ERROR";
            break;
    }
    //TODO: Store words in array by first letter for less CPU intensive way
    //Remove words that start with an active letter
    for (var letter = 0; letter < activeLetters.length; letter++) {
        for (var word = 0; word < words.length; word++) {
            if (words[word] != null && activeLetters[letter] == words[word][0]) {
                words[word] = null;
            }
        }
    }
    words = words.filter(function (n) {
        return n
    });
    return words[Math.floor(Math.random() * words.length)];
}

function getMonster() {
    for (var i = 0; i < monsters.length; i++) {
        if (monsters[i].word != undefined && currentWord[0] == monsters[i].word[0]) {
            activeMonster = monsters[i];
            return;
        }
    }
    activeMonster = undefined;
}

function wordCorrectness() {
    if (activeMonster != undefined) {
        var correctness = 0;
        for (var i = 0; i < currentWord.length; i++) {
            if (activeMonster.word[i] != undefined) {
                if (currentWord[i] == activeMonster.word[i])
                    correctness++;
                else
                    break;
            }
        }
        var returnArray = [2];
        returnArray[0] = activeMonster.word.substr(0, correctness);
        returnArray[1] = activeMonster.word.substr(correctness, activeMonster.word.length);
        if (returnArray[1].length == 0) {
            currentWord = "";
            activeMonster.hit();
        }

        return returnArray;
    }
    return undefined;
}

//Core Methods
var monsterTickCount = 0;
var tickCount = 0;

function update(mod) {
    if (focus) {
        if (activeScreen == ScreenEnum.Game) {
            while (tickTime >= tickRate) {
                tickTime -= tickRate;
                for (var i = 0; i < monsters.length; i++) {
                    if (monsters[i] != null) {
                        monsters[i].update();
                    }
                }
                if (tickCount++ >= monsterTickCount) {
                    tickCount -= monsterTickCount;
                    monsterTickCount = 15 + Math.random() * 50;
                    monsters.push(new Monster(0, Math.random() * 600 + 100, 125 + Math.random() * 50));
                }
            }
            tickTime += mod;
        }
    }
}

function render() {
    //Drawing Settings
    ctx.imageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctxInfo.imageSmoothingEnabled = false;
    ctxInfo.webkitImageSmoothingEnabled = false;
    ctxInfo.mozImageSmoothingEnabled = false;

    if (activeScreen == ScreenEnum.MainMenu) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctxInfo.fillStyle = 'white';
        ctxInfo.fillRect(0, 0, infoCanvas.width, infoCanvas.height);
    } else if (activeScreen == ScreenEnum.Game || activeScreen == ScreenEnum.Inventory || activeScreen == ScreenEnum.Store) {
        //GAME DRAWING
        //Draw Background
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (bgReady)
            ctx.drawImage(bgObj, 0, 0, 800, 600);
        //Draw Monsters
        //First sort them by Y value
        var sortY = monsters.slice(0);
        sortY.sort(function (a, b) {
            return a.y - b.y;
        });

        for (var i = 0; i < sortY.length; i++)
            sortY[i].draw();
        for (var j = 0; j < sortY.length; j++)
            sortY[j].drawWord();
        //Draw current word.
        ctxInfo.font = "17pt MarkerFelt-Thin, Comic Sans MS";
        var x = 50;
        var y = 550;
        var width = 200;
        var height = 25;
        var radius = 5;
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';

        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.fillText(currentWord, x + 4, y + 16);
        if (focus) {
            //INFO PANE DRAWING
            ctxInfo.fillStyle = 'white';
            ctxInfo.fillRect(0, 0, infoCanvas.width, infoCanvas.height);
            ctxInfo.font = "20pt MarkerFelt-Thin, Comic Sans MS";
            ctxInfo.fillStyle = '#000';
            ctxInfo.fillText("EXP: " + player.exp, 100, 60);
            ctxInfo.fillText("$$$$: " + player.gold, 500, 60);
            ctxInfo.fillStyle = "red";
            ctxInfo.fillRect(infoCanvas.width - 75, infoCanvas.height - 30, 75, 30);
            ctxInfo.fillStyle = '#000';
            ctxInfo.font = "15pt MarkerFelt-Thin, Comic Sans MS";
            ctxInfo.fillText('pause', infoCanvas.width - 65, infoCanvas.height - 10)
        } else {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctxInfo.fillStyle = 'white';
            ctxInfo.fillRect(0, 0, canvas.width, canvas.height);
            ctxInfo.font = "40pt MarkerFelt-Thin, Comic Sans MS";
            ctxInfo.fillStyle = '#000';
            ctxInfo.fillText("GAME PAUSED", 185, 57);
            ctxInfo.font = "15pt MarkerFelt-Thin, Comic Sans MS";
            ctxInfo.fillStyle = 'blue';
            ctxInfo.fillText("click here to unpause", 280, 80);
        }
        if (activeScreen == ScreenEnum.Inventory) {
            ctx.font = "40pt MarkerFelt-Thin, Comic Sans MS";
            ctx.fillStyle = '#000';
            ctx.fillText("INVENTORY", 200, 200);
        } else if (activeScreen == ScreenEnum.Store) {
            ctx.font = "40pt MarkerFelt-Thin, Comic Sans MS";
            ctx.fillStyle = '#000';
            ctx.fillText("STORE", 200, 200);
        }
    }
}

function run() {
    update((Date.now() - time) / 1000);
    render();
    time = Date.now();
    requestAnimationFrame(run);
}