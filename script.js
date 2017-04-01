(function() {

	window.onload = function() {
		var updown, gravity, sideways = 0,
			blink = false;

		var udpPort = new osc.UDPPort({
			localAddress: "0.0.0.0",
			localPort: 5000
		});


		var canvas = document.getElementById("cv");
		var ctx = canvas.getContext('2d');
		var playerX = 0;


		udpPort.on("ready", function() {
			console.log("ready");
		});

		udpPort.on("message", function(oscMessage, timeTag, info) {
			switch(oscMessage.address) {
				case "/muse/acc":
					updown = oscMessage.args[0];
					gravity = oscMessage.args[1];
					sideways = oscMessage.args[2] - 150;

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

			playerX += sideways / 60;
			if(playerX < 0) playerX = 0;
			if(playerX > canvas.width - 50) playerX = canvas.width - 50;

			ctx.beginPath();
			ctx.rect(playerX, 510, 50, 50);
			ctx.fillStyle = blink ? "#00FF00" : "#FF0000";
			ctx.fill();
			ctx.closePath();

			blink = false;
		}, 16);
	};
})();
