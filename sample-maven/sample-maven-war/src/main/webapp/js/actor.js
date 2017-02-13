/*
 * Actor Tab - Started 
 */
function updateActorSelectAllCtrl(table, chkbox_select_all, removeBtn) {
	var $table             = table.table().node();
	var $chkbox_all        = $('tbody input[type="checkbox"]', $table);
	var $chkbox_checked    = $('tbody input[type="checkbox"]:checked', $table);
	if($chkbox_checked.length === 0) {
		$(chkbox_select_all).prop('checked', false);
		if(removeBtn != null) {
			$(removeBtn).prop('disabled', true);
		}
	} else if ($chkbox_checked.length === $chkbox_all.length) {
		$(chkbox_select_all).prop('checked', true);
		if(removeBtn != null) {
			$(removeBtn).prop('disabled', false);
		}
	} else {
		$(chkbox_select_all).prop('checked', false);
		if(removeBtn != null) {
			$(removeBtn).prop('disabled', false);
		}
	}
}

var actor_data = [], edit_actor = 'true';
var actors_table = $("#actors-table").DataTable({
	aaData : actor_data,
	dom: "t",
	destroy: true,
	ordering: false,
	autoWidth: false,
	columns: [
     	    { data : "actorId", width : "6%", className: "dt-center"},
     	    { data : "firstName", width : "47%", className: "dt-head-center"}, 
            { data : "lastName", width : "47%", className: "dt-head-center"},
	],
	columnDefs: [
		{
			targets: 0,
	        className: "dt-center",
	        render: function ( data, type, row ) {
	        	var checkbox;
	        	if(edit_actor === 'true') {
	        		checkbox = "<input type='checkbox'>";
	        	} else {
	        		checkbox = "<input type='checkbox' disabled>";
	        	}
	            return checkbox;
	         }
		}
    ]
});

$('#add-actor').click(function() {
	var firstName = $.trim($('#firstname').val()), lastName = $.trim($('#lastname').val());
	var error = $('.actor-error-msg .col-sm-4');
	if(firstName && lastName) {
		var data = {'actorId': 0, 'firstName': firstName, 'lastName': lastName};
		actor_data.push(data);
		actors_table.clear();
		actors_table.rows.add(actor_data).draw();
		
		error.html("");
		$('#firstname').val("").focus();
		$('#lastname').val("");
		if(actor_data.length === 3) {
			$(this).prop('disabled', true);
		}
		$('#actors').val(JSON.stringify(actor_data)).trigger('change');
	} else if(!firstName && lastName){
		error.html("First Name is required.");
	} else if(firstName && !lastName){
		error.html("Last Name is required.");
	} else {
		error.html("First Name & Last Name is required.");
	}
});

$('#remove-actor').click(function() {
	var row_selected    = $('tbody tr.selected', '#actors-table');
	$.each(row_selected, function(index, row){
		var data = actors_table.row(row).data();
		var remove_index = $.inArray(data, actor_data);
		actor_data.splice(remove_index, 1);
	});
	actors_table.clear();
	actors_table.rows.add(actor_data).draw();
	$('#add-actor').prop('disabled', false);
	$('#actors').val(JSON.stringify(actor_data));
});

$('#actors-table tbody').on('click', 'input[type="checkbox"]', function(e) {
	var $row = $(this).closest('tr');
		
	if(this.checked){
		$row.addClass('selected');
	} else {
		$row.removeClass('selected');
	}
	
	updateActorSelectAllCtrl(actors_table, '#actor-select-all', '#remove-actor');
	e.stopPropagation();
});

$('#actors-table').on('click', 'tbody td:first-child, thead th:first-child', function(e) {
	$(this).parent().find('input[type="checkbox"]').trigger('click');
});

$('thead input[name="select_all"]', actors_table.table().container()).on('click', function(e) {
	if(this.checked){
		$('#actors-table tbody input[type="checkbox"]:not(:checked)').trigger('click');
	} else {
		$('#actors-table tbody input[type="checkbox"]:checked').trigger('click');
	}

	e.stopPropagation();
});

actors_table.on('draw', function() {
	updateActorSelectAllCtrl(actors_table, '#actor-select-all', '#remove-actor');
});

function populateActorsTable(actors, isEditable) {
	edit_actor = isEditable;
	var rows = $.parseJSON(actors);
	$.each(rows, function(index, row){
		actor_data.push(row);
	});
	actors_table.clear();
	actors_table.rows.add(actor_data).draw(false);
	if(actor_data.length === 3) {
		$('#add-actor').prop('disabled', true);
	}
}
/*
 * Actor Tab - Ended 
 */
