<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<html>
	<head>
		<link rel="stylesheet" href="css/app.css" type="text/css">
	</head>
	<body>
		<div class="forbidden">
		    <div class="repeat-image">
		        <div class="main-image image403">
		            <div class="text-block">
		                <p class="status"><spring:message code="errors.accessDenied.status"/></p>
		                <p class="title"><spring:message code="errors.accessDenied.title"/></p>
		                <p class="message"><spring:message code="errors.forbidden.message"/></p>
		                <div class="instructions"><spring:message code="errors.forbidden.instructions"/></div>
		                <div class="message"><spring:message code="errors.forbidden.linkMsg"/></div>
		            </div>
		        </div>
		    </div>
		</div>
	</body>
</html>