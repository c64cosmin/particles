function angle2radian(angle){return angle*Math.PI/180.0;}
function randomRange(magnitude){return (Math.random()*2-1)*magnitude;}
var canvas, canvasObj;
var resourceLoader;
var video;
var controls;
var particleSprites = [];
function openFullscreen() {
  var elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { /* Safari */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE11 */
    elem.msRequestFullscreen();
  }
}
function init(){
	resourceLoader = document.getElementById('resources');
    resourceLoader.style.visibility="hidden";
    canvasObj=document.getElementById('canvas');
    canvas=canvasObj.getContext('2d');
    requestAnimationFrameInit();
    loopTime=performance.now();
	particleSprites.push(loadImage("particles/particles0.png"));
	particleSprites.push(loadImage("particles/particles1.png"));
	particleSprites.push(loadImage("particles/particles2.png"));
	particleSprites.push(loadImage("particles/particles3.png"));
	particleSprites.push(loadImage("particles/particles4.png"));
	particleSprites.push(loadImage("particles/particles5.png"));
	video = loadVideo("media/video.mp4"); 
	controls = document.getElementById("controls");
	player = document.getElementById("player");
	setBackground(0,0,0);
	start();
    loopDraw();
}

function loadVideo(src){
	var video = document.createElement("VIDEO");
	video.src = src;
	video.muted = true;
	video.autoplay = true;
	video.loop = true
    resourceLoader.appendChild(video);
    return video;
}

function loadImage(src){
    var img = document.createElement("img");
    img.ready = false;
    img.addEventListener('load',function(){
        this.ready = true;
    });
    img.src=src;
    resourceLoader.appendChild(img);
    return img;
}

function setBackground(r, g, b){
    canvasObj.style.backgroundColor="rgb("+r+","+g+","+b+")";
}

function loopDraw(){
	canvas.setTransform(1,0,0,1,0,0);
    canvas.clearRect(0,0,canvasObj.width, canvasObj.height);
    if(video)canvas.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
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
	this.image = null;
	this.shrink = 0;
	this.fadeShrink = false;
	this.update = function(){
		this.speed.add(this.gravity);
		this.position.add(this.speed);
		this.speed.mulScalar(this.damping);
		this.rotation += this.rotationSpeed;
		this.scale.add(new Vector(this.scaleSpeed,this.scaleSpeed));
		if(this.scale.x < 0 || this.scale.y < 0)return true;
		this.life--;
		if(this.life < 0){
			if(this.fadeShrink){
				this.scaleSpeed = -0.1;
			}else{
				return true;
			}
		}
		return false;
	}
	this.draw = function(){
		if(!this.image)return;
		canvas.setTransform(
			this.scale.x, 0,
			0, this.scale.y,
			this.position.x, this.position.y
		);
		canvas.rotate(this.rotation);//Math.random()*360);
		canvas.drawImage(
			this.image,
			-this.image.width/2,
			-this.image.height/2
		);
	}
}

function RectangleShape(){
	this.position = new Vector(0,0);
	this.size = new Vector(0,0);
	this.getPoint = function(){
		return new Vector(
			Math.random()*this.size.x + this.position.x,
			Math.random()*this.size.y + this.position.y
		);
	}
}

function ParticleSystem(){
	this.particles = [];
	this.image = null;
	this.spawnShape = null;
	this.spawnProbability = 1;
	this.direction = 0; 
	this.directionRandom = 0;
	this.speed = 0;
	this.speedRandom = 0;
	this.scale = 1;
	this.scaleRandom = 0;
	this.scaleSpeed = 0;
	this.scaleSpeedRandom = 0;
	this.gravity = new Vector(0,0);
	this.rotation = 0;
	this.rotationRandom = 0;
	this.rotationSpeed = 0;
	this.rotationSpeedRandom = 0;
	this.damping = 0;
	this.dampingRandom = 0;
	this.life = 1;
	this.lifeRandom = 0;
	this.fadeShrink = false;
	this.spawnNewParticle = function(){
		if(!this.spawnShape)return;
		var p = new Particle();

		p.position = this.spawnShape.getPoint(); 

		var angle = this.direction + randomRange(this.directionRandom);
		var speed = this.speed + randomRange(this.speedRandom);
		p.speed = new Vector(
			Math.cos(angle2radian(angle))*speed,
			Math.sin(angle2radian(angle))*speed
		);

		var scaleVariation = randomRange(this.scaleRandom);
		p.scale = new Vector(this.scale + scaleVariation, this.scale + scaleVariation);
		p.scaleSpeed = this.scaleSpeed + randomRange(this.scaleSpeedRandom);
		p.gravity = this.gravity;
		p.rotation = this.rotation + randomRange(this.rotationRandom);
		p.rotationSpeed = this.rotationSpeed + randomRange(this.rotationSpeedRandom);
		p.damping = this.damping + randomRange(this.dampingRandom);
		if(p.damping < 0)this.damping = 0;
		p.life = this.life + randomRange(this.lifeRandom);
		p.image = this.image;
		p.fadeShrink = this.fadeShrink;
		this.particles.push(p);
	}
	this.update = function(){
		var prob = this.spawnProbability;
		while(prob >= 1){
			this.spawnNewParticle();	
			prob-=1;
		}
		if(prob > 0 && Math.random() < prob){
			this.spawnNewParticle();	
		}
	
	    for(var i=0;i<this.particles.length;i++){
			if(this.particles[i].update()){
	            this.particles.splice(i, 1);
	            i--;
			}
	    }
	}
	this.draw = function(){
	    for(var i=0;i<this.particles.length;i++){
			this.particles[i].draw();
	    }
	}
}

