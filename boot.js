
 function exec_cmd(sExec) {
    var cp = require('child_process')  
    var node=cp.exec('node winfo.js')
    console.log('[exec_cmd]======>'+node.pid+'==>'+sExec);

    node.stdout.on('data',function(data){
      console.log('output:'+node.pid+'===>'+data);
    });
    node.stderr.on('data',function(data){
      console.log('stderr:'+node.pid+'===>'+data);
    });
    node.on('exit',function(code){
      console.log('[dead_cmd]'+node.pid+'===>'+sExec);
      exec_cmd(sExec);//process.exit;  
    });
  }; 

console.log('main pd=>'+process.pid)
exec_cmd('node winfo.js')