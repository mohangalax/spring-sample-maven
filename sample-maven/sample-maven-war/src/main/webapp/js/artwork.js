// Array holding selected row IDs
var rows_selected = [], rows_data = [];

$('#add-collection-artwork').click(function() {
	var $modal = $('#addArtworkModal');
	$modal.on('shown.bs.modal', function () {
		var $this = $(this);
		//Autofocus to Keyword field.
		$('#keyword').focus();
		
		//Select2 initialization
		$.fn.select2.amd.require(['select2/compat/matcher'], function (oldMatcher) {
			$('#providers').select2({
				placeholder: "Select one or more providers...",
				hideSelectionFromResult: true,
				width: 273,
				matcher: oldMatcher(matchStart)
			});
			
			$('#platforms').select2({
				placeholder: "Select one or more platforms...",
				hideSelectionFromResult: true,
				width: 273,
				matcher: oldMatcher(matchStart)
			});
		});
		
		//Oldmatcher function - match only words that start with search term.
		function matchStart (term, text) {
		  if (text.toUpperCase().indexOf(term.toUpperCase()) == 0) {
		    return true;
		  }

		  return false;
		}
		
	});
	$modal.modal('show');
});

//Enable search button when atleast a field has value. 
$('form#artwork').on('change input', ':input', function() {
	var $that = $('#addArtworkModal');
	var completed = $('form#artwork :input').filter(function() {return !!$.trim(this.value);}).length > 0;
	$that.find('form button.btn').prop('disabled', !completed);
});

//Below is for setting hidden value to avoid multiple 
//Providers & Platforms attribute in pagination request.
$('#providers').change(function() {
	$('#selProviders').val($(this).val());
});

$('#platforms').change(function() {
	$('#selPlatforms').val($(this).val());
});

