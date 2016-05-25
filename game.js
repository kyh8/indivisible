var DIRECTION = {
  37: -1,
  39: 1,
  65: -1,
  68: 1
}

var keyRactive = new Ractive({
  // el: '#game-board',
  // template: '#game-board-template',
  data:{
    keydown: 'none',
    moving: false
  }
});

function runGame(){
  var block = document.getElementById("block-1");
  if(block){
    var position = block.style.top;
    position = parseInt(position.substring(0,position.length-2));
    // console.log(position);
    if(position >= 600){
      block.parentNode.removeChild(block);
    }
    else{
      block.style.top = position + 1 + "px";
    }
  }

  setTimeout(function(){
    runGame();
  }, 7);
}

function handleMotion(){
  var player = document.getElementById("player-block");
  var position = player.style.left;
  position = parseInt(position.substring(0,position.length-2));
  // console.log(position);
  var moving = keyRactive.get('moving');
  var keyPressed = keyRactive.get('keydown');
  if(!moving){
    return;
  }

  if(position < 237 && DIRECTION[keyPressed] == 1 ||
      position > -237 && DIRECTION[keyPressed] == -1){
    player.style.left = position + 1*(DIRECTION[keyPressed]) + "px";

    setTimeout(function(){
      handleMotion();
    }, 3);
  }
}

$(document).ready(function(){
  $(document).keydown(function(event){
    // console.log("down: " + event.keyCode);
    var keyCode = event.keyCode;
    console.log(keyCode);
    if(DIRECTION.hasOwnProperty(keyCode)){
      keyRactive.set('keydown', keyCode);
    }
    // console.log('ractive:' + keyRactive.get('keydown'));
  });

  $(document).keyup(function(event){
    // console.log("up: " + event.keyCode);
    var keyCode = event.keyCode;
    var keyDown = keyRactive.get('keydown');
    if(keyCode == keyDown){
      keyRactive.set('keydown', 'none');
    }
    // console.log('ractive:' + keyRactive.get('keydown'));
  });

  keyRactive.observe('keydown', function(newValue, oldValue){
    // console.log(newValue);
    var moving = DIRECTION.hasOwnProperty(newValue);
    keyRactive.set('moving', moving);
  });

  keyRactive.observe('moving', function(newValue, oldValue){
    handleMotion();
  });

  runGame();
});
