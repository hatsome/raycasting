var map=[
 [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
 [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
 [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1],
 [1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1],
 [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
 [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1],
 [1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
 [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
 [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1],
 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
 [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]];

var previousTime = Date.now();
var lag = 0.0;
var MS_PER_UPDATE = 1000 / 25;

var player={
		x : 3.5,
		y : 3.5,
		mov : 0, //Moving: 1 forewards, -1 backwards, 0 standing still
		dir : 0, //Turning: 1 right, -1 left, 0 standing still
		rot : 0, //Current rotation angle
		speed: 0.05, //Units player moves each step
		sprint: 0, //sprinting 1, walking 0
		sprintFactor: 2, //sprinting 2 times faster
		rotSpeed: 2 * Math.PI / 180, //Rotation speed each update
		fov : 60 * Math.PI / 180, //Field of View
	};	

function bindKeys(){
	document.onkeydown = function(e){
		e = e || window.event;
		switch(e.keyCode){
			case 65: //a
			case 37: player.dir = 1;//left
				break;
			case 87: //w
			case 38: player.mov = 1; //up
				break;
			case 68: //d
			case 39: player.dir = -1;//right
				break;
			case 83: //s
			case 40: player.mov = -1;//down
				break;
			case 16: player.sprint = 1; //shift
		}
		
	};
	document.onkeyup = function(e){
		e = e || window.event;
		switch(e.keyCode){
			case 65: //a
			case 37: //left
			case 68: //d
			case 39: //right
				player.dir = 0;
				break;
			case 87: //w
			case 38: //up
			case 83: //s
			case 40: //down
				player.mov = 0;
				break;	
			case 16: //shift	
				player.sprint = 0; 
				break;
		}
	};
}

function processInput(){
	var step = player.mov * player.speed * (player.sprint +1) * player.sprintFactor;
	var rotStep = player.dir * player.rotSpeed;
	
	player.rot = addRotToAngle(rotStep, player.rot);

	var xNew = player.x + step * Math.cos(player.rot);
	var yNew = player.y - step * Math.sin(player.rot); 
	
	
	if (!(hitWall(xNew, yNew))){	
		player.x = xNew;
		player.y = yNew;
	}
}

function update(){

}

function render(interpolation){
	drawBackground();
	castRays();
	drawMap();
}

function drawBackground(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = '#4DC7F0';
	ctx.fillRect(0, 0, canvas.width, canvas.height /2);
	ctx.fillStyle = '#D6D6D6';
	ctx.fillRect(0, canvas.height /2, canvas.width, canvas.height /2);
}

function hitWall(x, y) {
	if (x < 0 || x >= map[0].length || y < 0 || y >= map.length){
		return true;
	}
	return map[Math.floor(y)][Math.floor(x)] != 0;
}

function addRotToAngle(rot, angle){
	var newAngle = angle + rot;
	if (newAngle < 0){
		return newAngle + 360 * Math.PI /180;
	}		
	if (newAngle > 360 * Math.PI / 180){
		return newAngle - 360 * Math.PI /180;
	}
	return newAngle;
}		

function castRays() {
	var angleBetweenRays = ((player.fov*180/Math.PI) / canvas.width)*Math.PI /180;
	var dist;		
	var angle = addRotToAngle(player.fov /2, player.rot);
	for (var i = 0; i < canvas.width;i++){
		castSingleRay(angle, i);
		angle = addRotToAngle(-angleBetweenRays, angle);
	}
}

function castSingleRay(angle, row) {
	var facingRight = (angle < 90* Math.PI /180 || angle > 270 * Math.PI /180); 
	var facingUp = (angle < 180 * Math.PI /180);
	
	var x = 0;
	var y = 0;
	var dX = 0;
	var dY = 0;
	var xMap = 0;
	var yMap = 0;
	var xHit = 0;
	var yHit = 0;
	var dist = 0;
	var img = 0;
	var offset = 0;
	var slope =  1 / (Math.sin(-angle) / Math.cos(-angle));	
	//horizontal
	y = facingUp ? Math.floor(player.y) : Math.ceil(player.y);
	x = player.x + (y -player.y) *slope;
	
	dY = facingUp ? -1 : 1;
	dX = dY * slope;
	while (x >= 0 && x < map[0].length && y >= 0 && y < map.length)
	{
		yMap = Math.floor(y + (facingUp ? -1 : 0));
		xMap = Math.floor(x);
		if (hitWall(xMap, yMap)){
			dist = Math.abs((player.x - x) / Math.cos(angle));
			offset = x % 1;
			img = map[yMap][xMap];
			break;
		}
		x += dX;
		y += dY;
	}
	
	//vertical
	var slope = (Math.sin(-angle) / Math.cos(-angle));
	x = facingRight ? Math.ceil(player.x) : Math.floor(player.x);
	y = player.y + (x -player.x) *slope;
	dX = facingRight ? 1 : -1;
	dY = dX * slope;
	while (x >= 0 && x < map[0].length && y >= 0 && y < map.length)
	{
		xMap = Math.floor(x + (facingRight ? 0 : -1));
		yMap = Math.floor(y);
		if (hitWall(xMap, yMap)){
			break;
		}
		x += dX;
		y += dY;
	}
	if (dist == 0 || dist > Math.abs((player.y - y) / Math.sin(angle))){
		dist = Math.abs((player.y - y) / Math.sin(angle));
		img = map[yMap][xMap];
		offset = y %1;
	}
	dist = dist * Math.cos(player.rot - angle);
	drawRay(dist, row, offset, img);
	
}

function drawRay(dist, x, offset, img) {		
	var distanceProjectionPlane = (canvas.width /2) / Math.tan((player.fov /2));
	var sliceHeight = 1 / dist * distanceProjectionPlane;
	//image
	switch(img){
		case 1: ctx.drawImage(document.getElementById('wall'), offset*63, 0, 1, 64, x, (canvas.height /2) - (sliceHeight /2), 1, sliceHeight);
			break;
		case 2: //different image
			break;
	}

}

function drawMap(){
	ctx.clearRect(0, 0, map[0].length*5, map.length*5);
	ctx.fillStyle = 'rgb(255, 0, 0)';
	ctx.fillRect(player.x*5 -1, player.y*5 -1, 2, 2);
	
	for (var y=0; y<map.length; y++){
		for (var x=0; x<map[y].length; x++){
			if (map[y][x] > 0){
				ctx.fillStyle = 'rgb(0, 0, 0)';
				ctx.fillRect(x*5, y*5, 5, 5);
			}		
		}
	}

}

var game = function() {
	var currentTime = Date.now();
	var elapsedTime = currentTime - previousTime;
	previousTime = currentTime;
	lag += elapsedTime;

	processInput();

	while (lag >= MS_PER_UPDATE) {
		update();
		lag -= MS_PER_UPDATE;
	}

	render(lag / MS_PER_UPDATE);

	requestAnimationFrame(game);
}

bindKeys();
requestAnimationFrame(game);