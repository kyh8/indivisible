function runGame(){
  var block = document.getElementById("block-1");
  var position = block.style.top;
  position = parseInt(position.substring(0,position.length-2));
  console.log(position);
  if(position >= 600){
    block.parentNode.removeChild(block);
  }
  else{
    block.style.top = position + 1 + "px";
  }

  setTimeout(function(){
    runGame();
  }, 10);
}

$(document).ready(function(){
  runGame();
});
