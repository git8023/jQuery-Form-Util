package org.yong.servlet;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class AjaxVerificationServlet extends HttpServlet {

	// @Fields serialVersionUID :
	private static final long serialVersionUID = -6685028687129465378L;

	@Override
	protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		String account = req.getParameter("account");
		System.out.println("AjaxVerificationServlet.service()");
		resp.getWriter().write("" + !"admin".equals(account));
	}

}
