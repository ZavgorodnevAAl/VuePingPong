const Express = require("express")();
const Http = require("http").Server(Express);
const Socketio = require("socket.io")(Http, {
    cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"]
    }
});

var position = {
    player1pos: 15,
    player2pos: 15
};

var ballPosition = {
    x: 15,
    y: 4,
};

var alpha = 45, speed = 0, width = 20, area_height = 10.3, wins = {p1: 0, p2: 0};

Http.listen(3000, () => {
    console.log("Listening at :3000...");
});

let players = 0;
let player1 = null, player2 = null;

let timerId = setInterval(() => {
    updatePositionBall();
},10);

Socketio.on("connection", socket => {
    players++;
    if (players <= 2){
        if (player1 === null){
            player1 = socket.id;
        }else{
            player2 = socket.id;
        }
    }
    console.log('A user connected: ' + socket.id);
    Socketio.emit("updateId", {'p1': player1, 'p2': player2});
    socket.on("restart", data => {
        restart();
    })
    socket.on("UpdateSpeed", data => {
        speed = data;
    })
    socket.on("move", data => {
        if (socket.id === player1){
            if (data.direction === "left") {
                if (position.player1pos > 0) {
                    position.player1pos--;
                    Socketio.emit("position", position);
                }
            } else if (data.direction === "right") {
                if (position.player1pos < 30) {
                    position.player1pos++;
                    Socketio.emit("position", position);
                }
            }
        }else if (socket.id === player2){
            if (data.direction === "left") {
                if (position.player2pos > 0) {
                    position.player2pos--;
                    Socketio.emit("position", position);
                }
            } else if (data.direction === "right") {
                if (position.player2pos < 30) {
                    position.player2pos++;
                    Socketio.emit("position", position);
                }
            }
        }
    });
    socket.on('send', function (text) {
        let newText = "< " + socket.id + " >" + text;
        if (socket.id === player1){
            newText = "player1: " + text;
        }else if (socket.id === player2){
            newText = "player2: " + text;
        }
        Socketio.emit('receive', newText);
    });
    socket.on('disconnect', function () {
        if (socket.id === player1){
            player1 = null;
        }else if (socket.id === player2){
            player2 = null;
        }
        players--;
        console.log('A user disconnected: ' + socket.id);
    });
});

function updatePositionBall() {
    let newLeft = ballPosition.x + Math.cos(alpha * Math.PI / 180) * speed / 30;
    let newTop = ballPosition.y + Math.sin(alpha * Math.PI / 180) * speed / 30;

    let player_size = 30 * width / (100 - width);
    let ball_size = player_size / 4;

    if (newTop < -0.3){
        wins.p2++;
        restart_position();
        newLeft = 15;
        newTop = 4;
        ballPosition.x = newLeft;
        ballPosition.y = newTop;
        Socketio.emit("ballPosition", ballPosition);
        return;
    }
    if (newTop + ball_size > area_height + 0.3){
        wins.p1++;
        restart_position();
        newLeft = 15;
        newTop = 4;
        ballPosition.x = newLeft;
        ballPosition.y = newTop;
        Socketio.emit("ballPosition", ballPosition);
        return;
    }
    if (newLeft < 0 || newLeft > 30){
        alpha = 180 - alpha;
    }
    Socketio.emit('test1', area_height - ball_size);
    if (newTop + ball_size > area_height){
        if (position.player2pos + player_size > newLeft &&
            position.player2pos < newLeft + ball_size){
            alpha *= -1;
        }
    }
    if (newTop < 0){
        if (position.player1pos + player_size > newLeft &&
            position.player1pos < newLeft + ball_size){
            alpha *= -1;
        }
    }
    //console.log(this.alpha)
    newLeft = ballPosition.x + Math.cos(alpha * Math.PI / 180) * speed / 30;
    newTop = ballPosition.y + Math.sin(alpha * Math.PI / 180) * speed / 30;
    ballPosition.x = newLeft;
    ballPosition.y = newTop;
    Socketio.emit("ballPosition", ballPosition);
}

function restart() {
    position.player1pos = position.player2pos = 15;
    Socketio.emit("position", position);
    player1 = player2 = null;
    Socketio.emit("updateId", {'p1': player1, 'p2': player2});
    players = 0;
    speed = 0;
    ballPosition.x = 15;
    ballPosition.y = 4;
    alpha = 45 + Math.random() * 90 + 180 * (Math.random() > 0.5);
    Socketio.emit("ballPosition", ballPosition);
    wins.p1 = wins.p2 = 0;
    Socketio.emit("WinsUpdate", wins);
    console.log("restart");
}
function restart_position() {
    position.player1pos = position.player2pos = 15;
    Socketio.emit("position", position)
    speed = 0;
    ballPosition.x = 15;
    ballPosition.y = 4;
    alpha = 45 + Math.random() * 90 + 180 * (Math.random() > 0.5);
    Socketio.emit("ballPosition", ballPosition);
    Socketio.emit("WinsUpdate", wins);
}