var host = window.location.host;
var socket = io(host);
$('.createGame').click(function() {
    var randomid = Math.random().toString(36).substring(7); 
    socket.emit('createdGame', {
        nsp: randomid
    })
    window.location.href = '/' + randomid;
})