/**
 * Created by Garrick on 12/4/13.
 */
var currentLevel;

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

//Load the first level.
new Level(levels[0]);