var particles;
var shape;
function start(){
	shape = new RectangleShape();
	shape.position.x = 0;
	shape.position.y = 0;
	shape.size.x = canvasObj.width;
	shape.size.y = canvasObj.height;
	particles = new ParticleSystem();
	particles.spawnShape = shape;
	particles.image = particleSprites[0];
	particles.life = 50;
	particles.rotationRandom=360;
	particles.spawnProbability=10;
}

function loop(){
	particles.update();
	particles.draw();
}

function onClickVariables(){
	particles.image = particleSprites[parseFloat(document.getElementById("image").value)];
	particles.spawnProbability = parseFloat(document.getElementById("spawnProbability").value*0.01);
	particles.direction = parseFloat(document.getElementById("direction").value);
	particles.directionRandom = parseFloat(document.getElementById("directionRandom").value);
	particles.speed = parseFloat(document.getElementById("speed").value*0.01);
	particles.speedRandom = parseFloat(document.getElementById("speedRandom").value*0.01);
	particles.scale = parseFloat(document.getElementById("scale").value*0.01);
	particles.scaleRandom = parseFloat(document.getElementById("scaleRandom").value*0.01);
	particles.scaleSpeed = parseFloat(document.getElementById("scaleSpeed").value*0.001);
	particles.scaleSpeedRandom = parseFloat(document.getElementById("scaleSpeedRandom").value*0.01);
	particles.gravity.x = parseFloat(document.getElementById("gravityX").value*0.01);
	particles.gravity.y = parseFloat(document.getElementById("gravityY").value*0.01);
	particles.rotation = parseFloat(document.getElementById("rotation").value);
	particles.rotationRandom = parseFloat(document.getElementById("rotationRandom").value);
	particles.rotationSpeed = parseFloat(document.getElementById("rotationSpeed").value*0.01);
	particles.rotationSpeedRandom = parseFloat(document.getElementById("rotationSpeedRandom").value*0.01);
	particles.damping = parseFloat(document.getElementById("damping").value*0.01);
	particles.dampingRandom = parseFloat(document.getElementById("dampingRandom").value*0.01);
	particles.life = parseFloat(document.getElementById("life").value);
	particles.lifeRandom = parseFloat(document.getElementById("lifeRandom").value);
}

function setParam(name, value){
	document.getElementById(name).value = value;
}

function ex0(){
	setParam("image", 0);
	setParam("spawnProbability", 50);
	setParam("direction", 0);
	setParam("directionRandom", 360);
	setParam("speed", 50);
	setParam("speedRandom", 50);
	setParam("scale", 50);
	setParam("scaleRandom", 30);
	setParam("scaleSpeed", -40);
	setParam("scaleSpeedRandom", 0);
	setParam("gravityX", 0);
	setParam("gravityY", 0);
	setParam("rotation", 0);
	setParam("rotationRandom", 360);
	setParam("rotationSpeed", 0);
	setParam("rotationSpeedRandom", 10);
	setParam("damping", 100);
	setParam("dampingRandom", 0);
	setParam("life", 20);
	setParam("lifeRandom", 10);
	onClickVariables();
}

function ex1(){
	setParam("image", 1);
	setParam("spawnProbability", 10);
	setParam("direction", 0);
	setParam("directionRandom", 360);
	setParam("speed", 350);
	setParam("speedRandom", 50);
	setParam("scale", 50);
	setParam("scaleRandom", 30);
	setParam("scaleSpeed", 40);
	setParam("scaleSpeedRandom", 1);
	setParam("gravityX", 0);
	setParam("gravityY", 0);
	setParam("rotation", 0);
	setParam("rotationRandom", 360);
	setParam("rotationSpeed", 0);
	setParam("rotationSpeedRandom", 1);
	setParam("damping", 95);
	setParam("dampingRandom", 0);
	setParam("life", 30);
	setParam("lifeRandom", 10);
	onClickVariables();
}

