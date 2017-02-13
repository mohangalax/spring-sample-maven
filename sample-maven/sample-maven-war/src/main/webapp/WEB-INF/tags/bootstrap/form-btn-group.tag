<%@ tag pageEncoding="UTF-8" dynamic-attributes="dynamicAttributes" %>

<%@ attribute name="cssClass" type="java.lang.String" %>
<%@ attribute name="cssBody" type="java.lang.String" %>
<%@ attribute name="cssBtn" type="java.lang.String" %>
<%@ attribute name="labelFor" type="java.lang.String" %>
<%@ attribute name="label" type="java.lang.String" %>
<%@ attribute name="button" type="java.lang.String" %>
<%@ attribute name="buttonTxt" type="java.lang.String" %>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<div class="form-group ${cssClass}" <c:forEach items="${dynamicAttributes}" var="attr">${attr.key}="${attr.value}"</c:forEach>>
    <c:if test="${label != '' or labelFor != ''}"><label class="control-label col-sm-3" for="${labelFor}">${label}</label></c:if>
    <div class="${cssBody}">
        <jsp:doBody />
    </div>
    <c:if test="${button != '' and buttonTxt != ''}"><button id="${button}" type="button" class="btn btn-primary ${cssBtn}" style="margin-right: 5px" disabled>${buttonTxt}</button></c:if>
    <c:if test="${label != '' or labelFor != ''}"><span class="error-inline"></span></c:if>
</div>