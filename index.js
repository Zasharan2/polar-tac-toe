var c = document.getElementById("game");
var ctx = c.getContext("2d");

const canvasWidth = 896;
const canvasHeight = 512;

var keys = [];

document.addEventListener("keydown", function (event) {
    keys[event.key] = true;
    if (["ArrowUp", "ArrowDown", " "].indexOf(event.key) > -1) {
        event.preventDefault();
    }
});

document.addEventListener("keyup", function (event) {
    keys[event.key] = false;
});

var mouseX, mouseY;
var relMouseX, relMouseY;
var mouseRadius;
var mouseAngle;

c.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});

window.addEventListener("mousemove", function(event) {
    mouseX = event.clientX - c.getBoundingClientRect().left;
    mouseY = event.clientY - c.getBoundingClientRect().top;
    relMouseX = 256 - mouseX;
    relMouseY = 256 - mouseY;
    mouseRadius = Math.sqrt((Math.pow(relMouseX,2)) + (Math.pow(relMouseY,2)));
    mouseAngle = Math.atan2(relMouseY, relMouseX) + Math.PI;
});

var mouseDown, mouseButton;

window.addEventListener("mousedown", function(event) {
    mouseDown = true;
    mouseButton = event.buttons;
});

window.addEventListener("mouseup", function(event) {
    mouseDown = false;
});

var angleDivs = 5;
var levels = 3;

var minAngleDivs = 2;
var minLevels = 1;

const pink = "#ffaacc";
const purple = "#883366";
const select = "#ff66aa88";
const p1Col = "#ff4488";
const p2Col = "#8844ff";
const green = "#44aa44";

function drawArc(i, j, col, hoverBool) {
    // arc
    ctx.strokeStyle = pink;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(256, 256, 224*(i/levels), (j / angleDivs) * 2*Math.PI, ((j + 1) / angleDivs) * 2*Math.PI);
    ctx.fillStyle = col;
    ctx.fill();
    if (!hoverBool) {
        ctx.stroke();
    }
    ctx.closePath();

    // triangle
    ctx.strokeStyle = col;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(256, 256);
    ctx.lineTo(256 + (224*(i/levels)*Math.cos((j/angleDivs)*2*Math.PI)), 256+(224*(i/levels)*Math.sin((j/angleDivs)*2*Math.PI)));
    ctx.lineTo(256 + (224*(i/levels)*Math.cos(((j + 1)/angleDivs)*2*Math.PI)), 256+(224*(i/levels)*Math.sin(((j + 1)/angleDivs)*2*Math.PI)));
    ctx.lineTo(256, 256);
    ctx.fill();
    if (!hoverBool) {
        ctx.stroke();
    }
    ctx.closePath();
}

var sectors;
function initSectors() {
    sectors = new Array(angleDivs);
    for (var i = 0; i < sectors.length; i++) {
        sectors[i] = new Array(levels);
        for (var j = 0; j < sectors[i].length; j++) {
            sectors[i][j] = 0;
        }
    }
}

var winConditions = [4, 3]; // 4 angular OR 3 levels
var minWinConditions = [3, 3];

function checkWin() {
    for (var i = 0; i < levels; i++) {
        for (var j = 0; j < angleDivs; j++) {
            if (sectors[j][i] != 0) {
                // angular check
                var running = sectors[j][i];
                var runningBool = true;
                for (var k = 0; k < winConditions[0]; k++) {
                    if (sectors[(j + k) % (angleDivs)][i] != running) {
                        runningBool = false;
                    }
                }
                if (runningBool) {
                    return [j, i, 0];
                }

                // level check
                if (i + winConditions[1] < (levels + 1)) {
                    running = sectors[j][i];
                    runningBool = true;
                    for (var k = 0; k < winConditions[1]; k++) {
                        if (sectors[j][i + k] != running) {
                            runningBool = false;
                        }
                    }
                    if (runningBool) {
                        return [j, i, 1];
                    }
                }
            }
        }
    }
    return false;
}

var turn = 1;
var players = 2;
var selectSectorTimer = 0;
var selectSectorDelay = 50;

var gameWon = false;

