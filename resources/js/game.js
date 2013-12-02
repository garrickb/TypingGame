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
window.requestAnimationFrame(run);

// Check if a new cache is available on page load.
/*
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
 */

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
//Background Image
var bgObj = new Image();
bgObj.width = 800;
bgObj.height = 600;


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
            currentLevel.addMonster(new Monster(1, e.clientX, e.clientY));
        else
            currentLevel.addMonster(new Monster(2, e.clientX, e.clientY));
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

var currentLevel;
var loadedMonsters = [];

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
    if (loadedMonsters[this.attributes[AttributeEnum.SRC]] == undefined) {
        var img = new Image();
        img.src = this.attributes[AttributeEnum.SRC];
        loadedMonsters[this.attributes[AttributeEnum.SRC]] = img;
    }
    this.width = loadedMonsters[this.attributes[AttributeEnum.SRC]].width * imgScale;
    this.height = loadedMonsters[this.attributes[AttributeEnum.SRC]].height * imgScale;
    this.x = x - (this.height / 2);
    this.y = y;
    this.startX = this.x;
    this.currentHP = this.attributes[AttributeEnum.HP];
    this.destX = this.x;
    this.destY = 600 - (this.height / 2);
    //Set the word.
    this.word = getWord(difficulty);
    if (activeMonster == undefined) //Check if new monster matches current words
        getMonster();

}


Monster.prototype.hit = function () {
    if (this == activeMonster)
        activeMonster = undefined;
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
    if (currentLevel != undefined && currentLevel.monsters != undefined) {
        if (this == activeMonster)
            activeMonster = undefined;
        currentLevel.monsters.splice(currentLevel.monsters.indexOf(this), 1);
    }
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
        } else if (Math.random() * 100 > 96) {
            this.destX = this.startX - 150 + Math.random() * 300;
            if (this.destX >= 800)
                this.destX = 799;
            else if (this.destX <= 0)
                this.destX = 1;
        }

    }
    if (yDist > 0)
        this.y += speed * speedMod;
    else {
        this.y = this.destY;
    }

};


Monster.prototype.draw = function () {
    //Check the image is loaded
    if (this.width == 0) {
        //console.log("Re-loading image for " + this.attributes[AttributeEnum.SRC]);
        var img = new Image();
        img.src = this.attributes[AttributeEnum.SRC];
        loadedMonsters[this.attributes[AttributeEnum.SRC]] = img;

        this.width = loadedMonsters[this.attributes[AttributeEnum.SRC]].width * imgScale;
        this.height = loadedMonsters[this.attributes[AttributeEnum.SRC]].height * imgScale;
    }
    if (this.currentHP > 0) {
        //Draw Image
        var monsterImg = loadedMonsters[this.attributes[AttributeEnum.SRC]];

        ctx.drawImage(monsterImg, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        //Draw HP Bar
        ctx.beginPath();
        ctx.fillStyle = 'green';
        ctx.rect(this.x - this.width / 2, this.y - this.height / 2 - 5, (this.currentHP / this.attributes[AttributeEnum.HP])
            * this.width, 15);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'black';
        ctx.stroke();
        ctx.beginPath();
        ctx.fillStyle = 'red';
        ctx.rect(this.x - this.width / 2 + (this.currentHP / this.attributes[AttributeEnum.HP]) * this.width, this.y - this.height / 2 - 5, this.width - ((this.currentHP / this.attributes[AttributeEnum.HP])
            * this.width), 15);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'black';
        ctx.stroke();
        //draw origin
        //ctx.fillRect(this.x-5,this.y-5,10,10);
    }
};

Monster.prototype.drawWord = function () {
    if (this.currentHP > 0) {
        var selectedFont = "25pt MarkerFelt-Thin, Comic Sans MS";
        var font = "20pt MarkerFelt-Thin, Comic Sans MS";
        var boxWidth = 0;
        var x = (this.x > (ctx.measureText(this.word).width / 2) + 10) ? ((this.x < 790 + (ctx.measureText(this.word).width / 2) - ctx.measureText(this.word).width) ? this.x - (ctx.measureText(this.word).width / 2) : 790 - ctx.measureText(this.word).width) : 10;
        var y = this.y - 17 - this.height / 2;
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
                    drawRect(x, y, 35, boxWidth);
                    ctx.fillStyle = 'black';
                }
            }
            ctx.font = "20pt MarkerFelt-Thin, Comic Sans MS";
        } else {
            drawRect(x, y, 35, ctx.measureText(this.word).width);
            ctx.fillText(this.word, x, y);
        }
    }
};

