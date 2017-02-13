$('.selectpicker').selectpicker().on('change', function() {
	$(this).valid();
});
				
$('#licenseStart').parent('.datepicker').datepicker({
	startDate: new Date(),
    format: 'mm/dd/yyyy',
    autoclose: true
}).on('changeDate', function() {
	if($('#licenseStart').valid()) {
		return true;
	}
});

$('#licenseEnd').parent('.datepicker').datepicker({
	startDate: new Date(),
    format: 'mm/dd/yyyy',
    autoclose: true,
}).on('changeDate', function() {
	if($('#licenseEnd').valid()) {
		return true;
	}
});

$('#deliverBy').parent('.datepicker').datepicker({
	startDate: new Date(),
    format: 'mm/dd/yyyy',
    autoclose: true
}).on('changeDate', function() {
	if($('#deliverBy').valid()) {
		return true;
	}
});

$('#airdate').parent('.datepicker').datepicker({
	startDate: new Date(),
    format: 'mm/dd/yyyy',
    autoclose: true
}).on('changeDate', function() {
	if($('#airdate').valid()) {
		return true;
	}
});

function updateMasterSelectAllCtrl(table, chkbox_select_all) {
	var $table             = table.table().node();
	var $chkbox_all        = $('tbody input[type="checkbox"]', $table);
	var $chkbox_checked    = $('tbody input[type="checkbox"]:checked', $table);
	
	if($chkbox_checked.length === 0) {
		$(chkbox_select_all).prop('checked', false);
	} else if ($chkbox_checked.length === $chkbox_all.length) {
		$(chkbox_select_all).prop('checked', true);
	} else {
		$(chkbox_select_all).prop('checked', false);
	}
}

/*
 * Platform Tabs - Started
 */
var sel_platform_ids = [];

function platform_datatable(table_id, select_default) {
	var oTable = $(table_id).DataTable({
		retrieve: true,
		dom: "t",
		ordering: false,
		autoWidth: false,
	    scrollY: "195px",
		scrollCollapse: true,
		columnDefs: [
	   		{
	   			targets: 0,
	   	        className: "dt-center",
	   	        width: "10%",
	   	        render: function ( data, type, row ) {
	   	            return "<input type='checkbox'>";
	   	        }
	   		},
	   		{
	   			targets: 1,
	   			className: "dt-head-center",
	   			width: "90%",
	   	        render: function ( data, type, row ) {
	   	        	return row.name;
	   	        }
	   		}
	    ],
	    rowCallback: function(row, data, dataIndex) {
	    	if(select_default) {
		        // Get row ID
		        var platformId = data.platformId;
		        
		        // If row ID is in the list of selected row IDs
		        if($.inArray(platformId, sel_platform_ids) !== -1){
		           $(row).find('input[type="checkbox"]').prop('checked', true);
		           $(row).addClass('selected');
		        }
	    	}
	    }
	});
	return oTable;
};

var vod_table = platform_datatable('#vod-platform', true);

var tve_table = platform_datatable('#tve-platform', true);

var est_table = platform_datatable('#est-platform', true);

$('#provGrpName').change(function() {
	providerGroupChangeEvent(this, null);
});

function providerGroupChangeEvent(thisProvider, platformIds) {
	
	if($(thisProvider).val()) {
		var platforms = $(thisProvider).find(':selected').data('platforms');
		//This condition is for Update screen.
		if(null != platformIds) {
			if(platformIds) {
				var platform_arr = platformIds.split(',')
				$(platform_arr).each( function ( d, j ) {
					sel_platform_ids.push(Number(j));
				});
			}
		} else {
			sel_platform_ids = [];
			$.each(platforms, function(index, platform) {
				sel_platform_ids.push(platform.platformId);
			});
			$('#platformIds').val(sel_platform_ids);
		}
		
		vod_table.rows().remove().draw();
		tve_table.rows().remove().draw();
		est_table.rows().remove().draw();
	
	
		$.each(platforms, function(index, platform) {
			if("VOD" === platform.type) {
				vod_table.row.add(platform).draw(false);
			} else if("TVE" === platform.type) {
				tve_table.row.add(platform).draw(false);
			} else {
				est_table.row.add(platform).draw(false);
			}
		});
		
		platformTabToggle(vod_table, '.vod-platform-yes', '.vod-platform-no');
		
		platformTabToggle(tve_table, '.tve-platform-yes', '.tve-platform-no');
		
		platformTabToggle(est_table, '.est-platform-yes', '.est-platform-no');
	} else {
		sel_platform_ids = [];
		$('#platformIds').val(sel_platform_ids);
		clearPlatformTabs('.vod-platform-yes', '.vod-platform-no');
		clearPlatformTabs('.tve-platform-yes', '.tve-platform-no');
		clearPlatformTabs('.est-platform-yes', '.est-platform-no');
	}
	return;
}

function platformTabToggle(table, tab_table, tab_info) {
	if(table.data().count()) {
		$(tab_table).removeClass('display-none');
		$(tab_info).addClass('display-none');
		table.columns.adjust();
	} else {
		$(tab_table).addClass('display-none');
		$(tab_info).removeClass('display-none');
	}
}

