(function() {

	window.onload = function() {
		var sideCompensation = -115;
		var updown, gravity, sideways = 0,
			blink = false;
		var obstacles = [],
			obDelay = 0;

		var udpPort = new osc.UDPPort({
			localAddress: "0.0.0.0",
			localPort: 5000
		});


		var canvas = document.getElementById("cv");
		var ctx = canvas.getContext('2d');
		var playerX = 0;
		var speed = 0;
		var point = 0;
		var lives = 3;

		udpPort.on("ready", function() {
			console.log("ready");
		});

		udpPort.on("message", function(oscMessage, timeTag, info) {
			switch(oscMessage.address) {
				case "/muse/acc":
					updown = oscMessage.args[0];
					gravity = oscMessage.args[1];
					sideways = oscMessage.args[2] + sideCompensation;

					if(gravity > 1500) blink = true;
					break;
				case "/muse/elements/blink":
					blink |= oscMessage.args[0] == 1;
					console.log(oscMessage.args[0]);
					break;
			}
		});

		udpPort.open();

		setInterval(function draw() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Logic
			if(--obDelay <= 0) {
				obDelay = 12 - speed;
				speed += 0.01;
				obstacles.push([Math.random()*canvas.width, -30, Math.random()<0.2?0:1]);
			}

			playerX += sideways / 60;
			if(playerX < 0) playerX = 0;
			if(playerX > canvas.width - 50) playerX = canvas.width - 50;

			obstacles.forEach(function(ob) {
				ob[1] += 2;
				if(playerX < ob[0] + 10 &&
				  playerX + 50 > ob[0] &&
				  510 < ob[1] + 30 &&
				  50 + 510 > ob[1]) {
				  ob[1] = canvas.height + 30;
				  console.log("hit");
				  if(ob[2] == 1){
				  	lives--;
				  	console.log("hit red, " + lives + " lives left.");}
				  else {
				  	point += 10;
				  	console.log("hit green: " + point + " points total.");}}
			});

			// Draw
			ctx.beginPath();
			ctx.rect(playerX, 510, 50, 50);
			ctx.fillStyle = blink ? "#00FF00" : "blue";
			ctx.fill();
			ctx.closePath();

			obstacles.forEach(function(ob) {
				ctx.beginPath();
				ctx.rect(ob[0], ob[1], 10, 30);
				if(ob[2] == 1)
					ctx.fillStyle = "red";
				else
					ctx.fillStyle = "green";
				ctx.fill();
				ctx.closePath();
			});
			obstacles = obstacles.filter(function(ob){
				return (ob[1] < canvas.height)})
			blink = false;
		}, 16);
	};
})();