function ex2(){
	setParam("image", 2);
	setParam("spawnProbability", 50);
	setParam("direction", 0);
	setParam("directionRandom", 360);
	setParam("speed", 650);
	setParam("speedRandom", 350);
	setParam("scale", 50);
	setParam("scaleRandom", 30);
	setParam("scaleSpeed", 10);
	setParam("scaleSpeedRandom", 1);
	setParam("gravityX", 0);
	setParam("gravityY", 20);
	setParam("rotation", 0);
	setParam("rotationRandom", 360);
	setParam("rotationSpeed", 0);
	setParam("rotationSpeedRandom", 10);
	setParam("damping", 95);
	setParam("dampingRandom", 0);
	setParam("life", 20);
	setParam("lifeRandom", 10);
	onClickVariables();
}

function ex3(){
	setParam("image", 3);
	setParam("spawnProbability", 1000);
	setParam("direction", 270);
	setParam("directionRandom", 20);
	setParam("speed", 650);
	setParam("speedRandom", 350);
	setParam("scale", 50);
	setParam("scaleRandom", 30);
	setParam("scaleSpeed", 10);
	setParam("scaleSpeedRandom", 1);
	setParam("gravityX", 0);
	setParam("gravityY", -20);
	setParam("rotation", 0);
	setParam("rotationRandom", 360);
	setParam("rotationSpeed", 0);
	setParam("rotationSpeedRandom", 10);
	setParam("damping", 95);
	setParam("dampingRandom", 0);
	setParam("life", 40);
	setParam("lifeRandom", 10);
	onClickVariables();
}
function ex4(){
	setParam("image", 0);
	setParam("spawnProbability", 1000);
	setParam("direction", 0);
	setParam("directionRandom", 0);
	setParam("speed", 0);
	setParam("speedRandom", 0);
	setParam("scale", 50);
	setParam("scaleRandom", 30);
	setParam("scaleSpeed", 10);
	setParam("scaleSpeedRandom", 1);
	setParam("gravityX", 0);
	setParam("gravityY", 0);
	setParam("rotation", 0);
	setParam("rotationRandom", 360);
	setParam("rotationSpeed", 0);
	setParam("rotationSpeedRandom", 0);
	setParam("damping", 100);
	setParam("dampingRandom", 0);
	setParam("life", 50);
	setParam("lifeRandom", 10);
	onClickVariables();
}
function ex5(){
	setParam("image", 4);
	setParam("spawnProbability", 100);
	setParam("direction", 90);
	setParam("directionRandom", 20);
	setParam("speed", 50);
	setParam("speedRandom", 50);
	setParam("scale", 50);
	setParam("scaleRandom", 30);
	setParam("scaleSpeed", -1);
	setParam("scaleSpeedRandom", 0);
	setParam("gravityX", 0);
	setParam("gravityY", 1);
	setParam("rotation", 0);
	setParam("rotationRandom", 360);
	setParam("rotationSpeed", 0);
	setParam("rotationSpeedRandom", 1);
	setParam("damping", 100);
	setParam("dampingRandom", 0);
	setParam("life", 400);
	setParam("lifeRandom", 0);
	onClickVariables();
	spawner(1);
}
function ex6(){
	particles.fadeShrink=true;
	canvasObj.width=1920;
	canvasObj.height=1080;
	setParam("image", 5);
	setParam("spawnProbability", 7);
	setParam("direction", 270);
	setParam("directionRandom", 20);
	setParam("speed", 80);
	setParam("speedRandom", 50);
	setParam("scale", 100);
	setParam("scaleRandom", 70);
	setParam("scaleSpeed", 1);
	setParam("scaleSpeedRandom", 0);
	setParam("gravityX", 0);
	setParam("gravityY", -0.1);
	setParam("rotation", 0);
	setParam("rotationRandom", 360);
	setParam("rotationSpeed", 0);
	setParam("rotationSpeedRandom", 1);
	setParam("damping", 100);
	setParam("dampingRandom", 0);
	setParam("life", 3000);
	setParam("lifeRandom", 0);
	video = null;
	controls.style.visibility="hidden";
	player.style.padding="0px";
	player.style.margin="0px";
	player.style.border="0px";
	player.style.overflow="hidden";
    document.body.style.overflow="hidden";
	onClickVariables();
	setBackground(20,30,60);
	spawner(7);
	openFullscreen();
}

function spawner(p){
	var x = p%3;
	var y = Math.floor(p/3);
	if(x==0 || x==2){
		shape.size.x = 0;
	}else{
		shape.size.x = canvasObj.width;
	}
	if(y==0 || y==2){
		shape.size.y = 0;
	}else{
		shape.size.y = canvasObj.height;
	}
	if(x==2){
		shape.position.x=canvasObj.width;
	}else{
		shape.position.x=0;
	}
	if(y==2){
		shape.position.y=canvasObj.height;
	}else{
		shape.position.y = 0;
	}
}
