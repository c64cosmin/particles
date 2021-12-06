var canvas, canvasObj;
var screenWidth,screenHeight;
function init(){
    canvasObj=document.getElementById('canvas');
    canvas=canvasObj.getContext('2d');
    requestAnimationFrameInit();
    loopTime=performance.now();
    loopDraw();
}

function setBackground(r, g, b){
    canvasObj.style.backgroundColor="rgb("+r+","+g+","+b+")";
}

function loopDraw(){
	setBackground(0,0,0);
    canvas.clearRect(0,0,screenWidth,screenHeight);
    draw();
    requestAnimation(loopDraw);
}

var requestAnimation = null;
function requestAnimationFrameInit(){
    requestAnimation =
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame;
}
