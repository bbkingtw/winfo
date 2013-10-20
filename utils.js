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
	data=$("textarea[id='"+filename+"']").val()
	//alert(sFile)
	//alert(data)
	socket.emit('save_file', {data:data,filename:sFile})
}

function git_file(){
	sFile=$(this).attr('id')
	data=$("textarea[id='"+filename+"']").val()	
	socket.emit('git_file', {data:data,filename:sFile})
}

function show_file_content(data,callback) {		
	filename=data.filename
	data=data.data
	//alert(filename)
	//alert(data)
	iMatch=$("textarea[id='"+filename+"']").length
	//alert('match='+iMatch)

	if (iMatch>0)
		$("textarea[id='"+filename+"']").val(data);	
	else {
		var a=$('<div></div>')

		$('<textarea></texarea>') .attr('id',filename).css('width',"100%").css('height','50%').text(data).appendTo(a)	
                $('<div>'+filename+'</div>').addClass('block').css('color','blue').appendTo(a)
		$('<button>load</button>').attr('id',filename).click(load_file).appendTo(a)
		$('<button>save</button>').attr('id',filename).click(save_file).appendTo(a)
	
		a.prependTo($('body')).css("border","2px solid")	
	}
}


function sNow() {
	function pad_2(number)
	{
     	return (number < 10 ? '0' : '') + number;
	}

	function hours(date)
	{
    	var hours = date.getHours();
    	if(hours > 12)
        	return hours - 12; // Substract 12 hours when 13:00 and more
    	return hours;
	}

	function am_pm(date)
	{
	    if(date.getHours()==0 && date.getMinutes()==0 && date.getSeconds()==0)
    	    return ''; // No AM for MidNight
    	if(date.getHours()==12 && date.getMinutes()==0 && date.getSeconds()==0)
        	return ''; // No PM for Noon
    	if(date.getHours()<12)
	        return ' AM';
    	return ' PM';
	}

	function date_format(date)
	{
     	s=
     		date.getFullYear() + '/'+
     		pad_2(date.getDate()) + '/' +
            pad_2(date.getMonth()+1) + ' ' +
            
            pad_2(hours(date)) + ':' +
            pad_2(date.getMinutes()) + ':' +
            pad_2(date.getSeconds()) 
            
        //alert(s)
        return s
	}

	return date_format(new Date())
}