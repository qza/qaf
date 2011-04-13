<%@ page import="java.util.Random"%>
<%  if(request.getParameter("START")==null && request.getAttribute("opid")==null) {
		String redirectHTTP = "http://localhost/qaf?START=" + new Random().nextInt(100000);
	    response.sendRedirect(redirectHTTP);
	}
	else{
		System.out.println("\n\nOPID=" + request.getAttribute("opid")+"\n\n");
		String nextJSP = "/WEB-INF/pages/home.iface?language";
		getServletContext().getRequestDispatcher(nextJSP).forward(request,response);
	}
%>
