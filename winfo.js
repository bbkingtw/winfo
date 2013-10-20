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

    /*setInterval(function(){
      socket.emit('append_random_point',1)      
      //news(1);//io.sockets.emit('news',1)
    },3000)*/

    socket.on('reload', function(data){            
      //news(data)
      if (data=='single')
        process.exit();
      else {      
        console.log('prepare reload_all')
        process.send({cmd:'reload_all'});
      }
    })

    socket.on('request_file', function (sFile) {      
      var fs=require('fs')
      var file=__dirname+'/'+sFile;

      fs.readFile(file, 'utf8', function(err,data){
        if (err) {
          console.log('error:'+err)
          return
        }
        socket.emit('data_file', {data:data, filename:sFile})
      })      
    })

    socket.on('save_file', function(obj) {
      sFile=obj.filename
      data=obj.data

      var fs=require('fs')
      var file=__dirname+'/'+sFile;

      fs.writeFile(file, data, function(err){
        if (err) 
          news('file save fail='+err+' on '+sFile);
        else
          news('file save success');
      })      
    })
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
       append_chart_data(obj.chart, obj.key, obj.val, socket);
    });
  });

  return app;
}

function removeWorkerFromListByPID(pid) {
 var counter = -1;
 workerList.forEach(function(worker){
    ++counter;
    if (worker.pid === pid) {
      workerList.splice(counter, 1);
    }
  });
}

function news(s) {
  io.sockets.emit('news',s);
}
function emit(event, value) {
  io.sockets.emit(event,value);
}

function append_chart_data(sChart, sKey, sVal, socket) {
  if (!charts[sChart]) charts[sChart]=[];
  xdata={ chart:sChart, key:sKey, val:sVal };  
  //news(xdata);
  charts[sChart].push(xdata);
  if (socket)
    socket.emit('update_chart',xdata);
  else
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

function removeA(arr) {
    var what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax= arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
}

function kill_all_fork() {
  workers.forEach(function(w){
    w.kill()        
  })  
}

numReqs=0
var cluster = require('cluster'); 
console.log('master is '+process.pid)  
if (1==0){
//if (cluster.isMaster) {  
  console.log('master is '+process.pid)  
  /*
  setInterval(function() {
    console.log("numReqs =", numReqs);
  }, 1000);
*/

  function messageHandler(msg) {
    console.log('===============>'+msg)
    if (msg.cmd && msg.cmd == 'notifyRequest') {
      numReqs += 1;
    }
  }
  
  function append_worker(){
    var worker_process=cluster.fork()
    console.log(worker_process.process.pid+' is callup for service')
    workers.push(worker_process)
    return worker_process
  } 

  workers=[]  
  var numCPUs=require('os').cpus().length; numCPUs=1
  for (var i=0; i<numCPUs; i++) append_worker()

  cluster.on('exit',function(worker,code,signal){    
    removeA(workers, worker)
    console.log('worker '+worker.process.pid+' died('+code+')')
    append_worker()        
  })  
}
else {    
  console.log('====================child '+process.pid+' is going')
  //process.send({ cmd: 'notifyRequest' });
  //process.send({cmd:'reload_all'})

  function messageHandler(msg) {
    console.log(msg)
    if (msg.cmd && msg.cmd == 'reload_all') {
      numReqs += 1;
    }   
  }

  process.on('message',function(msg){
    console.log('c=====================>'+msg);
    process.send({cmd:'reload_all'})
    /*
    news('client')

    console.log('========>'+msg)
    if (msg='reload_all') {
       console.log('reload_all')          
       process.send('reload_all')
    }*/
  })
  /*
  require('http').Server(function(req,res){
    res.writeHead(200)
    //res.end('=>hello\n')    
    //for (var i=1; i<10000; i++) {          }
    s='<meta http-equiv="refresh" content="0; url=/">';
    res.end('<head>'+s+'</head>');//'=>hello\n')
    //res.end('this is '+process.pid)
    console.log('process by '+process.pid)
    process.send({cmd:123})
  }).listen(80)
  */
  PORT=80;
  app=init_http(PORT);

  console.log('listen at '+PORT);

  app.get('/',function(req,res){
    res.render('winfo.jade');          
  });  

  start_udp_server(11111)
  //process.send({ cmd: 'notifyRequest' });
}  