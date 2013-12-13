/**
 * Created by Garrick on 12/4/13.
 */
var helmet;
var shield;
var plate;
var boots;
var sword;

var hoverX, hoverY, hovering = false;
var activeItem;
var activeIndex;
var activeItemInteraction; //0 = hover, 1 = click, 2 = drag

var activeStartX, activeStartY;

var invCanvas = document.getElementById('invPane');
invCanvas.style.cursor = "none";
var ctxInv = invCanvas.getContext('2d');
invCanvas.addEventListener('mousemove', onInventoryHover, false);
invCanvas.addEventListener('mouseover', onInventoryHoverStart, false);
invCanvas.addEventListener('mouseout', onInventoryHoverEnd, false);
invCanvas.addEventListener('mousedown', onInventoryDown, false);
invCanvas.addEventListener('mouseup', onInventoryUp, false);

function onInventoryHover(e) {
    hoverX = e.pageX - invCanvas.offsetLeft;
    hoverY = e.pageY - invCanvas.offsetTop;
}
function onInventoryHoverStart(e) {
    hovering = true;
}
function onInventoryHoverEnd(e) {
    hovering = false;
}
var mouseDown, mouseDownTime, mouseDownX, mouseDownY;
function onInventoryDown(e) {
    mouseDown = true;
    mouseDownTime = Date.now();
    mouseDownX = hoverX;
    mouseDownY = hoverY;
    console.log("mouse down");
}
function onInventoryUp(e) {
    mouseDown = false;
    if (activeItemInteraction == undefined)
        mouseDownTime = undefined;
    console.log("mouse up");
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
    ctxInv.font = "8pt MarkerFelt-Thin, Comic Sans MS";
    var widestEntry = ctxInv.measureText(this.name).width;
    for (var i = 0; i < this.special.length; i++) {
        if (ctxInv.measureText(this.special[i][0] + ": " + this.special[i][1]).width > widestEntry)
            widestEntry = ctxInv.measureText(this.special[i][0] + ": " + this.special[i][1]).width;
    }
    this.menuWidth = widestEntry + 10;
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
        && ((((x - 12.5) / 45) % 1) < 0.9) //Exclude area between the columns
        && ((((y - 245) / 45) % 1) < 0.9)) //Exclude area between the rows
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
                return true;
            }
        return false;
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

Inventory.prototype.update = function () {
    if (hovering) {
        if (activeItem == undefined) {
            activeIndex = player.inventory.itemIndexAt(hoverX, hoverY);
            if (activeIndex != undefined) {
                activeItem = player.inventory.items[activeIndex];
                activeItemInteraction = 0;
            }
        } else {
            switch (activeItemInteraction) {
                case 0: //Make sure we're still hovering what we are calling the 'active item'.
                    if (this.itemIndexAt(hoverX, hoverY) != activeIndex) {
                        this.resetActive();
                    } else {
                        //Check if we're clicking
                        if (mouseDown) {
                            if ((Date.now() - mouseDownTime > 500) || (Math.abs(hoverX - mouseDownX) + Math.abs(hoverY - mouseDownY)) > 5) {
                                console.log("start drag");
                                activeStartX = hoverX;
                                activeStartY = hoverY;
                                activeIndex = this.itemIndexAt(hoverX, hoverY);
                                activeItem = this.items[activeIndex];
                                activeItemInteraction = 2;
                                mouseDownTime = undefined;
                            }
                        } else if (mouseDownTime != undefined) {
                            console.log("clicked item");
                            activeStartX = hoverX;
                            activeStartY = hoverY;
                            activeIndex = this.itemIndexAt(hoverX, hoverY);
                            activeItem = this.items[activeIndex];
                            activeItemInteraction = 1;
                            mouseDownTime = undefined;
                        }
                    }
                    break;
                case 1: //Make sure that we're still within range of menu items, update hovered menu item.
                    break;
                case 2: //Make sure that we're still holding down mouse
                    if (!mouseDown) {
                        console.log("end drag");
                        this.resetActive();
                    } else {
                        console.log("draggin'");
                        activeStartX = hoverX;
                        activeStartY = hoverY;
                    }
                    break;
            }
        }
    } else {
        if (mouseDown || activeItem != undefined) {
            this.resetActive();
            mouseDown = false;
            console.log("action was interrupted");
        }
    }
};
Inventory.prototype.resetActive = function () {
    console.log('reset');
    mouseDownTime = undefined;
    mouseDownX = undefined;
    mouseDownY = undefined;
    activeIndex = undefined;
    activeItem = undefined;
    activeItemInteraction = undefined;
};

