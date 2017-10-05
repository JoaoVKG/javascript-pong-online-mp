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
                socket.on('click', function() {
                    socket.broadcast.emit('clicked');
                })
                if (nspPlayers[data.nsp] == 2) {

                }
            } else {
                socket.emit('serverFull');
            }
        });
    })

})