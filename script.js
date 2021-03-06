(function() {

	window.onload = function() {
		var hueUrl = "http://10.42.0.156/api/38a0fb262bbee024203659723e28149f/lights/1/state"

		var sideCompensation = -115;
		var updown, gravity, sideways = 0,
			blinkValue = 0;
		var obstacles,
			obDelay;

		var udpPort = new osc.UDPPort({
			localAddress: "0.0.0.0",
			localPort: 5000
		});


		var canvas = document.getElementById("cv");
		var ctx = canvas.getContext('2d');
		var playerX;
		var player_height = 55;
		var player_width = 90;
		var ob_height = 30;
		var ob_width = 10;
		var speed;
		var points;
		var lives;
		var ticks;

		ctx.font = '40px sans';
		ctx.fillStyle = 'black';
		ctx.fillText('Connecting to Muse...', 100, 50);

		udpPort.on("ready", function() {
			console.log("ready");

		});

		var receivedSignal = false;
		var lastJump = -Infinity;

		var oldState = true, changeReady = true;
		function setHueState(state) {
			data = {
				on: state,
				transitiontime: 0
			}

			if(state) {
				data['hue'] = Math.floor(Math.random() * 65535)
			}

			oldState = state;
			return $.ajax({
				url: hueUrl,
				type: "PUT",
				data: JSON.stringify(data),
				dataType: "json"
			});
		}

		setHueState(true);

		udpPort.on("message", function(oscMessage, timeTag, info) {
			if (!receivedSignal) {
				startGame();
				receivedSignal = true;
			}
			switch(oscMessage.address) {
				case "/muse/acc":
					updown = oscMessage.args[0];
					gravity = oscMessage.args[1];
					sideways = oscMessage.args[2] + sideCompensation;

					if(gravity > 1400 && ticks - lastJump > 100) {
						var osize = size();
						//blinkValue = 100;
						//playerX += (osize - size()) / 2;

						/*
						obstacles.forEach(function(ob) {
							ob[1] -= 20;
						});
						obDelay += 12;
						*/
						obstacles.forEach(function(ob) {
							ob[1] += 75;
						});

						lastJump = ticks;
					}
					break;
				case "/muse/elements/blink":
					var newState = oscMessage.args[0] == 0;
					if(newState != oldState && changeReady) {
						changeReady = false;
						setHueState(newState);
						//console.log(newState);

						setTimeout(function() {changeReady = true;}, 100);
					}
					//blink |= oscMessage.args[0] == 1;
					//console.log(oscMessage.args[0]);
					break;
				case "/muse/elements/experimental/mellow":
					//console.log(oscMessage.args[0]);
					break;
			}
		});

		udpPort.open();

		var requestId, intervalId;

		function startGame() {
			obstacles = [];
			obDelay = 0;

			playerX = 50;
			speed = 0;
			points = 0;
			lives = 10;
			ticks = 0;
			lastJump = -Infinity;

			requestId = requestAnimationFrame(draw);
			intevalId = setInterval(tick, 16);
		}

		function stopGame() {
			cancelAnimationFrame(requestId);
			clearInterval(intevalId);

			document.body.onclick = function() {
				document.body.onclick = undefined;

				startGame();
			};
		}

		function size() {
			var max = 50;
			var min = 15;
			return (max - min) * (100 - blinkValue) / 100 + min;
		}

		function tick() {
			ticks++;
			// Logic
			if(--obDelay <= 0) {
				obDelay = 12 - speed;
				speed += 0.01;
				obstacles.push([Math.random()*canvas.width, -ob_height, Math.random()<0.4?0:1]);
			}

			playerX += sideways / 60;
			if(playerX < 0) playerX = 0;
			if(playerX > canvas.width - player_width) playerX = canvas.width - player_width;

			obstacles.forEach(function(ob) {
				ob[1] += 2;
				if(playerX < ob[0] + ob_width &&
				  playerX + player_width > ob[0] + ob_width &&
				  510 < ob[1] + ob_height &&
				  player_height + 510 > ob[1]) {
				  ob[1] = canvas.height + ob_height;
//				  console.log("hit");
				  if(ob[2] == 1){
				  	lives--;
				  	//console.log("hit red, " + lives + " lives left.");
					if (lives == 0) {
						stopGame();
					}
				  }
				  else {
					points += 10;
					//console.log("hit green: " + points + " pointss total.");
					}
				}
			});

			obstacles = obstacles.filter(function(ob){
				return (ob[1] < canvas.height)});

			if (blinkValue > 0) blinkValue--;
		}

		var beer_image = new Image();
		var green_beer_image = new Image();
		beer_image.src = 'beer1030.png';
		green_beer_image.src = 'green_beer1030.jpg';
		function draw() {
			requestAnimationFrame(draw);

			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// ----------------------
			ctx.beginPath();
			base_image = new Image();
            base_image.src = 'download.jpg';
            ctx.drawImage(base_image, playerX, 510);
            ctx.closePath();
			// ----------------------
			// Draw
//			ctx.beginPath();
//			ctx.rect(playerX, 510, size(),player_width);
//			ctx.fillStyle = blinkValue > 0 ? "#4C005C" : "blue";
//			ctx.fill();
//			ctx.closePath();


			obstacles.forEach(function(ob) {
				ctx.beginPath();
				if(ob[2] == 1)
				ctx.drawImage(beer_image, ob[0], ob[1]);
				else
				ctx.drawImage(green_beer_image, ob[0], ob[1]);
				ctx.closePath();
//				ctx.beginPath();
//				ctx.rect(ob[0], ob[1], ob_width, ob_height);
//				if(ob[2] == 1)
//					ctx.fillStyle = "#FF0010";
//				else
//					ctx.fillStyle = "#2BCE48";
//				ctx.fill();
//				ctx.closePath();
			});

			ctx.font = '20px sans';
			ctx.fillStyle = 'black';
			ctx.fillText('Lives: ' + lives, 10, 20);
			ctx.fillText('Points: ' + points, 10, 40);
		}
	};
})();