function clearPlatformTabs(tab_table, tab_info) {
	$(tab_table).addClass('display-none');
	$(tab_info).addClass('display-none');
}

$('#platform-tabs a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
	var target = $(e.target).attr("href")
	if('#vod-tab' === target) {
		vod_table.columns.adjust();
	} else if('#tve-tab' === target) {
		tve_table.columns.adjust();
	} else {
		est_table.columns.adjust();
	}
});

datatableSelection('#vod-platform', vod_table, '#vod-select-all');
datatableSelection('#tve-platform', tve_table, '#tve-select-all');
datatableSelection('#est-platform', est_table, '#est-select-all');

function datatableSelection(platform_tab, table, select_all_id) {
	$(platform_tab+' tbody').on('click', 'input[type="checkbox"]', function(e) {
		var $row = $(this).closest('tr');
		
		var data = table.row($row).data();
		var platformId = data.platformId;
		  
		var index = $.inArray(platformId, sel_platform_ids);
		
		if(this.checked && index === -1){
			sel_platform_ids.push(platformId);
			$('#platformIds').val(sel_platform_ids).trigger('change');
		} else if (!this.checked && index !== -1){
			sel_platform_ids.splice(index, 1);
			$('#platformIds').val(sel_platform_ids);
		}
		
		if(this.checked){
			$row.addClass('selected');
		} else {
			$row.removeClass('selected');
		}
		  
		updateMasterSelectAllCtrl(table, select_all_id);
		e.stopPropagation();
	});
	
	$(platform_tab).on('click', 'tbody td:first-child, thead th:first-child', function(e) {
		$(this).parent().find('input[type="checkbox"]').trigger('click');
	});
	
	$('thead input[name="select_all"]', table.table().container()).on('click', function(e) {
		if(this.checked){
			$(platform_tab+' tbody input[type="checkbox"]:not(:checked)').trigger('click');
		} else {
			$(platform_tab+' tbody input[type="checkbox"]:checked').trigger('click');
		}
	
		e.stopPropagation();
	});
	
	table.on('draw', function() {
		updateMasterSelectAllCtrl(table, select_all_id);
	});
}
/*
 * Platform Tabs - Ended
 */

/*
 * Artwork Tab - Started
 */
$('#artwork-tab').change(function() {
	$('#no-artwork').addClass('display-none');
})

var master_artworks_table = $('#selected-artworks').DataTable();
master_artworks_table.page.len(10);


function artworkFirstColumnDef( data, type, row ) {
	return '<img src="data:image/gif;base64,'+data+'">';
}

function artworkSecondColumnDef( data, type, row ) {
	return '<div class="media-word-wrap">'+data+'</div>';
}

/*
 * Artwork Tab - Ended
 */

/*
 * Save button - Started
 */
$('#masterName').on('change input', function() {
	var completed = $.trim($(this).val()).length > 0;
	$('.command-bar .btn-primary').prop('disabled', !completed);
	$('#unsaved-master').prop('disabled', !completed);
});

//This function is to enable the submit button in update scenario.
$("form").on('change input', ':input', function() {
	if($('#masterAssetId').val() > 0 && $.trim($('#masterName').val())) {
		$('.command-bar .btn-primary').prop('disabled', false);
		$('#unsaved-master').prop('disabled', false);
	}
});

function resetForm(form_id) {
	var arr = $(form_id).find('.has-error'); 
	$.each(arr, function(index, item) { 
		$(item).removeClass('has-error'); 
		$(item).find('.help-block').hide(); 
	});
	$("#errormessages").html("");
	$("#errormessages").removeClass("alert alert-warning");
    $("#errormessages").hide();
}

$('#save-master, #unsaved-master').click(function(event, error) {
	event.preventDefault();
	
	//To Clean all the validation error message after clicking save button.
	resetForm("#add-master");
	
	//As we prevent submit form on save alone, we need to hide this manually as alert.js won't do this.
	$('#unsaveModal').modal('hide');
	
	var masterName = $('#masterName').val();
	$('#save-master').prop('disabled', true);
	$('#unsaved-master').prop('disabled', true);
	$.ajax({
		type: 'POST',
		url: 'save',	
		data: $('form#add-master').serialize(),
	    success: function(response) {
	    	if('SUCCESS' === response.status) {
	    		var id = response.id;
		  		if(typeof id != 'undefined' && id > 0) {
		  			$('#masterAssetId').val(id);
		  		}
		  		if(error === undefined) {
			  		var $success = $('#draftModal');
			  		$success.find(".modal-title").text("Save Master");
			  		$success.find(".modal-body span").html("Master asset <strong>"+masterName+"</strong> was successfully saved as Draft.");
			  		$success.modal('show');
			  		
			  		if('Draft' === $('#status').val()) {
			  			setTimeout(function() {
			  				$success.modal('hide');
			  			}, 2500);
			  		}
		  		}
		  	//Unknown failure.
		  	} else {
		  		$("#errormessages").html("<span class='glyphicon glyphicon-warning-sign'/>"+"Unknown issue while saving <strong>"+masterName+"</strong> Master asset as Draft.");
		  		$("#errormessages").addClass("alert alert-warning");
                $("#errormessages").show();
                scrollTop();
		  	}
	    }
	 });
	
	return false;
});
/*
 * Save button - Ended
 */

