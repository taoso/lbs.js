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

    _location.prototype.update = function (id, lat, lng) {
        self = this;
        self.redis.hgetall(self.getInfoKey(id), function (err, obj) {
            if (obj && obj.lat && obj.lng) {
                var hash = geohash.encodeGeoHash(obj.lat, obj.lng);
                self.redis.srem(self.getKey(hash), id);
            }

            self.redis.hmset(self.getInfoKey(id), 'lat', lat, 'lng', lng);

            var hash = geohash.encodeGeoHash(lat, lng);
            self.redis.sadd(self.getKey(hash), id);
        });
    };

    _location.prototype.getNeighbors = function (lat, lng, callback) {
        self = this;

        var hash = geohash.encodeGeoHash(lat, lng).substr(0, this.keyLen);

        var multi = self.redis.multi();
        multi.smembers(self.getKey(hash));

        ['top', 'right', 'bottom', 'bottom',
            'left', 'left', 'top', 'top'].forEach(function (d, i, a) {
                hash = geohash.calculateAdjacent(hash, d);
                multi.smembers(self.getKey(hash));
            });

        multi.exec(function (error, replies) {
            var ids = [];
            if (replies) {
                replies.forEach(function (e, i, a) {
                    if (e) {
                        ids = ids.concat(e);
                    }
                });
            }

            var _ids = {};
            var multi = self.redis.multi();
            ids.forEach(function (id, i, a) {
                if (!_ids[id]) {
                    _ids[id] = true;
                    multi.hgetall(self.getInfoKey(id), function (error, result) {
                        if (result) {
                            result['id'] = id;
                            return result;
                        }
                    });
                }
            });

            multi.exec(function (error, replies) {
                return callback(replies);
            });
        });
    };

    return _location;
})();

if (typeof exports == "undefined") { exports = {}; }

exports.Location = Location;
