function SitePlatform(selected_arr, hiddenField, table_option, select_element, add_button, remove_button, select_all, oTable) {
    this.init.apply(this, arguments); //This simply calls init with the arguments from Foo
}

SitePlatform.prototype.init = function(selected_arr, hiddenField, table_option, select_element, add_button, remove_button, select_all, oTable) {
	this.selected_arr = selected_arr;
	this.hiddenField = hiddenField;
	this.table_option = table_option;
	
	//Below piece is for Update, happen during onload.
	if(hiddenField.val()) {
		var site_arr = $.parseJSON(hiddenField.val());
		if(typeof site_arr !== 'undefined' && site_arr.length > 0) {
			$(select_element).prop('disabled', false);
			site_arr.sort();
			$.each(site_arr, function(index, site) {
				selected_arr.push(site);
				table_option.find("option[value='"+site+"']").remove();
				oTable.fnAddData( ["<input type='checkbox'/>", site]);
				$('.selectpicker').selectpicker('refresh');
			});
		}
	}
	
	//Add site button event, This needs to be refactor in future during "Add Provider" implementation.
	$(add_button).click(function(){
		var $this = $(this);
		var option = $(select_element);
		oTable.fnAddData( ["<input type='checkbox'/>", option.val()]);
		selected_arr.push(option.val());
		hiddenField.val(JSON.stringify(selected_arr));
		table_option.find("option[value='"+option.val()+"']").remove();		
        $('.selectpicker').selectpicker('refresh');
		option.prop('selectedIndex',0);
		$this.prop('disabled', true)
	});
	
	//Remove site button event, This needs to be refactor in future during "Add Provider" implementation.
	remove_button.click(function(){
		var $this = $(this);
		var row_selected    = $('tbody tr.selected', oTable);
		$.each(row_selected, function(index, row){
			var data = oTable.api().row(row).data();
			selected_arr.splice($.inArray(data[1],selected_arr) ,1);
			hiddenField.val(JSON.stringify(selected_arr));
			var newOption = $('<option value="'+data[1]+'">'+data[1]+'</option>');
			table_option.append(newOption);			
			$('.selectpicker').selectpicker('refresh');
			oTable.fnDeleteRow(row);
	    });
		$this.prop('disabled', true);
		updateDataTableSelectAllCtrl(oTable, remove_button, select_all);
	});
	
	//Enable or Disable "Add site" button based on Sites dropdown selection.
	$(select_element).change(function(){
		var $this = $(this);
		if($this.val() != '') {
			$this.parents('.form-group').children('button').prop('disabled', false);
		} else {
			$this.parents('.form-group').children('button').prop('disabled', true);
		}
		
	});
}