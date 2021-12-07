function angle2radian(angle){return angle*Math.PI/180.0;}
function randomRange(magnitude){return (Math.random()*2-1)*magnitude;}
var canvas, canvasObj;
var resourceLoader;
var particleSprites = [];
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
	video = loadVideo("media/video.mp4"); 
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
	setBackground(0,0,0);
	canvas.setTransform(1,0,0,1,0,0);
    canvas.clearRect(0,0,canvasObj.width, canvasObj.height);
    canvas.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
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
	this.update = function(){
		this.speed.add(this.gravity);
		this.position.add(this.speed);
		this.speed.mulScalar(this.damping);
		this.rotation += this.rotationSpeed;
		this.scale.add(new Vector(this.scaleSpeed,this.scaleSpeed));
		if(this.scale.x < 0 || this.scale.y < 0)return true;
		this.life--;
		if(this.life < 0)return true;
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
	particles.scaleSpeed = parseFloat(document.getElementById("scaleSpeed").value*0.01);
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
	setParam("scaleSpeed", -4);
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
	setParam("scaleSpeed", 4);
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
	setParam("scaleSpeed", 1);
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
	setParam("scaleSpeed", 1);
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
