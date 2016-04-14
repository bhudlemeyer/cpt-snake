$(document).ready(function() {
  var canvas = $("#snakeCanvas")
  var ctx = canvas[0].getContext("2d")
  var container = $(canvas).parent();
  var cw = 20;
  var d;
  var food;
  var score;
  var snake_array; //an array of cells to make up the snake
  drawCanvas();

  //-----------------HELPER FUNCTIONS GO HERE------------
  function drawCanvas() {
    var width = $(container).width();
    var height = $(container).height();
    if(width > 1000) {
      cw = 35
    }
    canvas.attr('width', width); //max width
    canvas.attr('height', height); //max height

    //Everytime this window is resized, redraw snake game
    init(width, height);
  }

  function init(w, h) {
    d = "right"; //default direction
    createSnake();
    createFood(w, h); //Now we can see the food particle
    //finally lets display the score
    paintBackgroundImage("assets/image/background.jpg", w, h)

    score = 0;

    //Lets move the snake now using a timer which will trigger the paint function
    //every 60ms
    if(typeof game_loop != "undefined") clearInterval(game_loop);
    game_loop = setInterval( function() {
      paint(w, h);
    }, 150);
  }

  function createSnake() {
    var length = 5; //Length of the snake
    snake_array = []; //Empty array to start with
    for(var i = length-1; i>=0; i--) {
      //This will create a horizontal snake starting from the top left
      snake_array.push({x: i, y:0});
    }
  }

  //Lets create the food now
  function createFood(w, h) {
    food = {
      x: Math.round(Math.random()*(w-cw)/cw),
      y: Math.round(Math.random()*(h-cw)/cw),
    };
  }

  //Lets paint the snake now
  function paint(w, h) {
    //To avoid the snake trail we need to paint the BG on every frame
    //Lets paint the canvas now
    paintBackgroundImage("assets/image/background.jpg", w, h)

    //The movement code for the snake to come here.
    //The logic is simple
    //Pop out the tail cell and place it infront of the head cell
    var nx = snake_array[0].x;
    var ny = snake_array[0].y;
    //These were the position of the head cell.
    //We will increment it to get the new head position
    //Lets add proper direction based movement now
    if(d == "right") nx++;
    else if(d == "left") nx--;
    else if(d == "up") ny--;
    else if(d == "down") ny++;

    //Lets add the game over clauses now
    //This will restart the game if the snake hits the wall
    //Lets add the code for body collision
    //Now if the head of the snake bumps into its body, the game will restart
    if(nx == -1 || nx >= Math.round(w/cw) || ny == -1 || ny >= Math.round(h/cw) || checkCollision(nx, ny, snake_array)) {
      //restart game
      init(w, h);
      //Lets organize the code a bit now.
      return;
    }

    //Lets write the code to make the snake eat the food
    //The logic is simple
    //If the new head position matches with that of the food,
    //Create a new head instead of moving the tail
    if(nx == food.x && ny == food.y) {
      var tail = {x: nx, y: ny};
      score += 100;
      //Create new food
      createFood(w, h);
    } else {
      var tail = snake_array.pop(); //pops out the last cell
      tail.x = nx; tail.y = ny;
    }
    //The snake can now eat the food.
    snake_array.unshift(tail); //puts back the tail as the first cell

    paintHead(snake_array[0].x, snake_array[0].y)
    for(var i = 1; i < snake_array.length-1; i++) {
      var c = snake_array[i];
      //Lets paint 10px wide cells
      paintBody(c.x, c.y);
    }

    paintTail(snake_array[snake_array.length-1].x, snake_array[snake_array.length-1].y)
    //Lets paint the food
    paintFood(food.x, food.y);
    //Lets paint the score
    var score_text = "Score: " + score;
    ctx.fillText(score_text, 5, h-5);
  }

  //Lets first create a generic function to paint cells
  function paintFood(x, y) {
    ctx.fillStyle = "blue";
    ctx.fillRect(x*cw, y*cw, cw, cw);
    ctx.strokeStyle = "white";
    ctx.strokeRect(x*cw, y*cw, cw, cw);
  }

  function paintHead(x, y) {
    var head = new Image();
    if (cw == 20) {
      head.src = "assets/image/snake-head-top-small.png";
    } else {
      head.src = "assets/image/snake-head-top.png";
    }
    paintRect(head, x, y)
  }

  function paintTail(x, y) {
    var tail = new Image();
    if (cw == 20) {
      tail.src = "assets/image/snake-tail-small.png";
    } else {
      tail.src = "assets/image/snake-tail.png";
    }
    paintRect(tail, x, y)
  }

  function paintBody(x, y) {
    var body = new Image();
    if (cw == 20) {
      body.src = "assets/image/snake-body-small.png";
    } else {
      body.src = "assets/image/snake-body.png";
    }
    paintRect(body, x, y)
  }

  function paintRect(img, x, y) {
    var pattern = ctx.createPattern(img, "repeat")
    ctx.fillStyle = pattern;
    ctx.fillRect(x*cw, y*cw, cw, cw)
  }

  function paintBackgroundImage(url, w, h) {
    var background = new Image();
    background.src = url;

    var image_width = background.naturalWidth;
    var image_height = background.naturalHeight;

    if (h/w > image_height/image_width) {
      new_width = image_width*h/image_height;
      ctx.drawImage(background, (w-new_width)/2, 0, new_width, h);
    } else {
      new_height = image_height*w/image_width;
      ctx.drawImage(background, 0, (h-new_height)/2, w, new_height);
    }
  }

  function checkCollision(x, y, array) {
    //This function will check if the provided x/y coordinates exist
    //in an array of cells or not
    for(var i = 0; i < array.length; i++) {
      if(array[i].x == x && array[i].y == y)
        return true;
    }
    return false;
  }

  //-----------------EVENT REGISTER GO HERE -------------
  $(window).resize(drawCanvas);

  $$('canvas').swipeLeft(function(){ if(d != "right") d = "left"; });
  $$('canvas').swipeDown(function(){ if(d != "up") d = "down"; });
  $$('canvas').swipeRight(function(){ if(d != "left") d = "right"; });
  $$('canvas').swipeUp(function(){ if(d != "down") d = "up"; });

  $$('canvas').bind('touchstart', function(e){ e.preventDefault(); });

  //Lets add the keyboard controls now
  $(document).keydown(function(e){
    var key = e.which;
    //We will add another clause to prevent reverse gear
    if(key == "37" && d != "right") d = "left";
    else if(key == "38" && d != "down") d = "up";
    else if(key == "39" && d != "left") d = "right";
    else if(key == "40" && d != "up") d = "down";
    //The snake is now keyboard controllable
  })
})