//Add Artwork modal - Search artwork datatable
var artwork_table = $('#artworks-table-modal').DataTable( {
	"deferLoading": 0,
	"destroy": true,
	"sDom":"rtip",
	"bSort" : false,
	"autoWidth": false,
    "bServerSide": true,
    "iDisplayLength": 8,
    "sAjaxSource": "/mediacentral/artworks/search",
    "sPaginationType": "full_numbers",
    "oLanguage": {
    	"sEmptyTable": "No matching artwork found",
        "sInfoFiltered": "",
        "oPaginate": {
	        "sNext": '&gt;',
	        "sLast": '>>',
	        "sFirst": '<<',
	        "sPrevious": '&lt;'
	     }
    },
    "fnServerParams": function (aoData) {
    	aoData.push({
    		"name": "keyword",
    		"value": $.trim($('#keyword').val())
    	}),
    	aoData.push({
    		"name": "providers",
    		"value": $('#selProviders').val()
    	}),
    	aoData.push({
    		"name": "platforms",
    		"value": $('#selPlatforms').val()
    	}),
    	aoData.push({
    		"name": "season",
    		"value": $.trim($('#season').val())
    	}),
    	aoData.push({
    		"name": "type",
    		"value": $('#artworktype').val()
    	}),
    	//Passing artworkIds to avoid those while applying hibernate criteria in dao.
    	aoData.push({
    		"name": "artworkIds",
    		"value": $("#artworkIds").val()
    	})
		$('#search-modal').modal('show');
    },
    "columnDefs": [
		{
			targets: 0,
	        className: "dt-center",
	        render: function ( data, type, row ){
	             return "<input type='checkbox'>";
	         }
		},
		{
			targets: 1,
			render: function ( data, type, row ) {
				return '<img src="data:image/gif;base64,'+row.imageTnail+'">';
			}
		},
		{
			targets: 2,
			render: function ( data, type, row ) {
				return '<div class="media-word-wrap">'+row.name+'</div>';
			}
		},
		{
			targets: 3,
			render: function ( data, type, row ) {
				return '<div class="media-word-wrap">'+row.filename+'</div>';
			}
		},
		{
			targets: 4,
			render: function ( data, type, row ) {
				var items = new Array();
				$.each( row.selProviders, function( key, val ) {
					items.push( "<li class='list-unstyled'><div class='media-word-wrap'><span class='label label-primary'>" + val + "</span></div></li>" );
				});
				return items.join('');
			}
		},
		{
			targets: 5,
			render: function ( data, type, row ) {
				var items = new Array();
				$.each( row.selPlatforms, function( key, val ) {
					items.push( "<li class='list-unstyled'><div class='media-word-wrap'><span class='label label-info'>" + val + "</span></div></li>" );
				});
				return items.join('');
			}
		}
	],
	"columns" : [ 
	    { data : "artworkId", width : "5%", "sDefaultContent":""},
	    { data : "image", width : "8%", "sDefaultContent":""}, 
        { data : "name", width : "15%", "sDefaultContent":""},
        { data : "filename", width : "15%", "sDefaultContent":""},
        { data : "selProviders", width : "15%", "sDefaultContent":""},
        { data : "selPlatforms", width : "15%", "sDefaultContent":""},
        { data : "season", width : "10%", "sDefaultContent":""},
        { data : "type", width : "16%", "sDefaultContent":""},
    ],
	"fnServerData": function (sSource, aoData, fnCallback, oSettings) {
		oSettings.jqXHR = $.getJSON(sSource, aoData, function (json) {
            if(json.aaData != null){
            	$('#artworks-table-modal').removeClass('display-none');
            	$('.artwork-add-close').removeClass('display-none');
          	    fnCallback(json);
            } else {
            	var host = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port: '');
            	window.location = host + "/mediacentral/artworks";
	        }
            $('#search-modal').modal('hide');
         }).done(function(){
         }).fail(function handleError(jqXHR, statusText, errorThrown) {
        	 $('#search-modal').modal('hide');
        	 if(statusText != 'abort') {
             	alert("The page cannot load.  Refresh your browser or if this problem persists, contact support.");
        	 }
         });
    },
    "rowCallback": function(row, data, dataIndex) {
        // Get row ID
        var artworkId = data.artworkId;
        
        // If row ID is in the list of selected row IDs
        if($.inArray(artworkId, rows_selected) !== -1){
           $(row).find('input[type="checkbox"]').prop('checked', true);
           $(row).addClass('selected');
        }
     },
     "fnDrawCallback": function() {
    	 if(this.fnSettings().fnRecordsDisplay() > 0) {
    		 $(this).siblings('.dataTables_paginate').removeClass("display-none");	
    		 $(this).siblings('.dataTables_info').removeClass("display-none");
    	 } else {
    		 $(this).siblings('.dataTables_paginate').addClass("display-none");	
    		 $(this).siblings('.dataTables_info').addClass("display-none");
    	 }
     }
});

//Datatable initialize & Pagination stuff
$('form#artwork').submit(function(e) {
	e.preventDefault();
	artwork_table.draw();
	rows_selected = [];
    rows_data = [];
    col_rows_selected = [];
	$('.artwork-add-close').prop('disabled', true);
	return false;
});
	
// Handle click on checkbox
$('#artworks-table-modal tbody').on('click', 'input[type="checkbox"]', function(e) {
	var $row = $(this).closest('tr');
	
	// Get row data
	var data = artwork_table.row($row).data();
	  
	// Get row ID
	var artworkId = data.artworkId;
	  
	// Determine whether row ID is in the list of selected row IDs 
	var index = $.inArray(artworkId, rows_selected);
	
	// If checkbox is checked and row ID is not in list of selected row IDs
	if(this.checked && index === -1){
		rows_selected.push(artworkId);
	    rows_data.push(data);
	// Otherwise, if checkbox is not checked and row ID is in list of selected row IDs
	} else if (!this.checked && index !== -1){
		rows_selected.splice(index, 1);
	    rows_data.splice(index, 1);
	}
	
	if(this.checked){
		$row.addClass('selected');
	} else {
		$row.removeClass('selected');
	}
	
	if(rows_selected.length > 0) {
		$('.artwork-add-close').prop('disabled', false);
	} else {
		$('.artwork-add-close').prop('disabled', true);
	}
	  
	// Update state of "Select all" control
	updateArtworkSelectAllCtrl(artwork_table, '#artwork-select-all');
	
	// Prevent click event from propagating to parent
	e.stopPropagation();
});