/*
 * Schedule button - Started
 */
var submitted = false;

/* Custom validation rule for Master asset.*/
$.validator.addMethod("greaterThanEqual", function(value, element, params) {
    if (!/Invalid|NaN/.test(new Date(value))) {
        return new Date(value) >= new Date($(params).val());
    }

    return isNaN(value) && isNaN($(params).val()) 
        || (Number(value) >= Number($(params).val())); 
},'Must be greater than or equal to License Start.');

$.validator.addMethod("lessThanEqual", function(value, element, params) {
    if (!/Invalid|NaN/.test(new Date(value))) {
        return new Date(value) <= new Date($(params).val());
    }

    return isNaN(value) && isNaN($(params).val()) 
        || (Number(value) <= Number($(params).val())); 
},'Must be less than or equal to License Start.');

$.validator.addMethod("licensestart_rule", function (value, element, params) {
	var valid = false;
	
	if (!/Invalid|NaN/.test(new Date(value))) {
		if(!$(params[0]).val() || new Date(value) <= new Date($(params[0]).val())) {
			valid = true;
		} else {
			valid = false;
			$.validator.messages.licensestart_rule = "Must be less than or equal to License End."
			return valid;
		}
		
		if(!$(params[1]).val() || new Date(value) >= new Date($(params[1]).val())) {
			valid = true;
		} else {
			valid = false;
			$.validator.messages.licensestart_rule = "Must be greater than or equal to Delivery By Date."
			return valid;
		}
		
		if(!$(params[2]).val() || new Date(value) >= new Date($(params[2]).val())) {
			valid = true;
		} else {
			valid = false;
			$.validator.messages.licensestart_rule = "Must be greater than or equal to Air Date."
			return valid;
		}
    }
    return valid;
    
}, $.validator.messages.licensestart_rule);

$.validator.addMethod("platform_rule", function (value, element, params) {
	var valid = false;
	if($.trim($(params).val())) {
		if($.trim(value)) {
			valid = true;
		}
		$.validator.messages.platform_rule = "Select at least one Platform."
	} else {
		$.validator.messages.platform_rule = "Select Provider Group and at least one Platform.";
	}
    return valid;
}, $.validator.messages.platform_rule);

/* Asset confirmation table before scheduled.*/
var asset_data = [];
var asset_confirm_table = $("#asset-confirm-table").DataTable({
	dom: "t",
	destroy: true,
	paging: false,
	ordering: false,
	autoWidth: false,
	scrollY: "700px",
	scrollCollapse: true,
	columns: [
     	    { data : "", width : "4%", className: "dt-center"},
     	    { data : "assetName", width : "36%", className: "dt-head-center"},
     	    { data : "licenseStart", width : "12%", className: "dt-head-center"}, 
            { data : "licenseEnd", width : "12%", className: "dt-head-center"},
            { data : "providerName", width : "12%", className: "dt-head-center"},
            { data : "platformName", width : "12%", className: "dt-head-center"}
	],
	columnDefs: [
		{
			targets: 0,
	        className: "dt-center",
	        render: function ( data, type, row ) {
	             return "<input type='checkbox' checked>";
	         }
		}
    ]
});

$('#asset-confirm-table tbody').on('click', 'input[type="checkbox"]', function(e) {
	var $row = $(this).closest('tr');
	
	var data = asset_confirm_table.row($row).data();
	  
	var index = $.inArray(data, asset_data);
	if(this.checked && index === -1){
		asset_data.push(data);
	} else if (!this.checked && index !== -1){
		asset_data.splice(index, 1);
	}

	$('#selectedAssets').val(JSON.stringify(asset_data));
	
	if(this.checked){
		$row.addClass('selected');
	} else {
		$row.removeClass('selected');
	}
	
	if(asset_data.length > 0) {
		$('.confirm-schedule').prop('disabled', false);
	} else {
		$('.confirm-schedule').prop('disabled', true);
	}
	  
	updateMasterSelectAllCtrl(asset_confirm_table, $('#add-asset-select-all'));
	e.stopPropagation();
});

$('#asset-confirm-table').on('click', 'tbody td:first-child, thead th:first-child', function(e) {
	$(this).parent().find('input[type="checkbox"]').trigger('click');
});

$('thead input[name="select_all"]', asset_confirm_table.table().container()).on('click', function(e) {
	if(this.checked){
		$('#asset-confirm-table tbody input[type="checkbox"]:not(:checked)').trigger('click');
	} else {
		$('#asset-confirm-table tbody input[type="checkbox"]:checked').trigger('click');
	}

	e.stopPropagation();
});

