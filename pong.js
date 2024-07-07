
// Why do we need mypaddle initialized here?
let myPaddle;
let playerScore = 0;
let pcScore = 0;
let balls = [];
console.log("Global:", balls);

document.addEventListener("DOMContentLoaded", (event) => {
    startGame();
});

// Gamebox grabs the html doc area to draw in and sets our game loop in the start function under interval. I think.
let gameBox = {
    canvas: document.getElementById('pong'),
    height: 800,
    width: 800,
    frame: 0,
    start: function(){
        this.context = this.canvas.getContext('2d');
        this.interval = setInterval(updateGame, 20);
    },
    clear: function(){
        this.context.clearRect(0,0, this.width, this.height)
    }
    
};

// Start game gets the gamebox and calls start. 
// It then makes the player and pc paddles, draws the score, and places a ball.
// TODO: We need to clean up the creations by pulling out their arguments to named variables as this is super confusing.
// TODO: We also need to make it so that the game resets when a score is had, and that the ball spawns in a random location.
// TODO: Need to add a Start Screen.
// TODO: Need to implement lives to end the game state.
function startGame(){
    balls = [];
    console.log("Start:", balls);
    gameBox.start();
    paddleWidth = gameBox.height/8;
    paddleHeight = 10;
    paddleColor = 'rgba(218, 218, 216,1)';
    paddleBeginPosX = ((gameBox.width / 2) - ((gameBox.height/8)/2));
    paddleBeginPosYPlayer = gameBox.height - 40;
    paddleBeginPosYNPC = 40;
    myPaddle = new gameRect(paddleWidth, paddleHeight, paddleColor, paddleBeginPosX, paddleBeginPosYPlayer);
    pcPaddle = new gameRect(paddleWidth, paddleHeight, paddleColor, paddleBeginPosX, paddleBeginPosYNPC);
    displayScore = new gameText("", "white", 100,100);
    spawnBall();
};

// Spawn Ball Function. This will return a ball at a random location. This should allow us to make mutiple balls
function spawnBall(){
    // need an x, y, radius, start, end, and color to make a ball
    //(x, y, radius, start, end, color){
    // We need to make a ball spawn zone that is outside of the paddle area
    gameZoneXMin = 300;
    gameZoneXMax = gameBox.width - 100;
    gameZoneYMin = 100;
    gameZoneYMax = gameBox.height - 300;
    
    x = Math.random() * (gameZoneXMax - gameZoneXMin) + gameZoneXMin;
    y = Math.random() * (gameZoneYMax - gameZoneYMin) + gameZoneYMin;
    
    radius = 5.5;
    circleStart = 0;
    circleEnd = 2 * Math.PI;
    circleColor = "litegrey";

    balls.push(new gameBall(x, y, radius, circleStart, circleEnd, circleColor));
};

// TODO: Figure out why the stuttering is happening
// TODO: Fix bug on ballspawn with pcAI.
function updateGame(){
    gameBox.clear();
    gameBox.frame += 1;
    balls = balls.filter(ball => ball.update());
    displayScore.update();
    myPaddle.update();
    pcAI(pcPaddle,balls)
};

// TODO: Add power menu
// TODO: Figure out why the ball will pass thru the paddle sometimes
function moveMe(event){
    // mousePos.labelX = event.clientX;
    // mousePos.labelY = event.clientY;
    relX = event.clientX - gameBox.canvas.offsetLeft;

    if(relX > 0 && relX < gameBox.canvas.width){
        myPaddle.x = relX - myPaddle.width /2
    }
    myPaddle.update();
};

// This is very primative
// TODO: Make this intelligent. Need to add an actual variance so that there is a change that the player can score.
// TODO: Need to handle multiple game balls and add support for the AI to use Powers.
// TODO: Make the pcPaddle not just jump when a new ball is spawned in.
function pcAI(pcPaddle, ball){
    if (ball.length == 0) {
        spawnBall();
        return;
    };
    if (gameBox.frame % 55 == 0){
        pcPaddle.update();
        return;
    };
    ball = ball[0];
    let offset = ball.x - ((pcPaddle.width/3) - Math.floor(Math.random() * 10))
    pcPaddle.x = offset + Math.floor(Math.random() * 10);
    pcPaddle.update();
};

// This is kinda ok.
// TODO: Carry the score after ball respawns.
// TODO: Change location.
function score(side){
    spawnBall();
    if (side == 'pc'){
        displayScore.playerScore +=1;
    } else {
        displayScore.pcScore +=1;
    }
    displayScore.update();
    //console.log("from score, no ball?")
};





// These are for the paddles, but could be named better
// The compiler seems to think these should be classes instead of whatever I've got going on right now.
function gameRect (width, height, color, x, y){
    this.width = width;
    this.height = height;
    this.color = color;
    this.x = x;
    this.y = y;
    this.update= function(){
        ctx = gameBox.context;
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.closePath();
    }
};
// This is to display the score. I guess thats fine for now
// TODO: Change the location atleast. 
function gameText (text, color, x, y){
    this.text = text;
    this.color = color;
    this.x = x;
    this.y = y;
    this.playerScore = 0;
    this.pcScore = 0;
    this.update= function(){
        this.text = `Player: ${this.playerScore}, PC: ${this.pcScore}`;
        ctx = gameBox.context;
        ctx.font = '20px Segoe UI'
        ctx.fillStyle = color;
        ctx.fillText(this.text, this.x, this.y,);
        ctx.closePath();
    }
};

// This is a mess. The way we are solving the movement of the ball really needs to be reworked. 
// TODO: To enable powers we will need a list of balls to begin with, and these balls will need to know how to move without this static
//        enabled way we are currently doing it.
// TODO: Add a gravity component that that balls will be attracted to. 
// TODO: Fix the collision system to something that approches sanity. 

function gameBall (x, y, radius, start, end, color){
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.start = start;
    this.end = end;
    this.color = color;
    this.ballOwner;
    this.origin;
    this.dx = 6; // X Velocity
    this.dy = 6; // Y Velocity
    this.update= function(){
        ctx = gameBox.context;
        ctx.fillStyle = color;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, this.start, this.end);
        ctx.stroke();
        ctx.closePath();
        if ((this.x + this.radius <= 5) || (this.x + this.radius >= gameBox.canvas.width - 5)){
            this.dx = this.dx * -1;
        }; 
        if (this.y + this.radius <= 5){
            score('pc');
            this.dy = this.dy * -1;
            return false;
        }; 
        if (this.y + this.radius >= gameBox.canvas.height -5){
            score('player');
            this.dy = this.dy * -1;
            return false;
        };
        if ((this.y + this.radius >= myPaddle.y - myPaddle.height) && (this.x + this.radius >= myPaddle.x && this.x + this.radius <= myPaddle.x + myPaddle.width)){
            console.log('hit my paddle');
            this.dy = this.dy + 1;
            this.dy = this.dy * -1;
        };
        if ((this.y - this.radius <= pcPaddle.y + pcPaddle.height) && (this.x - this.radius >= pcPaddle.x && this.x - this.radius <= pcPaddle.x + pcPaddle.width)){
            console.log('hit pcs paddle');
            this.dy = this.dy - 1;
            this.dy = this.dy * -1;
        };
        this.x = this.x + this.dx;
        this.y = this.y + this.dy;
        return true;
    }
};



// BUG LIST:
// Ball passes thru paddle - fix is radius check. Need to implement.
// Ball gets stuck on the goal zone - ideally should be 'fixed' with ball destruction on score
// Frame stuttering ball and paddle
// Ball sometimes goes into paddle, especially if hit on side of paddle
