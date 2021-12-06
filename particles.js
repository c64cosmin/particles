var canvas, canvasObj;
var imagesLoader;
var particleSprites = [];
function init(){
	imagesLoader = document.getElementById('images');
    imagesLoader.style.visibility="hidden";
    canvasObj=document.getElementById('canvas');
    canvas=canvasObj.getContext('2d');
    requestAnimationFrameInit();
    loopTime=performance.now();
	particleSprites.push(loadImage("particles0.png"));
	particleSprites.push(loadImage("particles1.png"));
	particleSprites.push(loadImage("particles2.png"));
	particleSprites.push(loadImage("particles3.png"));
    loopDraw();
}

function loadImage(src){
    var img = document.createElement("img");
    img.ready = false;
    img.addEventListener('load',function(){
        this.ready = true;
    });
    img.src=src;
    imagesLoader.appendChild(img);
    return img;
}

function setBackground(r, g, b){
    canvasObj.style.backgroundColor="rgb("+r+","+g+","+b+")";
}

function loopDraw(){
	setBackground(0,0,0);
    canvas.clearRect(0,0,canvasObj.width, canvasObj.height);
    loop();
    requestAnimation(loopDraw);
}

var requestAnimation = null;
function requestAnimationFrameInit(){
    requestAnimation =
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame;
}

function Vector(x, y){
	this.x = x;
	this.y = y;
	this.add = function(vec){
		this.x += vec.x;
		this.y += vec.y;
	};
	this.sub = function(vec){
		this.x -= vec.x;
		this.y -= vec.y;
	};
	this.mulScalar = function(val){
		this.x *= val;
		this.y *= val;
	};
}

function Particle(){
	this.position = new Vector(0,0);
	this.speed = new Vector(0,0);
	this.scale = new Vector(1,1);
	this.scaleSpeed = 0;
	this.gravity = new Vector(0,0);
	this.rotation = 0;
	this.rotationSpeed = 0;
	this.damping = 1;
	this.life = 0;
	this.update = function(){
		this.speed.add(this.gravity);
		this.position.add(this.speed);
		this.speed.mulScalar(this.damping);
		this.rotation += this.rotationSpeed;
		this.scale.add(new Vector(this.scaleSpeed,this.scaleSpeed));
		this.life--;
		if(this.life < 0)return true;
		return false;
	}
	this.draw = function(){
		canvas.drawImage(
			this.image,
			this.position.x,
			this.position.y,
			this.scale.x,
			this.scale.y
		);
	}
}

var particles = [];

function loop(){
	var p = new Particle();
	p.position = new Vector(
		Math.random()*canvasObj.width,
		Math.random()*canvasObj.height
	);
	p.scale = new Vector(30,30);
	p.life = 25;
	p.image = particleSprites[2];
	particles.push(p);

    for(var i=0;i<particles.length;i++){
		var part = particles[i];
        if(part.update()){
            particles.splice(i, 1);
            i--;
        }else{
			part.draw();
		}
    }
}
