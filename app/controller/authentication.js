var render = require(__dirname + '/../../render/'),
    uniqid = require('uniqid');

(function () {

    var self = {

        signup: function(req, res, next)
        {
            if('' === req.body.nick.trim().toString()) {

                res.redirect('/');
                return res.end();
            }

            req.session.nick = req.body.nick;
            req.session.hash = 'undefined' === typeof req.body.room ? uniqid() : req.body.room;
            res.redirect('/room/' + req.session.hash);
            return res.end();
        },

        signout: function(req, res, next)
        {
            req.session.destroy(function(err){

                if(err){

                    console.log(err);

                } else {

                    res.redirect('/');
                    return res.end();
                }
            });
        }

    };

    module.exports = self;

    return self;

}());