asset_confirm_table.on('draw', function() {
	updateMasterSelectAllCtrl(asset_confirm_table, $('#add-asset-select-all'));
});

/* Repitch confirmation table after scheduled.*/
var repitch_confirm_table = $("#repitch-confirm-table").DataTable({
	dom: "t",
	destroy: true,
	paging: false,
	ordering: false,
	autoWidth: false,
	scrollY: "700px",
	scrollCollapse: true,
	columns: [
     	    { data : "assetName", width : "24%", className: "dt-head-center"},
     	    { data : "licenseStart", width : "12%", className: "dt-head-center"}, 
            { data : "licenseEnd", width : "12%", className: "dt-head-center"},
            { data : "providerName", width : "12%", className: "dt-head-center"},
            { data : "platformName", width : "12%", className: "dt-head-center"},
            { data : "status", width : "12%", className: "dt-head-center"},
            { data : "", width : "4%", className: "dt-center"}
	],
	columnDefs: [
		{
			targets: 6,
	        className: "dt-center",
	        render: function ( data, type, row ) {
	             return "<input type='checkbox' checked>";
	         }
		}
    ]
});

$('#repitch-confirm-table tbody').on('click', 'input[type="checkbox"]', function(e) {
	var $row = $(this).closest('tr');
	
	var data = repitch_confirm_table.row($row).data();
	  
	var index = $.inArray(data, asset_data);
	if(this.checked && index === -1){
		asset_data.push(data);
	} else if (!this.checked && index !== -1){
		asset_data.splice(index, 1);
	}

	$('#selectedAssets').val(JSON.stringify(asset_data));
	
	if(this.checked){
		$row.addClass('selected');
	} else {
		$row.removeClass('selected');
	}
	
	e.stopPropagation();
});

$('#repitch-confirm-table').on('click', 'tbody td:first-child, thead th:first-child', function(e) {
	$(this).parent().find('input[type="checkbox"]').trigger('click');
});

