<% String titleLabel = (String) request.getSession().getAttribute("titleLabel");%>
<% String qafAccountLabel = (String) request.getSession().getAttribute("qafAccountLabel");%>
<% String usernameLabel = (String) request.getSession().getAttribute("usernameLabel");%>
<% String passwordLabel = (String) request.getSession().getAttribute("passwordLabel");%>
<% String loginLabel = (String) request.getSession().getAttribute("loginLabel");%>
<% String resetLabel = (String) request.getSession().getAttribute("resetLabel");%>
<% String openidLabel = (String) request.getSession().getAttribute("openidLabel");%>

<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<html xmlns:jsp="http://java.sun.com/JSP/Page">
<head>
	<link rel="icon" href="images/favicon.ico" type="image/ico">
	<link rel="shortcut icon" href="images/favicon.ico">
	<title><%= titleLabel %></title>
</head>
<body>
<form name="loginForm" method="POST" action='<%= response.encodeURL("j_security_check") %>' >
	<div style="width: 100%; display: table; font-size: 1.2em; padding-top: 10%;">
		<span style="display: table-cell;"></span>
		<span style="display: table-cell; width: 400px;">
			<img src="./images/health.jpg" alt="ICEfaces" title="Qaf" width="400" height="250" align="middle"/>
		</span>
		<span style="display: table-cell;"></span>
	</div>
	<div style="width: 100%; display: table; font-size: 1.2em;">
		<span style="display: table-cell;"></span>
		<span style="display: table-cell; width: 550px;">
			<table width="100%"" cellpadding="10px">
				<tr>
					<td valign="middle">
						<h3 style="font-size: 1.8em;" align="right"><%= qafAccountLabel %></h3>
					</td>
					<td valign="middle">
						<table border="0" cellspacing="5" style="padding-left: 10px;">
							<tr>
						    <th align="right"><%= usernameLabel %>:</th>
						    <td align="left"><input type="text" id="j_username" name="j_username"/></td>
						  </tr>
						  <tr>
						    <th align="right"><%= passwordLabel %>:</th>
						    <td align="left"><input type="password" id="j_password" name="j_password"/></td>
						  </tr>
						  <tr align="center">
						    <td>
						    </td>
						    <td align="right">
						    	<input type="submit" id="log_in" value="<%= loginLabel %>"/>
						    	<input type="reset" value="<%= resetLabel %>"/>
						    </td>
						  </tr>
						</table>
					</td>
				</tr>
			</table>
			<table width="100%"" cellpadding="0px" style="padding-top: 10px">
				<tr>
					<td valign="middle" align="center">
						<h3 style="font-size: 1.8em;"><%= openidLabel %> </h3>
					</td>
				</tr>
				<tr>
					<td valign="top" align="center">
						<a href="openid?op=Google" style="font-size: 1.2em;">Google</a> &nbsp;
						<a href="openid?op=Yahoo" style="font-size: 1.2em;">Yahoo</a>
					</td>
				</tr>
			</table>
		</span>
		<span style="display: table-cell;"></span>
	</div>
</form>
</body>
</html>
