/**
 * Created by Garrick on 11/25/13.
 */
var canvas = document.getElementById('game');
var ctx = canvas.getContext('2d');
var infoCanvas = document.getElementById('infoPane');
var ctxInfo = infoCanvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;
infoCanvas.width = 950;
infoCanvas.height = 100;
invCanvas.width = 150;
invCanvas.height = 600;
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
    gold: 0,
    inventory: new Inventory()
};
for (var i = 0; i < 10; i++) {
    player.inventory.add(new Item(Math.floor(Math.random() * 2)));
}

var currentWord = "";

//UI Elements
var bgObj = new Image();
bgObj.width = 800;
bgObj.height = 600;
bgObj.src = "resources/img/room/room1.png";
var invObj = new Image();

invObj.width = 150;
invObj.height = 600;
invObj.src = "resources/img/ui/side.png";

var statsObj = new Image();

statsObj.width = 950;
statsObj.height = 100;
statsObj.src = "resources/img/ui/bottom.png";


//Events
canvas.addEventListener('click', onGameClick, false);
infoCanvas.addEventListener('click', onInfoClick, false);
document.onkeypress = function (e) {
    if (focus) {
        if (e.keyCode == 13) {
            currentWord = "";
            activeMonster = undefined;
        } else {
            currentWord += String.fromCharCode(e.keyCode);
        }
        console.log(currentWord);
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
        var x = e.pageX - canvas.offsetLeft;
        var y = e.pageY - canvas.offsetTop;
        console.log(x + ", " + y)
    }
}

function onInfoClick(e) {
    var x = e.pageX - infoCanvas.offsetLeft;
    var y = e.pageY - infoCanvas.offsetTop;
    console.log("Click at x:" + x + ", y:" + y + ".");
    if (focus) {
        if (x > 875 && y > 70)
            focus = false;
    } else {
        focus = true;
    }
}


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
    player.inventory.update();
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
    //Clear all frames
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctxInfo.fillStyle = '#000';
    ctxInfo.fillRect(0, 0, infoCanvas.width, infoCanvas.height);

    if (activeScreen == ScreenEnum.MainMenu) {
        ctxInfo.fillStyle = 'white';
        ctxInfo.fillRect(0, 0, infoCanvas.width, infoCanvas.height);
    } else if (activeScreen == ScreenEnum.Game || activeScreen == ScreenEnum.Inventory || activeScreen == ScreenEnum.Store) {
        if (player.inventory != undefined) {
            player.inventory.draw();
        }
        ctxInfo.drawImage(statsObj, 0, 0, 950, 100);
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