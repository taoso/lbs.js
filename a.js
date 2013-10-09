var cluster = require('cluster');
var app = require('./app.js').app;
var numCPUs = 2;

if (cluster.isMaster) {
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', function(worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
    });
} else {
    app.listen(3000, '0.0.0.0');
}