//Level Object
LevelDataEnum = {
    BG_SRC: 0,
    DIFFICULTY: 1,
    ENEMY_LEVELS: 2,
    BASE_TICKS: 3,
    MAX_TICKS: 4,
    ON_START: 5,
    ON_FINISH: 6,
    REWARD_EXP: 7,
    REWARD_GOLD: 8
};
//TODO: Item Reward: Array of items awarded on completion
var levels = [
    ['resources/img/room/room1.png', 12, [0], 50, 25, function () {

    },
        function () {
            alert('level 1 ended: rewarded 50 gold and 10 exp')
        }, 50, 10],
    ['resources/img/room/room1.png', 25, [0, 1, 1, 1], 45, 25, function () {
        alert("omg lvl2 git rdy");
    },
        function () {
            alert('level 2 ended: rewarded 100 exp and 25 gold')
        }, 100, 25],
    ['resources/img/room/room1.png', 25, [0, 1, 1, 2, 2, 2], 45, 20, function () {
    },
        function () {
            alert('level 3 ended: rewarded 200 exp and 50 gold')
        }, 200, 50]
];
var levelIndex = 0;

function Level(level) {
    currentLevel = this;
    this.currentDifficulty = 0;
    this.monsters = [];
    this.active = false;
    this.data = level;
    var img = new Image();
    img.src = level[LevelDataEnum.BG_SRC];
    img.onload = function () {
        bgObj = img;
        level[LevelDataEnum.ON_START]();
        currentLevel.active = true;
    };
}
Level.prototype.addMonster = function (monster) {
    if (monster instanceof Monster)
        this.monsters.push(monster);
};

Level.prototype.end = function () {
    this.active = false;
    player.gold += this.data[LevelDataEnum.REWARD_GOLD];
    player.exp += this.data[LevelDataEnum.REWARD_EXP];
    this.data[LevelDataEnum.ON_FINISH]();
    if (++levelIndex < levels.length) {
        currentLevel = new Level(levels[levelIndex]);
    } else {
        currentLevel = undefined;
        alert("no more levels to load")
    }
    //TODO: Ending screen
};


function drawRect(x, y, height, boxWidth) {
    var width = boxWidth + 10;
    ctx.fillStyle = 'white';
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(x - 5 + 5, y - 28);
    ctx.lineTo(x - 5 + width - 5, y - 28);
    ctx.quadraticCurveTo(x - 5 + width, y - 28, x - 5 + width, y - 28 + 5);
    ctx.lineTo(x - 5 + width, y - 28 + height - 5);
    ctx.quadraticCurveTo(x - 5 + width, y - 28 + height, x - 5 + width - 5, y - 28 + height);
    ctx.lineTo(x - 5 + 5, y - 28 + height);
    ctx.quadraticCurveTo(x - 5, y - 28 + height, x - 5, y - 28 + height - 5);
    ctx.lineTo(x - 5, y - 28 + 5);
    ctx.quadraticCurveTo(x - 5, y - 28, x - 5 + 5, y - 28);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.fillStyle = 'black';
}