// Handle click on table cells with checkboxes
$('#artworks-table-modal').on('click', 'tbody td:first-child, thead th:first-child', function(e){
	$(this).parent().find('input[type="checkbox"]').trigger('click');
});

// Handle click on "Select all" control
$('thead input[name="select_all"]', artwork_table.table().container()).on('click', function(e){
	if(this.checked){
		$('#artworks-table-modal tbody input[type="checkbox"]:not(:checked)').trigger('click');
	} else {
		$('#artworks-table-modal tbody input[type="checkbox"]:checked').trigger('click');
	}

	// Prevent click event from propagating to parent
	e.stopPropagation();
});

// Handle table draw event
artwork_table.on('draw', function(){
	// Update state of "Select all" control
	updateArtworkSelectAllCtrl(artwork_table, '#artwork-select-all');
});

//ClearAll button
$('button.artwork-close').click(function() {
	rows_selected = [];
    rows_data = [];
    col_rows_selected = [];
	$('.artwork-add-close').prop('disabled', true);
	$('.artwork-add-close').addClass('display-none');
	
	var $artwork = $('#addArtworkModal');
	$artwork.find(':input').val('').trigger('change');
	$artwork.find('form')[0].reset();
	$artwork.find('tbody').empty();
	$artwork.find('table').addClass('display-none');
	$artwork.find('.dataTables_info').addClass("display-none");
	$artwork.find('.dataTables_paginate').addClass("display-none");
	
	var $collection = $('#addCollectionModal');
	$collection.find(':input').val('').trigger('change');
	$collection.find('tbody').empty();
	$collection.find('table').addClass('display-none');
	$collection.find('.dataTables_info').addClass("display-none");
	$collection.find('.dataTables_paginate').addClass("display-none");
});

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
});


//Collection artworks - datatable
var editable = 'true';
var collection_table = $('#selected-artworks').DataTable({
	dom: "rtip",
	ordering: false,
	autoWidth: false,
    pageLength: 5,
    sPaginationType: "full_numbers",
    language: {
        paginate: {
	        next: '&gt;',
	        last: '>>',
	        first: '<<',
	        previous: '&lt;'
	     }
    },
    columnDefs: [
	   			{
	   				targets: 0,
	   		        visible: false,
	   			},
	   			{
	   				targets: 1,
	   				render: function ( data, type, row ) {
	   					return artworkFirstColumnDef( data, type, row );
	   				}
	   			},
	   			{
	   				targets: 2,
	   				render: function ( data, type, row ) {
	   					return artworkSecondColumnDef( data, type, row );
	   				}
	   			},
	   			{
	   				targets: 3,
	   				render: function ( data, type, row ) {
	   					return '<div class="media-word-wrap">'+data+'</div>';
	   				}
	   			},
	   			{
	   				targets: 4,
	   				render: function ( data, type, row ) {
	   					var items = new Array();
	   					$.each( data, function( key, val ) {
	   						items.push( "<li class='list-unstyled'><div class='media-word-wrap'><span class='label label-primary'>" + val + "</span></div></li>" );
	   					});
	   					return items.join('');
	   				}
	   			},
	   			{
	   				targets: 5,
	   				render: function ( data, type, row ) {
	   					var items = new Array();
	   					$.each( data, function( key, val ) {
	   						items.push( "<li class='list-unstyled'><div class='media-word-wrap'><span class='label label-info'>" + val + "</span></div></li>" );
	   					});
	   					return items.join('');
	   				}
	   			},
	   			{
	   				targets: 8,
	   				className: "dt-center",
	   				render: function ( data, type, row ) {
	   					var remove_link;
	   					if(editable === 'true') {
	   						remove_link = '<div class="remove-artwork"><a href="javascript:void(0);"><i class="glyphicon glyphicon-remove-circle" style="color:#8B0000"></i> Remove</a></div>';
	   					} else {
	   						remove_link = '<i class="glyphicon glyphicon-remove-circle" style="color:#8B0000"></i> Remove';
	   					}
	   					return remove_link;
	   				}
	   			}
	   		],
    drawCallback: function() {
   	 if(this.fnSettings().fnRecordsDisplay() > 0) {
   		 $(this).siblings('.dataTables_paginate').removeClass("display-none");	
   		 $(this).siblings('.dataTables_info').removeClass("display-none");
   	 } else {
   		 $(this).siblings('.dataTables_paginate').addClass("display-none");	
   		 $(this).siblings('.dataTables_info').addClass("display-none");
   	 }
    }
});

