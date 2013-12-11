/**
 * Created by Garrick on 12/4/13.
 */
var helmet;
var shield;
var plate;
var boots;
var sword;

var hoverX, hoverY, hovering = false, hoveredItem;
var selectedItem, selectedIndex;

var invCanvas = document.getElementById('invPane');
invCanvas.style.cursor = "none";
var ctxInv = invCanvas.getContext('2d');
invCanvas.addEventListener('click', onInventoryClick, false);
invCanvas.addEventListener('mousemove', onInventoryHover, false);
invCanvas.addEventListener('mouseover', onInventoryHoverStart, false);
invCanvas.addEventListener('mouseout', onInventoryHoverEnd, false);
function onInventoryClick(e) {
    var x = e.pageX - invCanvas.offsetLeft;
    var y = e.pageY - invCanvas.offsetTop;
    if (selectedItem == undefined) {
        var index = player.inventory.itemIndexAt(x, y);
        var item = player.inventory.items[index];
        if (item != undefined) {
            console.log("You clicked on " + item.name + " [" + index + "]");
            selectedItem = item;
            selectedIndex = index;
        }
    } else {
        selectedItem = undefined;
    }
}
function onInventoryHover(e) {
    var x = e.pageX - invCanvas.offsetLeft;
    var y = e.pageY - invCanvas.offsetTop;
    hoverX = x;
    hoverY = y;
    if (selectedItem == undefined) {
        var index = player.inventory.itemIndexAt(x, y);
        var item = player.inventory.items[index];
        hoveredItem = item;
        if (item != undefined) {
            console.log("You're hovering " + item.name + " [" + index + "]");
        }
    } else {

    }
}
function onInventoryHoverStart(e) {
    console.log("hover start");
    hovering = true;
}
function onInventoryHoverEnd(e) {
    console.log("hover end");
    hovering = false;
}

var loadedItems = [];
ItemAttribute = {
    NAME: 0,
    SRC: 1,
    LEVEL: 2,
    CATEGORY: 3,
    SUB_CATEGORY: 4,
    COST: 5,
    SPECIAL: 6
};
//Name, level, type
var items = [
    ["Bronze Sword", "resources/img/item/bronze-sword.png", 1, "WEAPON", "SWORD", 5, [
        ["Min Dmg", 4],
        ["Max Dmg", 7]
    ]],
    ["Iron Sword", "resources/img/item/iron-sword.png", 10, "WEAPON", "SWORD", 10, [
        ["Min Dmg", 17],
        ["Max Dmg", 24]
    ]]
];


//TODO: Add randomized rarity, the higher it is the better it is.
function Item(id) {
    var attributes = items[id];
    this.name = attributes[ItemAttribute.NAME];
    this.src = attributes[ItemAttribute.SRC];
    this.level = attributes[ItemAttribute.LEVEL];
    this.category = attributes[ItemAttribute.CATEGORY];
    this.subCategory = attributes[ItemAttribute.SUB_CATEGORY];
    this.imageLoaded = false;
    this.cost = attributes[ItemAttribute.COST];
    this.special = attributes[ItemAttribute.SPECIAL];
}

Item.prototype.toString = function () {
    return "'" + this.name + "' [" + this.subCategory + ", " + this.category + "]";
};

function Inventory(items) {
    if (items == undefined) {
        this.items = [];
    } else {
        //TODO: Starting with items in inventory.
    }
}

Inventory.prototype.itemIndexAt = function (x, y) {
    if ((x > 12.5 && x < 140) && (y > 245 && y < 462.5)
        && ((((x - 12.5) / 45) % 1) < 0.8) //Exclude area between the columns
        && ((((y - 245) / 45) % 1) < 0.8)) //Exclude area between the rows
    {
        var column = Math.floor((x - 12.5) / 45);
        var row = Math.floor((y - 245) / 45);
        //console.log("Inventory slot (" + column + ", " + row + ") [" + (column + (row*3)) + "]");
        return (column + (row * 3));
    }
    return undefined;
};

Inventory.prototype.add = function (item) {
    //Load the image if it's not already.
    if (loadedItems[item.src] == undefined) {
        var img = new Image();
        img.src = item.src;
        loadedItems[item.src] = img;
        img.onload = function () {
            item.imageLoaded = true;
        };
    } else {
        item.imageLoaded = true;
    }
    for (var i = 0; i < 15; i++)
        if (this.items[i] == undefined) {
            this.items[i] = item;
            console.log("[" + i + "] Successfully added (" + item.toString() + ") into inventory.");
            return true;
        }
    console.log("ERROR: Not enough room in inventory!");
    return false; //There are more than 15 items in the inventory.
};

