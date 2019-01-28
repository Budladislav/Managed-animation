"use strict";

/* GLOBAL VARIABLES */
  let e_Canvas = document.getElementById('canvas');
  let canvasContext = e_Canvas.getContext('2d');
  let n_CanvasWidth;
  let n_CanvasHeight;
  let n_CanvasShortSide;
  let b_DirectionKeyHold; //for indicate holding state of direction buttons
  let n_pressIntervalId; //for realization 'long touch' in touch events
  //for bundles of keyboard codes and span ids, for press indication
  let o_SpanId = { 
    32: '#space', //spacebar
    48: '#0', //0 (speed 0)
    96: '#0', //num0 (speed 0)
    37: '#←', //left arrow
    65: '#a', //A
    38: '#↑', //top arrow
    87: '#w', //W
    39: '#→', // right arrow
    68: '#d', // D
    40: '#↓', //down arrow
    83: '#s', //S
    49: '#0', //key 1
    50: '#0', //key 2
    51: '#0', //key 3
    52: '#0', //key 4
    53: '#9', //key 5
    54: '#9', //key 6
    55: '#9', //key 7
    56: '#9', //key 8
    57: '#9', //key 9
    97: '#0', //key num1
    98: '#0', //key num2
    99: '#0', //key num3
    100: '#0', //key num4
    101: '#9', //key num5
    102: '#9', //key num6
    103: '#9', //key num7
    104: '#9', //key num8
    105: '#9', //key num9
    88: '#x', //X
    90: '#z', //Z
    67: '#c', //C
    86: '#v' //V
  }
/* GLOBAL VARIABLES end */

/* FUNCTIONS */

  /*setup intrface. Used for dynamic setting sizes of elements.
  min-width 500px, min-height 500px. if client size fewer - scrollbars
  if bigger - content size expands to client size*/
  let fSetInterface = () => {
    let n_WindowWidth = document.documentElement.clientWidth;
    let n_WindowHeight = document.documentElement.clientHeight;
    let n_WindowShortSide = Math.min(n_WindowWidth,n_WindowHeight);
    let n_BodyMinWidth;
    let n_BodyMinHeight;

    if (n_WindowWidth < 500){
      n_BodyMinWidth = 500;
    } else {
      n_BodyMinWidth = n_WindowWidth - 20;
    }
    if (n_WindowHeight < 500){
      n_BodyMinHeight = 500;
    } else {
      n_BodyMinHeight = n_WindowHeight - 20;
    }

    $('body').css({
      'min-width' : n_BodyMinWidth + 'px',
      'min-height' : n_BodyMinHeight + 'px'
    });
    $('#main-container').css({
      'width' : n_BodyMinWidth + 'px',
      'height' : n_BodyMinHeight + 'px'
    });

    if (!fIsMobile()) { //desctop
      $('#mobile-controlls-container').css('display','none');
      $("#control-status").text("available, ");  
    } else { //mobile
      $('#control-info').css('display','none');
      window.addEventListener('focus', ()=>{}); //remove event focus
      //Increases text size on mobile devices
      (n_WindowWidth < n_WindowHeight)
        ? $('body').css('font-size','2em')
        : $('body').css('font-size','1.5em')    
      
      let nControlContainerHeight = (n_WindowWidth < n_WindowHeight)
        ? n_WindowShortSide * 0.12 : n_WindowShortSide * 0.25;
      $('#mobile-controlls-container').css({
        'width' : n_BodyMinWidth + 'px',
        'height' : nControlContainerHeight + 'px'
      });
      $('#controls_size-speed').css('width',n_BodyMinWidth*0.5+'px');
      $('#controls_direction').css('width',n_BodyMinWidth*0.5+'px');

      let nButtonSize = nControlContainerHeight - 20;
      $('.mobile-control-button').css({
        'width': nButtonSize +'px',
        'height': nButtonSize +'px',
        'margin': '10px'
      });
    }

    n_CanvasWidth = $('#canvas').width();
    n_CanvasHeight = $('#canvas').height();
    n_CanvasShortSide = Math.min(n_CanvasWidth,n_CanvasHeight);
    //html attr-s must be same that css, so that the drawing is not distorted
    e_Canvas.width = n_CanvasWidth;
    e_Canvas.height = n_CanvasHeight;  
  }

  //check is it device mobile (with touchscreen). True - mobile/ false - desctop
  let fIsMobile = () => {
    return ('ontouchstart' in document.documentElement);
  }
  let fDrawFilledCircle = (Xcenter, Ycenter, radius) => {
    canvasContext.beginPath();
    canvasContext.arc(Xcenter, Ycenter, radius, 0, Math.PI * 2);
    canvasContext.fill();
  }
  let fDrawCircle = (Xcenter, Ycenter, radius, start = 0, angle = Math.PI * 2, lineWidth, strokeStyle) => {
    canvasContext.beginPath();
    canvasContext.lineWidth = lineWidth;
    canvasContext.strokeStyle = strokeStyle;
    canvasContext.arc(Xcenter, Ycenter, radius, start, angle);
    canvasContext.stroke();
  }
