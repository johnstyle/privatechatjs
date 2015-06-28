var render = require(__dirname + '/../../render/');

(function () {

    var self = {

        index: function(req, res, next)
        {
            if('undefined' !== typeof req.session.nick) {

                res.redirect('/room/' + req.session.hash);
                return res.end();
            }

            res.send(render.layout({
                'title': 'Private chat',
                'main': render.roomCreate()
            }));
        }

    };

    module.exports = self;

    return self;

}());