/* Save & Schedule button before Scheduled Master, Save Master button after Scheduled.*/
$("#add-master").validate({
	ignore: [],
	rules: {
		licenseStart: {
			required: true,
			licensestart_rule: ["#licenseEnd", "#deliverBy", "#airdate"]
		},
		licenseEnd: {
			required: true,
			greaterThanEqual: "#licenseStart"
		},
		deliverBy: {
			required: true,
			lessThanEqual: "#licenseStart"
		},
		"episode.airdate": {
			required: true,
			lessThanEqual: "#licenseStart"
		},
		scheduleContact: {
			required: true,
			email: true
		},
		platformIds: {
			platform_rule: "#provGrpName"
		},
		categoryIds: {
			category_rule: "#provGrpName"
		},
		"episode.titleId": {
			required: true,
			number: true
		},
		year: {
			required: true,
			number: true
		},
		"episode.seasonNum": {
			number: true
		},
		"episode.episodeNum": {
			number: true
		},
		"epgOption.daysNew": {
			number: true
		},
		"epgOption.daysLc": {
			number: true
		}
	},
	messages: {
		
	},
	highlight: function(element) {
        $(element).closest('.form-group').addClass('has-error');
    },
    unhighlight: function(element) {
        $(element).closest('.form-group').removeClass('has-error');
    },
    errorElement: 'span',
    errorClass: 'help-block',
    errorPlacement: function(error, element) {
    	if($(element).is(":hidden") && ($(element).prop('id') === 'platformIds' || $(element).prop('id') === 'categoryIds')) {
    		//if hidden field need to validate
    		error.insertAfter(element);
    	} else if(element.parents('.form-group').length && (element.parents('.form-group').find('select').hasClass('selectpicker') || element.parents('.form-group').find('.input-group').hasClass('datepicker'))) {
        	//if bootstrap-select or bootstrap-datepicker plugin used 
        	if( element.parents('.form-group').find('button').hasClass('btn-primary') ){
        		error.insertAfter(element.parent().parent().siblings('button'));
        	} else {
        		error.insertAfter(element.parent().parent());
        	}                 
        } else if(element.parents('.form-group').length && element.parents('.form-group').find('button').hasClass('btn-primary')) {
            error.insertAfter(element.parent().siblings('button'));
        } else if(element.parents('.form-group').length) {
            error.insertAfter(element.parent());
        } else {
            error.insertAfter(element);
        }
    },
    // callback for custom error display on banner.
    showErrors: function (errorMap, errorList) {
   	 // also show default labels from errorPlacement callback
       this.defaultShowErrors(); 
       if (submitted) {
           var msg = "<span class='glyphicon glyphicon-warning-sign' style='font-size: 20px;'/>Required fields are missing data. Enter data in the required fields listed below<br/>"
           
           $('form').find('.has-error').each(function(index, element) {
           	var labelTxt = $(element).children('label').text();
               var index = labelTxt.indexOf(':');
               if (index != -1) {
               	labelTxt = labelTxt.substr(0, index);
               }
               msg += '<li>'+ labelTxt +"</li>"
           });
           	
           $("#errormessages").html(msg);
           
           // toggle the error summary box
           if ($('form').find('.has-error').length > 0) {
           	$("#errormessages").addClass("alert alert-warning");
               $("#errormessages").show();
           } else {
           	$("#errormessages").removeClass("alert alert-warning");
               $("#errormessages").hide();
           }
       }
   },
   invalidHandler: function(form, validator) {
       submitted = true;
       $('#save-master').trigger('click', true);
       if(validator.errorList.length === 1) {
    	   var element = validator.errorList[0].element;
    	   if($(element).prop('id') === 'categoryIds') {
    		   $('#metadata-tabs a[href="#category-tab"]').tab('show');
    	   } else {
    		   $('#metadata-tabs a[href="#showinfo-tab"]').tab('show');
    	   }
       }
   },
   //handler for ajax request submit
   submitHandler: function(form) {
		var $form = $('form#add-master'), master_name = $('#masterName').val();
		if($(form).attr('formaction') === 'add') {
			form.submit();
		} else {
			$.post($form.attr('action'), $form.serialize(), function(response) {
				if(response.status === 'Draft') {
					asset_data = response.result;
					$('#selectedAssets').val(JSON.stringify(asset_data));
					var $modal = $('#schedule-confirm-modal');
					$modal.one('shown.bs.modal', function () {
						var confirm_dataTable = $("#asset-confirm-table").DataTable();
						confirm_dataTable.clear();
						confirm_dataTable.rows.add(asset_data);
						confirm_dataTable.draw();
					});

					$modal.modal('show');
				} else if(response.status === 'Repitch') {
					asset_data = response.result;
					$('#selectedAssets').val(JSON.stringify(asset_data));
					var $modal = $('#repitch-confirm-modal');
					$modal.one('shown.bs.modal', function () {
						var repitch_dataTable = $("#repitch-confirm-table").DataTable();
						repitch_dataTable.clear();
						repitch_dataTable.rows.add(asset_data);
						repitch_dataTable.draw();
					});

					$modal.modal('show');
				} else if(response.status === 'Non-Repitch') {
					$('#selectedAssets').val('');
					var $modal = $('#update-asset-modal');
					$modal.find(".modal-body span").html("Updates to master will override any changes made to the assets. <br>Are you sure you want to update the master and its related assets?");
					$modal.modal('show');
				} else if(response.status === 'Delivery Start') {
					$("#errormessages").html("<span class='glyphicon glyphicon-warning-sign'/>"+"Delivery processing is in progress. Metadata updates are not allowed at this time. Please try again later.");
					$("#errormessages").addClass("alert alert-warning");
					$("#errormessages").show();
					scrollTop();
				} else if(response.status === 'New Assets') {
					//Add New Asset - When user tries to add asset to scheduled master and found new assets, then display those assets for confirmation.
					asset_data = response.result;
					$('#selectedAssets').val(JSON.stringify(asset_data));
					var $modal = $('#schedule-confirm-modal');
					$modal.one('shown.bs.modal', function () {
						var confirm_dataTable = $("#asset-confirm-table").DataTable();
						confirm_dataTable.clear();
						confirm_dataTable.rows.add(asset_data);
						confirm_dataTable.draw();
					});
					$modal.modal('show');
				} else if(response.status === 'Media Assigned') {
					//Add New Asset - When user tries to add asset to scheduled master, but some or all assets in "Media Assigned" status. - Before confirmation
					$("#errormessages").html("<span class='glyphicon glyphicon-warning-sign'/>"+"Unable to Add New Asset to <strong>"+master_name+"</strong> Master Asset. Media has already been assigned.");
					$("#errormessages").addClass("alert alert-warning");
					$("#errormessages").show();
					scrollTop();
				} else if(response.status === 'Assets Exist') {
					//Add New Asset - When user tries to add asset to scheduled master and found all assets already exist for this master.
					$("#errormessages").html("<span class='glyphicon glyphicon-warning-sign'/>"+"All possible Assets exist for the selected Provider Group in <strong>"+master_name+"</strong> Master Asset.");
					$("#errormessages").addClass("alert alert-warning");
					$("#errormessages").show();
					scrollTop();
				} else {
					$("#errormessages").html("<span class='glyphicon glyphicon-warning-sign'/>"+"Unknown issue while saving <strong>"+master_name+"</strong> Master Asset.");
					$("#errormessages").addClass("alert alert-warning");
					$("#errormessages").show();
					scrollTop();
				}
			});
			return false; // required to block normal submit since we used Ajax to submit form.
		}
   	}
});

/* Clear selected asset in confirmation and add asset platform ids.*/
$('.cancel-schedule').click(function(event, error) {
	asset_data = [];
	$('#selectedAssets').val("");
	add_asset_platform_ids = [];
	$('#addAssetPlatformIds').val("");
	$('.confirm-schedule').prop('disabled', false);
});

