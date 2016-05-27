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
var MIN_GEN_RATE = 1;
var MAX_GEN_RATE = 3;
var LEVEL_GEN_NUM = 10; //blocks per level
var GAME_BOARD_HEIGHT = 500;

var gameRactive;

function runGame(){
  var spawnTimes = calcSpawns();
  runLevel(spawnTimes, 0);
}

function runLevel(spawns, i){
  if(gameRactive.get('lost')){
    return;
  }
  if(i == spawns.length){
    console.log('NEW LEVEL!');
    dropLine();
    var spawnTimes = calcSpawns();
    runLevel(spawnTimes, 0);
    return;
  }
  setTimeout(function(){
    // console.log("SPAWN INDEX: " + i);
    var blocks = gameRactive.get('blocks');
    var blockIndex = gameRactive.get('blocknum');
    blocks.push({
      'id': blockIndex,
      'value': 1
    });
    // console.log(blocks);
    // console.log('index: ' + blockIndex);
    gameRactive.set('blocknum', blockIndex+1);
    var blockElement = document.getElementById("block-"+blockIndex);
    var offset = Math.floor(Math.random() * 460);
    blockElement.style.left = offset + "px";

    dropBlock(blockIndex);
    runLevel(spawns, i+1);
  }, spawns[i]);
}

function calcSpawns(){
  var spawns = [];
  for(var i = 0; i < LEVEL_GEN_NUM; i++){
    var n = Math.random()*MAX_GEN_RATE;
    if(n < MIN_GEN_RATE){
      n += MIN_GEN_RATE;
    }
    spawns.push(n*1000);
  }
  return spawns;
}

function checkCollisions(){
  if(gameRactive.get('lost')){
    return;
  }

  var blocks = gameRactive.get('blocks');
  var gameBlocks = [];
  for(var i = 0; i < blocks.length; i++){
    gameBlocks.push(blocks[i]);
  }
  for(var i = 0; i < gameBlocks.length; i++){
    var block = document.getElementById("block-" + gameBlocks[i].id);
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
      if((pl < br && pl > bl || pr < br && pr > bl) &&
          (pt > bt && pt < bb || pb > bt && pb < bb)){
        // console.log("COLLIDE");
        // $('#block-1').fadeOut(100);
        gameRactive.set('score', gameRactive.get('score') + 1);
        blocks.splice(i, 1);

        $('#player-block').animate({width:"30px", height:"30px"},50,"linear",function(){
          $('#player-block').animate({width:"25px", height:"25px"},50);
        });
      }
    }
  }

  setTimeout(function(){
    checkCollisions();
  }, COLLISION_REFRESH);
}

function dropLine(){
  // console.log('line dropping');
  var levelLine = document.getElementById("level");
  var position = levelLine.style.top;
  position = parseInt(position.substring(0,position.length-2));
  console.log('position of level line: ' + position);

  var level = levelLine.getBoundingClientRect();
  var bottom = level.bottom;

  var player = document.getElementById("player-block");
  var playerBlock = player.getBoundingClientRect();
  var playerTop = playerBlock.top;
  var playerBottom = playerBlock.bottom;

  if(position >= GAME_BOARD_HEIGHT){
    levelLine.style.top = '-12px';
    gameRactive.set('levelPassed', false);
    levelLine.style.backgroundColor = 'red';
    return;
  }
  else{
    levelLine.style.top = position + 1 + "px";
    if(bottom >= playerTop && bottom <= playerBottom && !gameRactive.get('levelPassed')){
      if(gameRactive.get('score') % gameRactive.get('divisor') == 0){
        gameRactive.set('levelPassed', true);
        gameRactive.set('divisor', gameRactive.get('divisor') + 1);
        console.log('new divisor: ' + gameRactive.get('divisor'));
        levelLine.style.backgroundColor = 'green';
      }
      else{
        gameRactive.set('lost', true);
      }
    }
  }

  setTimeout(function(){
    dropLine();
  }, 7);
}

function dropBlock(index){
  var block = document.getElementById("block-" + index);
  // console.log(index);
  if(block){
    var position = block.style.top;
    position = parseInt(position.substring(0,position.length-2));
    // console.log(position);
    if(position >= GAME_BOARD_HEIGHT){
      var blocks = gameRactive.get('blocks');
      var blockIndex = -1;
      for(var i = 0; i < blocks.length; i++){
        if(blocks[i].id == index){
          blockIndex = i;
        }
      }
      blocks.splice(blockIndex, 1);
      return;
    }
    else{
      block.style.top = position + BLOCK_DROP_SPEED + "px";
    }
  }

  setTimeout(function(){
    dropBlock(index);
  }, BLOCK_DROP_REFRESH);
}

function handleMotion(){
  if(gameRactive.get('lost')){
    return;
  }
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
      divisor: 2,
      blocks: [],
      blocknum: 0,
      lost: false,
      levelPassed: false
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

  $("#retry").hover(function(){
      document.getElementById('retry-image').width = '90';
      document.getElementById('retry-image').height = '90';
      document.getElementById('retry-image').style.marginTop = '0px';
    },
    function(){
      document.getElementById('retry-image').width = '70';
      document.getElementById('retry-image').height = '70';
      document.getElementById('retry-image').style.marginTop = '10px';
    });

  gameRactive.observe('keydown', function(newValue, oldValue){
    // console.log(newValue);
    var moving = DIRECTION.hasOwnProperty(newValue);
    gameRactive.set('moving', moving);
  });

  gameRactive.observe('lost', function(newValue, oldValue){
    if(newValue){
      console.log('YOU LOST');
    }
  });

  gameRactive.observe('levelPassed', function(newValue, oldValue){
    if(newValue){
      console.log('YOU PASSED THE LEVEL');
    }
  });

  handleMotion();
  checkCollisions();
  runGame();
});
