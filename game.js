var DIRECTION = {
  37: -1, // left arrow
  39: 1, // right arrow
  65: -1, // 'A'
  68: 1 // 'D'
}

var COLLISION_REFRESH = 5;
var BLOCK_DROP_REFRESH = 5;
var BLOCK_DROP_SPEED = 1;
var MOVE_SPEED = 1;
var MOVE_REFRESH = 3;
var MIN_GEN_RATE = 1.5;
var LEVEL_TIME = 20;

var gameRactive;

function runGame(){
  var spawnTimes = calcSpawns();
}

function calcSpawns(){
  var nums = [];
  for(var i = 0; i < 19; i++){
    var n = Math.random()*20;
    if(n < MIN_GEN_RATE){
      n += MIN_GEN_RATE;
    }
    nums.push(n);
  }

  nums.sort(function(a,b){
    return a-b;
  });
  console.log(nums);
  var spawns = [];
  for(var i = 0; i < nums.length; i++){
    if(i == 0){
      spawns.push(nums[0] - 0);
    }
    else{
      spawns.push(nums[i] - nums[i-1]);
    }
  }
  spawns.push(LEVEL_TIME - nums[nums.length-1]);
  console.log(spawns.length);
  console.log(spawns);
  var sum = 0;
  for(var i = 0; i < spawns.length; i++){
    sum += spawns[i];
  }
  console.log(sum);
  return spawns;
}

function checkCollisions(){
  var block = document.getElementById("block-1");
  if(block){
    var player = document.getElementById("player-block");
    var blockRect = block.getBoundingClientRect();
    var bl = blockRect.left;
    var br = blockRect.right;
    var bt = blockRect.top;
    var bb = blockRect.bottom;

    var playerRect = player.getBoundingClientRect();
    var pl = playerRect.left;
    var pr = playerRect.right;
    var pt = playerRect.top;
    var pb = playerRect.bottom;

    // console.log(blockRect);
    // console.log(playerRect);
    // console.log('checking');
    if((bl < pr && bl > pl || br < pr && br > pl) &&
        (bt > pt && bt < pb || bb > pt && bb < pb)){
      // console.log("COLLIDE");
      // $('#block-1').fadeOut(100);
      gameRactive.set('score', gameRactive.get('score') + 1);
      block.parentNode.removeChild(block);
      $('#player-block').animate({width:"30px", height:"30px"},50,"linear",function(){
        $('#player-block').animate({width:"25px", height:"25px"},50);
      });
    }
  }
  setTimeout(function(){
    checkCollisions();
  }, COLLISION_REFRESH);
}

function dropBlocks(){
  var block = document.getElementById("block-1");
  if(block){
    var position = block.style.top;
    position = parseInt(position.substring(0,position.length-2));
    // console.log(position);
    if(position >= 600){
      block.parentNode.removeChild(block);
    }
    else{
      block.style.top = position + BLOCK_DROP_SPEED + "px";
    }
  }

  setTimeout(function(){
    dropBlocks();
  }, BLOCK_DROP_REFRESH);
}

function handleMotion(){
  var player = document.getElementById("player-block");
  var position = player.style.left;
  position = parseInt(position.substring(0,position.length-2));
  // console.log(position);
  var moving = gameRactive.get('moving');
  var keyPressed = gameRactive.get('keydown');

  if(position < 237 && DIRECTION[keyPressed] == 1 ||
      position > -237 && DIRECTION[keyPressed] == -1){
    player.style.left = position + MOVE_SPEED*(DIRECTION[keyPressed]) + "px";
  }
  setTimeout(function(){
    handleMotion();
  }, MOVE_REFRESH);
}

$(document).ready(function(){
  gameRactive = new Ractive({
    el: '#game-area',
    template: '#template',
    data:{
      keydown: 'none',
      moving: false,
      score: 0,
      divisor: 2
    }
  });

  $(document).keydown(function(event){
    // console.log("down: " + event.keyCode);
    var keyCode = event.keyCode;
    if(DIRECTION.hasOwnProperty(keyCode)){
      gameRactive.set('keydown', keyCode);
    }
    // console.log('ractive:' + gameRactive.get('keydown'));
  });

  $(document).keyup(function(event){
    // console.log("up: " + event.keyCode);
    var keyCode = event.keyCode;
    var keyDown = gameRactive.get('keydown');
    if(keyCode == keyDown){
      gameRactive.set('keydown', 'none');
    }
    // console.log('ractive:' + gameRactive.get('keydown'));
  });

  gameRactive.observe('keydown', function(newValue, oldValue){
    // console.log(newValue);
    var moving = DIRECTION.hasOwnProperty(newValue);
    gameRactive.set('moving', moving);
  });

  handleMotion();
  dropBlocks();
  checkCollisions();
  runGame();
});