function artworkFirstColumnDef( data, type, row ) {
	return '<a class="form-unsaved" href="/mediacentral/artworks/'+row[0]+'"><img src="data:image/gif;base64,'+data+'"></a>';
}

function artworkSecondColumnDef( data, type, row ) {
	return '<a class="form-unsaved" href="/mediacentral/artworks/'+row[0]+'"><div class="media-word-wrap">'+data+'</div></a>';
}

$('.artwork-add-close').click(function() {
	//Know existing artworks in this collection
	var existArtworks = new Array();
	collection_table.columns(0).every( function () {
		var columnData = this.data();
		columnData.unique().each( function ( d, j ) {
			existArtworks.push(d);		            	  
        });
	});
	
	//Add selected artworks to collection only if its not there
	for(var i = 0; i < rows_data.length; i++) {
		if($.inArray(rows_data[i].artworkId, existArtworks) === -1){
			collection_table.row.add([
    		                          rows_data[i].artworkId,
    		                          rows_data[i].imageTnail,
    		                          rows_data[i].name,
    		                          rows_data[i].filename,
    		                          rows_data[i].selProviders,
    		                          rows_data[i].selPlatforms,
    		                          rows_data[i].season,
    		                          rows_data[i].type
    		                          ]).draw(false);
		}
	}
	
	//Add new artwork ids to hidden field.
	var exist_artworkIds = [];
	
	if($('#artworkIds').val()) {
		exist_artworkIds = $('#artworkIds').val().split(',');
	}
	
	for(var i in rows_selected) {
		if($.inArray(rows_selected[i].toString(), exist_artworkIds) === -1) {
			exist_artworkIds.push(rows_selected[i]);
		};
	}
	
	$('#artworkIds').val(exist_artworkIds).trigger('change');
	
	$('#selected-artworks').removeClass('display-none');
	$('#remove-collection-artwork').prop('disabled', false);
	$('.artwork-add-close').prop('disabled', true);
	$('button.artwork-close').trigger('click');
});

//Update section
function populateSelectedArtworksTable(artworksData, isEditable) {
	editable = isEditable;
	for(var i = 0; i < artworksData.length; i++) {
		collection_table.row.add([
		                          artworksData[i].artworkId,
		                          artworksData[i].imageTnail,
		                          artworksData[i].name,
		                          artworksData[i].filename,
		                          artworksData[i].selProviders,
		                          artworksData[i].selPlatforms,
		                          artworksData[i].season,
		                          artworksData[i].type
		                          ]).draw(false);
	}
	$('#selected-artworks').removeClass('display-none');
	$('#add-collection-artwork').prop('disabled', false);
	$('#remove-collection-artwork').prop('disabled', false);
	$('#no-artwork').addClass('display-none');
}

//Remove section
function RemoveArtwork(name, page_name) {
    this.init.apply(this, arguments); //This simply calls init with the arguments from RemoveArtwork
}

