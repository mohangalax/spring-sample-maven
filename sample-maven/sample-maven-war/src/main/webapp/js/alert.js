$(document).ready(function() {
	//unsaved boolean
	var unsaved = false;

	$("form").on('change', ':input', ':select', function() { //triggers change in all input/select fields including text type
	    unsaved = true;
	});

	var pageEvent = false;
	$(document).on('click', 'a.form-unsaved', function() { //Triggers modal popup only for "form-unsaved" element & if unsaved data available in form.
		pageEvent = true;
		var $this = $(this);
		if(unsaved === true) {
			var $modal = $('#unsaveModal');
		  	$modal.find(".modal-title").text("Unsaved Changes");
		  	$modal.find(".modal-body span").html("Changes have not been saved. Do you want to save changes?");
		  	$modal.find('.modal-footer .btn-warning').attr('href', $this.attr('href'));
		  	$modal.modal('show');
			return false;
		} else {
			return;
		}
	});
	
	$('#unsaveModal button[data-dismiss="modal"]').click(function() { //Reset pageEvent to false, if user click Close(X) button or Cancel button.
		pageEvent = false;
	});
	
	$('button.remove-confirm').click(function() { //Set pageEvent to true, once user hits remove confirm.
		pageEvent = true;
	});

	$(window).bind('beforeunload', function() { //Trigger browser unsaved pop, only if pageEvent is false.
		
		if (pageEvent) {
            return undefined;
        }
		
	    if(unsaved){
	        return "You have unsaved changes on this page. Do you want to leave this page and discard your changes or stay on this page?";
	    }
	});
	
	$('button:submit').click(function() { //Reset unsaved boolean after Save button click.
		unsaved = false;
	});

	$('#unsaveModal .modal-footer .btn-primary').click(function() { //Trigger form submit, if Ok button is clicked from custom modal popup.
		//$('button:submit').prop('disabled', true);
		$('form:visible').submit();
		$('#unsaveModal').modal('hide');
	});
});