Inventory.prototype.remove = function (item) {
    if (item instanceof Item) {
        for (var i = 0; i < 15; i++)
            if (this.items[i] === item) {
                console.log("Removed " + this.items[i].name + " at index of " + i + ".");
                this.items[i] = undefined;
            }
    } else {
        if (item < 15) {
            if (this.items[item] == undefined) {
                console.log("Nothing exists at index " + item + ".");
                return true;
            }
            console.log("Removed " + this.items[item].name + " at index of " + item + ".");
            this.items[item] = undefined;
            return true;
        } else
            return false;
    }
};

Inventory.prototype.print = function () {
    console.log("INVENTORY:");
    for (var i = 0; i < 15; i++) {
        console.log("[" + i + "] " + ((this.items[i] != undefined) ? this.items[i] : "undefined"));
    }
};

Inventory.prototype.draw = function () {
    ctxInv.fillStyle = '#FFF';
    ctxInv.imageSmoothingEnabled = false;
    ctxInv.webkitImageSmoothingEnabled = false;
    ctxInv.mozImageSmoothingEnabled = false;
    ctxInv.fillRect(0, 0, invCanvas.width, invCanvas.height);
    ctxInv.drawImage(invObj, 0, 0, 150, 600);
    for (var i = 0; i < 15; i++) {
        if (this.items[i] != undefined) {
            if (!this.items[i].imageLoaded) {
                console.log("Re-loading image for item " + this.items[i].src);
                var img = new Image();
                img.src = this.items[i].src;
                loadedMonsters[this.items[i].src] = img;
                img.onload = function () {
                    this.imageLoaded = true;
                };
            } else {
                ctxInv.drawImage(loadedItems[this.items[i].src], (Math.floor(i % 3) * 45) + 12.5, 245 + (Math.floor(i / 3) * 45), 37.5, 37.5);
            }
        }
    }
    if (selectedItem != undefined) {
        ctxInv.fillText(selectedItem.name, 50, 50);
    } else if (hovering && hoveredItem != undefined) {
        var extraInfo = hoveredItem.special;
        ctxInv.font = "8pt MarkerFelt-Thin, Comic Sans MS";
        var widestEntry = ctxInv.measureText(hoveredItem.name).width;
        for (var i = 0; i < extraInfo.length; i++) {
            if (ctxInv.measureText(extraInfo[i][0] + ": " + extraInfo[i][1]).width > widestEntry)
                widestEntry = ctxInv.measureText(extraInfo[i][0] + ": " + extraInfo[i][1]).width;
        }
        var menuWidth = widestEntry + 10;
        var menuHeight = 30 + (extraInfo.length) * 12;
        var menuX = (hoverX > menuWidth) ? hoverX - menuWidth : (hoverX + menuWidth > invCanvas.width) ? 0 : hoverX;
        ctxInv.beginPath();
        ctxInv.fillStyle = 'grey';
        ctxInv.rect(menuX, hoverY, menuWidth, menuHeight);
        ctxInv.fill();
        ctxInv.lineWidth = 2;
        ctxInv.strokeStyle = 'black';
        ctxInv.stroke();
        if (hoveredItem.level > 5)
            ctxInv.fillStyle = 'darkred';
        else
            ctxInv.fillStyle = 'darkgreen';
        var currY = hoverY + 24;
        ctxInv.fillText(hoveredItem.name, menuX + 5, currY - 12);
        ctxInv.fillStyle = 'white';
        for (var i = 0; i < extraInfo.length; i++) {
            ctxInv.fillText(extraInfo[i][0] + ": " + extraInfo[i][1], menuX + 5, currY)
            currY += 12;
        }
        ctxInv.fillStyle = 'gold';
        ctxInv.fillText("$$$ " + hoveredItem.cost, menuX + 5, currY)
    }
    //Draw Cursor
    if (hovering) {
        ctxInv.fillStyle = 'black';
        ctxInv.beginPath();
        ctxInv.arc(hoverX - 2, hoverY, 4, 0, 2 * Math.PI);
        ctxInv.fill();
    }
}
;