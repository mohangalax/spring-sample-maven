<%@ tag pageEncoding="UTF-8" %>

<%@ attribute name="title" fragment="true" %>
<%@ attribute name="head" fragment="true" %>
<%@ attribute name="js" fragment="true" %>
<%@ attribute name="ngApp" type="java.lang.String" %>
<%@ attribute name="navContext" type="java.lang.String" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<c:set var="lang" value="${requestContext.locale}"/>

<!DOCTYPE html>
<html class="no-js" lang="${lang}" data-ng-app="${ngApp}">

<head>
	<!-- page metadata -->
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	<meta name="author" content="ESPN, Inc" />
    <meta name="description" content="ESPN / ESE Media Central Asset Management System" />
    
	<title> ESPN Media Central <c:if test="${not empty title && title != ''}"> | </c:if>  <jsp:invoke fragment="title"/> </title>
	<meta name="served-from" content="${serverName}"/>	
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="icon" href="/mediacentral/images/favicon.png" type="image/x-icon" /> 

	<!-- stylesheets -->
	<link rel="stylesheet" href="/mediacentral/libs/css/jquery-ui.min-1.12.0.css"/>
	<link rel="stylesheet" href="/mediacentral/libs/css/bootstrap.min-3.3.7.css"/>
	<link rel="stylesheet" href="/mediacentral/libs/css/datatables/dataTables.bootstrap.min-1.10.12.css" />
	<link rel="stylesheet" href="/mediacentral/libs/css/datatables/responsive.bootstrap.min-2.1.0.css" />
	<link rel="stylesheet" href="/mediacentral/libs/css/custom/bootstrap-select.min.css" />
	<link rel="stylesheet" href="/mediacentral/libs/css/custom/jstree/jstree-bootstrap-theme.min.css" />
	
	<!-- app stylesheets -->
	<link rel="stylesheet" href="/mediacentral/css/app.css"/>
	<link rel="stylesheet" href="/mediacentral/css/fonts.css"/>
	<jsp:invoke fragment="head"/>

</head>
<body>
	<div id="container">
		<!-- load the site-logo -->
		<%@include file="../includes/header.jspf" %>
		<!-- load the main menu -->
		<%@include file="../includes/main_menu.jspf" %>
		<main>
			<div id="content">
		    	<jsp:doBody/>
		    </div>
	    </main>
	    <%@include file="../includes/footer.jspf" %>
    </div>
	<!--  external libraries  -->    
    <script src="/mediacentral/libs/js/jquery/jquery-core-3.1.0/jquery-3.1.0.min.js"></script>
	<script src="/mediacentral/libs/js/jquery/jquery-ui-1.12.0/jquery-ui.min.js"></script>
	<script src="/mediacentral/libs/js/jquery/jquery-validate-1.15.0/jquery.validate.min.js"></script>
    <script src="/mediacentral/libs/js/bootstrap-3.3.7/bootstrap.min.js"></script>
    <script src="/mediacentral/libs/js/datatables/jquery.dataTables.min-1.10.12.js"></script>
	<script	src="/mediacentral/libs/js/datatables/dataTables.bootstrap.min-1.10.12.js"></script>
	<script	src="/mediacentral/libs/js/datatables/dataTables.responsive.min-2.1.0.js"></script>
	<script	src="/mediacentral/libs/js/datatables/responsive.bootstrap.min-2.1.0.js"></script>
	<script src="/mediacentral/libs/js/spin-2.3.2/spin.min.js"></script>
	<script src="/mediacentral/libs/js/custom/bootstrap-select.min.js"></script>
	<script src="/mediacentral/libs/js/custom/jstree.min.js"></script>	
	
    <!-- app scripts -->
    <script src="/mediacentral/js/app.js"></script>
    <script src="/mediacentral/js/alert.js"></script>
    <script src="/mediacentral/js/spinner.js"></script>
    <script src="/mediacentral/js/validation.js"></script>
    <jsp:invoke fragment="js"/>
	
</body>
</html>