RemoveArtwork.prototype.init = function(name, page_name) {
	this.name = name;
	this.page_name = page_name;
	var $row, data, $removeModal = $('#removeArtworkModal');
	
	//Remove artwork item Confirmation modal
    $('#selected-artworks').on( 'click', '.remove-artwork', function() {
    	$row = $(this).closest('tr');
    	data = collection_table.row($row).data();
    	$removeModal.find('button.btn-primary').removeClass('removeAll-artwork-confirm').addClass('remove-artwork-confirm');
    	$removeModal.find(".modal-body span").html("You are about to remove the <strong>"+data[2]+"</strong> artwork item from the <strong>"+$(name).val()+"</strong> "+page_name+". Are you sure you want to remove this artwork?");
    	$removeModal.modal('show');
    });
	
    //Remove artwork item from table and splice that artworkId, rows_selected, rows_data from array.
	$('#removeArtworkModal').on( 'click', '.remove-artwork-confirm', function() {
    	var artworkIds = $('#artworkIds').val().split(',');
    	var artworkId_index = $.inArray((data[0]).toString(), artworkIds);
    	artworkIds.splice(artworkId_index ,1);
    	$('#artworkIds').val(artworkIds).trigger('change');
    	collection_table.row($row).remove().draw(false);
    	
    	var row_index = $.inArray(data[0], rows_selected);
    	rows_selected.splice(row_index ,1);
    	
    	for(var i = 0; i < rows_data.length; i++) {
    		if(data[0] === rows_data[i].artworkId) {
    			rows_data.splice(i, 1);
    		}
    	}
    	
    	$removeModal.modal('hide');
    });
	
	//Remove all artwork from collection confirmation modal.
	$('#remove-collection-artwork').click(function(){
		$removeModal.find('button.btn-primary').removeClass('remove-artwork-confirm').addClass('removeAll-artwork-confirm');
    	$removeModal.find(".modal-body span").html("You are about to remove all artwork in the <strong>"+$(name).val()+"</strong> "+page_name+". Are you sure you want to remove all items?");
    	$removeModal.modal('show');
	});
	
	//Remove all artwork from table and empty artworkIds, rows_selected, rows_data values.
	$('#removeArtworkModal').on( 'click', '.removeAll-artwork-confirm', function() {
    	$('#artworkIds').val([]).trigger('change');
    	collection_table.rows().remove().draw(false);
    	
    	rows_selected = [];
    	rows_data = [];
    	col_rows_selected = [];
    	
    	$('#remove-collection-artwork').prop('disabled', true);
    	$removeModal.modal('hide');
    });
}

//Updates "Select all" control in a data table
function updateArtworkSelectAllCtrl(table, chkbox_select_all) {
	var $table             = table.table().node();
	var $chkbox_all        = $('tbody input[type="checkbox"]', $table);
	var $chkbox_checked    = $('tbody input[type="checkbox"]:checked', $table);
	
	if($chkbox_checked.length === 0){
		$(chkbox_select_all).prop('checked', false);
	} else if ($chkbox_checked.length === $chkbox_all.length){
		$(chkbox_select_all).prop('checked', true);
	} else {
		$(chkbox_select_all).prop('checked', false);
	}
}

/*
 * Add Collection to Master asset - Artwork Tab
 */

var collection_keyword, col_rows_selected = [];

$('#add-master-collection').click(function() {
	var $modal = $('#addCollectionModal');
	$modal.on('shown.bs.modal', function () {
		var $this = $(this);
		//Autofocus to Keyword field.
		$('#collection-keyword').focus();
	});
	$modal.modal('show');
});

//Enable search button when collection keyword is entered. 
$('#collection-keyword').on('change input', function() {
	var completed = $.trim($(this).val()).length > 0;
	$('#collection-search').prop('disabled', !completed);
});