function getAttributes(difficulty) {
    //Name, src, hp, move spd, attk spd, damage, exp, gold
    var attributes = new Array(8);
    var monsters;
    var monsterID = -1;
    var exp;
    var gold = 0;
    switch (difficulty) {
        case 0:
            monsters =
                [
                    //Slime
                    ["Slime", ["resources/img/monster/LivingMoundGreen.PNG", "resources/img/monster/LivingMoundGreenBrown.PNG",
                        "resources/img/monster/LivingMoundMagenta.PNG", "resources/img/monster/LivingMoundOrange.PNG",
                        "resources/img/monster/LivingMoundTeal.PNG"], 5, 6, 5, 5]
                ];
            monsterID = 0;
            exp = 2;
            if (Math.floor(Math.random() * 100) > 65)
                gold = Math.floor(Math.random() * 3) + 1;
            break;
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
            if (Math.floor(Math.random() * 100) > 50)
                gold = Math.floor(Math.random() * 5) + 1;
            break;
        case 2:
            monsters =
                [
                    //Slime
                    ["Spiky Slime", ["resources/img/monster/LivingMoundBrown.PNG", "resources/img/monster/LivingMoundBrownGreen.PNG",
                        "resources/img/monster/LivingMoundFlesh.PNG", "resources/img/monster/LivingMoundLightGreen.PNG",
                        "resources/img/monster/LivingMoundRed.PNG"], 20, 4, 4, 8],
                    //Centipede
                    ["Tentacle Centipede", ["resources/img/monster/CentipedeBlueTentacles.PNG", "resources/img/monster/CentipedeGreenTentacles.PNG",
                        "resources/img/monster/CentipedeGreenTentacles2.PNG", "resources/img/monster/CentipedeRedTentacles.PNG"], 16, 7, 4, 14]
                ];
            monsterID = Math.floor(Math.random() * monsters.length);
            exp = 5;
            if (Math.floor(Math.random() * 100) > 35)
                gold = Math.floor(Math.random() * 7) + 2;
            break;
        default:
            console.error("THIS MONSTER DIFFICULTY IS NOT YET SUPPORTED! [" + difficulty + "]");
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
    var activeLetters = [currentLevel.monsters.length];
    for (var i = 0; i < currentLevel.monsters.length; i++)
        if (currentLevel.monsters[i].word !== undefined)
            activeLetters[i] = currentLevel.monsters[i].word[0];
    var words;
    switch (difficulty) {
        case 0:
            words = ["a", "at", "bat", "cat", "rat", "sat", "an", "can", "fan", "man", "pan", "cap", "map", "nap",
                "tap", "bag", "wag", "nap", "tap", "rag", "am", "jam", "ram", "yam", "bad", "dad", "had", "mad", "sad",
                "by", "my", "all", "or", "mom", "and", "us", "bus", "bed", "red", "get", "let", "jet", "net", "pet",
                "wet", "den", "hen", "pen", "ten", "beg", "leg", "peg", "it", "bit", "fit", "hit", "sit", "big", "dig",
                "fig", "wig", "in", "fin", "win", "pin", "bid", "did", "hid", "rid", "if", "is", "his", "her", "hip",
                "sip", "tip", "lip", "hop", "mop", "pop", "top", "dot", "got", "hot", "not", "pot", "job", "mob", "sob",
                "bun", "fun", "run", "sun", "but", "cut", "gut", "nut", "up", "cup", "pup", "cub", "rub", "tub", "bug",
                "dug", "hug", "rug", "tug", "zoo", "be", "he", "bee", "see", "she", "we", "go", "so", "do", "zen",
                "zap", "zip", "zig", "zag", "yak", "yay", "yep", "yet", "elk", "god", "imp", "kill", "kit", "kiss",
                "key", "ork", "oak", "one", "vex", "vee"];
            break;
        case 1:
        case 2:
            words = ["sound", "card", "barn", "park", "only", "straw", "ocean", "title", "shark", "card", "good",
                "name", "right", "might", "think", "tight", "right", "push", "count", "line", "much", "work", "know",
                "years", "rain", "mail", "wait", "paint", "chant", "paid", "goods", "after", "very", "thing", "means",
                "blue", "true", "clue", "glue", "gold", "mold", "hold", "help", "where", "great", "girl", "third",
                "stage", "kind", "cause", "hero", "sift", "gift", "lift", "soft", "stack", "check", "time", "hour",
                "edge", "built", "felt", "valid", "zinc", "zits", "zone", "zebra", "quail", "quads", "quaff", "quilt",
                "yowl", "yews", "yank", "apples", "dunes", "double", "dunce", "itches", "immune", "idle", "jiffy",
                "judge", "jails", "koala", "kisses", "lance", "loser", "lofts", "lodge", "gnome", "north", "numbs",
                "notes", "ounce", "three", "oval", "order", "onion", "oaken", "robber", "sting", "under"];
            break;
        default:
            return "ERROR";
            break;
    }
    //TODO: Store words in array by first letter for less CPU intensive way
    //Remove words that start with an active letter
    for (var letter = 0; letter < activeLetters.length; letter++) {
        for (var word = 0; word < words.length; word++) {
            if (words[word] != undefined && activeLetters[letter] == words[word][0]) {
                words[word] = undefined;
            }
        }
    }
    words = words.filter(function (n) {
        return n
    });
    return words[Math.floor(Math.random() * words.length)];
}

function getMonster() {
    for (var i = 0; i < currentLevel.monsters.length; i++) {
        if (currentLevel.monsters[i].word != undefined && currentWord[0] == currentLevel.monsters[i].word[0]) {
            activeMonster = currentLevel.monsters[i];
            return;
        }
    }
    currentWord = "";
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
            activeMonster.hit();
            currentWord = "";
        } else
            currentWord = returnArray[0];
        return returnArray;
    } else {
        currentWord = "";
    }
    return undefined;
}