function game() {
    selectSectorTimer += deltaTime;

    ctx.strokeStyle = purple;
    ctx.lineWidth = 5;

    if (turn == 1) {
        ctx.fillStyle = p1Col;
    } else if (turn == 2) {
        ctx.fillStyle = p2Col;
    }
    ctx.fillRect(10, 10, 50, 50);

    // draw sectors
    for (var i = levels; i > 0; i--) {
        for (var j = 0; j < angleDivs; j++) {
            switch (sectors[j][i - 1]) {
                case 0: {
                    drawArc(i, j, pink, false);
                    break;
                }
                case 1: {
                    drawArc(i, j, p1Col, false);
                    break;
                }
                case 2: {
                    drawArc(i, j, p2Col, false);
                    break;
                }
                case 3: {
                    drawArc(i, j, green, false);
                    break;
                }
                default: {
                    break;
                }
            }
            if (!gameWon) {
                if (mouseRadius < (224*(i/levels)) && mouseRadius > (224*((i - 1)/levels))) {
                    if ((mouseAngle / (2*Math.PI)) > (j / angleDivs) && (mouseAngle / (2*Math.PI)) < ((j + 1) / angleDivs)) {
                        if (sectors[j][i - 1] == 0) {
                            if (mouseDown && selectSectorTimer > selectSectorDelay) {
                                selectSectorTimer = 0;
                                sectors[j][i - 1] = turn;
                                turn++;
                                if (turn > players) {
                                    turn = 1;
                                }
                                var checkwin = checkWin();
                                if (checkwin != false) {
                                    if (checkwin[2] == 0) {
                                        for (var k = 0; k < winConditions[0]; k++) {
                                            sectors[(checkwin[0] + k) % angleDivs][checkwin[1]] = 3;
                                        }
                                    } else if (checkwin[2] == 1) {
                                        for (var k = 0; k < winConditions[1]; k++) {
                                            sectors[checkwin[0]][checkwin[1] + k] = 3;
                                        }
                                    }
                                    gameWon = true;
                                }
                            }
                            drawArc(i, j, select, true);
                        }
                    }
                }
            }
        }
    }

    ctx.strokeStyle = purple;
    ctx.lineWidth = 5;
    // draw circle borders
    for (var i = levels; i > 0; i--) {
        ctx.beginPath();
        ctx.arc(256, 256, 224*(i/levels), 0, Math.PI*2);
        ctx.stroke();
        ctx.closePath();
    }
    // draw angle borders
    for (var i = 0; i < angleDivs; i++) {
        ctx.beginPath();
        ctx.moveTo(256, 256);
        ctx.lineTo(256+(224*Math.cos((i/angleDivs)*2*Math.PI)), 256+(224*Math.sin((i/angleDivs)*2*Math.PI)));
        ctx.stroke();
        ctx.closePath();
    }
}

function background() {
    ctx.fillStyle = pink;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}

function triangle(x, y, updown, col) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 48, y);
    if (updown == 1) {
        ctx.lineTo(x + 24, y - 32);
    } else if (updown == -1) {
        ctx.lineTo(x + 24, y + 32);
    }
    ctx.lineTo(x, y);
    ctx.lineTo(x + 48, y);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
}

function mouseAABB(x, y, w, h) {
    if (mouseX > x && mouseY > y && mouseX < (x + w) && mouseY < (y + h)) {
        return true;
    }
    return false;
}

var changeSettingsTimer = 0;
var changeSettingsDelay = 20;

