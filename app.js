var app = require('express')();
_redis = require('redis').createClient(6379, '127.0.0.1');
_redis.on("error", function (err) {
    //console.log("Redis Error: " + err);
});

_redis.on("connect", function () {
    app.redis = _redis;
});

Location = require('./location').Location;

app.get('/user/:id/location/:lat/:lng', function (req, res) {
    var id = req.params.id;
    var lat = req.params.lat;
    var lng = req.params.lng;

    if (id && lat && lng) {
        l = new Location(id);
        l.setRedis(app.redis);
        l.update(id, lat, lng);
    }

    res.status(201);
    res.send();
});

app.get('/neighbors/:lat/:lng', function (req, res) {
    var lat = req.params.lat;
    var lng = req.params.lng;

    if (lat && lng) {
        l = new Location();
        l.setRedis(app.redis);
        l.getNeighbors(lat, lng, function (ids) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(ids));
        });
    }
});

//app.listen(3000, '0.0.0.0');
exports.app = app;
