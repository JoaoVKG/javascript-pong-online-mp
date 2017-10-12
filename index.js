const express = require('express');
const consign = require('consign');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');

const app = express();

app.set('view engine', 'ejs');
app.set('views', './app/views');

app.use(express.static('./app/public'));

app.use(bodyParser.urlencoded({extended: true}));

app.use(expressValidator());

consign({cwd: 'app'})
    .include('routes')
    .then('controllers')
    .into(app);

const server = app.listen(process.env.PORT || 3000, function() {
    console.log("Servidor está online na porta " + (process.env.PORT || 3000));
})

// GAME

var BallServer = {
    xspeed: 0,
    yspeed: 0
}

// GAME

const io = require('socket.io').listen(server);

app.set('io', io);

io.on('connection', function(socket) {
    console.log('user connected');
    var nspPlayers = [];
    
    socket.on('disconnect', function() {
        console.log('user disconnected');
    })

    socket.on('createdGame', function(data) {
        var nsp = io.of('/' + data.nsp);
        nspPlayers[data.nsp] = 0;
        nsp.on('connection', function(socket) {
            if (nspPlayers[data.nsp] < 2) {
                console.log('someone connected at ' + data.nsp);
                nspPlayers[data.nsp]++;
            
                // SERVER RESPONSE TO CLIENT GAME
                socket.on('paddle1MovedUpClient', function() {
                    socket.emit('paddle1MovedUpServer');
                    socket.broadcast.emit('paddle1MovedUpServer');
                })

                socket.on('paddle1MovedDownClient', function() {
                    socket.emit('paddle1MovedDownServer');
                    socket.broadcast.emit('paddle1MovedDownServer');
                })

                socket.on('paddle1StoppedClient', function() {
                    socket.emit('paddle1StoppedServer');
                    socket.broadcast.emit('paddle1StoppedServer');
                })

                socket.on('paddle2MovedUpClient', function() {
                    socket.emit('paddle2MovedUpServer');
                    socket.broadcast.emit('paddle2MovedUpServer');
                })

                socket.on('paddle2MovedDownClient', function() {
                    socket.emit('paddle2MovedDownServer');
                    socket.broadcast.emit('paddle2MovedDownServer');
                })

                socket.on('paddle2StoppedClient', function() {
                    socket.emit('paddle2StoppedServer');
                    socket.broadcast.emit('paddle2StoppedServer');
                })

                socket.on('ballMovementClient', function(data) {
                    socket.broadcast.emit('ballMovementServer', {
                        Ballx: data.BallxServer,
                        Bally: data.BallyServer
                    });
                })

                socket.on('paddle2ScoredClient', function() {
                    socket.broadcast.emit('paddle2ScoredServer')
                })
                
                socket.on('paddle1ScoredClient', function() {
                    socket.broadcast.emit('paddle1ScoredServer')
                })

                socket.on('ballTouchedWallClient', function() {
                    socket.broadcast.emit('ballTouchedWallServer');
                })

                socket.on('ballResetedClient', function() {
                    resetBallServer();
                    socket.emit('ballResetedServer', {
                        BallServer: BallServer
                    })
                })

                if (nspPlayers[data.nsp] == 1) {
                    socket.emit('isAdmin', {
                        admin: true
                    })
                }
                if (nspPlayers[data.nsp] == 2) {
                    resetBallServer();
                    socket.emit('gameStarted', {
                        BallServer: BallServer,
                        canMove: true
                    });
                    socket.broadcast.emit('gameStarted', {
                        BallServer: BallServer,
                        canMove: true
                    });
                }
            } else {
                socket.emit('serverFull');
            }
        });
    })

})

function resetBallServer() {
    BallServer.xspeed = Math.random() < 0.5 ? 5 : -5;
    BallServer.yspeed = Math.random() < 0.5 ? 5 : -5;
    console.log("Function called");
    console.log("xspeed: " + BallServer.xspeed);
    console.log("yspeed: " + BallServer.yspeed);
}