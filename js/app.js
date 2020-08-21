$(document).on('click', '#show_databases', function(e){
	$('#sec_select_db').addClass('d-none');
	$('#sec_select_table').addClass('d-none');
	$('#sec_print_button').addClass('d-none');
	$('#sec_table_description').addClass('d-none');
	var data = {
		'db_username': $('#db_username').val(),
		'db_password': $('#db_password').val(),
		'action': 'show_databases',
	};
	$.ajax({
		type:'post',
		url: 'php/server.php',
		data:data,
		success: function(res){
			if(res.type == 'error'){
				alert(res.data);
			}else{
				var html = '<option>Please Select Database</option>';
				$.each(res.data, function(index, value){
					html += '<option value="'+value+'">'+value+'</option>';
				});
				$('#db_name').html(html);
				$('#db_username').prop('disabled', true);
				$('#db_password').prop('disabled', true);
				$('#show_databases').prop('disabled', true);
				$('#sec_select_db').removeClass('d-none');
			}
		}
	});
});
$(document).on('click', '#show_tables', function(e){
	$('#sec_select_table').addClass('d-none');
	$('#sec_print_button').addClass('d-none');
	$('#sec_table_description').addClass('d-none');
	var data = {
		'db_username': $('#db_username').val(),
		'db_password': $('#db_password').val(),
		'db_name': $('#db_name').val(),
		'action': 'show_tables',
	};
	$.ajax({
		type:'post',
		url: 'php/server.php',
		data:data,
		success: function(res){
			if(res.type == 'error'){
				alert(res.data);
			}else{
				var html = '<option>Please Select Table</option>';
				$.each(res.data, function(index, value){
					html += '<option value="'+value+'">'+value+'</option>';
				});
				$('#table_name').html(html);
				$('#db_name').prop('disabled', true);
				$('#show_tables').prop('disabled', true);
				$('#sec_select_table').removeClass('d-none');
			}
		}
	});
});

