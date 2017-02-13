<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags"%>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<%@ taglib prefix="b" uri="http://ais.ese.espn.com/tags/bootstrap" %>
<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags"%>

<c:url var="home" value="/"/>
<c:url var="add" value="/content/masters/add"/>
<c:url var="view" value="/content/masters"/>
<c:url var="search" value="/content/masters/search"/>
<c:url var="edit" value="/content/masters"/>
<c:url var="assets" value="/content/assets"/>

<t:page navContext="Content">
	<jsp:attribute name="title">Content</jsp:attribute>
	<jsp:attribute name="head">
		<link rel="stylesheet" href="/mediacentral/libs/css/bootstrap-datepicker-1.3.0/datepicker3.min.css" />
	</jsp:attribute>
	<jsp:attribute name="js">
		<script src="/mediacentral/libs/js/bootstrap-datepicker-1.3.0/bootstrap-datepicker.min.js"></script>
		<script>
			$(document).ready(function() {
				
				var keyword, endDate, providerGroup, status;
				var date = new Date();
				var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
				
				$('#startDate').datepicker({
		            format: 'mm/dd/yyyy',
		            autoclose: true
		        }).on('change keyup', function() {
		        	startDate = $(this).data('datepicker').getFormattedDate('mm/dd/yyyy');
		        });
				
				$('#startDate').datepicker("setDate", firstDay);
				
				$('#endDate').datepicker({
		            format: 'mm/dd/yyyy',
		            autoclose: true
		        });
				
				$('.selectpicker').selectpicker();
				
				var oTable = $('#master').DataTable( {
	        		dom:"rtip",
	        		ordering: false,
	                serverSide: true,
	                autoWidth: false,
	                sAjaxSource: "${search}",
	                sPaginationType: "full_numbers",
	                language: {
	                	sEmptyTable: "No matching Master Asset found",
	                    sInfoFiltered: "",
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
	                		"value": keyword
	                	}),
	                	aoData.push({
	                		"name": "startDate",
	                		"value": startDate
	                	}),
	                	aoData.push({
	                		"name": "endDate",
	                		"value": endDate
	                	}),
	                	aoData.push({
	                		"name": "providerGroup",
	                		"value": providerGroup
	                	}),
	                	aoData.push({
	                		"name": "status",
	                		"value": status
	                	}),
		        		$('#search-modal').modal('show');
	                },
	                columnDefs: [
						{
							targets: 0,
							render: function ( data, type, row ) {
								return '<a href="${edit}/'+row.masterAssetId+'">'+row.masterName+'</a>';
							}
						},
						{
							targets: 3,
							className: "dt-center",
							render: function ( data, type, row ) {
								if(null != row.assets) {
									var count = Object.keys(row.assets).length;
									var assets = JSON.stringify(row.assets).replace(/\"/g, '&#34;');
									return '<div class="assets" data-title="'+row.masterName+'" data-assets="'+assets+'"> <a href="#"><span class="badge">'+count+'</span></a>';
								} else {
									return "";
								}
							}
						},
						{
							targets: 7,
							render: function ( data, type, row ) {
								var icon = '<i class="glyphicon glyphicon-unlock"></i>'; // This icon is not there in bootstrap-glyphicons.
								if(row.status === 'Archived') {
									icon = '<i class="glyphicon glyphicon-lock"></i>';
								}
								return icon;
							}
						}
					],
					columns : [ 
					    {data : "masterName", width : "25%", "sDefaultContent":""},
	                    {data : "provGrpName", width : "15%", "sDefaultContent":""},
	                    {data : "showId", width : "15%", "sDefaultContent":""},
	                    {data : "assets", width : "6%", "sDefaultContent":""},
	                    {data : "licenseStart", width : "12%", "sDefaultContent":""},
	                    {data : "licenseEnd", width : "11%", "sDefaultContent":""},
	                    {data : "status", width : "13%", "sDefaultContent":""},
	                    {data : "", width : "3%", "sDefaultContent":""}
	                ],
					fnServerData: function (sSource, aoData, fnCallback, oSettings) {
						oSettings.jqXHR = $.getJSON(sSource, aoData, function (json) {
			                if(json.aaData != null){
			                	$('#master').removeClass('display-none');
			              	    fnCallback(json);
				            } else {
				            	var host = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port: '');
				            	window.location = host + "/mediacentral/content/masters";
					        }
			                $('#search-modal').modal('hide');
		                 }).done(function(){
		                 }).fail(function handleError(jqXHR, statusText, errorThrown) {
		                	 $('#search-modal').modal('hide');
		                	 if(statusText != 'abort') {
		                     	alert("The page cannot load.  Refresh your browser or if this problem persists, contact support.");
		                	 }
		                 });
		            }
	            });
				
				//Search button
				$('button:submit').click(function() {
					keyword = $.trim($('#keyword').val());
					endDate = $('#endDate').data('datepicker').getFormattedDate('mm/dd/yyyy');
					providerGroup = $('#providerGroup').val();
					status = $('#status').val();
		        	oTable.clear().draw();
		        	return false;
				});
				
				//Clear All button
				$('#clearAll').click(function() {
					$('#keyword').val("");
					$('#startDate').datepicker("setDate", firstDay);
					$('#endDate').datepicker("setDate", "");
					$('.selectpicker').selectpicker('val', "ALL");
					$('button:submit').trigger('click');
				});
				
				$('#master').on('click', '.assets', function() {
		        	var assets = $(this).data('assets');
		        	var collName = $(this).data('title');
		        	var $modal = $('#assetsModal');
		        	$modal.one('shown.bs.modal', function () {
				    	$('#assetsDetail').DataTable({
			        		aaData : assets,
			        		dom: "t",
			        		destroy: true,
			        		ordering : false,
			        		autoWidth: false,
			        		paging: false,
			        		scrollY: "700px",
			        		scrollCollapse: true,
			        		columnDefs: [
	   	   						{
	   								targets: 0,
	   								render: function ( data, type, row ) {
	   									return '<a href="${assets}/'+row.assetId+'">'+row.assetName+'</a>';
	   								}
	   							},
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
	       					    {data : "assetName", width : "31%", "sDefaultContent":""},
	       	                    {data : "licenseStart", width : "12%", "sDefaultContent":""},
	       	                    {data : "licenseEnd", width : "12%", "sDefaultContent":""},
	       	                    {data : "providerName", width : "15%", "sDefaultContent":""},
	       	                 	{data : "platformName", width : "15%", "sDefaultContent":""},
	       	                 	{data : "status", width : "15%", "sDefaultContent":""}
	       	                ]
				    	});
		        	});
		        	$modal.find('.modal-title').html(collName);
		        	$modal.modal('show');
				});
			});
		</script>
	</jsp:attribute>
	
	<jsp:body>
		<c:set var="isMasterAssetMgr" value="false" />
		<sec:authorize access="isAuthenticated()">
			<sec:authorize access="hasAuthority('PERMISSION_MASTER_ASSET_MANAGER')" var="isMasterAssetMgr" />
		</sec:authorize>
		
		<b:page-header>
			<h1><spring:message code="dropdown.master.asset.manager"/></h1>
		</b:page-header>
					
		<div id="content-data">
			<div class="form-horizontal">
				<div class="container-fluid" style="padding-left: 0px;">
					<div class="row">
						<div class="col-sm-3">
							<div class="row">
								<div class="form-group">
							        <label class="col-sm-5 control-label"><spring:message code="form.label.master.startDate"/></label>
							        <div class="col-sm-7 date">
							            <div class="input-group input-append date" id="startDate">
							                <input type="text" class="form-control" name="date" style="padding-left: 2px"/>
							                <span class="input-group-addon add-on"><i class="glyphicon glyphicon-calendar"></i></span>
							            </div>
							        </div>
							    </div>
							</div>
							<div class="row">
								<div class="form-group">
							        <label class="col-sm-5 control-label"><spring:message code="form.label.master.endDate"/></label>
							        <div class="col-sm-7 date">
							            <div class="input-group input-append date" id="endDate">
							                <input type="text" class="form-control" name="date" style="padding-left: 2px"/>
							                <span class="input-group-addon add-on"><i class="glyphicon glyphicon-calendar"></i></span>
							            </div>
							        </div>
							    </div>
							</div>
						</div>
						<div class="col-sm-6">
							<div class="form-group">
								<label class="col-sm-4 control-label" for="keyword"><spring:message code="form.label.master.keyword"/></label>
								<div class="col-sm-8">
							    	<input class="form-control" id="keyword" autofocus="autofocus" placeholder="Enter Master Name or Show ID" maxlength="60" />
							    </div>
					    	</div>
							<div class="form-group">
								<label class="col-sm-4 control-label" for="providerGroup" ><spring:message code="form.label.master.providerGrp"/></label>
								<div class="col-sm-8">
							    	<select id="providerGroup" class="form-control selectpicker">
							    		<option value="ALL">ALL</option>
								    	<c:forEach items="${providerGroups}" var="providerGroup">
									    	<option value="${providerGroup.provGrpName}">${providerGroup.provGrpName}</option>
										</c:forEach>
							    	</select>
							    </div>
							</div>
							<div class="form-group">
							    <spring:message code="form.label.master.statuslist" var="statuslist"/>
							    <label class="col-sm-4 control-label" for="status"><spring:message code="form.label.master.status"/></label>
								<div class="col-sm-8">
							    	<select id="status" class="form-control selectpicker">
							    		<option value="ALL">ALL</option>
								    	<c:forEach items="${statuslist}" var="status">
									    	<option value="${status}">${status}</option>
										</c:forEach>
							    	</select>
							    </div>
						    </div>
						</div>
						<div class="col-sm-3" style="padding-left: 0px">
							<div class="form-group">
								<div class="row" style="height: 34px">
								</div>
							</div>
							<div class="form-group">
								<div class="row" style="height: 34px">
								</div>
							</div>
							<div class="form-group">
								<button type="submit" class="btn btn-primary"><i class="glyphicon glyphicon-search"></i> <spring:message code="form.button.search"/></button>
								<button id="clearAll" type="button" class="btn btn-default"><spring:message code="form.button.master.search.clearall"/></button>
							</div>
						</div>
					</div>
				</div>
			</div>
			<table id="master"
				class="table table-striped table-bordered dt-responsive display-none">
		        <thead>
		            <tr>
		                <th><spring:message code="form.label.master.thead.name"/></th>
		                <th><spring:message code="form.label.master.thead.providergrp"/></th>
		                <th><spring:message code="form.label.master.thead.showId"/></th>
		                <th><spring:message code="form.label.master.thead.assets"/></th>
		                <th><spring:message code="form.label.master.thead.licensestart"/></th>
		                <th><spring:message code="form.label.master.thead.licenseend"/></th>
		                <th><spring:message code="form.label.master.thead.status"/></th>
		                <th></th>
		            </tr>
		        </thead>
		        <tbody>
		        </tbody>
		    </table>
		</div>
		    
		<div class="command-bar">
			<c:if test="${isMasterAssetMgr}">
				<a href="${add}" class="btn btn-primary"><spring:message code="form.button.master.add"/></a>
			</c:if>
			<a href="${home}" class="btn btn-default"><spring:message code="form.button.done"/></a>
		</div>
		
		<!-- Assets Modal -->
		<div id="assetsModal" class="modal" role="dialog">
		  <div class="modal-dialog" style="width: auto; max-width: 900px">
		    <!-- Modal content-->
		    <div class="modal-content">
		      <div class="modal-header">
		        <button type="button" class="close" data-dismiss="modal">&times;</button>
		        <h4 class="modal-title"></h4>
		      </div>
		      <div class="modal-body">
		      	<div class="table-responsive">
			      	<table id="assetsDetail" class="table table-striped table-bordered dt-responsive">
						<thead>
					        <tr>
					            <th><spring:message code="form.label.master.thead.assetname"/></th>
				                <th><spring:message code="form.label.master.thead.licensestart"/></th>
				                <th><spring:message code="form.label.master.thead.licenseend"/></th>
				                <th><spring:message code="form.label.master.thead.provider"/></th>
				                <th><spring:message code="form.label.master.thead.platform"/></th>
				                <th><spring:message code="form.label.master.thead.assetstatus"/></th>
					        </tr>
					    </thead>
					</table>
				</div>
		      </div>
		    </div>
		  </div>
		</div>
		
		<!-- Modal section -->
		<spring:message code="form.master.search.inprogress" var="inProgressMsg"/>
		<%@include file="../../includes/progress_modal.jspf" %>
	</jsp:body>
	
</t:page>