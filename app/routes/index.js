module.exports = function(app) {
    app.get('/', function(req, res) {
        app.controllers.index.index(app, req, res);
    })
}