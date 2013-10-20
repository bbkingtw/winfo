var cluster = require('cluster')

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

numReqs=0
if (cluster.isMaster) {
  workers=[]

  function append_worker(sExec){
     var x=cluster.fork();
     x.send({cmd:sExec})
     workers.push(x);
  }

  function messageHandler(msg) {
    console.log(msg)
    if (msg.cmd && msg.cmd == 'plus') {
      numReqs += 1;
    }   
  }

  cluster.on('exit',function(worker,code,signal){    
    removeA(workers, worker)
    console.log('worker '+worker.process.pid+' died('+code+')')
    append_worker()        
  })  

  console.log('boot='+process.pid)
  append_worker('node winfo.js')
}
else {
  process.on('message',function(data){
    var sExec=data.cmd;
    exec_cmd(sExec)
  })

  function exec_cmd(sExec) {
    var cp = require('child_process');  
    var node=cp.exec('node winfo.js')
    console.log('exec======>'+node.pid+'==>'+sExec);

    node.stdout.on('data',function(data){
      console.log(node.pid+'===>'+data);
    });
    node.stderr.on('data',function(data){
      console.log('stderr:'+node.pid+'===>'+data);
    });
    node.on('exit',function(code){
      exec_cmd(sExec);//process.exit;  
    });
  }; 

  
  
/*
  msg=''

  process.on('message',function(data){
    msg=data.cmd
  });

  setInterval(
    function(data){
      console.log(process.pid+'==>'+msg+'='+numReqs);
      process.send({cmd:'plus'})
    }, 1000
  )
*/
}
