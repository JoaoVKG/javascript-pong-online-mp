module.exports.index = function(app, req, res) {
    res.render('game', {nsp: req.params.nsp});
}