<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags"%>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<%@ taglib prefix="b" uri="http://ais.ese.espn.com/tags/bootstrap" %>
<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags"%>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>

<c:url var="home" value="/"/>
<c:url var="view" value="/content/categories/name"/>
<c:url var="save" value="/content/categories/save"/>
<c:url var="edit" value="/content/categories/"/>

<t:page navContext="Content">
       <jsp:attribute name="title">Content</jsp:attribute>
        <jsp:attribute name="head">                   
       <style>
       .fixed-panel {
  			min-height: 500px;  	
  			max-height: 500px;
  			overflow-y: scroll;
  			border-color: #2F4F4F;
		} 
       </style>
       </jsp:attribute>
       
       <jsp:attribute name="js"> 
       		<script>
            	$(document).ready(function() {
                	var respData = null;
                    loadTree(respData);         
                    
		            var providerName = null;   
                    $('#catgProvider').change(function(e){
                    	var tree = $("#tree");
                    	$('#showDisabled').prop('checked', false)
                    	if($(this).val() != '') {
                        	$("#showDisabled").prop("disabled", false);
                        	$("#addAction").show();
                        		providerName = $(this).val(); 
                        		//get categories by provider name
                        		$.ajax({
                            		type: "GET",                            			
                            		url: "${view}",
                            		data: {providerName: providerName},
                            		success: function(respData) {
                            			tree.jstree('destroy');
                             			loadTree(respData);   					
                             		}
                            	}); 
                       	} else{
                        	$("#showDisabled").prop("disabled", true);
                        	$("#addAction").hide();
                        	tree.jstree('destroy');
                        }                        	   
                    });  
                    
                    $("#tree").bind('ready.jstree', function(event, data) { 
     					$("#addAction").click(function() {  	        						
	        				var tree = $('#tree');
	        				$('button.add-confirm').prop('disabled', true);
	        				var $modal = $('#addModal');

	        				if (!tree.find("li").length){
	        					$("#catgAddVal").focus();
	        					//hide location in add modal since its not mandatory when there are no category paths to add under
        						$modal.find(".modal-body").find(".form-group").next().hide();
	        				} else {	        					
	        					var pathListNames = new Array();
		       					var pathListIds = new Array();
		       	                var option = '<option value=""> </option>';
		       	                   	  	
		       	         		$(tree.jstree().get_json(tree, {
		       	         			flat: true
		       	         		    }))
		       	         		    .each(function(index, value) {
		      	         		    	var node = tree.jstree().get_node(this.id);
		      	         		    	//do not show location paths of diabled categories 
		      	         		    	if(node.state.disabled == false){
		      	         		    		//show location paths only upto 5 level 
			       	         		    	if(node.parents.length < 5){
			       	         		    		catgPathNames = tree.jstree(true).get_path(node, '/');
			       	         		    	    catgPathId = tree.jstree(true).get_path(node, '/', true);       	         		    	      	
			       	         		    	    pathListNames.push(catgPathNames);
			       	         		    	    pathListIds.push(catgPathId);
			       	         		    	}
		      	         		    	}		      	         		    	
		       	         		});
		       	         		   	  
		       					for (var i=0;i<pathListNames.length;i++){
		       	       		       option += '<option value="'+ pathListIds[i] + '">' + pathListNames[i] + '</option>';
		       	       		    }
		       					
		       					$modal.find(".modal-body").find(".form-group").next().show();
		       	       		    $('#location').append(option);
		       	       		    $('.selectpicker').selectpicker('refresh');	        					
	        				} 
	                        $modal.modal('show',function () {	                          
	  		         	      $('.modal-body',this).css({width:'auto',height:'auto', 'max-height':'100%'});
	  		         		});
        				});
     					
     					$('#addModal').on('shown.bs.modal', function () {
                      	    $("#catgAddVal").focus();
                      	});
     					
     					$('#catgAddVal').on('keyup blur', function() {
     						if($.trim($(this).val()) != ''){
     							$('button.add-confirm').prop('disabled', false); 
     						} else {
     							$('button.add-confirm').prop('disabled', true);
     							$(this).focus();
     						}                     		
                      	});
     					
     					//Blank field validation
     					$.validator.addMethod("blank", function (value, element) {
     						var valid = true;
     					    if ($.trim(value) === '') {
     					    	valid = false;
     					    }
     					    return valid;
     					}, "This field is required.");
     					
						$("#addForm").submit(function(e) {	
								e.preventDefault();
							}).validate({
								rules: {
								      name: {
								    	  blank: true
								      }
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
								    	error.insertAfter(element.parent().parent());             
								    } else if(element.parents('.form-group').length) {
								    	error.insertAfter(element.parent());
								    }
								},
								submitHandler: function(addForm) { 
									var tree = $("#tree");
									var catgText = $('#catgAddVal').val();
									var providerName = $('#catgProvider').val();
									var parentPathIds = $('#location').val();
									var parentId = 0;
								
									if(parentPathIds != null){										
										if (parentPathIds.indexOf('/') == -1) {
											parentId = parentPathIds; 
										} else {
											var parentIdIndex = parentPathIds.lastIndexOf("/") + 1;
											parentId = parentPathIds.substr(parentIdIndex);
										}
									}	
									
									var parentNode = null;
									if(parentId != 0){
										parentNode = tree.jstree(true).get_node(parentId);
									} else{
										parentNode = '#'; // # -> is for root node in jstree
									} 
									
									var category = null;
									
								   $.ajax({
								    	type: "POST",
								 	    url: "${save}",								 	    
								 	    data: {name:catgText, parentId:parentId, providerName:providerName},
								 	  	success: function(response) {
								 	  		if( 'DUPLICATE' == response.result && 'SUCCESS' === response.status){
								 	  			validator = $( "#addForm" ).validate();
									    		validator.showErrors({
									    			  "name": "Value already exists."
									    			});
									    	} else if( 'SUCCESS' === response.status ){
									    		var $modal = $('#addModal');                                            		    		
									    		$modal.modal('hide');									    		
									    		tree.jstree().create_node( parentNode,  { "id": response.id , "text" : catgText, "state" :{"opened":true, "disabled":false, "selected":false} });
									    	}									    	
									    }
								 	});  
								    return false;  
								 }
							});        
 					});                                              
                    
                    $("#showDisabled").change(function(){
		            	$('.enabledActions').remove();
		                var tree = $('#tree');
		                var parent = tree.jstree(true).get_node("#");
		                if (this.checked) {
		                	var hasDisabledNode = false;
		                	$(tree.jstree().get_json(tree, {
	       	         			flat: true
	       	         		    }))
	       	         		    .each(function(index, value) {
	      	         		    	var node = tree.jstree().get_node(value.id);
	      	         		    	//check if there is at least one disabled node in tree
	      	         		    	if(node.state.disabled == true){
	      	         		    		hasDisabledNode = true;
	      	         		    		
	      	         		    		$('#tree').jstree('show_node', value.id); 
	      	         		    		
	      	         		    		var parentNode = $('#tree').jstree(true).get_node(node.parent);
	                    		   		if(parentNode.children.length > 0){
	                    		   			$('#tree').jstree(true).get_node(value.id, true).show();
	                    		   		} else {
	                    		   			$('#tree').jstree('show_node', value.id); 
	                    		   		} 	                    		   		
	      	         		    	}		      	         		    	
	       	         			});
		                	
		                	if(hasDisabledNode){
		                		//close all and open all to trigger after_open event for root node as well since on tree load root node is opened already
	  		                	tree.jstree("close_all");
	  		                	tree.jstree("open_all");
		                	}		                	  	
                  	     } else {
	                  	    	tree.jstree(true).get_children_dom(parent).find(".disabledActions").remove();
	                  	    	$(tree.jstree().get_json(tree, {
		       	         			flat: true
		       	         		    }))
		       	         		    .each(function(index, value) {
		      	         		    	var node = tree.jstree().get_node(value.id);		      	         		    	
		      	         		    	if(node.state.disabled == true){		     	         		    		
		      	         			   		var parentNode = $('#tree').jstree(true).get_node(node.parent);
		                    		   		if(parentNode.children.length > 0){
		                    		   			$('#tree').jstree(true).get_node(value.id, true).hide();
		                    		   		} else {
		                    		   			$('#tree').jstree('hide_node', value.id); 
		                    		   		}
		      	         		    	}		      	         		    	
		       	         			});
	              	     }                 		  
	                  });  
                                                      
                    $('#editModal').on('shown.bs.modal', function () {
                  	    $("#catgEditVal").focus();
                  	})
                    
                    $('#catgEditVal').on('keyup blur', function() {
 						if($.trim($(this).val()) != ''){
 							$('button.edit-confirm').prop('disabled', false); 
 						} else {
 							$('button.edit-confirm').prop('disabled', true);
 							$(this).focus();
 						}                     		
                  	});
                    
                    $("#editForm").submit(function(e) {	
						e.preventDefault();
					}).validate({
						rules: {
						      name: {
						    	  blank: true
						      }
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
							if(element.parents('.form-group').length) {
						    	error.insertAfter(element.parent());
						    }
						},
						submitHandler: function(editForm) { 
							var instance = $('#tree').jstree(true);
							var id = instance.get_selected();
							var catgText = $("#catgEditVal").val();
                      		var state = 'ENABLED';                 		
     		
                      		$.ajax({
                        	    url: '${edit}'+id+'/'+catgText+'/'+state,
                          	    type: 'PUT',	                              	    
                          	  	success: function(response) {
                          	  	if( 'DUPLICATE' == response.result && 'SUCCESS' === response.status){
					 	  			validator = $( "#editForm" ).validate();
						    		validator.showErrors({
						    			  "name": "Value already exists."
						    			});
						    	} else if('SUCCESS' === response.status) {
                        	    		var $modal = $('#editModal');                          				    		
                        	    		$modal.modal('hide');
                        	    		instance.rename_node( instance.get_selected(), catgText);
                        	    	}
                        	   	}
                          	}); 	                          		
						    return false;  
						 }
					});
                    
                    $('button.delete-confirm').click(function() { 
                    	var instance = $("#tree").jstree(true);
                  		var id = $('#tree').jstree(true).get_selected();                                                     
                  		$.ajax({
                    	    url: '${edit}'+id,
                    	    type: 'DELETE',
                    	    success: function(response) {
                    	    	if('SUCCESS' === response.status) {
                    	    		var $modal = $('#deleteModal');                          				    		
                    	    		$modal.modal('hide');
                    	    		instance.delete_node(instance.get_selected());
                    	    	}
                    	    }
                    	});
                  	});
                    
                    $('button.disable-confirm').click(function() { 
                    	$('.disabledActions').remove();
                    	var instance = $("#tree").jstree(true); 
                  		var id = instance.get_selected();    
                  		var catgText = $("#tree").jstree().get_selected(true)[0].text;
                  		var state = 'DISABLE';
                  		var selectedNode = $('#tree').jstree(true).get_node(id);
                  		
                  		/* instance.get_node(id, true).hide();
                  		var $modal = $('#disableModal'); 
                  		$modal.modal('hide'); */
                  		
                  		$.ajax({
                  			type: "PUT",
                    	    url: '${edit}'+id+'/'+catgText+'/'+state,               	    
                    	  	success: function(response) {
                    	    	if('SUCCESS' === response.status) {
                    	    		var $modal = $('#disableModal');                          				    		
                    	    		$modal.modal('hide');
                    		    		
                    	    		var getSelectedBranch = instance.get_json(instance.get_selected(), { 'flat': true });
                    	    		$.each(getSelectedBranch, function( key, value ) {
                    	    		    if (value.state.selected == false) {
                    	    		         $('#tree').jstree('disable_node', value.id);
                    	    		         $('#tree').jstree('hide_node', value.id);                    	    		                             	    		         
                    	    		    }
                    	    		});                        				    		
                    				    		
                    		   		instance.disable_node(instance.get_selected());
                    		   		instance.hide_node(instance.get_selected(), true);
                    		   		var parentNode = $('#tree').jstree(true).get_node(selectedNode.parent);
                    		   		if(parentNode.children.length > 0){
                    		   			$('#tree').jstree(true).get_node(id, true).hide();
                    		   		}
                    		   		
                    		   		$('.enabledActions').remove();
                    		   		instance.deselect_node(instance.get_selected());  
                    		   	}
                    		}
                      	});  
                  	});
                      	
                    $('#location').change(function(e){
                    	$('#location').valid();
                    });                     	
                      	
                    $("#addModal").on("hidden.bs.modal", function(){
    					$('#catgAddVal').val("");
           		    	$('#location').find('option').remove();
           		    	$('.selectpicker').selectpicker('refresh');
           		    	option = '';           		    		
           		    	var addFormValidator = $( "#addForm" ).validate();
                        addFormValidator.resetForm();
                        $('.form-group').removeClass('has-error');
    			    });
                      	
                    $("#editModal").on("hidden.bs.modal", function(){
                    	var editFormValidator = $( "#editForm" ).validate();
                        editFormValidator.resetForm();     
                        $('.form-group').removeClass('has-error');
                    });      
               }); 
                    
				function loadTree(respData) {
    				var tree = $('#tree');                        	   
        			tree.jstree("refresh");    
        			
                    $("#tree").bind("select_node.jstree",
                        	function(evt, data){
                         		var instance = $('#tree').jstree(true);
                         	  	var id = data.node.id; 
                        	    var catgText = data.node.text;                   	   
          
                         	  	$(this).find(".enabledActions").remove();
                         	  	//check if user has authority for updating category
                         	  	if( "${isCategoryMgr}" == "true" ){
                         	  		//on node selection add three links - edit, delete and disable
                            		$(this).find(".jstree-clicked")
                            		   	.after($('<span style="padding-left:15px" class="enabledActions"></span><a href="#" id="disableAction" class="enabledActions"><span class="glyphicon glyphicon-minus-sign"><spring:message code="form.label.category.disable"/></span></a>'))
                            		    .after($('<span style="padding-left:15px" class="enabledActions"></span><a href="#" id="deleteAction" class="enabledActions"><span class="glyphicon glyphicon-remove"><spring:message code="form.label.category.delete"/></span></a>'))
                            		    .after($('<span style="padding-left:50px" class="enabledActions"></span><a href="#" id="editAction" class="enabledActions"><span class="glyphicon glyphicon-edit"><spring:message code="form.label.category.edit"/></span></a>'));
                         	  	}                         	  	
                       		            
                              	$("#editAction").click(function(){   
                              		$("#catgEditVal").val($.trim(catgText));
                              		$('button.edit-confirm').prop('disabled', true);
                               		var $modal = $('#editModal');                                  		
                               	  	$modal.modal('show');                                	 	
                               	});       	
                    	
                         		var messages = new Array();
                         		messages['delete.confirm'] = "Are you sure you want to delete the '<b>" + catgText + "</b>' category?";
                              	messages['delete.all.confirm'] = "Deleting the '<b>" + catgText + "</b>' category will delete all associated sub-categories. <br><br> Are you sure you want to delete the '<b>" + catgText + "</b>' category?";
                              				
                              	$("#deleteAction").click(function(){ 
                               		var $modal = $('#deleteModal');
                               		$modal.find(".modal-body span").html(messages["delete.confirm"]);
                               		
                               		var nodeChildren = data.node.children.length;
                               		if( nodeChildren > 0 ){
                               			$modal.find(".modal-body span").html(messages["delete.all.confirm"]);
                               		} else{
                               			$modal.find(".modal-body span").html(messages["delete.confirm"]);
                               		}
                               		
                               		$modal.modal('show');  
                              	});
                              	
                              	messages['disable.confirm'] = "Are you sure you want to disable the '<b>" + catgText + "</b>' category?";
                               	messages['disable.all.confirm'] = "Disabling the '<b>" + catgText + "</b>' category will disable all associated sub-categories. <br><br> Are you sure you want to disable the '<b>" + catgText + "</b>' category?";
                                                				
                              	$("#disableAction").click(function(){ 
                              		var tree = $('#tree');        		               	
            		                var $modal = $('#disableModal');
                               			
            		                var nodeChildren = data.node.children.length;
                               		if( nodeChildren > 0 ){
                               			$modal.find(".modal-body span").html(messages["disable.all.confirm"]);
                               		} else{
                               			$modal.find(".modal-body span").html(messages["disable.confirm"]);
                               		}                      			
                               			
                               		$modal.modal('show');  
                               	});
                              	
                  	});
                    
                    $("#tree").bind('after_open.jstree', function(event, data) { 
	                	if( $("#showDisabled").is(":checked") ) {
		                	var tree = $('#tree');
		                	var parent = tree.jstree(true).get_node("#");	         		   	
		
		                	$(tree.jstree().get_json(data.node.id, {
		   	         			flat: true
		   	         		    }))
		   	         		    .each(function(index, value) {
		   	         		    	var node = tree.jstree().get_node(value.id);
	  	         		    		var parentNode = tree.jstree().get_node(node.parent);      		    	 	
	  	         		    	 	
	  	         		    		var hasMinusSign = tree.jstree(true).get_node(value.id, true).find(".jstree-disabled").siblings().hasClass("glyphicon-minus-sign");
	  	         		    		var hasEnableLink = tree.jstree(true).get_node(value.id, true).children(".jstree-disabled").siblings().hasClass("enableAction");
	 
		  	         		    	if(!hasMinusSign){ 
			  	         		   		//show disabled sign before category text
			  			                tree.jstree(true).get_node(value.id, true).find(".jstree-disabled")
			  			              		.before($('<span class="glyphicon glyphicon-minus-sign disabledActions"></span>'));
		  	         		    	} 
									
		  	         		    	//allow enable link only if user has category manager role
		  	         		    	if( "${isCategoryMgr}" == "true" ){ 
		  	         		    		//show enable hyperlink, if parent node is a root node(#) and it's state is disabled
				  	         		    if( node.parent == '#' && node.state.disabled == true && !hasEnableLink){
				  	         		    	tree.jstree(true).get_node(value.id, true).children(".jstree-disabled").after($('<a href="#" class="enableAction disabledActions"><span style="padding-left:10px" class="glyphicon glyphicon-plus-sign"><spring:message code="form.label.category.enable"/></span></a>'));
				  	         		    }
				  	         		    	
				  	         		    //show enable hyperlink, if parent node is not a root node(#) and its parent is not disabled
				  	         		    if( node.parent != '#' && parentNode.state.disabled == false && node.id != data.node.id && !hasEnableLink){
				  	         		    	tree.jstree(true).get_node(value.id, true).children(".jstree-disabled").after($('<a href="#" class="enableAction disabledActions"><span style="padding-left:10px" class="glyphicon glyphicon-plus-sign"><spring:message code="form.label.category.enable"/></span></a>'));
				  	         		    } 
		  	         		    	}
		   	         		});   
		                	
		                	$(".enableAction").click(function() {	
			                  		var $this = $(this);
			                  		var id = $(this).siblings("a").attr('id');
			       	       			var messages = new Array();
			       	       			var node = tree.jstree(true).get_node(id);
			       	       			var catgText = $(this).siblings("a").text();
			       	       			var id = node.id;
			       	       			
			       	       			var $modal = $('#enableModal');
			       	       			
									messages['enable.confirm'] = "Are you sure you want to enable the '<b>" + catgText + "</b>' category?";
									messages['enable.all.confirm'] = "Enabling the '<b>" + catgText + "</b>' category will enable all associated sub-categories. <br><br> Are you sure you want to enable the '<b>" + catgText + "</b>' category?";
			      															
								    var nodeChildren = tree.jstree(true).get_children_dom(node).length;
										if( nodeChildren > 0 ){
											$modal.find(".modal-body span").html(messages["enable.all.confirm"]);
										} else{
											$modal.find(".modal-body span").html(messages["enable.confirm"]);
										}                      			
	
			               			$modal.modal('show');  	
			               		 
			               		 var ajaxCalled = false;	
			               		 $('button.enable-confirm').click(function() { 
			               			 	if(ajaxCalled) return;
				           				var state = 'ENABLE';
				           				$.ajax({
				               			    url: '${edit}'+id+'/'+catgText+'/'+state,
				               			    type: 'PUT',
				               			  	success: function(response) {
				             			    	if('SUCCESS' === response.status) {
				             			    		var $modal = $('#enableModal');                          				    		
				             			    		$modal.modal('hide');
				             				   		var parentNode = tree.jstree(true).get_node(id);                        				    		
				             				   		tree.jstree(true).enable_node(parentNode);
				        				    	
				             				   		//if node has children, then enable all children
				             				   		if( tree.jstree(true).get_children_dom(parentNode).length > 0){
				             				   			var getBranch = tree.jstree(true).get_json(tree.jstree(true).get_node(id), { 'flat': true });
				                 			    		$.each(getBranch, function( key, value ) {
				                 			    		         $('#tree').jstree('enable_node', value.id);
				                 				   		});
				             				    	}                        				    		                       				    		
				             				   		
				             				   		tree.jstree(true).get_node(id, true).children().find('.disabledActions').remove();
				             				    	$this.siblings('.disabledActions').remove();                        				    	
				             				    	$this.remove();
				             				    }
				             				}
				               			});
				           				ajaxCalled = true;
				           			});
			               		 
			                  	});
	                	}
                  }); 
                    
        			tree.jstree({
                  		'core' : {
                  			'data': respData,
                  			'themes': {
                   				'icons' : false, 
                   				'dots' : false,
								'name': 'proton',
                   		        'responsive': true,
                   		     	'multiple' : false,
                				'variant' : 'large'
                  	     		},
                      		'check_callback' : true                             
                    	},
	          	        "plugins" : [ "sort" ]
                	});
           		}
             </script>
       </jsp:attribute>
       
       <jsp:body>
        <c:set var="isCategoryMgr" value="false" />
		<sec:authorize access="isAuthenticated()">
			<sec:authorize access="hasAuthority('PERMISSION_CATEGORY_MANAGER')" var="isCategoryMgr" />
		</sec:authorize>
		
	   <b:page-header><h1><spring:message code="dropdown.category.manager"/></h1></b:page-header>
       <div id="content-data"> 
	   	<div class="col-sm-12">	   	
			<label><spring:message code="form.label.category.provider"/></label>	
				<span style="padding-left:5px">
		        	<select id="catgProvider" name="providers" class="selectpicker form-control" data-width="25%">
		            	<option value=""> </option>
		                	<c:forEach items="${providers}" var="provider">
						    	<option value="${provider.providerName}">${provider.providerName}</option>
							</c:forEach>																
		            </select>
		        </span>	
			<span style="padding-left:10px">
				<label><input type="checkbox" id="showDisabled" disabled/><spring:message code="form.label.category.checkbox.showDisabled"/></label>
			</span>	
		</div>
		<div class="col-sm-12">				
			<div class="panel panel-body col-sm-8 fixed-panel" style="margin-top:20px">		
			<span style="padding-left:440px">
				<c:if test='${isCategoryMgr}'>
					<button type="button" id="addAction" class="btn btn-primary" style="display: none"><spring:message code="form.button.category.add"/></button>
				</c:if>
			</span>	
            	<div id="tree" >               	                                
            	</div>
            </div>
        </div>
       </div>   
       <div class="command-bar">	           	
	      <a href="${home}" class="btn btn-default"><spring:message code="form.button.done"/></a>
	   </div>
       
       <!-- Add Modal -->
		<div id="addModal" class="modal fade" role="dialog">
		  <div class="modal-dialog">
		    <!-- Modal content-->
		    <div class="modal-content">
		    <form:form id="addForm" commandName="category" cssClass="form-horizontal" data-toggle="validator">
		      <div class="modal-header">
		        <button type="button" class="close" data-dismiss="modal">&times;</button>
		        <h4 class="modal-title"><spring:message code="form.title.category.add"/></h4>
		      </div>
		      <div class="modal-body">
		      
		 		<spring:message code="form.label.category.value" var="value"/>
				<b:form-group label="${value}" labelFor="value" cssBody="col-sm-6" cssClass="required">
					<form:input path="name" type="text" id="catgAddVal" class="form-control" autocomplete="off" maxlength="20" required="required"/>
					<form:errors path="name" cssClass="validate-error"/>					
				</b:form-group>
				
				<spring:message code="form.label.category.location" var="location"/>
				<b:form-group label="${location}" labelFor="location" cssBody="col-sm-6" cssClass="required">
		            <form:select path="location" id="location" class="selectpicker form-control" required="required">
					</form:select>
					<form:errors path="location" cssClass="validate-error"/>
				</b:form-group>			
		      </div>
		      <div class="modal-footer">
		 		<button type="button" class="btn btn-default" data-dismiss="modal"><spring:message code="alert.button.cancel"/></button>
				<button type="submit" class="btn btn-primary add-confirm" disabled><spring:message code="alert.button.save"/></button>    
		      </div>
		     </form:form>	
		    </div>
		  </div>
		</div>
		
       	 <!-- Edit Modal -->
		<div id="editModal" class="modal fade" role="dialog">
		  <div class="modal-dialog">
		    <!-- Modal content-->
		    <div class="modal-content">
		    <form:form id="editForm" commandName="category" cssClass="form-horizontal" data-toggle="validator">
		      <div class="modal-header">
		        <button type="button" class="close" data-dismiss="modal">&times;</button>
		        <h4 class="modal-title"><spring:message code="form.title.category.edit"/></h4>
		      </div>
		      <div class="modal-body">
			
				<spring:message code="form.label.category.value" var="value"/>
				<b:form-group label="${value}" labelFor="value" cssBody="col-sm-6" cssClass="required">
					<form:input path="name" type="text" id="catgEditVal" class="form-control" autocomplete="off" maxlength="20" required="required"/>
					<form:errors path="name" cssClass="validate-error"/>					
				</b:form-group>
			  
		      </div>
		      <div class="modal-footer">
		 		<button type="button" class="btn btn-default" data-dismiss="modal"><spring:message code="alert.button.cancel"/></button>
				<button type="submit" class="btn btn-primary edit-confirm" disabled><spring:message code="alert.button.save"/></button>    
		      </div>
		     </form:form>
		    </div>
		  </div>
		</div>
       
		<!-- Delete Modal -->
		<spring:message code="form.title.category.confirm.delete" var="confirmDelete"/>
		<b:modal modalId="deleteModal" modalTitle="${confirmDelete}" modalIcon="glyphicon-warning-sign">
			<button type="button" class="btn btn-primary delete-confirm"><spring:message code="alert.button.yes"/></button>
    		<button type="button" class="btn btn-default" data-dismiss="modal"><spring:message code="alert.button.no"/></button>
	 	</b:modal>
	 	
	 	<!-- Enable Modal -->
		<spring:message code="form.title.category.enable" var="enableCategory"/>
		<b:modal modalId="enableModal" modalTitle="${enableCategory}" modalIcon="glyphicon-warning-sign">
			<button type="button" class="btn btn-primary enable-confirm"><spring:message code="alert.button.yes"/></button>
    		<button type="button" class="btn btn-default" data-dismiss="modal"><spring:message code="alert.button.no"/></button>
		</b:modal>
	 
	 	<!-- Disable Modal -->
	 	<spring:message code="form.title.category.disable" var="disableCategory"/>
	 	<b:modal modalId="disableModal" modalTitle="${disableCategory}" modalIcon="glyphicon-warning-sign">
			<button type="button" class="btn btn-primary disable-confirm"><spring:message code="alert.button.yes"/></button>
    		<button type="button" class="btn btn-default" data-dismiss="modal"><spring:message code="alert.button.no"/></button>
	 	</b:modal>
	</jsp:body>
</t:page>

