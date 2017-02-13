function updateCategorySelectAllCtrl(table, chkbox_select_all, removeBtn) {
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

var categories = [], category_ids = [], edit_category = 'true';

var category_table = $("#categories-table").DataTable({
	dom: "t",
	destroy: true,
	ordering: false,
	paging: false,
	scrollY: "468px",
	scrollCollapse: true,
	columns: [
     	    { data : "id", width : "5%", className: "dt-center"},
     	    { data : "provider", width : "25%", className: "dt-head-center"},
            { data : "text", width : "70%", className: "dt-head-center"},
	],
	columnDefs: [
		{
			targets: 0,
	        className: "dt-center",
	        render: function ( data, type, row ) {
	        	var checkbox;
	        	if(edit_category === 'true') {
	        		checkbox = "<input type='checkbox'>";
	        	} else {
	        		checkbox = "<input type='checkbox' disabled>";
	        	}
	            return checkbox;
	        }
		}
    ]
});

$('a[href="#category-tab"]').on('shown.bs.tab', function (e) {
	category_table.columns.adjust();
});

$('#provGrpName').change(function() {
	populateCategoryTable($(this), null, edit_category);
});

function populateCategoryTable(provGrpName, categoryIds, isEditable) {
	var $this = provGrpName;
	
	edit_category = isEditable;
	
	if($.trim($this.val())) {
		$.ajax({
		    url: 'categories/'+$this.val(),
		    type: 'GET',
		    success: function(response) {
		    	categories = response;
		    	
		    	//Populate first dropdown on success of ajax
		    	var providers = $this.find(':selected').data('providers');
		    	$.each(providers, function(index, row) {
		    		$('<option>').val(row).text(row).appendTo('#provider-name');
		    	});
		    	
		    	$('.selectpicker').selectpicker('refresh');
		    	
		    	if(categoryIds !== null) {
		    		var category_arr = categoryIds.split(',')
	    			$(category_arr).each( function ( d, j ) {
	    				category_ids.push(Number(j));
	    			});
		    		$.each(categories, function(index, row) {
		    			if($.inArray(row.id, category_ids) !== -1){
		    				category_table.row.add(row).draw();
		    			}
		    		});
		    	}
		    },
		    error: function(e) {
		    	resetCategoriesTab();
		    }
		});
	} else {
		resetCategoriesTab();
	}
}

function populateAssetCategoryTable(providerName, categoryIds, categories, isEditable) {	
	edit_category = isEditable;
	provider_ctg = $('#provider-categories');
	
	$('<option>').val(providerName).text(providerName).appendTo('#provider-name');
	$('select[id=provider-name]').val(providerName);
	$('#provider-name').prop("disabled", true);
	$('.selectpicker').selectpicker('refresh');
	
	if(categoryIds !== null) {
		var category_arr = categoryIds.split(',')
		$(category_arr).each( function ( d, j ) {
			category_ids.push(Number(j));
		});
		$.each(categories, function(index, row) {
			if($.inArray(row.id, category_ids) !== -1){
				category_table.row.add(row).draw();
			}
		});
		$.each(categories, function(index, row) {
			$('<option>').val(JSON.stringify(row)).text(row.text).appendTo(provider_ctg);
			$('.selectpicker').selectpicker('refresh');
		});
	}
}

function resetCategoriesTab() {
	var provider_name = $('#provider-name'), provider_ctg = $('#provider-categories');
	provider_name.empty();
	provider_ctg.empty();
	$('<option>').val("").text(" ").appendTo(provider_name);
	$('<option>').val("").text(" ").appendTo(provider_ctg);
	$('.selectpicker').selectpicker('refresh');
	categories = [], category_ids = [];
	category_table.clear().draw();
}

$('#provider-name').change(function() {
	var provider = $(this).val(), provider_ctg = $('#provider-categories');
	
	provider_ctg.empty();
	$('<option>').val("").text(" ").appendTo(provider_ctg);
	if($.trim($(this).val())) {
		$.each(categories, function(index, row) {
			if(provider === row.provider) {
				$('<option>').val(JSON.stringify(row)).text(row.text).appendTo(provider_ctg);
			}
		});
	} else {
		$('#add-category').prop('disabled', true);
	}
	
	$('.selectpicker').selectpicker('refresh');
});

$('#provider-categories').change(function() {
	var completed = $.trim($(this).val()).length > 0;
	$('#add-category').prop('disabled', !completed);
});

$('#add-category').click(function() {
	var data = JSON.parse($('#provider-categories').val());
	category_ids.push(data.id);
	category_table.row.add(data).draw();
	$('#provider-categories').prop('selectedIndex', 0).selectpicker('refresh');
	$(this).prop('disabled', true);
	$('#categoryIds').val(category_ids).trigger('change');
});

$('#remove-category').click(function() {
	var row_selected    = $('tbody tr.selected', '#categories-table');
	$.each(row_selected, function(index, row){
		var rowNode = category_table.row(row);
		var data = rowNode.data();
		var remove_index = $.inArray(data.id, category_ids);
		category_ids.splice(remove_index, 1);
		category_table.row(rowNode).remove().draw();
	});
	$('#categoryIds').val(category_ids);
});

$('#categories-table tbody').on('click', 'input[type="checkbox"]', function(e) {
	var $row = $(this).closest('tr');
		
	if(this.checked){
		$row.addClass('selected');
	} else {
		$row.removeClass('selected');
	}
	
	updateCategorySelectAllCtrl(category_table, '#category-select-all', '#remove-category');
	e.stopPropagation();
});

$('#categories-table').on('click', 'tbody td:first-child, thead th:first-child', function(e) {
	$(this).parent().find('input[type="checkbox"]').trigger('click');
});

$('thead input[name="select_all"]', category_table.table().container()).on('click', function(e) {
	if(this.checked){
		$('#categories-table tbody input[type="checkbox"]:not(:checked)').trigger('click');
	} else {
		$('#categories-table tbody input[type="checkbox"]:checked').trigger('click');
	}

	e.stopPropagation();
});

category_table.on('draw', function() {
	updateCategorySelectAllCtrl(category_table, '#category-select-all', '#remove-category');
});

/*
 * Validation rule for Master Asset category tab
 */
$.validator.addMethod("category_rule", function (value, element, params) {
	var valid = true, 
		selected_provs = [], 
		message = "Select at least one Category for Provider - ", 
		error_providers = [], newmsg;
	var providers = $(params).find(':selected').data('providers');
	if($.trim($(params).val())) {
		$.each(categories, function(index, row) {
			if($.inArray(row.id, category_ids) !== -1) {
				selected_provs.push(row.provider);
			}
		});
		
		$.each(providers, function(index, provider) {
			if($.inArray(provider, selected_provs) === -1) {
				error_providers.push(provider);
				valid = false;
			}
		});
		
		newmsg = error_providers.join(", ");
		$.validator.messages.category_rule = message + newmsg;
	} else {
		$.validator.messages.category_rule = "Select Provider Group and select at least one Category for each Provider.";
		valid = false;
	}
	
    return valid;
}, $.validator.messages.category_rule);

/*
 * Validation rule for Asset category tab
 */
$.validator.addMethod("asset_category_rule", function (value, element) {
	var valid = true;

	if(category_ids.length === 0) {
		$.validator.messages.asset_category_rule = "Add at least one category to the table.";
		valid = false;
	}
	
    return valid;
}, $.validator.messages.asset_category_rule);