var collection_table_modal = $('#collections-table-modal').DataTable( {
	deferLoading: 0,
	dom:"rtip",
	destroy: true,
	ordering : false,
    serverSide: true,
    autoWidth: false,
    pageLength: 10,
    sAjaxSource: "/mediacentral/artworks/collections/search",
    sPaginationType: "full_numbers",
    language: {
    	emptyTable: "No matching collection found",
    	infoFiltered: "",
        paginate: {
	        next: '&gt;',
	        last: '>>',
	        first: '<<',
	        previous: '&lt;'
	     }
    },
    fnServerParams: function (aoData) {
    	aoData.push({
    		"name": "keyword",
    		"value": collection_keyword
    	}),
		$('#search-modal').modal('show');
    },
    columnDefs: [
 		{
			targets: 0,
	        className: "dt-center",
	        render: function ( data, type, row ){
	             return "<input type='checkbox'>";
	         }
		},
		{
			targets: 4,
			className: "dt-center",
			render: function ( data, type, row ) {
				var count = Object.keys(row.artworks).length;
				var artworks = JSON.stringify(row.artworks).replace(/\"/g, '&#34;');
				return '<div class="artworks" data-title="'+row.name+'" data-artworks="'+artworks+'"> <a href="#"><span class="badge">'+count+'</span></a>';
			}
		}
	],
	columns: [
	    {data : "", width : "5%", "sDefaultContent":""}, 
	    {data : "name", width : "35%", "sDefaultContent":""}, 
        {data : "type", width : "10%", "sDefaultContent":""},
        {data : "description", width : "42%", "sDefaultContent":""},
        {data : "artworks", width : "8%", "sDefaultContent":""}
    ],
	fnServerData: function (sSource, aoData, fnCallback, oSettings) {
		oSettings.jqXHR = $.getJSON(sSource, aoData, function (json) {
            if(json.aaData != null){
            	$('#collections-table-modal').removeClass('display-none');
            	$('.artwork-add-close').removeClass('display-none');
          	    fnCallback(json);
            } else {
            	var host = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port: '');
            	window.location = host + "/mediacentral/artworks/collections";
	        }
            $('#search-modal').modal('hide');
         }).done(function(){
         }).fail(function handleError(jqXHR, statusText, errorThrown) {
        	 $('#search-modal').modal('hide');
        	 if(statusText != 'abort') {
             	alert("The page cannot load.  Refresh your browser or if this problem persists, contact support.");
        	 }
         });
    },
    rowCallback: function(row, data, dataIndex) {
        // Get row ID
        var artCollId = data.artCollId;
        
        // If row ID is in the list of selected row IDs
        if($.inArray(artCollId, col_rows_selected) !== -1){
           $(row).find('input[type="checkbox"]').prop('checked', true);
           $(row).addClass('selected');
        }
     },
    drawCallback: function() {
   	 if(this.fnSettings().fnRecordsDisplay() > 0) {
   		 $(this).siblings('.dataTables_paginate').removeClass("display-none");	
   		 $(this).siblings('.dataTables_info').removeClass("display-none");
   	 } else {
   		 $(this).siblings('.dataTables_paginate').addClass("display-none");	
   		 $(this).siblings('.dataTables_info').addClass("display-none");
   	 }
    }
});

//When searching with keyword
$('#collection-search').click(function(e) {
	e.preventDefault();
	collection_keyword = $.trim($('#collection-keyword').val());
	collection_table_modal.clear().draw();
	
	return false;
});