function settings() {
    changeSettingsTimer += deltaTime;

    // labels
    ctx.font = "30px Comic Sans MS";
    ctx.fillStyle = purple;
    ctx.fillText("Levels", 560, 30);
    ctx.fillText("Angles", 680, 30);
    ctx.fillText("Total", 800, 140);
    ctx.fillText("To Win", 790, 400);

    // general settings

    ctx.font = "80px Comic Sans MS";
    ctx.fillStyle = purple;
    if (levels > 9) {
        ctx.fillText(levels, 552, 160);
    } else {
        ctx.fillText(levels, 576, 160);
    }
    if (angleDivs > 9) {
        ctx.fillText(angleDivs, 680, 160);
    } else {
        ctx.fillText(angleDivs, 704, 160);
    }

    if (mouseAABB(576, 48, 48, 32)) {
        if (mouseDown && changeSettingsTimer > changeSettingsDelay) {
            changeSettingsTimer = 0;
            levels++;
            gameWon = false;
            initSectors();
        }
        triangle(576, 80, 1, purple);
    } else {
        triangle(576, 80, 1, pink);
    }
    if (mouseAABB(704, 48, 48, 32)) {
        if (mouseDown && changeSettingsTimer > changeSettingsDelay) {
            changeSettingsTimer = 0;
            angleDivs++;
            gameWon = false;
            initSectors();
        }
        triangle(704, 80, 1, purple);
    } else {
        triangle(704, 80, 1, pink);
    }
    if (mouseAABB(576, 182, 48, 32)) {
        if (mouseDown && changeSettingsTimer > changeSettingsDelay) {
            changeSettingsTimer = 0;
            levels--;
            if (levels < minLevels) {
                levels = minLevels;
            }
            gameWon = false;
            initSectors();
        }
        triangle(576, 182, -1, purple);
    } else {
        triangle(576, 182, -1, pink);
    }
    if (mouseAABB(704, 182, 48, 32)) {
        if (mouseDown && changeSettingsTimer > changeSettingsDelay) {
            changeSettingsTimer = 0;
            angleDivs--;
            if (angleDivs < minAngleDivs) {
                angleDivs = minAngleDivs;
            }
            gameWon = false;
            initSectors();
        }
        triangle(704, 182, -1, purple);
    } else {
        triangle(704, 182, -1, pink);
    }

    // win condition settings

    ctx.font = "80px Comic Sans MS";
    ctx.fillStyle = purple;
    if (winConditions[0] > 9) {
        ctx.fillText(winConditions[1], 552, 416);
    } else {
        ctx.fillText(winConditions[1], 576, 416);
    }
    if (winConditions[1] > 9) {
        ctx.fillText(winConditions[0], 680, 416);
    } else {
        ctx.fillText(winConditions[0], 704, 416);
    }

    if (mouseAABB(576, 304, 48, 32)) {
        if (mouseDown && changeSettingsTimer > changeSettingsDelay) {
            changeSettingsTimer = 0;
            winConditions[1]++;
            if (winConditions[1] > levels) {
                winConditions[1] = levels;
            }
            gameWon = false;
            initSectors();
        }
        triangle(576, 336, 1, purple);
    } else {
        triangle(576, 336, 1, pink);
    }
    if (mouseAABB(704, 304, 48, 32)) {
        if (mouseDown && changeSettingsTimer > changeSettingsDelay) {
            changeSettingsTimer = 0;
            winConditions[0]++;
            if (winConditions[0] > angleDivs) {
                winConditions[0] = angleDivs;
            }
            gameWon = false;
            initSectors();
        }
        triangle(704, 336, 1, purple);
    } else {
        triangle(704, 336, 1, pink);
    }
    if (mouseAABB(576, 438, 48, 32)) {
        if (mouseDown && changeSettingsTimer > changeSettingsDelay) {
            changeSettingsTimer = 0;
            winConditions[1]--;
            if (winConditions[1] < minWinConditions[1]) {
                winConditions[1] = minWinConditions[1];
            }
            gameWon = false;
            initSectors();
        }
        triangle(576, 438, -1, purple);
    } else {
        triangle(576, 438, -1, pink);
    }
    if (mouseAABB(704, 438, 48, 32)) {
        if (mouseDown && changeSettingsTimer > changeSettingsDelay) {
            changeSettingsTimer = 0;
            winConditions[0]--;
            if (winConditions[0] < minWinConditions[0]) {
                winConditions[0] = minWinConditions[0];
            }
            gameWon = false;
            initSectors();
        }
        triangle(704, 438, -1, purple);
    } else {
        triangle(704, 438, -1, pink);
    }
}

function main() {
    background();
    game();
    settings();
}

var deltaTime = 0;
var deltaCorrect = (1 / 8);
var prevTime = Date.now();
function loop() {
    deltaTime = (Date.now() - prevTime) * deltaCorrect;
    prevTime = Date.now();

    main();
    window.requestAnimationFrame(loop);
}

function init() {
    initSectors();
    gameWon = false;
    window.requestAnimationFrame(loop)
}
window.requestAnimationFrame(init);