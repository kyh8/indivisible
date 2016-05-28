var DIRECTION = {
  37: -1, // left arrow
  39: 1, // right arrow
  65: -1, // 'A'
  68: 1 // 'D'
}

//http://www.december.com/html/spec/color1.html
var COLORS = {
  1:'gray',
  2:'#EE7942', //sienna2
  3:'#CD2626' //firebrick3
}

var COLLISION_REFRESH = 5;

var BLOCK_DROP_SPEED = 1;
var BLOCK_DROP_REFRESH = 5;
var MOVE_SPEED = 1;
var MOVE_REFRESH = 3;
var LINE_DROP_RATE = 6;

var MIN_GEN_RATE = 1;
var MAX_GEN_RATE = 3;

var LEVEL_GEN_NUM = 10; //blocks per level
var GAME_BOARD_HEIGHT = 500;
var PLAYER_SIZE = 25;

var gameRactive;
var levelTimer;

function startGame(){
  handleMotion();
  checkCollisions();
  runLevel();
}

function runLevel(){
  if(gameRactive.get('lost')){
    return;
  }

  var timeout = 5;
  if(!gameRactive.get('paused')){
    timeout = Math.random()*gameRactive.get('maxSpawnRate');
    if(timeout < gameRactive.get('minSpawnRate')){
      timeout = gameRactive.get('minSpawnRate');
    }

    timeout = timeout * 1000;
    console.log('timeout: ' + timeout);

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

    var index = gameRactive.get('levelBlockIndex');
    console.log('index:' + (index+1));
    console.log('blocks to spawn:', gameRactive.get('blocksToSpawn'));
    if(index == gameRactive.get('blocksToSpawn')-1){
      console.log('NEW LEVEL!');
      dropLine();
      gameRactive.set('levelBlockIndex', 0);
    }
    else{
      gameRactive.set('levelBlockIndex', gameRactive.get('levelBlockIndex') + 1);
    }
  }

  levelTimer = setTimeout(function(){
    runLevel();
  }, timeout);
}

function checkCollisions(){
  if(gameRactive.get('lost')){
    return;
  }

  if(!gameRactive.get('paused')){
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

          $('#player-block').animate({width:(PLAYER_SIZE + 5) + "px", height:(PLAYER_SIZE + 5) + "px"},50,"linear",function(){
            $('#player-block').animate({width:PLAYER_SIZE + "px", height:PLAYER_SIZE + "px"},50);
          });
        }
      }
    }
  }

  setTimeout(function(){
    checkCollisions();
  }, COLLISION_REFRESH);
}

function dropLine(){
  if(!gameRactive.get('paused')){
    var levelLine = document.getElementById("level");
    var position = levelLine.style.top;
    position = parseInt(position.substring(0,position.length-2));

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

          // LEVEL UP
          var max = gameRactive.get('maxSpawnRate');
          if(max > 1){
            console.log('new max: ', max-0.2);
            gameRactive.set('maxSpawnRate', max-0.2);
          }
          var min = gameRactive.get('minSpawnRate');
          if(min > 0.5) {
            console.log('new min: ', min-0.05);
            gameRactive.set('minSpawnRate', min-0.05);
          }
          var toSpawn = gameRactive.get('blocksToSpawn') + gameRactive.get('divisor') - 2;
          gameRactive.set('blocksToSpawn', toSpawn);
          console.log('new blocks to spawn:', toSpawn);

          levelLine.style.backgroundColor = 'green';
        }
        else{
          gameRactive.set('lost', true);
        }
      }
    }
  }
  setTimeout(function(){
    dropLine();
  }, LINE_DROP_RATE);
}

function dropBlock(index){
  if(!gameRactive.get('paused')){
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
  }

  setTimeout(function(){
    dropBlock(index);
  }, BLOCK_DROP_REFRESH);
}

function handleMotion(){
  if(gameRactive.get('lost')){
    return;
  }
  if(!gameRactive.get('paused')){
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
  }
  setTimeout(function(){
    handleMotion();
  }, MOVE_REFRESH);
}

function resetGame(){
  gameRactive.set('keydown', 'none');
  gameRactive.set('moving', false);
  gameRactive.set('score', 0);
  gameRactive.set('divisor', 2);
  gameRactive.set('blocks', []);
  gameRactive.set('lost', false);
  gameRactive.set('levelPassed', false);
  gameRactive.set('paused', false);
  gameRactive.set('levelBlockIndex', 0);
  gameRactive.set('blocksToSpawn', LEVEL_GEN_NUM);
  gameRactive.set('minSpawnRate', MIN_GEN_RATE);
  gameRactive.set('maxSpawnRate', MAX_GEN_RATE);

  document.getElementById('player-block').style.left = '0';
  document.getElementById('level').style.top = '-12px';
  startGame();
}

function pauseGame(){
  if(!gameRactive.get('lost')){
    gameRactive.set('paused', !gameRactive.get('paused'));
  }
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
      levelPassed: false,
      paused: false,
      levelBlockIndex: 0,
      justOpened: true,
      blocksToSpawn: LEVEL_GEN_NUM,
      minSpawnRate: MIN_GEN_RATE,
      maxSpawnRate: MAX_GEN_RATE
    }
  });

  $(document).keypress(function(event){
    if(event.keyCode == 112 && !gameRactive.get('justOpened')){
      console.log('pause/unpause');
      pauseGame();
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
      var image = document.getElementById('retry-image');
      image.width = '90';
      image.height = '90';
      image.style.marginTop = '0px';
    },
    function(){
      var image = document.getElementById('retry-image');
      image.width = '70';
      image.height = '70';
      image.style.marginTop = '10px';
    });

  $('#retry').click(function(){
    resetGame();
  });

  $('#play-button').click(function(){
    gameRactive.set('justOpened', false);
    startGame();
  });

  $('#play-button').hover(function(){
    var button = document.getElementById('play-button');
    // button.style.color = 'black';
    // button.style.backgroundColor = 'white';
    button.style.borderColor='white';
  },
  function(){
    var button = document.getElementById('play-button');
    // button.style.color = 'white';
    // button.style.backgroundColor = 'black';
    button.style.borderColor='black';
  });

  $(window).focusout(function(event){
    if(!gameRactive.get('paused') && !gameRactive.get('justOpened')){
      pauseGame();
    }
  });

  gameRactive.observe('keydown', function(newValue, oldValue){
    // console.log(newValue);
    var moving = DIRECTION.hasOwnProperty(newValue);
    gameRactive.set('moving', moving);
  });

  //
  // gameRactive.observe('lost', function(newValue, oldValue){
  //   if(newValue){
  //     console.log('YOU LOST');
  //   }
  // });
  //
  // gameRactive.observe('levelPassed', function(newValue, oldValue){
  //   if(newValue){
  //     console.log('YOU PASSED THE LEVEL');
  //   }
  // });

  gameRactive.observe('paused', function(newValue, oldValue){
    if(newValue == true && oldValue == false){ // just paused
      clearTimeout(levelTimer);
    }
    else if(newValue == false && oldValue == true){ // just unpaused
      timeout = Math.random()*gameRactive.get('maxSpawnRate');
      if(timeout < gameRactive.get('minSpawnRate')){
        timeout = gameRactive.get('minSpawnRate');
      }

      timeout = timeout * 1000;
      console.log('timeout: ' + timeout);

      levelTimer = setTimeout(function(){
        runLevel();
      }, timeout);
    }
  });

  // startGame();
});
