<%@ tag pageEncoding="UTF-8" dynamic-attributes="dynamicAttributes" %>

<%@ attribute name="modalId" type="java.lang.String" %>
<%@ attribute name="modalTitle" type="java.lang.String" %>
<%@ attribute name="modalBody" type="java.lang.String" %>
<%@ attribute name="modalIcon" type="java.lang.String" %>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>


<div id="${modalId}" class="modal fade">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                <h4 class="modal-title">${modalTitle}</h4>
            </div>
            <div class="modal-body">
            	<div class="container-fluid" style="padding-left: 0px; padding-right: 0px">
	            	<div class="col-sm-1">
	            		<i class="glyphicon ${modalIcon}" style="font-size: 20px;"></i>
	            	</div>
	            	<div class="col-sm-11">
	            		<span>${modalBody}</span>
	            	</div>
            	</div>
            </div>
            <div class="modal-footer">
                <jsp:doBody />
            </div>
        </div>
    </div>
</div>