/* FUNCTIONS end */

/* CONSTRUCTORS */
  //main object constructor
  let Ball = function () {
    this.x = n_CanvasWidth / 2;
    this.y = n_CanvasHeight / 2;
    this.radius = n_CanvasShortSide / 20;
    this.setInfoRadius(this.radius);
    this.speed = 3;
    this.setInfoSpeed(this.speed);
    this.Xspeed = this.speed;
    this.Yspeed = 0;
    this.direction = 'right';
    this.setInfoDirection(this.direction,true);
    this.flagZeroSpeed = false;
    this.intervalID;
    this.updateFrequency = 30;  //in ms
    this.animate();
  }
/* CONSTRUCTORS end */

/* PROTOTYPE METHODS */

  //update position of the ball, according to its speed.
  Ball.prototype.move = function(){
    this.x += this.Xspeed;
    this.y += this.Yspeed;
    this.checkColisionAndOverflow();
  }

  //draw ball in its current position
  Ball.prototype.draw = function(){
    let r = this.radius;
    //external orange circle
    fDrawCircle(this.x, this.y, r - (r / 20), undefined, undefined, r / 10, "orange");
    //inner filled black circle
    fDrawFilledCircle(this.x, this.y, r * 0.9);
    //inner 4-color circle
    fDrawCircle(this.x, this.y, r * 0.5, undefined, Math.PI / 2, r / 20, "#CD5C5C");
    fDrawCircle(this.x, this.y, r * 0.5, Math.PI / 2, Math.PI * 3 / 2, r / 20, "yellow");
    fDrawCircle(this.x, this.y, r * 0.5, Math.PI, Math.PI * 3 / 2, r / 20, "#1E90FF");
    fDrawCircle(this.x, this.y, r * 0.5, Math.PI * 3 / 2, Math.PI * 2, r / 20, "green");
    //inner white circle
    fDrawCircle(this.x, this.y, r * 0.2, undefined, undefined, r / 8, "white");
  }

  //update info in direction span in state panel, with color change
  Ball.prototype.setInfoDirection = function(value,colorTimout = false){
    //don't update direction info if ball contain all space and don't move
    if (this.radius === n_CanvasShortSide / 2){
      return;
    }
    $('#span-direction').css('color','blue');
    $('#span-direction').text(value);
    if (colorTimout) {
      setTimeout(()=>{$('#span-direction').css('color','black');},250);
    }      
  }

  //update info in speed span in state panel, with color change
  Ball.prototype.setInfoSpeed = function(value){
    if (this.speed === value || value === 0){
      $('#span-speed').css('color','black');
      $('#span-speed').text(value);
    } else if (value < this.speed){
      $('#span-speed').css('color','red');
      $('#span-speed').text(value);
    } else if (value > this.speed) {
      $('#span-speed').css('color','green');
      $('#span-speed').text(value);
    }      
  }

  //update info in size span in state panel, with color change
  Ball.prototype.setInfoRadius = function(value){
    if (this.radius === undefined || value === 1){
      $('#span-size').css('color','black');
      $('#span-size').text(value);
    } else if (value < this.radius){
      $('#span-size').css('color','red');
      $('#span-size').text(value);
    } else if (value > this.radius) {
      $('#span-size').css('color','green');
      $('#span-size').text(value);
    } 
    $('#span-size').text(value.toFixed(0));
  }

  //Set the action (movement,speed or size change).
  //Depends on argument string-name of the action
  Ball.prototype.setAction = function(action) {
    switch (action) {
      case 'up':
        this.Xspeed = 0;
        this.Yspeed = -this.speed;
        this.direction = action;
        this.setInfoDirection(action);
        break;
      case 'down':
        this.Xspeed = 0;
        this.Yspeed = this.speed;
        this.direction = action;
        this.setInfoDirection(action);
        break;
      case 'left':
        this.Xspeed = -this.speed;
        this.Yspeed = 0;
        this.direction = action;
        this.setInfoDirection(action);
        break;
      case 'right':
        this.Xspeed = this.speed;
        this.Yspeed = 0;
        this.direction = action;
        this.setInfoDirection(action);
        break;
      case 'stop':
        this.rememberDirection();
        this.Xspeed = 0;
        this.Yspeed = 0;
        this.speed = 0;
        this.setInfoSpeed(0);
        this.flagZeroSpeed = true;
        break;
      case 'speed1':
        this.speedNumChange(1);
        break;
      case 'speed2':
        this.speedNumChange(2);
        break;
      case 'speed3':
        this.speedNumChange(3);
        break;
      case 'speed4':
        this.speedNumChange(4);
        break;
      case 'speed5':
        this.speedNumChange(5);
        break;
      case 'speed6':
        this.speedNumChange(6);
        break;
      case 'speed7':
        this.speedNumChange(7);
        break;
      case 'speed8':
        this.speedNumChange(8);
        break;
      case 'speed9':
        this.speedNumChange(9);
        break;
      case 'speedIncrease':
        this.setInfoSpeed(this.speed + 1);
        this.speed++;
        this.changeSpeed();
        break;
      case 'speedDecrease':
        this.setInfoSpeed(this.speed - 1);
        this.speed--;
        if (this.speed === 0){
          this.rememberDirection();
          this.Xspeed = 0;
          this.Yspeed = 0;
          this.speed = 0;
          this.setInfoSpeed(0);
          this.flagZeroSpeed = true;
          break;
        }
        this.changeSpeed();
        break;
      case 'sizeIncrease':
        if (this.radius < n_CanvasShortSide / 2){
          this.setInfoRadius(this.radius + 1);
          this.radius++;
        } else {
          this.setInfoRadius(n_CanvasShortSide / 2);
          this.radius = n_CanvasShortSide / 2;
        }
        break;
      case 'sizeDecrease':
        if (this.radius > 1){
          this.setInfoRadius(this.radius - 1);
          this.radius--;
        } else{
          this.setInfoRadius(1);
          this.radius = 1;
        } 
        break;
    }
  }

  //auxilary function for Ball.prototype.setAction, to avoid repited code
  Ball.prototype.speedNumChange = function(number){
    this.setInfoSpeed(number);
    this.speed = number;
    this.changeSpeed();
  }

  //If ball reach any boundary of canvas - invert speed
  //And refresh coordinates in case ball goes out of boundaries due to player action
  Ball.prototype.checkColisionAndOverflow = function() {
    if (this.x > n_CanvasWidth - this.radius){
      this.x = n_CanvasWidth - this.radius; 
      this.Xspeed = -this.Xspeed;
      this.rememberDirection();
    } else if (this.x < this.radius) {
        this.x = this.radius;  
        this.Xspeed = -this.Xspeed;
        this.rememberDirection();
    }

    if (this.y > n_CanvasHeight - this.radius){
      this.y = n_CanvasHeight - this.radius;
      this.Yspeed = -this.Yspeed;
      this.rememberDirection();
    } else if (this.y < this.radius) {
        this.y = this.radius;
        this.Yspeed = -this.Yspeed;
        this.rememberDirection();
    }
  }

  Ball.prototype.changeSpeed = function() {
    if (this.speed < 0){
      this.setInfoSpeed(0);
      this.speed = 0;
      return;
    }

    if (this.flagZeroSpeed){ //return speed in last direction before stop
      switch (this.direction) {
        case 'right':
          this.Xspeed = this.speed;
          this.flagZeroSpeed = false;
          return;
        case 'left':
          this.Xspeed = -this.speed;
          this.flagZeroSpeed = false;
          return;
        case 'down':
          this.Yspeed = this.speed;
          this.flagZeroSpeed = false;
          return;
        case 'up':
          this.Yspeed = -this.speed;
          this.flagZeroSpeed = false;
          return;
      }
    }

    if (this.Xspeed > 0) {
      this.Xspeed = this.speed;
    } else if (this.Xspeed < 0) {
        this.Xspeed = -this.speed;
      }
    if (this.Yspeed > 0) {
      this.Yspeed = this.speed;
    } else if (this.Yspeed < 0) {
        this.Yspeed = -this.speed;
      }
  }

  //redraw ball in new position each updateFrequency ms
  Ball.prototype.animate = function() {
    this.intervalID = setInterval(()=>{
      canvasContext.clearRect(0,0,n_CanvasWidth,n_CanvasHeight);
      this.draw();
      this.move();
    },this.updateFrequency);
  }

  //for resume motion in necessary direction
  Ball.prototype.rememberDirection = function() {
    if (this.Xspeed === 0 && this.Yspeed ===0) {
      return;
    }
    if (this.Xspeed > 0){
      this.direction = 'right';
      if (!b_DirectionKeyHold) this.setInfoDirection('right',true);
      return;
    }
    if (this.Xspeed < 0){
      this.direction = 'left';
      if (!b_DirectionKeyHold) this.setInfoDirection('left',true);
      return;
    }
    if (this.Yspeed > 0) {
      this.direction = 'down';
      if (!b_DirectionKeyHold) this.setInfoDirection('down',true);
      return;
    }
    if (this.Yspeed < 0) {
      this.direction = 'up';
      if (!b_DirectionKeyHold) this.setInfoDirection('up',true);
      return;
    }
  }
  
