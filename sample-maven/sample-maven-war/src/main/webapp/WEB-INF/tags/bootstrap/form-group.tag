<%@ tag pageEncoding="UTF-8" dynamic-attributes="dynamicAttributes" %>

<%@ attribute name="cssClass" type="java.lang.String" %>
<%@ attribute name="cssBody" type="java.lang.String" %>
<%@ attribute name="cssLabel" type="java.lang.String" %>
<%@ attribute name="labelFor" type="java.lang.String" %>
<%@ attribute name="label" type="java.lang.String" %>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<c:set var="cssLabel" value="${(empty cssLabel) ? 'col-sm-3' : cssLabel}" />

<div class="form-group ${cssClass}" <c:forEach items="${dynamicAttributes}" var="attr">${attr.key}="${attr.value}"</c:forEach>>
    <c:if test="${label != '' or labelFor != ''}"><label class="control-label ${cssLabel}" for="${labelFor}">${label}</label></c:if>
    <div class="${cssBody}">
        <jsp:doBody />
    </div>
    <c:if test="${label != '' or labelFor != ''}"><span class="error-inline"></span></c:if>
</div>