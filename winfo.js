var remote_server = '127.0.0.1';

charts=[];

function init_http(PORT) {
  var clients=[];

  var express=require('express');
  var app=express();
  //var http = require('http').createServer(express);

  io = require('socket.io').listen(app.listen(PORT));
  io.sockets.on('connection', function (socket) {
    clients.push(socket);
    //socket.emit('news','ok');
  });   
  
  
  //var io = require('socket.io').listen(http);//app);
  app.use("/", express.static(__dirname));
  app.set('views', __dirname + '/');
  app.set('view engine','jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.errorHandler());  

  //app.listen(PORT);

  io.sockets.on('disconncet', function(socket) {
    console.log('remove '+socket);
    clients.delete(socket);
  });

  io.sockets.on('connection', function (socket) {
    clients.push(socket);

    socket.on('request_chart', function (data) {
       //socket.emit('news',data);
       switch(data) {
          case '1': socket.emit('response_chart','you request chart1'); break;
          case '2': socket.emit('response_chart','you request chart2'); break;
          default: socket.emit('error','you send an unknow chart id='+data);
       }	
    }); 

    socket.on('request_udp', function(data) {
       udp_out(data.server, data.port, data.udp_data);
    });

    socket.on('request_tcp', function(data) {
       tcp_out(data.server, data.port, data.udp_data);
    });

    socket.on('append_chart', function(data){
       append_chart(data);
    });

    socket.on('append_chart_data', function(obj){
       console.log('append_chart_data'+JSON.stringify(obj));
       append_chart_data(obj.chart, obj.key, obj.val);
    });
  });

  return app;
}

function news(s) {
  io.sockets.emit('news',s);
}
function emit(event, value) {
  io.sockets.emit(event,value);
}

function append_chart_data(sChart, sKey, sVal) {
  if (!charts[sChart]) charts[sChart]=[];
  xdata={ chart:sChart, key:sKey, val:sVal };  
  //news(xdata);
  charts[sChart].push(xdata);
  emit('update_chart',xdata);//charts[sChart]);//xdata);
}

function notify_chart(obj) {
  io.sockets.emit('update_chart',obj);
}

function process_chart_data(obj){
  if (!obj.chart) obj.chart='default';
  notify_chart(obj)
}

function start_udp_server(PORT) {
  HOST='127.0.0.1';

  var dgram = require('dgram');
  var server = dgram.createSocket('udp4');

  server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
  });

  server.on('message', function (message, remote) {     
     try {
       json=JSON.parse(message);
       if (json.request=='append_chart_data') {        
          obj=json.parameter;
          append_chart_data(obj.chart, obj.key, obj.val);
       }
       else {
          console.log('do now know how to process '+message);
       }
     }
     catch(e) {
       console.log('[udp except:'+e.message+']==>'+remote.address + ':' + remote.port +' - ' + message);
     }
  });

  server.on('chart_data', function(data) {
    process_chart_data(data);       
  });

  server.bind(PORT, HOST);
}

function udp_out(HOST, PORT, snote) {
  var dgram = require('dgram');
  var message = new Buffer(snote);//'My KungFu is Good!');

  var client = dgram.createSocket('udp4');
  client.send(message, 0, message.length, PORT, HOST, function(err, bytes) {
    if (err) throw err;
    console.log('UDP message sent to ' + HOST +':'+ PORT);
    client.close();
  });
}

function tcp_out(HOST, PORT, data) {
  var net = require('net');
  console.log('[tcp]==>'+data+' on host='+HOST+', port='+PORT);

  var client = new net.Socket();
  client.connect(PORT, HOST, function() {
    console.log('[tcp]==>CONNECTED TO: ' + HOST + ':' + PORT);
    // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client 
    //client.write('get /\n\n');//'I am Chuck Norris!');
    client.write(data + '\n\n');//'I am Chuck Norris!');
  });

  // Add a 'data' event handler for the client socket
  // data is what the server sent to this socket
  client.on('data', function(data) {    
    console.log('[tcp]==>DATA: ' + data);
    // Close the client socket completely
    client.destroy();    
    news(data);
  });

  // Add a 'close' event handler for the client socket
  client.on('close', function() {
    console.log('[tcp]==>Connection closed');
  });
}

app=init_http(3000);

app.get('/',function(req,res){
  res.render('winfo.jade');          
});

start_udp_server(11111);
udp_out(remote_server, '11111', 'test');