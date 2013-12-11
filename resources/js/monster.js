/**
 * Created by Garrick on 12/4/13.
 */
var loadedMonsters = [];
var activeMonster;

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
    this.destY = 600 - (this.height / 2);
    this.destX = this.x;
    this.y = y;
    this.startX = this.x;
    this.currentHP = this.attributes[AttributeEnum.HP];

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
    player.inventory.add(new Item(0));
    this.destroy();
};


Monster.prototype.destroy = function () {
    if (currentLevel != undefined && currentLevel.monsters != undefined) {
        if (this == activeMonster)
            activeMonster = undefined;
        currentLevel.monsters.splice(currentLevel.monsters.indexOf(this), 1);
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
        case 3:
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
        case 3:
            words = ["a", "I'm gonna wreck you."];
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
        this.x = this.x - (this.height / 2);
        this.destY = 600 - (this.height / 2);
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
        ctx.font = font;
        var normWidth = ctx.measureText(this.word).width;
        var boxWidth = 0;
        var xOffset = 0;
        var x = (this.x > (normWidth / 2) + 10) ? ((this.x < 790 + (normWidth / 2) - normWidth) ? this.x - (normWidth / 2) : 790 - normWidth) : 10;
        var y = this.y - 25 - this.height / 2;
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
                        ctx.fillText(ch, x - xOffset / 2, y + 1);
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
                        ctx.fillText(ch, x - xOffset / 2, y + 1);
                        x += ctx.measureText(ch).width;
                    }
                }
                if (i == 0) {
                    xOffset = boxWidth - normWidth;
                    drawRect(x - xOffset / 2, y, 40, boxWidth);
                    ctx.fillStyle = 'black';
                }
            }
            ctx.font = "20pt MarkerFelt-Thin, Comic Sans MS";
        } else {
            drawRect(x, y, 40, ctx.measureText(this.word).width);
            ctx.fillText(this.word, x, y + 1);
        }
    }
};