/* PROTOTYPE METHODS end */

/* EVENTS */

  //need for indicate avaliability of control from PC keybord (active window or not)
  window.addEventListener('blur', ()=>{
    $("#control-status").text("not available, ");
    $("#control-status").css('color','red');
  });

  //need for indicate avaliability of control from PC keybord (active window or not)
  window.addEventListener('focus', ()=>{
    $("#control-status").text("available, ");
    $("#control-status").css('color','green');
  });

  //prevent scroll-control via arrow keys
  /*
  window.addEventListener("keydown", function(e) {
    // space and arrow keys
    if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
      e.preventDefault();
    }
  }, false);
  */

  //PC control event. find out which button is pressed, and starts the process
  //of changing the direction of movement / speed or size of the ball
  $("body").on('keydown', function (event){
    //object for translation code of keys to action names
    let o_KeyActions = {
      32: 'stop', //spacebar
      48: 'stop', //0 (speed 0)
      96: 'stop', //num0 (speed 0)
      37: 'left', //left arrow
      65: 'left', //A
      38: 'up', //top arrow
      87: 'up', //W
      39: 'right', // right arrow
      68: 'right', // D
      40: 'down', //down arrow
      83: 'down', //S
      49: 'speed1', //key 1
      50: 'speed2', //key 2
      51: 'speed3', //key 3
      52: 'speed4', //key 4
      53: 'speed5', //key 5
      54: 'speed6', //key 6
      55: 'speed7', //key 7
      56: 'speed8', //key 8
      57: 'speed9', //key 9
      97: 'speed1', //key num1
      98: 'speed2', //key num2
      99: 'speed3', //key num3
      100: 'speed4', //key num4
      101: 'speed5', //key num5
      102: 'speed6', //key num6
      103: 'speed7', //key num7
      104: 'speed8', //key num8
      105: 'speed9', //key num9
      88: 'speedIncrease', //X
      90: 'speedDecrease', //Z
      67: 'sizeDecrease', //C
      86: 'sizeIncrease' //V
    }   

    let action = o_KeyActions[event.keyCode];
    b_DirectionKeyHold = (action === 'up' || action === 'right'
      || action === 'down' || action === 'left');
    ball.setAction(action);
    $(o_SpanId[event.keyCode]).css('color','blue');
  });

  //PC control event.
  $("body").keyup(function (event){
    b_DirectionKeyHold = false;
    $('#span-direction').css('color','black');
    $('#span-direction').text(ball.direction);
    $('#span-speed').css('color','black');
    $('#span-size').css('color','black');
    $(o_SpanId[event.keyCode]).css('color','black');
  });

  //Mobile control event
  //handles taps and long touchs at mobile control buttons (and their childs) 
  $('.mobile-control-button').on('touchstart',(event)=>{
    let a_ButtonsIds = ['button-sp_u', 'button-sp_d', 'button-si_u',
    'button-si_d', 'button-up', 'button-left', 'button-down', 'button-right'];
    let a_ButtonsActions = ['speedIncrease', 'speedDecrease', 'sizeIncrease',
    'sizeDecrease', 'up', 'left', 'down', 'right'];
    //forbid to fire handler if any contol button still in use
    if (event.touches.length > 1) {
      return;
    }
    
    for (var i = a_ButtonsIds.length - 1; i >= 0; i--) {
      if (event.currentTarget.id ===  a_ButtonsIds[i]){
        b_DirectionKeyHold = (a_ButtonsActions[i] === 'up'
        || a_ButtonsActions[i] === 'right' || a_ButtonsActions[i] === 'down'
        || a_ButtonsActions[i] === 'left');
        ball.setAction(a_ButtonsActions[i]);
        n_pressIntervalId = setInterval(()=>{ball.setAction(a_ButtonsActions[i]);},25);
        break;
      }
    }
  });

  //Mobile control event. Handles end of long-touch on any managment buttons
  $('.mobile-control-button').on('touchend',(event)=>{
    clearInterval(n_pressIntervalId);
    b_DirectionKeyHold = false;
    $('#span-direction').css('color','black');
    $('#span-direction').text(ball.direction);
    $('#span-speed').css('color','black');
    $('#span-size').css('color','black');
  });

/* EVENTS end */

/* MAIN CODE */
  fSetInterface();
  let ball = new Ball();
/* MAIN CODE end */
