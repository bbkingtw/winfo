var cluster = require('cluster');
var  http = require('http');

var server = http.createServer(function(req, res){
  console.log('%s %s', req.method, req.url);
  var body = 'Hello World';
  res.writeHead(200, { 'Content-Length': body.length });
  res.end(body);
});

cluster.cluster(server)
  .set('workers', 4)
  .use(cluster.logger('logs', 'debug'))
  .use(cluster.debug())
  .listen(3000);