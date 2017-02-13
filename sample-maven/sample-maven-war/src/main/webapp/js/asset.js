//This function is to enable the submit button in update scenario.
$("form").on('change input', ':input', function() {
	$('.save-asset').prop('disabled', false);
});

$("#edit-asset").validate({
	ignore: [],
	rules: {
		licenseStart: {
			required: true
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
		categoryIds: {
			asset_category_rule: true
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
               scrollTop();
           } else {
           	$("#errormessages").removeClass("alert alert-warning");
               $("#errormessages").hide();
           }
       }
   },
   invalidHandler: function(form, validator) {
       submitted = true;
       $('#edit-asset').trigger('click', true);
   },
   //handler for ajax request submit
   submitHandler: function(form) {
	    var $form = $('form#edit-asset');
    	$.post($form.attr('action'), $form.serialize(), function(response) {
		    	if(response.status === 'Repitch') {	     			 		
			  		var $modal = $('#repitch-asset-modal');
			  		$modal.find(".modal-body span").html("Saving updates to metadata will cause the asset to be re-pitched. <br><br> Are you sure you want to update the asset's metadata and re-pitch the asset?  Click 'Yes' to continue with updates or 'No' to cancel.");
			  		$modal.modal('show');
	     		} else if(response.status === 'Non-Repitch') {
	     			var $modal = $('#update-asset-modal');
	     			$modal.find(".modal-body span").html("Are you sure you want to update the <strong>"+$('#assetName').val()+"</strong> Asset?");
	     			$modal.modal('show');
	     		} else if(response.status === 'Delivery Start') {
		    		$("#errormessages").html("<span class='glyphicon glyphicon-warning-sign'/>"+"Delivery processing is in progress. Metadata updates are not allowed at this time. Please try again later.");
			  		$("#errormessages").addClass("alert alert-warning");
	                $("#errormessages").show();
	                scrollTop();
		    	} 
		    });

	}
});

$('.confirm-asset-update').click(function(event, error) {
	var $form = $('form#edit-asset');
	modal = $('#update-success-modal');
	$.ajax({
		type: 'POST',
		url: "/mediacentral/content/assets/update",
		data: $('form#edit-asset').serialize(),
	    success: function(response) {
	    $('#repitch-asset-modal').modal('hide');
    	$('#update-asset-modal').modal('hide');	   
	    
    	var form = '#edit-asset', page_name = 'Asset'; 	
 		$('button:submit').prop('disabled', false);
  		//Clear server side validation error, if any
  		$form.find('.form-group').removeClass('error');
		$form.find('.error-inline').empty();	
  				var page, modal = $('#update-success-modal');
			  	if(response.status === 'SUCCESS') {
			  		modal.find(".modal-title").text("Update Status");
			    	modal.find(".modal-body span").html("<strong>"+$('#assetName').val()+"</strong> Asset was successfully updated.");
			    	var current_status = $('#status').val();			    	
			    	//Set a timeout to show this modal after previous modal
			    	setTimeout(function(){
			    		modal.modal('show');
			    	}, 500);
			  	} else if(response.status === 'Delivery Start' ) {
	     			$("#errormessages").html("<span class='glyphicon glyphicon-warning-sign'/>"+"Delivery processing is in progress. Metadata updates are not allowed at this time. Please try again later.");
			  		$("#errormessages").addClass("alert alert-warning");
	                $("#errormessages").show();
	                scrollTop();
	     		} else{
		    		$("#errormessages").html("<span class='glyphicon glyphicon-warning-sign'/>"+"Unknown issue while saving <strong>"+$('#assetName').val()+"</strong> "+page_name+".");
			  		$("#errormessages").addClass("alert alert-warning");
	                $("#errormessages").show();
	                scrollTop();
		    	}
			  	
			    //Set a timeout to hide the element again
		        setTimeout(function(){
		        	modal.modal('hide');
		        	window.location.href = window.location.href;		        	
		        }, 2500);
	    }
	});

   return false; // required to block normal submit since we used Ajax to submit form.
});