/* Schedule the Master asset before Scheduled status, and Save the Master asset after Scheduled status.*/
var unsaved_href;
$('.confirm-schedule').click(function(event, error) {
	$.ajax({
		type: 'POST',
		url: 'schedule',
		data: $('form#add-master').serialize(),
	    success: function(response) {
	    	var page, modal = $('#schedule-success-modal'), master_name = $('#masterName').val();
	    	if(response.status === 'Scheduled') {
	    		//When it goes from Draft to Scheduled or from Unscheduled to Scheduled
		    	modal.find(".modal-title").text("Schedule Status");
		    	modal.find(".modal-body span").html("Assets were successfully saved and scheduled.");
		    	var current_status = $('#status').val();
		    	if(current_status === 'Unscheduled') {
		    		page = "/mediacentral/content/masters";
		    	} else {
		    		page = "add";
		    	}
		    	modal.modal('show');
	    	} else if(response.status === 'Delivery Start') {
	    		//When user tries to update Scheduled MA, but some or all assets in "Delivery Start" status.
	    		$("#errormessages").html("<span class='glyphicon glyphicon-warning-sign'/>"+"Delivery processing is in progress. Metadata updates are not allowed at this time. Please try again later.");
		  		$("#errormessages").addClass("alert alert-warning");
                $("#errormessages").show();
                scrollTop();
	    	} else if(response.status === 'Media Assigned') {
	    		//Add New Asset - When user tries to add asset to scheduled master, but some or all assets in "Media Assigned" status. - After confirmation
	    		$("#errormessages").html("<span class='glyphicon glyphicon-warning-sign'/>"+"Unable to Add New Asset to <strong>"+master_name+"</strong> Master Asset. Media has already been assigned.");
				$("#errormessages").addClass("alert alert-warning");
				$("#errormessages").show();
				scrollTop();
	    	} else if(response.status === 'New Assets') {
	    		//Add New Asset - When user tries to add asset to scheduled master and found new assets.
	    		//Before resetting few variable, add the asset to Asset section.
	    		scheduled_assets_table.rows.add(response.result).draw(false);
	    		asset_data = [];
	    		$('#selectedAssets').val("");
	    		add_asset_platform_ids = [];
	    		$('#addAssetPlatformIds').val("");
	    		//Then show the success message and stay on the same update master screen.
	    		modal.find(".modal-title").text("Schedule Status");
		    	modal.find(".modal-body span").html("Assets were successfully saved and scheduled.");
		    	modal.modal('show');
	    	} else if(response.status === 'FAIL') {
	    		//Some error during saving the MA
	    		$("#errormessages").html("<span class='glyphicon glyphicon-warning-sign'/>"+"Unknown issue while saving <strong>"+master_name+"</strong> Master Asset.");
				$("#errormessages").addClass("alert alert-warning");
				$("#errormessages").show();
				scrollTop();
	    	} else {
	    		//After updating Scheduled MA.
	    		modal.find(".modal-title").text("Update Status");
		    	modal.find(".modal-body span").html("Master Asset and children assets were successfully updated.");
		    	page = "/mediacentral/content/masters";
		    	modal.modal('show');
	    	}
	    	
    		//Update page url if the submit is happen through Unsaved change modal.
    		if(unsaved_href !== undefined) {
    			page = unsaved_href;
    		}
    		
	    	//Set a timeout to hide the element again
	        setTimeout(function() {
	        	modal.modal('hide');
	        	if(page !== undefined) {
	        		window.location.href = page;
	        	}
	        }, 2500);
	    }
	 });
});
/*
 * Schedule button - Ended
 */

/*
 * Scheduled Master asset - Assets section
 */
var editable = 'true';
var scheduled_assets_table = $('#scheduled-assets-table').DataTable({
	dom: "t",
	destroy: true,
	ordering : false,
	autoWidth: false,
	paging: false,
	columnDefs: [
	             {
	            	 targets: 3,
	            	 render: function ( data, type, row ) {
	            		 return '<div class="media-word-wrap">'+row.providerName+'</div>';
	            	 }
	             },
	             {
	            	 targets: 4,
	            	 render: function ( data, type, row ) {
	            		 return '<div class="media-word-wrap">'+row.platformName+'</div>';
	            	 }
	             },
	             {
	            	 targets: 6,
	            	 className: "dt-center",
	            	 render: function ( data, type, row ) {
	            		 var remove_link;
	            		 if(editable === 'true') {
	            			 remove_link = '<div class="remove-scheduled-asset"><a href="javascript:void(0);"><i class="glyphicon glyphicon-remove-circle" style="color:#8B0000"></i> Remove</a></div>';
	            		 } else {
	            			 remove_link = '<i class="glyphicon glyphicon-remove-circle" style="color:#8B0000"></i> Remove';
	            		 }
	            		 return remove_link;
	            	 }
	             }
	            ],
	columns : [
	           {data : "assetName", width : "24%", "sDefaultContent":""},
	           {data : "licenseStart", width : "12%", "sDefaultContent":""},
	           {data : "licenseEnd", width : "12%", "sDefaultContent":""},
	           {data : "providerName", width : "15%", "sDefaultContent":""},
	           {data : "platformName", width : "15%", "sDefaultContent":""},
	           {data : "status", width : "12%", "sDefaultContent":""},
	           {data : "action", width : "10%", "sDefaultContent":""}
	          ]
});

