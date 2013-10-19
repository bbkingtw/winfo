iFiles=0

function file(x) {
	return 'files'+x
}

function load_file() {
	sFile=$(this).attr('id');
	socket.emit('request_file',sFile)
}

function save_file(){
	sFile=$(this).attr('id')
	data=$('textarea#'+filename).text()
	alert(data)
	socket.emit('save_file', {data:data,filename:sFile})
}

function show_file_content(data,callback) {		
	filename=data.filename
	data=data.data
	//alert(filename)
	//alert(data)

	if ($('#'+filename).length) 
		$('textarea#'+filename).text(data);	
	else {
		var a=$('<div></div>')

		$('<textarea></texarea>') .attr('id',filename).css('width',"100%").css('height','50%').text(data).appendTo(a)	
		$('<button>load</button>').attr('id',filename).click(load_file).appendTo(a)
		$('<button>save</button>').attr('id',filename).click(save_file).appendTo(a)
	
		a.prependTo($('body')).css("border","2px solid")	
	}
}


