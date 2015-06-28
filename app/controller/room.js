var render = require(__dirname + '/../../render/'),
    ent = require('ent'),
    striptags = require('striptags'),
    MongoClient = require('mongodb').MongoClient;

(function () {

    var self = {

        socket: {},
        req: {},

        index: function(req, res, next)
        {
            console.log('room/index');

            if('undefined' === typeof req.session.nick) {

                if('undefined' !== typeof req.params.hash) {

                    res.send(render.layout({
                        'title': 'Join room - Private chat',
                        'main': render.roomJoin({
                            'room': req.params.hash
                        })
                    }));

                } else {

                    res.redirect('/');
                }

                return res.end();
            }

            if('undefined' !== typeof req.params.hash) {

                req.session.hash = req.params.hash;
            }

            self.req = req;

            res.send(render.layout({
                'title': 'Room - Private chat',
                'menu': [
                    {'link': '/signout', 'name': 'Signout'}
                ],
                'main': render.room(),
                'users': [
                    {'nick': req.session.nick}
                ]
            }));
        },

        redirect: function(req, res, next)
        {
            if('undefined' !== typeof req.session.nick) {

                res.redirect('/room/' + req.session.hash);
                return res.end();

            } else {

                res.redirect('/');
                return res.end();
            }
        },

        listen: function(socket)
        {
            if('undefined' === typeof self.req.session
                || 'undefined' === typeof self.req.session.hash) {

                return;
            }

            self.socket = socket;
            console.log('room/listen');

            self.socket.join(self.req.session.hash);
            console.log('room/'+self.req.session.hash+'/'+self.req.session.nick+'/join');

            socket.on('disconnect', function(){

                self.dbUpdate('Left chat');
            });

            socket.on('message', function(msg){

                if(!msg) {

                    return;
                }

                msg = striptags(msg);
                msg = ent.encode(msg);
                msg = msg.replace(new RegExp('(https?://[^\\s]+(?:jpe?g|png|gif|bmp))', 'gi'), '<a href="$1" target="_blank"><img src="$1" alt="" height="200"/></a>');
                msg = msg.replace(new RegExp('(https?://[^\\s]+(?:webm))', 'gi'), '<a href="$1" target="_blank"><video autoplay loop src="$1" height="200"></video></a>');

                self.dbUpdate(msg);
            });
        },

        dbHistory: function(callback)
        {
            // Connect to the db
            MongoClient.connect("mongodb://localhost:27017/privatechatjs", function(err, db) {

                db.collection('message').find({
                    room: self.req.session.hash
                }).sort({'date':1}).toArray(function(err, items) {

                    for(var i = 0; i < items.length; i++) {

                        console.log('history');
                        self.socket.client.server.emit('message', '<span class="nickname">' + items[i].nickname + '</span><span class="date">' + (new Date(items[i].date)).toUTCString() + '</span><span class="message">(history) ' + items[i].text + '</span>', { for: 'everyone' });
                    }

                    if('function' === typeof callback) {

                        console.log('history callback');
                        callback();
                    }
                });
            });
        },

        dbUpdate: function(msg)
        {
            self.socket.client.server.emit('message', '<span class="nickname">' + self.req.session.nick + '</span><span class="date">' + (new Date()).toUTCString() + '</span><span class="message">(live) ' + msg + '</span>', { for: 'everyone' });
            console.log('room/'+self.req.session.hash+'/'+self.req.session.nick+'/message: ' + msg);

            // Connect to the db
            MongoClient.connect("mongodb://localhost:27017/privatechatjs", function(err, db) {

                db.collection('message').insertOne({
                    'room': self.req.session.hash,
                    'nickname': self.req.session.nick,
                    'date': (new Date()).toISOString(),
                    'text': msg
                });
            });
        }

    };

    module.exports = self;

    return self;

}());
