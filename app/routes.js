(function () {

    var self = function (app, controller) {

        app.get('/', controller.home.index);
        app.get('/room', controller.room.redirect);
        app.get('/room/:hash', controller.room.index);
        app.post('/signup', controller.authentication.signup);
        app.get('/signout', controller.authentication.signout);
    };

    module.exports = self;

    return self;

}());
