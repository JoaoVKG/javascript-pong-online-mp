module.exports = function(app) {
    app.get('/:nsp', function(req, res) {
        app.controllers.game.index(app, req, res);
    })
}