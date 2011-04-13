package org.qaf.waf.language;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class RefreshServlet extends HttpServlet {

	/**
	 *
	 */
	private static final long serialVersionUID = -6708700914723422218L;

	public void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		// set the content type
		response.setContentType("text/html");

		PrintWriter out = response.getWriter();

		// Instruct the browser to wait 5 seconds before redirecting to a new
		// URL
		// Here two ways are shown. It can be directed to a different URL
		// altogether
		// or can also be directed to a servlet/JSP within the application.
		String mesg = "Hi!";

		response.setHeader("Refresh", "5; URL=http://www.oracle.com");
		// response.setHeader("Refresh", "5; // URL=../redirected.jsp?param1="+mesg);

		// output a message that notifies the user that the
		// browser is going to be redirected to a new page
		out.println("<HTML>");
		out.println("<BODY>");
		out.println("The page you requested is moved to a different location. ");
		out.println("Your browser will automatically take you<BR>");
		out.println("to the new location in 5 seconds.<BR>");
		out.println("If the browser does not take you to the new location, ");
		out.println("or you don't want to wait then,");
		out.println(" <a href=\"../redirected.jsp?param1=" + mesg + "\">Click Here</a><BR>");
		out.println("</BODY>");
		out.println("</HTML>");
	}

}
