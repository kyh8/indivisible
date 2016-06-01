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

var BLOCK_SPEEDS = {
  1:5,
  2:4,
  3:3
}

var INIT_SPAWN_PROB = {
  2:0,
  3:0
}

var COLLISION_REFRESH = 5;

var BLOCK_DROP_SPEED = 1;
var BLOCK_DROP_REFRESH = 5;
var MOVE_SPEED = 1;
var MOVE_REFRESH = 6;
var LINE_DROP_RATE = 6;

var MIN_GEN_RATE = 1;
var MAX_GEN_RATE = 3;

var LEVEL_GEN_NUM = 10; //blocks per level
var GAME_BOARD_SIZE = 500;
var PLAYER_SIZE = 30;
var BLOCK_SIZE = 30;

var MAX_RATE_2 = 0.4;
var MAX_RATE_3 = 0.2;
var LEVEL_UP_2 = 0.04;
var LEVEL_UP_3 = 0.02;

var MIN_GEN_FLOOR = 0.5;
var MAX_GEN_FLOOR = 1;
var MIN_LEVEL_UP_DIFF = 0.05;
var MAX_LEVEL_UP_DIFF = 0.2;

var startPressed = false;

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

    var value = 1;
    var is2 = Math.random();
    var is3 = Math.random();
    var probs = gameRactive.get('spawnProb');

    console.log('is2:',is2,'vs',probs[2]);
    console.log('is3',is3,'vs',probs[3]);
    if(is3 < probs[3]){
      value = 3;
    }
    else if(is2 < probs[2]){
      value = 2;
    }

    console.log('spawned:',value);

    blocks.push({
      'id': blockIndex,
      'value': value
    });
    // console.log(blocks);
    // console.log('index: ' + blockIndex);
    gameRactive.set('blocknum', blockIndex+1);
    var blockElement = document.getElementById("block-"+blockIndex);
    var offset = Math.floor(Math.random() * (GAME_BOARD_SIZE - BLOCK_SIZE));
    blockElement.style.left = offset + "px";
    dropBlock(blockIndex, value);

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
          gameRactive.set('score', gameRactive.get('score') + gameBlocks[i].value);
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

    if(position >= GAME_BOARD_SIZE){
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
          if(max > MAX_GEN_FLOOR){
            console.log('new max: ', max-MAX_LEVEL_UP_DIFF);
            gameRactive.set('maxSpawnRate', max-MAX_LEVEL_UP_DIFF);
          }
          var min = gameRactive.get('minSpawnRate');
          if(min > MIN_GEN_FLOOR) {
            console.log('new min: ', min-MIN_LEVEL_UP_DIFF);
            gameRactive.set('minSpawnRate', min-MIN_LEVEL_UP_DIFF);
          }
          var toSpawn = gameRactive.get('blocksToSpawn') + gameRactive.get('divisor') - 2;
          gameRactive.set('blocksToSpawn', toSpawn);

          console.log('new blocks to spawn:', toSpawn);
          var probs = gameRactive.get('spawnProb');
          if(probs[2] < MAX_RATE_2){
            probs[2] += LEVEL_UP_2;
          }
          if(probs[3] < MAX_RATE_3){
            probs[3] += LEVEL_UP_3;
          }

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

function dropBlock(index, value){
  if(!gameRactive.get('paused')){
    var block = document.getElementById("block-" + index);
    // console.log(index);
    if(block){
      var position = block.style.top;
      position = parseInt(position.substring(0,position.length-2));
      // console.log(position);
      if(position >= GAME_BOARD_SIZE){
        var blocks = gameRactive.get('blocks');
        var blockIndex = -1;
        for(var i = 0; i < blocks.length; i++){
          if(blocks[i].id == index){
            blockIndex = i;
            break;
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

  var dropRate = BLOCK_SPEEDS[value];

  setTimeout(function(){
    dropBlock(index, value);
  }, dropRate);
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

    if(position < (GAME_BOARD_SIZE - PLAYER_SIZE)/2 && DIRECTION[keyPressed] == 1 ||
        position > -1*((GAME_BOARD_SIZE - PLAYER_SIZE)/2) && DIRECTION[keyPressed] == -1){
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
  gameRactive.set('spawnProb', {2:0,3:0});

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
      maxSpawnRate: MAX_GEN_RATE,
      spawnProb: {2:0, 3:0},
      colors:COLORS
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

  $('#play-button').mousedown(function(){
    startPressed = true;
    var button = document.getElementById('play-button');
    button.style.color = 'black';
    button.style.backgroundColor = 'white';
  });

  $(document).mouseup(function(){
    console.log('wat');
    if(startPressed){
      var button = document.getElementById('play-button');
      button.style.color = 'white';
      button.style.backgroundColor = 'black';
    }
  });

  $('#play-button').click(function(){
    console.log('what');
    $('#screen').fadeOut(1000, function(){
      gameRactive.set('justOpened', false);
      startGame();
    });
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

  $('#resume').hover(function(){
    var resume = document.getElementById('resume');
    resume.style.fontSize='18px';
    resume.style.marginTop='18px';
  },
  function(){
    var resume = document.getElementById('resume');
    resume.style.fontSize='16px';
    resume.style.marginTop='20px';
  });

  $(window).focusout(function(event){
    if(!gameRactive.get('paused') && !gameRactive.get('justOpened')){
      pauseGame();
    }
  });

  gameRactive.on('resume', function(){
    pauseGame();
  });

  gameRactive.observe('keydown', function(newValue, oldValue){
    // console.log(newValue);
    var moving = DIRECTION.hasOwnProperty(newValue);
    gameRactive.set('moving', moving);
  });

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