function populateScheduledAssetsTable(assetsData, isEditable) {
	editable = isEditable;
	scheduled_assets_table.rows.add(assetsData).draw(false);
}

/*
 * Removing child asset from Master - Started
 */
var asset_row_removed;
$('#scheduled-assets-table').on( 'click', '.remove-scheduled-asset', function() {
	var remove_modal = $('#remove-child-asset-modal');
	asset_row_removed = $(this).closest('tr');
	var data = scheduled_assets_table.row(asset_row_removed).data();
	remove_modal.find(".modal-body span").html("You are about to remove the <strong>"+data.assetName+"</strong> asset. Are you sure you want to remove this asset?");
	remove_modal.modal('show');
});

$('#remove-child-asset-modal').on('click', '#remove-child-confirm', function() {
	var data = scheduled_assets_table.row(asset_row_removed).data();
	$.ajax({
		type: 'DELETE',
		url: $('#masterAssetId').val()+'/'+data.assetId,
		success: function(response) {
			if(response.status === 'Scheduled') {
				scheduled_assets_table.row(asset_row_removed).remove().draw(false);
			} else if (response.status === 'Unscheduled') {
				scheduled_assets_table.row(asset_row_removed).remove().draw(false);
				$('#provGrpName').prop('disabled', false);
				$('#provGrpName').selectpicker('refresh');
				$('input#provGrpName').prop('disabled', true);
				$('#assetType').prop('disabled', false);
				$('#assetType').selectpicker('refresh');
				$('input#assetType').prop('disabled', true);
				$('#status').val(response.status);
				$('#master-status').html(response.status);
				$('#scheduled-assets-section').addClass('display-none');
								
				$('#platforms-section').removeClass('display-none');
				$('#vod-platform').DataTable().columns.adjust();
			} else if (response.status === 'Delivery Start') {
				$("#errormessages").html("<span class='glyphicon glyphicon-warning-sign'/>"+"Delivery processing is in progress. Remove <strong>"+data.assetName+"</strong> asset is not allowed at this time. Please try again later.");
				$("#errormessages").addClass("alert alert-warning");
                $("#errormessages").show();
                scrollTop();
			} else {
				$("#errormessages").html("<span class='glyphicon glyphicon-warning-sign'/>"+"Unknown issue while deleting <strong>"+data.assetName+"</strong> Asset.");
				$("#errormessages").addClass("alert alert-warning");
                $("#errormessages").show();
                scrollTop();
			}
		}
	});
});
/*
 * Removing child asset from Master - Ended
 */

/*
 * Remove Master Asset - Started
 */
var remove_confirm_table = $('#remove-confirm-table').DataTable({
	dom: "t",
	destroy: true,
	ordering : false,
	autoWidth: false,
	paging: false,
	columnDefs: [
	             {
	            	 targets: 3,
	            	 render: function ( data, type, row ) {
	            		 return '<div class="media-word-wrap">'+row.providerName+'</div>';
	            	 }
	             },
	             {
	            	 targets: 4,
	            	 render: function ( data, type, row ) {
	            		 return '<div class="media-word-wrap">'+row.platformName+'</div>';
	            	 }
	             }
	            ],
	columns : [
	           {data : "assetName", width : "34%", "sDefaultContent":""},
	           {data : "licenseStart", width : "12%", "sDefaultContent":""},
	           {data : "licenseEnd", width : "12%", "sDefaultContent":""},
	           {data : "providerName", width : "15%", "sDefaultContent":""},
	           {data : "platformName", width : "15%", "sDefaultContent":""},
	           {data : "status", width : "12%", "sDefaultContent":""},
	          ]
});

$('button.remove').click(function() {
	var $modal = $('#remove-confirm-modal'), remove_info = [];
	remove_info.push("You are about to remove the <strong>"+$('#masterName').val()+"</strong> master asset.");
	if (scheduled_assets_table.data().count()) {
		$('#remove-confirm-table').removeClass('display-none');
		remove_confirm_table.clear();
		remove_confirm_table.rows.add(scheduled_assets_table.data()).draw(false);
		remove_info.push("Removing the master will also remove all the assets listed below.");
	}
	remove_info.push("Are you sure you want to remove this master?");
	
	$modal.find("#remove-master-info").html(remove_info.join(" "));
  	$modal.modal('show');
});

