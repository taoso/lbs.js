var app = require('express')();
_redis = require('redis').createClient(6379, '192.168.1.125');
_redis.on("error", function (err) {
    console.log("Redis Error: " + err);
});

_redis.on("connect", function () {
    app.redis = _redis;
});

Location = require('./location').Location;

app.get('/set/:name/:value', function (req, res) {
    if (req.params.name && req.params.value) {
        app.redis.set(req.params.name, req.params.value);
    }
    res.status(201);
    res.send();
});

app.get('/get/:name', function(req, res) {
    if (req.params.name) {
        app.redis.get(req.params.name, function (err, ret) {
            res.send(ret);
        });
    }
});

app.get('/user/:id/location/:lng/:lat', function (req, res) {
    var id = req.params.id;
    var lng = req.params.lng;
    var lat = req.params.lat;

    if (id && lat && lng) {
        l = new Location(id);
        l.setRedis(app.redis);
        l.update(lat, lng);
    }
    res.status(201);
    res.send();
});

app.get('/neighbors/:lng/:lat', function (req, res) {
    var lat = req.params.lat;
    var lat = req.params.lng;

    if (lat && lng) {
        l = new Location(id);
        l.getNeighbors(lng, lat, function (ids) {
            res.send(ids);
        });
    }
});

app.listen(3000);
