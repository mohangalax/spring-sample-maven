<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags"%>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<%@ taglib prefix="b" uri="http://ais.ese.espn.com/tags/bootstrap" %>
<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags"%>
<%@ taglib prefix="custom" uri="/WEB-INF/tld/custom-functions.tld"%>

<c:url var="view" value="/content/masters"/>
<c:url var="confirm" value="/content/masters/confirm"/>
<c:url var="add" value="/content/masters/add"/>
<c:url var="asset" value="/content/assets"/>

<t:page navContext="Content">
	<jsp:attribute name="title">Content</jsp:attribute>

	<jsp:attribute name="head">
		<link rel="stylesheet" href="/mediacentral/libs/css/bootstrap-datepicker-1.3.0/datepicker3.min.css" />
		<link href="/mediacentral/libs/css/select2/select2-4.0.3.min.css" rel="stylesheet" />
		<link href="/mediacentral/libs/css/select2/select2-bootstrap-1.4.6.min.css" rel="stylesheet" />
	</jsp:attribute>
	
	<jsp:attribute name="js">
		<script src="/mediacentral/libs/js/bootstrap-datepicker-1.3.0/bootstrap-datepicker.min.js"></script>
		<script src="/mediacentral/libs/js/select2-4.0.3/select2.full.min.js"></script>
		<script src="/mediacentral/js/artwork.js"></script>
		<script src="/mediacentral/js/category.js"></script>
		<script src="/mediacentral/js/actor.js"></script>
		<script src="/mediacentral/js/master.js"></script>
		<script>
			$(document).ready(function() {
				
				//Update section - Platform tabs
				if($('#provGrpName').val()) {
					providerGroupChangeEvent($('#provGrpName'), $('#platformIds').val());
				}
				
				//Update section - Assets
				var assetsData = ${assetsData};
				if (Object.keys(assetsData).length) {
					populateScheduledAssetsTable(assetsData, "${isEditable}");
				}
				
				//Update section - Category tab
				populateCategoryTable($('#provGrpName'), $('#categoryIds').val(), "${isEditable}");
				
				//Update section - Actors tab
				if($('#actors').val()) {
					populateActorsTable($('#actors').val(), "${isEditable}");
				}
				
				//Update section - Artwork tab
				var artworksData = ${artworksData};
				if (Object.keys(artworksData).length) {
					populateSelectedArtworksTable(artworksData, "${isEditable}");
				}
				
				//Remove button in Artwork tab
				new RemoveArtwork('#masterName', 'master');
				
				//Disable all field except Done button for Update screen if we don't have permission or in Archived status.
				if("${isEditable}" === 'false') {
					$(':input').prop('disabled', true);
					$('button').prop('disabled', true);
					$('.input-group-addon').css("pointer-events", "none");
				}
			});
		</script>
	</jsp:attribute>
	
	<jsp:body>
		<c:set var="isMasterAssetMgr" value="false" />
		<sec:authorize access="isAuthenticated()">
			<sec:authorize access="hasAuthority('PERMISSION_MASTER_ASSET_MANAGER')" var="isMasterAssetMgr" />
		</sec:authorize>
		
		<c:set var="isEditable" value="${true}"/>
	    <c:if test="${!isMasterAssetMgr or master.status eq 'Archived'}">
			<c:set var="isEditable" value="${false}"/>
		</c:if>
				
		<b:page-header>
			<div class="row">
				<div class="col-sm-6">
					<h1><c:choose><c:when test="${isUpdate}"><spring:message code="form.title.master.update"/></c:when><c:otherwise><spring:message code="form.title.master.add"/></c:otherwise></c:choose></h1>
				</div>
			    <div class="col-sm-6">
			    	<span class="pull-right"><strong><spring:message code="page.label.quicklinks"/></strong> <a <c:if test='${isEditable}'>class="form-unsaved"</c:if> href="${asset}"><spring:message code="dropdown.asset.manager"/></a> | <a <c:if test='${isEditable}'>class="form-unsaved"</c:if> href="${view}"><spring:message code="dropdown.master.asset.manager"/></a></span>
			    </div>
			</div>
			<div class="row">
				<div class="col-sm-6" style="padding-top: 10px">
					<c:if test="${isUpdate}"><strong><spring:message code="form.label.master.status"/></strong> <span id="master-status">${master.status}</span></c:if>
				</div>
			    <div class="col-sm-6" style="padding-bottom: 10px">
			    	<span class="pull-right">
			    		<c:if test="${isUpdate && isMasterAssetMgr}">
			    			<a id="copy-master" type="button" class="btn btn-primary<c:if test='${isEditable}'> form-unsaved</c:if>" href="copy?id=${master.masterAssetId}"><spring:message code="form.button.master.copy"/></a>
			    		</c:if>
			    	</span>
			    </div>
			</div>
		</b:page-header>
		<div id="errormessages"></div>
		<form:form id="add-master" action="${confirm}" commandName="master" cssClass="form-horizontal" data-toggle="validator">
			<div id="content-data">
				
				<c:set var="isScheduledMaster" value="${false}"/>
				<c:if test="${master.status eq 'Scheduled' or master.status eq 'Archived'}">
					<c:set var="isScheduledMaster" value="${true}"/>
				</c:if>
				
				<c:set var="isCopyMaster" value="${false}"/>
				<c:if test="${master.masterAssetId eq 0 && not empty master.masterName && empty master.status}">
					<c:set var="isCopyMaster" value="${true}"/>
				</c:if>
				
				<form:hidden path="masterAssetId"/>
				<form:hidden path="status"/>
				
				<spring:message code="form.label.master.name" var="name"/>
				<b:form-group label="${name}" labelFor="name" cssBody="col-sm-4" cssClass="required">
					<form:input path="masterName" cssClass="form-control" required="required" autofocus="autofocus" maxlength="60"/>
					<form:errors path="masterName" cssClass="validate-error"/>
				</b:form-group>
				
				<spring:message code="form.label.master.asset.type" var="type"/>
				<spring:message code="form.label.master.asset.types" var="assetTypes"/>
				<b:form-group label="${type}" labelFor="type" cssBody="col-sm-4" cssClass="required">
		            <form:select path="assetType" name="type" class="selectpicker form-control" required="required" disabled="${isScheduledMaster}">
						<c:forEach items="${assetTypes}" var="assetType" varStatus="loop">
							<form:option value="${fn:toUpperCase(fn:substring(assetType, 0, 2))}" label="${assetType}"/>
						</c:forEach>
					</form:select>
				</b:form-group>
				<form:hidden path="assetType" disabled="${!isScheduledMaster}"/>
				
				<spring:message code="form.label.master.providerGrp" var="providerGrp"/>
				<b:form-group label="${providerGrp}" labelFor="providerGrp" cssBody="col-sm-4" cssClass="required">
		            <form:select path="provGrpName" name="providerGrp" class="selectpicker form-control" required="required" disabled="${isScheduledMaster}">
						<form:option value="" label=" "/>
						<c:forEach items="${providerGroups}" var="providerGroup">
							<form:option value="${providerGroup.provGrpName}" data-platforms="${custom:toJson(providerGroup.platforms)}"  data-providers="${custom:toJson(providerGroup.providers)}"/>
						</c:forEach>
					</form:select>
				</b:form-group>
				<form:hidden path="provGrpName" disabled="${!isScheduledMaster}"/>
				
				<spring:message code="form.label.master.showname" var="showname"/>
				<b:form-group label="${showname}" labelFor="showname" cssBody="col-sm-4" cssClass="required">
					<form:input path="showName" cssClass="form-control" required="required" maxlength="60"/>
					<form:errors path="showName" cssClass="validate-error"/>
				</b:form-group>
				
				<spring:message code="form.label.master.showcode" var="showcode"/>
				<b:form-group label="${showcode}" labelFor="showcode" cssBody="col-sm-2" cssClass="required">
					<form:input path="showCode" cssClass="form-control" required="required" maxlength="6"/>
					<form:errors path="showCode" cssClass="validate-error"/>
				</b:form-group>
				
				<spring:message code="form.label.content.licensestart" var="licensestart"/>
				<b:form-group label="${licensestart}" labelFor="licensestart" cssBody="col-sm-2 date" cssClass="required">
		            <div class="input-group input-append date datepicker" style="padding-left: 0px">
		                <form:input path="licenseStart" type="text" class="form-control" name="date" style="padding: 3px"/>
		                <span class="input-group-addon add-on"><i class="glyphicon glyphicon-calendar"></i></span>
		            </div>
				</b:form-group>
				
				<spring:message code="form.label.content.licenseend" var="licenseend"/>
				<b:form-group label="${licenseend}" labelFor="licenseend" cssBody="col-sm-2 date" cssClass="required">
		            <div class="input-group input-append date datepicker" style="padding-left: 0px">
		                <form:input path="licenseEnd" type="text" class="form-control" name="date" style="padding: 3px"/>
		                <span class="input-group-addon add-on"><i class="glyphicon glyphicon-calendar"></i></span>
		            </div>
				</b:form-group>
				
				<spring:message code="form.label.content.deliverbydate" var="deliverbydate"/>
				<b:form-group label="${deliverbydate}" labelFor="deliverbydate" cssBody="col-sm-2 date" cssClass="required">
		            <div class="input-group input-append date datepicker" style="padding-left: 0px">
		                <form:input path="deliverBy" type="text" class="form-control" name="date" style="padding: 3px"/>
		                <span class="input-group-addon add-on"><i class="glyphicon glyphicon-calendar"></i></span>
		            </div>
				</b:form-group>
				
				<spring:message code="form.label.content.schedulecontact" var="schedulecontact"/>
				<b:form-group label="${schedulecontact}" labelFor="schedulecontact" cssBody="col-sm-4" cssClass="required">
					<form:input path="scheduleContact" cssClass="form-control" required="required" maxlength="50"/>
					<form:errors path="scheduleContact" cssClass="validate-error"/>
				</b:form-group>
				
				<%@include file="scheduled_assets_section.jspf" %>
				
				<%@include file="platforms_tabs.jspf" %>
				
				<c:set var="isAssetPage" value="${false}" />
				<%@include file="metadata_tabs.jspf" %>
				
				<form:hidden path="selectedAssets"/>				
			</div>
			<div class="command-bar">
				<c:choose>
					<c:when test="${isScheduledMaster or master.status eq 'Unscheduled'}">
						<button id="scheduled-save-master" type="submit" class="btn btn-primary" disabled><spring:message code="form.button.master.save"/></button>
					</c:when>
					<c:otherwise>
						<button id="save-master" type="submit" class="btn btn-primary" <c:if test="${!isCopyMaster}">disabled</c:if>><spring:message code="form.button.master.save"/></button>
						<button id="schedule-master" type="submit" class="btn btn-primary" <c:if test="${!isUpdate and !isCopyMaster}">disabled</c:if>><spring:message code="form.button.master.schedule"/></button>
					</c:otherwise>
				</c:choose>
				<c:if test="${isUpdate}">
	           		<button type="button" class="btn btn-default remove"><spring:message code="form.button.master.removemaster"/></button>
	           	</c:if>
	           	<a href="${view}" class="btn btn-default<c:if test='${isEditable}'> form-unsaved</c:if>"><spring:message code="form.button.done"/></a>
			</div>
		</form:form>
		
		<!-- Modal section -->
		<spring:message code="form.button.collection.addandclose" var="artworkButtonText"/>
		<%@include file="../artwork/add_artworks_modal.jsp" %>
		
		<%@include file="../artwork/add_collections_modal.jsp" %>
		<%@include file="../artwork/artworks_readonly_modal.jspf" %>
		
		<spring:message code="form.artwork.search.inprogress" var="inProgressMsg"/>
		<%@include file="../../includes/progress_modal.jspf" %>
		
		<!-- Remove Artwork item modal -->
		<b:modal modalId="removeArtworkModal" modalTitle="Remove Artwork" modalIcon="glyphicon-warning-sign">
			<button type="button" class="btn btn-primary"><spring:message code="alert.button.yes"/></button>
		    <button type="button" class="btn btn-default" data-dismiss="modal"><spring:message code="alert.button.no"/></button>
		</b:modal>
		
		<!-- Draft message modal -->
		<b:modal modalId="draftModal" modalIcon="glyphicon-ok-sign">
			<c:if test='${!isUpdate}'>
				<a href="${add}" class="btn btn-default"><spring:message code="alert.button.addanother"/></a>
				<button type="button" class="btn btn-primary" data-dismiss="modal"><spring:message code="alert.button.ok"/></button>
			</c:if>
		</b:modal>
		
		<!-- Unsaved changes modal -->
		<b:modal modalId="unsaveModal" modalIcon="glyphicon-warning-sign">
			<c:choose>
				<c:when test="${isScheduledMaster or master.status eq 'Unscheduled'}">
					<button type="submit" class="btn btn-primary"><spring:message code="alert.button.yes"/></button>
				</c:when>
				<c:otherwise>
					<button id="unsaved-master" type="submit" class="btn" style="background-color: #337ab7; border-color: #2e6da4;color: #fff;" disabled><spring:message code="alert.button.yes"/></button>
				</c:otherwise>
			</c:choose>
		    <a href="" class="btn btn-warning"><spring:message code="alert.button.no"/></a>
		    <button type="button" class="btn btn-default" data-dismiss="modal"><spring:message code="alert.button.cancel"/></button>
		</b:modal>
		
		<!-- Add Master asset confirm modal -->
		<%@include file="add_master_confirm_modal.jspf" %>
		
		<!-- Update Master Asset with Repitch confirmation modal -->
		<%@include file="repitch_master_confirm_modal.jspf" %>
				
		<!-- Update Master Asset with non-repitch confirmation modal -->
		<b:modal modalId="update-asset-modal" modalTitle="Confirm Update" modalIcon="glyphicon-question-sign">
			<button type="button" class="btn btn-primary confirm-schedule" data-dismiss="modal"><spring:message code="alert.button.yes"/></button>
		    <button type="button" class="btn btn-default" data-dismiss="modal"><spring:message code="alert.button.no"/></button>
		</b:modal>
		
		<!-- Schedule success message modal -->
		<b:modal modalId="schedule-success-modal" modalIcon="glyphicon-ok-sign">
		</b:modal>
						
		<!-- Remove child Asset confirmation modal -->
		<b:modal modalId="remove-child-asset-modal" modalTitle="Confirm Remove" modalIcon="glyphicon-warning-sign">
			<button id="remove-child-confirm" type="button" class="btn btn-primary" data-dismiss="modal"><spring:message code="alert.button.yes"/></button>
		    <button type="button" class="btn btn-default" data-dismiss="modal"><spring:message code="alert.button.no"/></button>
		</b:modal>
		
		<!-- Remove Master Asset confirmation modal -->
		<%@include file="remove_master_confirm_modal.jspf" %>
		
		<!-- Add new asset modal -->
		<%@include file="add_new_asset_modal.jspf" %>
	</jsp:body>
</t:page>