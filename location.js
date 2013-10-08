var Location = (function () {
    _location = function (id, lat, lng) {
        this.id = id;
        this.lat = lat;
        this.lng = lng;

        return this;
    };

    _location.prototype = {
        keyLen: 6,
    };

    _location.prototype.getKey = function (geohash) {
        return 'loc:' + geohash.substr(0, this.keyLen);
    };

    _location.prototype.getInfoKey = function (id) {
        return 'loc:info:' + id;
    };

    _location.prototype.setRedis = function (redis) {
        _location.prototype.redis = redis;
    };

    var geohash = require('geohash').GeoHash;

    _location.prototype.update = function (id, lng, lat) {
        self = this;
        self.redis.hgetall(self.getInfoKey(id), function (err, obj) {
            if (obj && obj.oldLng && obj.oldLat) {
                hash = geohash.encodeGeoHash(obj.oldLat, obj.oldLng);
                self.redis.srem(self.getKey(hash), id);
            }

            self.redis.hmset(self.getInfoKey(id), 'lat', lat, 'lng', lng);

            var hash = geohash.encodeGeoHash(lng, lat);
            self.redis.sadd(self.getKey(hash), id);
        });
    };

    _location.prototype.getNeighbors = function (lat, lng, callback) {
        var hash = geohash.encodeGeoHash(lat, lng).substr(0, this.KeyLen);
        var ids = []
        self = this;
        this.redis.smembers(this.getKey(hash), function (error, result) {
            if (result) {
                ids = result;
            }
            var n = geohash.calculateAdjacent(hash, 'top');
            [ 'right', 'bottom', 'bottom', 'left', 'left', 'top', 'top'
            ].forEach(function (e, i, a) {
                n = geohash.calculateAdjacent(n, e);
                self.redis.smembers(self.getKey(n), function (error, result) {
                    if (result) {
                        ids = ids.concat(result);
                    }
                    if (i === a.length - 1) {
                        return callback(ids);
                    }
                });
            });
        });
    };

    return _location;
})();

if (typeof exports == "undefined") { exports = {}; }

exports.Location = Location;
