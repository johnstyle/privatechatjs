var express = require('express'),
    http = require('http'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    io = require('socket.io'),
    app = express(),
    controller = require(__dirname + '/app/controller'),
    dot = require('dot').process({
        global: '_page.render',
        destination: __dirname + '/render/',
        path: (__dirname + '/app/view')
    });

app.use(express.static(__dirname + '/public'));
app.use('/components',  express.static(__dirname + '/public/components'));

app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: '62L8G3Pjo^3z4-B23x92e1O=,xsh86z',
    cookie: {
        secure: true
    }
}));

app.server = app.listen(3000, function () {

    console.log('Express is listening to http://localhost:3000');

    io.listen(app.server).on('connection', function(socket) {

        console.log('room/connection');

        controller.room.listen(socket);
    });

    require(__dirname + '/app/routes')(app, controller);
});