$('button.remove-confirm').click(function() {
	$.ajax({
	    url: $('#masterAssetId').val(),
	    type: 'DELETE',
	    success: function(response) {
	    	if('SUCCESS' === response.status) {
	    		window.location.href = "/mediacentral/content/masters";
	    	} else if ('Delivery Start' === response.status) {
				$("#errormessages").html("<span class='glyphicon glyphicon-warning-sign'/>"+"Delivery processing is in progress. Remove <strong>"+$('#masterName').val()+"</strong> master asset is not allowed at this time. Please try again later.");
				$("#errormessages").addClass("alert alert-warning");
                $("#errormessages").show();
                scrollTop();
			} else {
				$("#errormessages").html("<span class='glyphicon glyphicon-warning-sign'/>"+"Unknown issue while deleting <strong>"+$('#masterName').val()+"</strong> Master Asset.");
				$("#errormessages").addClass("alert alert-warning");
                $("#errormessages").show();
                scrollTop();
			}
	    }
	});
});
/*
 * Remove Master Asset - Ended
 */

/*
 * Copy Master Asset - Started
 */
$('#copy-master').click(function() {
	unsaved_href = $(this).prop('href');
});
/*
 * Copy Master Asset - Ended
 */

/*
 * Add New Asset - Started
 */
var add_asset_vod_table = platform_datatable('#add-asset-vod-platform', false);
var add_asset_tve_table = platform_datatable('#add-asset-tve-platform', false);
var add_asset_est_table = platform_datatable('#add-asset-est-platform', false);
var add_asset_platform_ids = [];

$('#add-new-asset').click(function() {
	var $modal = $('#add-new-asset-modal');
	$('#add-asset-platform-tabs a[href="#add-asset-vod-tab"]').tab('show');
	$modal.one('shown.bs.modal', function () {		
		var platforms = $('#provGrpName').find(':selected').data('platforms');
		
		add_asset_vod_table.rows().remove().draw();
		add_asset_tve_table.rows().remove().draw();
		add_asset_est_table.rows().remove().draw();
		
		$.each(platforms, function(index, platform) {
			if("VOD" === platform.type) {
				add_asset_vod_table.row.add(platform).draw(false);
			} else if("TVE" === platform.type) {
				add_asset_tve_table.row.add(platform).draw(false);
			} else {
				add_asset_est_table.row.add(platform).draw(false);
			}
		});
		
		platformTabToggle(add_asset_vod_table, '.vod-platform-yes', '.vod-platform-no');

		platformTabToggle(add_asset_tve_table, '.tve-platform-yes', '.tve-platform-no');

		platformTabToggle(add_asset_est_table, '.est-platform-yes', '.est-platform-no');
	});
	$modal.modal('show');
});

$('#add-asset-platform-tabs a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
	var target = $(e.target).attr("href")
	if('#add-asset-vod-tab' === target) {
		add_asset_vod_table.columns.adjust();
	} else if('#add-asset-tve-tab' === target) {
		add_asset_tve_table.columns.adjust();
	} else {
		add_asset_est_table.columns.adjust();
	}
});

addAssetDatatableSelection('#add-asset-vod-platform', add_asset_vod_table, '#add-asset-vod-select-all');
addAssetDatatableSelection('#add-asset-tve-platform', add_asset_tve_table, '#add-asset-tve-select-all');
addAssetDatatableSelection('#add-asset-est-platform', add_asset_est_table, '#add-asset-est-select-all');

function addAssetDatatableSelection(platform_tab, table, select_all_id) {
	$(platform_tab+' tbody').on('click', 'input[type="checkbox"]', function(e) {
		var $row = $(this).closest('tr');
		
		var data = table.row($row).data();
		
		var platformId = data.platformId;
		  
		var index = $.inArray(platformId, add_asset_platform_ids);
		if(this.checked && index === -1){
			add_asset_platform_ids.push(platformId);
			$('#addAssetPlatformIds').val(add_asset_platform_ids);
		} else if (!this.checked && index !== -1){
			add_asset_platform_ids.splice(index, 1);
			$('#addAssetPlatformIds').val(add_asset_platform_ids);
		}
		
		if(this.checked){
			$row.addClass('selected');
		} else {
			$row.removeClass('selected');
		}
		
		if(add_asset_platform_ids.length > 0) {
			$('#add-asset-schedule-master').prop('disabled', false);
		} else {
			$('#add-asset-schedule-master').prop('disabled', true);
		}
		
		updateMasterSelectAllCtrl(table, select_all_id);
		e.stopPropagation();
	});
	
	$(platform_tab).on('click', 'tbody td:first-child, thead th:first-child', function(e) {
		$(this).parent().find('input[type="checkbox"]').trigger('click');
	});
	
	$('thead input[name="select_all"]', table.table().container()).on('click', function(e) {
		if(this.checked){
			$(platform_tab+' tbody input[type="checkbox"]:not(:checked)').trigger('click');
		} else {
			$(platform_tab+' tbody input[type="checkbox"]:checked').trigger('click');
		}
	
		e.stopPropagation();
	});
	
	table.on('draw', function() {
		updateMasterSelectAllCtrl(table, select_all_id);
	});
}

$('#add-asset-cancel').click(function() {
	add_asset_platform_ids = [];
	$('#addAssetPlatformIds').val(add_asset_platform_ids);
});

$('#add-asset-schedule-master').click(function() {
	$('#add-master').submit();
});
/*
 * Add New Asset - Ended
 */