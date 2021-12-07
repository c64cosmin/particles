function angle2radian(angle){return angle*Math.PI/180.0;}
function randomRange(magnitude){return (Math.random()*2-1)*magnitude;}
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
	start();
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
	canvas.setTransform(1,0,0,1,0,0);
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
	this.life = 0;
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
		while(prob > 1){
			this.spawnNewParticle();	
			prob--;
		}
		if(Math.random() < prob){
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
	particles.image = particleSprites[1];
	particles.life = 50;
	particles.lifeRandom = 30; 
}

function loop(){
	particles.update();
	particles.draw();
}