function generate_tables(jsonData){
	var table_description = jsonData.description;
	var table_indexes = jsonData.indexes;
	var table_pull_key = jsonData.foreign_keys.pull_from;
	var table_push_key = jsonData.foreign_keys.push_to;
	//generate description
	var html = '<div class="col-12">\
                    <h4 class="custom_head">Table Description</h4>\
                    <table class="table table-custom w-100">\
                        <thead>\
                            <tr>\
                                <th>Field</th>\
                                <th>Type</th>\
                                <th>Null</th>\
                                <th>Key</th>\
                                <th>Default</th>\
                                <th>Extra</th>\
                            </tr>\
                        </thead>\
                        <tbody>';
    $.each(table_description, function(index, value){
    	html += '<tr>\
                    <td>'+value.Field+'</td>\
                    <td>'+value.Type+'</td>\
                    <td>'+value.Field+'</td>\
                    <td>'+value.Key+'</td>\
                    <td>'+value.Default+'</td>\
                    <td>'+value.Extra+'</td>\
                </tr>';
	});
                            
	html += '</tbody>\
        </table>\
    </div>';
    if(table_indexes != ''){
	    // generate index table
	    html += '<div class="col-12">\
	                    <h4 class="custom_head">Table Indexes</h4>\
	                    <table class="table table-custom w-100">\
	                        <thead>\
	                            <tr>\
	                                <th>Key Name</th>\
	                                <th>Column Names</th>\
	                                <th>Index Type</th>\
	                                <th>Unique</th>\
	                                <th>Null</th>\
	                            </tr>\
	                        </thead>\
	                        <tbody>';
	    $.each(table_indexes, function(index, value){
	    	html += '<tr>\
		                <td>'+value.Key_name+'</td>\
		                <td>'+value.Column_names+'</td>\
		                <td>'+value.Index_type+'</td>\
		                <td>'+value.Unique+'</td>\
		                <td>'+value.Null+'</td>\
		            </tr>';
	    });
	                            
	    html += '</tbody>\
	    	</table>\
	    </div>';
	}
	if(table_pull_key != ''){
	    // generate foreign keys parent
	    html += '<div class="col-12">\
	                    <h4 class="custom_head">Foreign Keys (parent)</h4>\
	                    <table class="table table-custom w-100">\
	                        <thead>\
	                            <tr>\
	                                <th>Constraint Name</th>\
	                                <th>Column Name</th>\
	                                <th>Referenced Table Name</th>\
	                                <th>Referenced Column Name</th>\
	                            </tr>\
	                        </thead>\
	                        <tbody>';
	    $.each(table_pull_key, function(index, value){
	    	html += '<tr>\
		                <td>'+value.CONSTRAINT_NAME+'</td>\
		                <td>'+value.COLUMN_NAME+'</td>\
		                <td>'+value.REFERENCED_TABLE_NAME+'</td>\
		                <td>'+value.REFERENCED_COLUMN_NAME+'</td>\
		            </tr>';
	    });
	                            
	    html += '</tbody>\
	    	</table>\
	    </div>';
	}
	if(table_push_key != ''){
	    // generate foreign keys childs
	    html += '<div class="col-12">\
	                    <h4 class="custom_head">Foreign Keys (child)</h4>\
	                    <table class="table table-custom w-100">\
	                        <thead>\
	                            <tr>\
	                                <th>Constraint Name</th>\
	                                <th>Referenced Column Name</th>\
	                                <th>Table Name</th>\
	                                <th>Column Name</th>\
	                            </tr>\
	                        </thead>\
	                        <tbody>';
	    $.each(table_push_key, function(index, value){
	    	html += '<tr>\
		                <td>'+value.CONSTRAINT_NAME+'</td>\
		                <td>'+value.REFERENCED_COLUMN_NAME+'</td>\
		                <td>'+value.TABLE_NAME+'</td>\
		                <td>'+value.COLUMN_NAME+'</td>\
		            </tr>';
	    });
	                            
	    html += '</tbody>\
	    	</table>\
	    </div>';
	}
	return html;
}
$(document).on('click', '#describe_table', function(e){
	$('#sec_print_button').addClass('d-none');
	$('#sec_table_description').addClass('d-none');
	var data = {
		'db_username': $('#db_username').val(),
		'db_password': $('#db_password').val(),
		'db_name': $('#db_name').val(),
		'table_name': $('#table_name').val(),
		'action': 'describe_table',
	};
	$.ajax({
		type:'post',
		url: 'php/server.php',
		data:data,
		success: function(res){
			if(res.type == 'error'){
				alert(res.data);
			}else{
				var html = '<div class="col-12">\
                    <div class="headings">\
                        <h4>Description of "'+$('#table_name').val()+'"</h4>\
                    </div>\
                </div>';
				html += generate_tables(res.data);
				$('#sec_table_description').html(html);
				$('#sec_print_button').removeClass('d-none');
				$('#sec_table_description').removeClass('d-none');
			}
		}
	});
});
$(document).on('click', '#generate_all_table_description', function(e){
	$('#sec_print_button').addClass('d-none');
	$('#sec_table_description').addClass('d-none');
	var data = {
		'db_username': $('#db_username').val(),
		'db_password': $('#db_password').val(),
		'db_name': $('#db_name').val(),
		'action': 'generate_all_table_description',
	};
	$.ajax({
		type:'post',
		url: 'php/server.php',
		data:data,
		success: function(res){
			if(res.type == 'error'){
				alert(res.data);
			}else{
				var html = '';
				var length = res.data.length;
				$.each(res.data, function(index, value){
					html += '<div class="col-12">\
	                    <div class="headings">\
	                        <h4>Description of "'+value.table_name+'"</h4>\
	                    </div>\
	                </div>';
					html += generate_tables(value);
					if (index !== (length - 1)) {
						html += '<div class="pagebreak"></div>';
					}
				});
				$('#sec_table_description').html(html);
				$('#sec_print_button').removeClass('d-none');
				$('#sec_table_description').removeClass('d-none');
			}
		}
	});
});