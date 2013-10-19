

wtable={	
	'prepare_json': prepare_json,
	'prepare_grid': prepare_grid	
}

function render_table(){
	alert(charts.length)
    charts.forEach(
    	function() {
    		alert($(this))
    		//$('#'+sChart).append($('<div>').text('k='+d.key+',val='+d.val));      
    	}
    	//alert(i)    
    )
}

function prepare_json(obj, callback) {
	var ar=[]
	obj.each(function(data){						
		ar.push({
			'id' :$(this).attr('id'),
			'val':Math.ceil(Math.random(5)*10)
		})			
	})
	callback(ar)
}

function prepare_grid(obj, callback){	
  	prepare_json(obj, function(rows){
		var sRows=''
		var sHead=''
		var iRows=0		

		rows.forEach(function(cols){	
			var sRow='';		

			for (var key in cols) {	
				if (iRows==0)
					sRow=sRow+'<td>'+key+'</td>'
				else
					sRow=sRow+'<td>'+cols[key]+'</td>'				
			}		
		
			if (iRows++==0)
				sHead='<tr>'+sRow+'</tr>';
			else
				sRows=sRows+'<tr>'+sRow+'</tr>'	
		});

		s='<table>'+
			'<thead>'+sHead+'</thead>'+
			'<tbody>'+sRows+'</tbody>'+
			'</table>'

		//alert(s)

		callback(s)
	});
};