Inventory.prototype.draw = function () {
    ctxInv.fillStyle = '#FFF';
    ctxInv.imageSmoothingEnabled = false;
    ctxInv.webkitImageSmoothingEnabled = false;
    ctxInv.mozImageSmoothingEnabled = false;
    ctxInv.fillRect(0, 0, invCanvas.width, invCanvas.height);
    ctxInv.drawImage(invObj, 0, 0, 150, 600);
    for (i = 0; i < 15; i++) {
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

    if (activeItem != undefined) {
        var menuX, menuHeight, menuWidth;
        switch (activeItemInteraction) {
            case 0: //HOVERING
                var extraInfo = activeItem.special;
                ctxInv.font = "8pt MarkerFelt-Thin, Comic Sans MS";
                menuWidth = activeItem.menuWidth;
                menuHeight = 30 + (extraInfo.length) * 12;
                menuX = (hoverX > menuWidth) ? hoverX - menuWidth : (hoverX + menuWidth > invCanvas.width) ? 0 : hoverX;
                ctxInv.beginPath();
                ctxInv.fillStyle = 'grey';
                ctxInv.rect(menuX, hoverY, menuWidth, menuHeight);
                ctxInv.fill();
                ctxInv.lineWidth = 2;
                ctxInv.strokeStyle = 'black';
                ctxInv.stroke();
                if (activeItem.level > 5)
                    ctxInv.fillStyle = 'darkred';
                else
                    ctxInv.fillStyle = 'darkgreen';
                var currY = hoverY + 24;
                ctxInv.fillText(activeItem.name, menuX + 5, currY - 12);
                ctxInv.fillStyle = 'white';
                for (i = 0; i < extraInfo.length; i++) {
                    ctxInv.fillText(extraInfo[i][0] + ": " + extraInfo[i][1], menuX + 5, currY);
                    currY += 12;
                }
                ctxInv.fillStyle = 'gold';
                ctxInv.fillText("$$$ " + activeItem.cost, menuX + 5, currY);
                break;
            case 1: //CLICKED
                ctxInv.font = "8pt MarkerFelt-Thin, Comic Sans MS";
                menuWidth = activeItem.menuWidth;
                menuX = (activeStartX > menuWidth) ? activeStartX - menuWidth : (activeStartX + menuWidth > invCanvas.width) ? 0 : activeStartX;
                menuHeight = 30;
                ctxInv.beginPath();
                ctxInv.fillStyle = 'grey';
                ctxInv.rect(menuX, activeStartY, menuWidth, menuHeight);
                ctxInv.fill();
                ctxInv.lineWidth = 2;
                ctxInv.strokeStyle = 'black';
                ctxInv.stroke();
                ctxInv.fillStyle = 'white';
                ctxInv.fillText(activeItem.name, menuX + 5, activeStartY + 12);
                ctxInv.fillText("Clicked.", menuX + 5, activeStartY + 24);
                break;
            case 2: //DRAGGED
                ctxInv.font = "8pt MarkerFelt-Thin, Comic Sans MS";
                menuWidth = activeItem.menuWidth;
                menuX = (activeStartX > menuWidth) ? activeStartX - menuWidth : (activeStartX + menuWidth > invCanvas.width) ? 0 : activeStartX;
                menuHeight = 30;
                ctxInv.beginPath();
                ctxInv.fillStyle = 'grey';
                ctxInv.rect(menuX, activeStartY, menuWidth, menuHeight);
                ctxInv.fill();
                ctxInv.lineWidth = 2;
                ctxInv.strokeStyle = 'black';
                ctxInv.stroke();
                ctxInv.fillStyle = 'white';
                ctxInv.fillText(activeItem.name, menuX + 5, activeStartY + 12);
                ctxInv.fillText("Holding.", menuX + 5, activeStartY + 24);
                break;
        }
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