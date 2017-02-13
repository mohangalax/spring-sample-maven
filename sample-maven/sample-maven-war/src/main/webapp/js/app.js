/*
 * Below code is for navbar highlighting
 */
var selector = '.navbar-nav li';
$(selector).click(function(e) {
	$(selector).removeClass('active');
	$(this).addClass('active');
});

/*
 * dataTable definition
 */
function dataTable(tableId, filterId, columnDefs) {
	var obj = $(tableId).dataTable({
			"columnDefs": columnDefs,
			"bFilter": true,
			"sPaginationType": "full_numbers",
			"sDom":"rtip",
			"oLanguage": {
			    "oPaginate": {
			        "sNext": '&gt;',
			        "sLast": '>>',
			        "sFirst": '<<',
			        "sPrevious": '&lt;'
			     }
			  },
			initComplete: function () {
				this.api().columns(0).every( function () {
		            var column = this;
		            var select = $('<select><option value="">ALL</option></select>')
		                    .appendTo( $(filterId) )
		                    .on( 'change', function () {
		                  	  	var val = $.fn.dataTable.util.escapeRegex($(this).val());
		                  	  	column.search( val ? '^'+val+'$' : '', true, false ).draw();
		              });
	                var column_arr = new Array();
		            column.data().unique().each( function ( d, j ) {
		            	column_arr.push($(d).text());			            	  
		            });
		             
		            $(column_arr).each( function ( d, j ) {
		            	select.append( '<option value="'+j+'">'+j+'</option>' )
		            });
				});
		    }
		});
	
	return obj;
}

/*
 * Filter by type and reset name dropdown.
 */
function filterByType($this, index, oTable, name, optarray) {
	var $type = $this.val();
	oTable.api().search('').columns().search('').draw();
		
	$(name).find('option').remove();
	var addoptarr = [];
	addoptarr.push("<option value=''>ALL</option>");
	if('' != $type) {
		oTable.fnFilter($type, index);
		oTable.api().rows({search:'applied'}).every( function ( rowIdx, tableLoop, rowLoop ) {
		    var rowNode = this.node();
		    $(rowNode).find("td").each(function (i) {
		    	if(0 === i) {
		    		addoptarr.push(optarray[rowIdx].option);
		    	}
		    });
		});
	} else {
		var opt_arr = new Array();
		$(optarray).each( function ( d, j ) {
			opt_arr.push(optarray[d].value);			            	  
        });
		
		opt_arr.sort(function (a, b) {
			return a.toLowerCase().localeCompare(b.toLowerCase());
		});
		
		$(opt_arr).each(function( d, j ) {
			addoptarr.push("<option value='" + j + "'>" + j + "</option>");
		});
		
	}
	$(name).children('select').html(addoptarr.join(''));
}

/*
 * Filter by name and reset type.
 */
function resetTypeFilter(type, typeIdx, oTable) {
	var typeVal, unique = false;
	oTable.api().rows({search:'applied'}).every( function ( rowIdx, tableLoop, rowLoop ) {
	    var rowNode = this.node();
	    $(rowNode).find("td:visible").each(function (i) {
	    	if(typeIdx === i) {
	    		if(typeof typeVal == 'undefined') {
	    			typeVal = $(this).text()
	    			unique = true;
	    		} else if (typeVal != $(this).text()) {
	    			unique = false;
	    		}
	    	}
	    });
	    
	    if(unique) {
	    	if($(type).is(':radio')) {
	    		$(type).filter('[value='+typeVal+']').prop("checked", true);
	    	} else {
	    		$(type).val(typeVal);
	    	}
	    } else {
	    	if($(type).is(':radio')) {
	    		$(type).filter('[value=""]').prop("checked", true);
	    	} else {
	    		$(type).prop('selectedIndex',0);
	    	}
	    }
	});
}

/*
 * function to unique name
 */
