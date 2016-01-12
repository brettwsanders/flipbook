var canvas = document.getElementsByClassName('drawing-pad')[0];
var context = canvas.getContext("2d");

//information for current frame
var currentFrame = {
  clickX: [],
  clickY: [],
  clickDrag: []
};

//information for prior frame
var previousFrame = {
  clickX: [],
  clickY: [],
  clickDrag: []
};

var allFrames = [];

var paint;
var framesSaved = 0;
var currentFrameID = 1;
var playInterval;

var addClick = function (x, y, dragging) {
  currentFrame.clickX.push(x);
  currentFrame.clickY.push(y);
  currentFrame.clickDrag.push(dragging);
  // console.log('Current Frame is: ');
  // console.log(' clickX: ', currentFrame.clickX);
  // console.log(' clickY: ', currentFrame.clickY);
  // console.log(' clickDrag: ', currentFrame.clickDrag);
};

var redraw = function (frame, style) {
  // context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
  context.strokeStyle = style || '#000000';
  context.lineJoin = 'round';
  context.lineWidth = 7;
      
  for (var i=0; i < frame.clickX.length; i++) {  
    context.beginPath();
    if (frame.clickDrag[i] && i) {
      context.moveTo(frame.clickX[i-1], frame.clickY[i-1]);
     } else{
       context.moveTo(frame.clickX[i]-1, frame.clickY[i]);
     }
     context.lineTo(frame.clickX[i], frame.clickY[i]);
     context.closePath();
     context.stroke();
  }
};

var clearCurrentFrame = function() {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
  currentFrame.clickX = [];
  currentFrame.clickY = [];
  currentFrame.clickDrag = [];
};

var play = function() {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
  var image = new Image();
  image.onload = function() {
    context.drawImage(image, 0, 0);
  };
  image.src = localStorage.getItem('frame' + currentFrameID);
  currentFrameID++;
  if (currentFrameID > framesSaved) currentFrameID = 1;
};

var setPreviousFrame = function() {
  previousFrame.clickX = currentFrame.clickX.slice();
  previousFrame.clickY = currentFrame.clickY.slice();
  previousFrame.clickDrag = currentFrame.clickDrag.slice();
};

var saveToAllFrames = function() {
  allFrames.push({
    clickX: currentFrame.clickX.slice(),
    clickY: currentFrame.clickY.slice(),
    clickDrag: currentFrame.clickDrag.slice()
  });
};

var componentToHex = function(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
};

var rgbToHex = function(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
};

$('.drawing-pad').mousedown(function(e){

  var mouseX = e.pageX - this.offsetLeft;
  // var mouseY = e.pageY - this.offsetTop;
  var mouseY = e.pageY;
  paint = true;
  // addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
  addClick(e.pageX - this.offsetLeft - 9, e.pageY - this.offsetTop - 12);
  redraw(currentFrame);
});

$('.drawing-pad').mousemove(function(e){
  if(paint){
    addClick(e.pageX - this.offsetLeft - 9, e.pageY - this.offsetTop - 12, true);
    redraw(currentFrame);
  }
});

$('.drawing-pad').mouseup(function(e){
  paint = false;
});

$('.drawing-pad').mouseleave(function(e){
  paint = false;
});

$('button.save-frame').on('click', function() {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
  redraw(currentFrame);
  var image = new Image();
  image.src = canvas.toDataURL("image/png");
  framesSaved++;
  localStorage.setItem("frame" + framesSaved, image.src);
  $('#view-saved-frames').append('<img src=' + image.src + '>');
  $('#count-saved-frames').text(framesSaved);
  setPreviousFrame();
  saveToAllFrames();
  clearCurrentFrame();
  redraw(previousFrame, '#FF9999');
});

$('#playButton').on('click', function() {
  if (framesSaved <= 0) {
    alert('You haven\'t saved any frames!');
    return;
  }
  var speed = $('#speed').val();
  playInterval = window.setInterval(play, speed);
});

$('#resetButton').on('click', function() {
  clearInterval(playInterval);
  clearCurrentFrame();
  currentFrameID = 1;
  framesSaved = 0;
  $('#count-saved-frames').text(framesSaved);
  $('#view-saved-frames').empty();
});


$('#pauseButton').on('click', function() {
  clearInterval(playInterval);
});

$('#clearFrame').on('click', function() {
  clearCurrentFrame();
  redraw(previousFrame, '#FF9999');
});

$('#see-all-frames').on('click', function() {
  if (framesSaved <= 0) {
    alert('You haven\'t saved any frames!');
    return;
  }
  var gbMultiplier = 120;
  var gbColor;
  var length = allFrames.length;
  for (var i = 0; i < allFrames.length; i++) {
    gbColor = (gbMultiplier * (1 - i / length) ) + 100;
    redraw(allFrames[i], rgbToHex(255, gbColor, gbColor));
  }
});

