var screenHeight = 800;
var screenWidth = 1600;
var font;
var Ball = {
    sprite: '',
    xspeed: 0,
    yspeed: 0
}

var Controls = {
    up1: 87,
    down1: 83,
    up2: 38,
    down2: 40
}

var Sounds = {
    hitpaddle: '',
    hitwall: '',
    opponentpoint: ''
}

var Paddle1 = {
    sprite: ''
}

var Paddle2 = {
    sprite: ''
}

var Score1 = {
    value: 0
}

var Score2 = {
    value: 0
}

function preload() {
    font = loadFont('fonts/PressStart2P.ttf');
    Sounds.hitpaddle = loadSound('sounds/hitpaddle.wav');
    Sounds.hitwall = loadSound('sounds/hitwall.wav');
    Sounds.opponentpoint = loadSound('sounds/opponentpoint.wav');
}

function setup() {
    createCanvas(screenWidth, screenHeight);
    createPaddles();
    resetBall();
}

function draw() {
    background(0);
    createNet();
    createScores();
    drawSprites();
    if (canMove) {
        movePaddles();
        if (paddle1MovedUp == true) {
            moveUpServer(Paddle1);
        }
        if (paddle1MovedDown == true) {
            moveDownServer(Paddle1);
        }
        if (paddle1MovedUp == false && paddle1MovedDown == false) {
            stopPaddleServer(Paddle1);
        }

        if (paddle2MovedUp == true) {
            moveUpServer(Paddle2);
        }
        if (paddle2MovedDown == true) {
            moveDownServer(Paddle2);
        }
        if (paddle2MovedUp == false && paddle2MovedDown == false) {
            stopPaddleServer(Paddle2);
        }
    }
    ballMovement();
    touchBall();
    score();
}

function resetBall() {
    if (canMove && admin) {
        socket.emit('ballResetedClient');
    }
    createBall();
}

function createNet() {
    fill(255);
    noStroke();
    rect(screenWidth/2 - 4, 0, 8, screenHeight);
}

function createBall() {
    Ball.sprite = createSprite(screenWidth/2, screenHeight/2, 16, 16);
    Ball.sprite.shapeColor = 255;
}

function createPaddles() {
    Paddle1.sprite = createSprite(24, screenHeight/2, 16, 64);
    Paddle1.sprite.shapeColor = 255;
    Paddle1.sprite.setCollider('rectangle', 0, 0, 21, 69);

    Paddle2.sprite = createSprite(screenWidth - 24, screenHeight/2, 16, 64);
    Paddle2.sprite.shapeColor = 255;
    Paddle2.sprite.setCollider('rectangle', 0, 0, 21, 69);
}

function createScores() {
    textFont(font);
    textSize(54);
    textAlign(CENTER);
    text(Score1.value, (screenWidth/2) - 80, 75);
    text(Score2.value, (screenWidth/2) + 80, 75);
}

function ballMovement() {
    if (admin) {
        if (Ball.sprite.position.y - 16 < 0 || Ball.sprite.position.y + 16 > screenHeight) {
            Sounds.hitwall.play();
            socket.emit('ballTouchedWallClient');
            Ball.yspeed = -Ball.yspeed;
        }
        Ball.sprite.setVelocity(Ball.xspeed, Ball.yspeed);
        socket.emit('ballMovementClient', {
            BallxServer: Ball.sprite.position.x,
            BallyServer: Ball.sprite.position.y
        })
    } else {
        Ball.sprite.position.x = ballx;
        Ball.sprite.position.y = bally;
        if (canPlayWallSound) {
            Sounds.hitwall.play();
            canPlayWallSound = false;
        }
    }
}

function score() {
    if (admin) {
        if (Ball.sprite.position.x - 16 < 0) {
            Sounds.opponentpoint.play();
            Score2.value++;
            socket.emit('paddle2ScoredClient')
            resetBall();
        }
        if (Ball.sprite.position.x + 16 > screenWidth) {
            Sounds.opponentpoint.play();
            Score1.value++;
            socket.emit('paddle1ScoredClient')
            resetBall();
        }
    } else {
        if (scored1) {
            Score1.value++;
            scored1 = false;
        } 

        if (scored2) {
            Score2.value++
            scored2 = false;
        }
       
        if (canPlayScoreSound) {
            Sounds.opponentpoint.play();
            canPlayScoreSound = false;
        }
    }
}

function movePaddles() {
    if (admin) {
        moveUp(Paddle1, Controls.up1);
        moveDown(Paddle1, Controls.down1);
    } else {
        moveUp(Paddle2, Controls.up2);
        moveDown(Paddle2, Controls.down2);  
    }
}

function moveUpServer(paddle) {
    if (paddle.sprite.position.y - 32 > 0) {
        paddle.sprite.setVelocity(0, -4);
    } else {
        paddle.sprite.setVelocity(0, 0);
    }
}

function moveDownServer(paddle) {
    if (paddle.sprite.position.y + 32 < screenHeight) {
        paddle.sprite.setVelocity(0, 4);
    } else {
        paddle.sprite.setVelocity(0, 0);
    } 
}

function stopPaddleServer(paddle) {
    paddle.sprite.setVelocity(0, 0);
}

function moveUp(paddle, control) {
    if (keyDown(control)) {
        if (paddle == Paddle1) {
            socket.emit('paddle1MovedUpClient');
        }
        if (paddle == Paddle2) {
            socket.emit('paddle2MovedUpClient');
        }
        if (paddle.sprite.position.y - 32 > 0) {
            paddle.sprite.setVelocity(0, -4);
        } else {
            paddle.sprite.setVelocity(0, 0);
        } 
    }
    if (keyWentUp(control)) {
        if (paddle == Paddle1) {
            socket.emit('paddle1StoppedClient');
        }
        if (paddle == Paddle2) {
            socket.emit('paddle2StoppedClient');
        }
        paddle.sprite.setVelocity(0, 0);
    }
}

function moveDown(paddle, control) {
    if (keyDown(control)) {
        if (paddle == Paddle1) {
            socket.emit('paddle1MovedDownClient');
        }
        if (paddle == Paddle2) {
            socket.emit('paddle2MovedDownClient');
        }
        if (paddle.sprite.position.y + 32 < screenHeight) {
            paddle.sprite.setVelocity(0, 4);
        } else {
            paddle.sprite.setVelocity(0, 0);
        }
    }
    if (keyWentUp(control)) {
        if (paddle == Paddle1) {
            socket.emit('paddle1StoppedClient');
        }
        if (paddle == Paddle2) {
            socket.emit('paddle2StoppedClient');
        }
        paddle.sprite.setVelocity(0, 0);
    }
}

function touchBall() {
    Ball.sprite.overlap(Paddle1.sprite, function() {
        Sounds.hitpaddle.play();
        if (Ball.xspeed < 0) {
            Ball.xspeed = -Ball.xspeed;
        }
        Ball.sprite.setVelocity(Ball.xspeed, Ball.yspeed);   
    });
    Ball.sprite.overlap(Paddle2.sprite, function() {
        Sounds.hitpaddle.play();
        if (Ball.xspeed > 0) {
            Ball.xspeed = -Ball.xspeed;
        }
        Ball.sprite.setVelocity(Ball.xspeed, Ball.yspeed);
    });
}