function unique_name($this, unique_url, id, permission) {
	var name = $.trim($this.val());
	if(name !== '' && permission == 'true') {
		$.ajax({
			type: "GET",
			url: unique_url,
			data: {id : id, name: name},
			success: function(status) {
				$this.valid();
				if(status === true) {
					$('.selectpicker').prop('disabled', false);
					$('button:submit').prop('disabled', false);					
				} else {
					$this.focus();
					$('.selectpicker').prop('disabled', true);
					$('button:submit').prop('disabled', true);
				}
			}
		});
	} else {
		$this.valid();
		$('button:submit').prop('disabled', true);
	}
}

/*
 * Blank field validation
 */
$.validator.addMethod("blank", function (value, element) {
	var valid = true;
    if ($.trim(value) === '') {
    	valid = false;
    }
    return valid;
}, "This field is required.");

/*
 * External Provider Id Url validation
 */
$.validator.addMethod("prov_url_rule", function (value, element) {
	var urlregex = /^(?!.{21,}|https?:|ttps?:|tps?:|ps?:|s?:|^\/)(?:www\.)?[^.\s@]+\.[^\s][^\/]+$/;
	return urlregex.test(value);
}, "Please enter a valid URL.");

/*
 * function for initialize the jQuery plugin validation and ajax for form submission.
 * 
 * name - Name Field mapping
 * page_id - Form hidden Id field
 * @add_url - Add page url.
 * @view_url - Manager page url.
 * page_name - Functionality name. Pattern for this name 
 * 			   is first letter should be Upper case, followed 
 *             by lower case. Example:- "Platform".
 */
