
// Why do we need mypaddle initialized here?
let myPaddle;
let playerScore = 0;
let pcScore = 0;

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
    gameBox.start();
    myPaddle = new gameRect(gameBox.height/8, 10, 'rgba(218, 218, 216,1)', ((gameBox.width / 2) - ((gameBox.height/8)/2) ), gameBox.height-40 );
    pcPaddle = new gameRect(gameBox.height/8, 10, 'rgba(218, 218, 216,1)', ((gameBox.width / 2) - ((gameBox.height/8)/2) ), 40);
    displayScore = new gameText("", "white", 100,100);
    firstBall = new gameBall(200, 100, 5.5, 0, 2 * Math.PI, "litegrey");
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
        ctx.font = '30px Segoe UI'
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
    this.xDirection = "positive";
    this.yDirection = "positive";
    this.xSpeed = 10;
    this.ySpeed = 10;
    this.update= function(){
        ctx = gameBox.context;
        ctx.fillStyle = color;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, this.start, this.end);
        ctx.stroke();
        ctx.closePath();
        // console.log(this.x)
    },
    this.collision = function(){
        if ((this.x <= 0) || (this.x >= gameBox.canvas.width - 20)){
            changeDirection(this, 'x');
        } else if (this.y <= 0){
            changeDirection(this, 'y');
            score('pc');
        } else if (this.y >= gameBox.canvas.height){
            changeDirection(this, 'y');
            score('player');
        } else if ((this.y == myPaddle.y - myPaddle.height) && (this.x >= myPaddle.x) && (this.x <= myPaddle.x + myPaddle.width)){
            console.log('hit my paddle');
            changeDirection(this, 'y');
        } else if ((this.y == pcPaddle.y + pcPaddle.height) && (this.x >= pcPaddle.x) && (this.x <= pcPaddle.x + pcPaddle.width)){
            changeDirection(this, 'y');
            console.log('hit pcs paddle');
        }
    }
};
// See notes on Game Ball. 
function changeDirection(ball, direction){
    if (ball.xDirection == "positive" && direction == 'x'){

        ball.xDirection = "negative";
    }else if (ball.xDirection == "negative" && direction == 'x'){

        ball.xDirection = "positive";
    }else if (ball.yDirection == "positive" && direction == 'y'){

        ball.yDirection = "negative";
    }else if (ball.yDirection == "negative" && direction == 'y'){

        ball.yDirection = "positive";
    }
}

// TODO: Figure out why the stuttering is happening
function updateGame(){
    gameBox.clear();
    gameBox.frame += 1;
    makeBallTravel(firstBall);
    myPaddle.update();
    displayScore.update();
    pcAI(pcPaddle,firstBall)
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
// See notes on game ball
// TODO: Redo this whole thing. Garbage. 
function makeBallTravel(ball){
    if (ball.xDirection == "positive" && ball.yDirection == "positive"){
        ball.x = ball.x + ball.xSpeed;
        ball.y = ball.y + ball.ySpeed;
    }else if (ball.xDirection == "positive" && ball.yDirection == "negative"){
        ball.x = ball.x + ball.xSpeed;
        ball.y = ball.y - ball.ySpeed;
    }else if (ball.xDirection == "negative" && ball.yDirection == "positive"){
        ball.x = ball.x - ball.xSpeed;
        ball.y = ball.y + ball.ySpeed;
    }else if (ball.xDirection == "negative" && ball.yDirection == "negative"){
        ball.x = ball.x - ball.xSpeed;
        ball.y = ball.y - ball.ySpeed;
    } else{
        ball.y = ball.y + 10;
    }
    ball.update();
    ball.collision();
};
// This is very primative
// TODO: Make this intelligent. Need to add an actual variance so that there is a change that the player can score.
// TODO: Need to handle multiple game balls and add support for the AI to use Powers
function pcAI(pcPaddle, firstBall){
    // console.log(pcPaddle, firstBall);
    if (gameBox.frame % 2 == 0){
        pcPaddle.update();
        return;
    }
    let offset = firstBall.x - ((pcPaddle.width/3) - Math.floor(Math.random() * 10))
    pcPaddle.x = offset + Math.floor(Math.random() * 10);
    pcPaddle.update();
};

// This is kinda ok.
// TODO: Carry the score after ball respawns.
// TODO: Change location.
function score(side){
    if (side == 'pc'){
        displayScore.playerScore +=1;
    } else {
        displayScore.pcScore +=1;
    }
    displayScore.update();
};