//Handle click on checkbox
$('#collections-table-modal tbody').on('click', 'input[type="checkbox"]', function(e) {
	var checked = this.checked;
	var $row = $(this).closest('tr');
	
	var collection_data = collection_table_modal.row($row).data();
	
	//Store selection collection id.
	var artCollId = collection_data.artCollId;
	var index_col = $.inArray(artCollId, col_rows_selected);
	
	if(checked && index_col === -1) {
		col_rows_selected.push(artCollId);
	} else if (!checked && index !== -1) {
		col_rows_selected.splice(index_col, 1);
	}
	
	//Store selected collections artwork & detail.
	var data = collection_data.artworks;
	
	$.each(data, function(index, row) {
		var artworkId = row.artworkId;
		
		var index = $.inArray(artworkId, rows_selected);
		
		if(checked && index === -1) {
			rows_selected.push(artworkId);
		    rows_data.push(row);
		} else if (!checked && index !== -1) {
			rows_selected.splice(index, 1);
		    rows_data.splice(index, 1);
		}
	});
		
	if(checked){
		$row.addClass('selected');
	} else {
		$row.removeClass('selected');
	}
	
	if(rows_selected.length > 0) {
		$('.artwork-add-close').prop('disabled', false);
	} else {
		$('.artwork-add-close').prop('disabled', true);
	}
	
	// Update state of "Select all" control
	updateArtworkSelectAllCtrl(collection_table_modal, '#collection-select-all');
	
	// Prevent click event from propagating to parent
	e.stopPropagation();
});

// Handle click on table cells with checkboxes
$('#collections-table-modal').on('click', 'tbody td:first-child, thead th:first-child', function(e){
	$(this).parent().find('input[type="checkbox"]').trigger('click');
});

// Handle click on "Select all" control
$('thead input[name="select_all"]', collection_table_modal.table().container()).on('click', function(e){
	if(this.checked){
		$('#collections-table-modal tbody input[type="checkbox"]:not(:checked)').trigger('click');
	} else {
		$('#collections-table-modal tbody input[type="checkbox"]:checked').trigger('click');
	}

	// Prevent click event from propagating to parent
	e.stopPropagation();
});

// Handle table draw event
collection_table_modal.on('draw', function() {
	// Update state of "Select all" control
	updateArtworkSelectAllCtrl(collection_table_modal, '#collection-select-all');
});

$('#collections-table-modal').on('click', '.artworks', function() {
	var artworks = $(this).data('artworks');
	var collName = $(this).data('title');
	var $modal = $('#artworkModal');
	$modal.one('shown.bs.modal', function () {
    	$('#artworkDetail').DataTable({
    		data: artworks,
    		dom:"t",
    		destroy: true,
    		ordering : false,
    		autoWidth: false,
    		scrollY: "700px",
    		scrollCollapse: true,
    		columns : [ 
	               {data : "imageTnail", width : "8%", "sDefaultContent":""}, 
	               {data : "name", width : "15%", "sDefaultContent":""},
	               {data : "filename", width : "15%", "sDefaultContent":""},
	               {data : "selProviders", width : "15%", "sDefaultContent":""},
	               {data : "selPlatforms", width : "15%", "sDefaultContent":""},
	               {data : "season", width : "7%", "sDefaultContent":""},
	               {data : "type", width : "13%", "sDefaultContent":""}
               ],
            columnDefs: [
					{
						targets: 0,
						render: function ( data, type, row ) {
							return '<img src="data:image/gif;base64,'+row.imageTnail+'">';
						}
					},
					{
						targets: 1,
						render: function ( data, type, row ) {
							return '<div class="media-word-wrap">'+row.name+'</div>';
						}
					},
					{
						targets: 2,
						render: function ( data, type, row ) {
							return '<div class="media-word-wrap">'+row.filename+'</div>';
						}
					},
					{
						targets: 3,
						render: function ( data, type, row ) {
							var items = new Array();
							$.each( row.selProviders, function( key, val ) {
								items.push( "<li class='list-unstyled'><div class='media-word-wrap'><span class='label label-primary'>" + val + "</span></div></li>" );
							});
							return items.join('');
						}
					},
					{
						targets:[4],
						render: function ( data, type, row ) {
							var items = new Array();
							$.each( row.selPlatforms, function( key, val ) {
								items.push( "<li class='list-unstyled'><div class='media-word-wrap'><span class='label label-info'>" + val + "</span></div></li>" );
							});
							return items.join('');
						}
					}
			]
        });
	});
	$modal.find('.modal-title').html(collName);
	$modal.modal('show');
});