function init_validation(form, name, page_id, $add_url, $view_url, $unique_url, page_name) {
	var submitted = false;
	//Common rules for few pages
	var uniqueRule = {
			blank: true,
			remote : {
				type: 'GET',
				url: $unique_url+'?id='+$(page_id).val(),
				dataType: 'json'
			}
	};
	
	var crossRule = {
			cross_rule: true
	};

	var uniqueMsg = {
			remote: "Value already exists, please enter another name."
	};
	
	$(form).validate({
		//Custom rule - defined in specific page.
		rules: { 
			name: uniqueRule,
			provGrpName: uniqueRule,
			providerName: uniqueRule,
			sites: crossRule,
			providers: crossRule,
			providerQaContact: { email: true },
			extProviderId: { prov_url_rule: true  }	
		},
		messages: {
			name: uniqueMsg,
			provGrpName: uniqueMsg,
			providerName: uniqueMsg
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
        	if(element.parents('.form-group').length && element.parents('.form-group').find('select').hasClass('selectpicker')) {
            	//if bootstrap-select plugin used 
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
        },
        //handler for ajax request submit
		submitHandler: function(form) {
			var $name = $(name).val();
			var $form = $('form');
			$('button:submit').prop('disabled', true);
	      	$.post($form.attr('action'), $form.serialize(), function(response) {
	      		$('button:submit').prop('disabled', false);
	      		//Clear server side validation error, if any
	      		$form.find('.form-group').removeClass('error');
				$form.find('.error-inline').empty();
				
				//Failed due to server side validation
	      		if('FAIL' === response.status && null !== response.result && response.result.length > 0) {
	      			for (var i = 0; i < response.result.length; i++) {
						var item = response.result[i];
						var $formGroup = $('#' + item.fieldName);
						$formGroup.parents('.form-group').addClass('error');
						$formGroup.parents('.form-group').find('.error-inline').html(item.message);
					}
	      		//Success and showing success confirmation modal.
	      		} else {
				  	if('SUCCESS' === response.status) {
				  		var $success = $('#successModal');
				  		$success.find(".modal-title").text("Save "+page_name);
				  		var id = response.id;
				  		if(typeof id != 'undefined' && id > 0) {
				  			$(page_id).val(id);
				  			var title = $('.page-header').find('h1').text();
				  			if(('Add '+page_name) === title) {
				  				$success.find('.modal-footer .btn-primary').attr('href', $add_url+'/'+id);
				  			} else {
				  				$success.find('.modal-footer .btn-primary').attr('href', $view_url+'/'+id);
				  			}
				  		}
				  		$success.find(".modal-body span").html(page_name+" <strong>"+$name+"</strong> was successfully saved.");
				  		$success.modal('show');
				  	//Unknown failure.
				  	} else {
				  		$("#errormessages").html("<span class='glyphicon glyphicon-warning-sign'/>"+"Unknown issue while saving <strong>"+$name+"</strong> "+page_name+".");
				  		$("#errormessages").addClass("alert alert-warning");
		                $("#errormessages").show();
				  	}
	      		}
	      	});
            return false; // required to block normal submit since we used Ajax to submit form.
		}
	});
}

/*
 * Remove button section
 * 
 * To use these below two function, you need to associate proper classes in button.
 */
function remove_button(messages){
	var $modal = $('#removeModal');
	$modal.find(".modal-body span").html(messages["form.remove.confirm.message"]);
  	$modal.modal('show');
}

function remove_confirm($this, page_id, $view_url, messages){
	var id = $(page_id).val();
	$this.prop('disabled', true);
	$.ajax({
	    url: $view_url+'/'+id,
	    type: 'DELETE',
	    success: function(response) {
	    	if('SUCCESS' === response.status) {
	    		window.location.href = $view_url;
	    	} else {
	    		$this.prop('disabled', false);
	    		$('#removeModal').modal('hide');
	    		
	    		if(null !== response.result) {
	    			$("#errormessages").html("<span class='glyphicon glyphicon-warning-sign'/>"+messages["form.remove.linked."+response.result]);
	    		} else {
	    			$("#errormessages").html("<span class='glyphicon glyphicon-warning-sign'/>"+messages["form.remove.unknown"]);
	    		}
	    		$("#errormessages").addClass("alert alert-warning");
                $("#errormessages").show();
	    	}
	    }
	});
}

/*
 * Small datatable for form page.
 */
function form_dataTable(tableId) {
	var obj = $(tableId).dataTable({
		"columnDefs": [{"width": "15%", "targets": 0 }, {className: "dt-center", "targets": [0]}, {className: "dt-head-center", "targets": [1]}],
		"ordering": false,
		"sDom":"rt",
		"scrollY": "200px",
		"scrollCollapse": true,
		"paging": false
	});
	return obj;
}

/*
 * function for select all check control in small datatable.
 */
function updateDataTableSelectAllCtrl(oTable, removebtn, chkbox_select_all) {
	var $table             = oTable.api().table().node();
	var $chkbox_all        = $('tbody input[type="checkbox"]', $table);
	var $chkbox_checked    = $('tbody input[type="checkbox"]:checked', $table);
	
	// If none of the checkboxes are checked
	if($chkbox_checked.length === 0){
		chkbox_select_all.prop('checked', false);
		removebtn.prop('disabled', true);
	// If all of the checkboxes are checked
	} else if ($chkbox_checked.length === $chkbox_all.length){
	    chkbox_select_all.prop('checked', true);
	    removebtn.prop('disabled', false);
	// If some of the checkboxes are checked
	} else {
	    chkbox_select_all.prop('checked', false);
	    removebtn.prop('disabled', false);
	}
}

/*
 * Disable all field except Done button for Update screen if we don't have permission.
 */
function disableUpdateScreen(permission) {
	if(permission == 'false') {
		$(':input').prop('disabled', true);
		$('button').prop('disabled', true);
	}
}

//To show tooltip if it exceeds max width of cell.
$('table').on("mouseenter", '.media-word-wrap', function() {
	var $this = $(this);
    if(this.offsetWidth < this.scrollWidth && !$this.attr('title')){
        $this.attr('title', $this.text());
    }
})

//To remove tooltip if the mouse over moves out.
$('table').on("mouseleave", '.media-word-wrap', function() {
	var $this = $(this);
	if($this.attr('title')) {
		$this.removeAttr('title');
	}
})

var scrollTop = function () {
	$("html, body").animate({ scrollTop: 0 }, "slow");
};