//Core Methods
var monsterTickCount = 50;
var tickCount = 0;

function update(mod) {
    if (focus) {
        if (activeScreen == ScreenEnum.Game && currentLevel != undefined && currentLevel.active) {
            while (tickTime >= tickRate) {
                tickTime -= tickRate;
                for (var i = 0; i < currentLevel.monsters.length; i++) {
                    if (currentLevel.monsters[i] != undefined) {
                        currentLevel.monsters[i].update();
                    }
                }
                if (currentLevel.data[LevelDataEnum.DIFFICULTY] > currentLevel.currentDifficulty) {
                    if (tickCount++ >= monsterTickCount) {
                        tickCount -= monsterTickCount;
                        var monsterDifficulty = currentLevel.data[LevelDataEnum.ENEMY_LEVELS][Math.floor(Math.random() *
                            currentLevel.data[LevelDataEnum.ENEMY_LEVELS].length)];
                        currentLevel.currentDifficulty += monsterDifficulty + 1;
                        monsterTickCount = currentLevel.data[LevelDataEnum.BASE_TICKS] + (Math.floor(Math.random() *
                            currentLevel.data[LevelDataEnum.MAX_TICKS]) + 1);

                        currentLevel.addMonster(new Monster(monsterDifficulty, Math.random() * 600 + 100, Math.floor(Math.random() * 10) + 100));
                    }
                } else if (currentLevel.monsters.length == 0) {
                    currentLevel.end();
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
        if (currentLevel != undefined && currentLevel.monsters != undefined) {
            //GAME DRAWING
            //Draw Background
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.drawImage(bgObj, 0, 0, 800, 600);
            //Draw Monsters
            //First sort them by Y value
            var sortY = currentLevel.monsters.slice(0);
            sortY.sort(function (a, b) {
                return a.y - b.y;
            });
            ctx.font = "20pt MarkerFelt-Thin, Comic Sans MS";
            for (var i = 0; i < sortY.length; i++)
                if (activeMonster == undefined || sortY[i] != activeMonster) {
                    sortY[i].draw();
                    sortY[i].drawWord();
                }
            if (activeMonster != undefined) {
                activeMonster.draw();
                activeMonster.drawWord();
            }
        }
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
            ctxInfo.fillText("click here to un-pause", 280, 80);
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

//Load the first level.
new Level(levels[0]);