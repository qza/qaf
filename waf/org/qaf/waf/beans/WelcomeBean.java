package org.qaf.waf.beans;

import java.io.IOException;
import java.util.HashMap;
import java.util.Locale;

import javax.faces.context.ExternalContext;
import javax.faces.context.FacesContext;
import javax.faces.event.ActionEvent;
import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class WelcomeBean {

	private HashMap<String, Locale> locales = null;

    public WelcomeBean() {
    	locales = new HashMap<String, Locale>(4);
    	locales.put("srpski", new Locale("sr", "SR"));
        locales.put("english", new Locale("en", "UK"));
        locales.put("french", new Locale("fr", "FR"));
    }

    public void onChooseLocale(ActionEvent event) {
        String current = event.getComponent().getId();
        FacesContext context = FacesContext.getCurrentInstance();
        context.getViewRoot().setLocale((Locale) locales.get(current));
    }

    public String loginAction() throws IOException, ServletException {
      ExternalContext ectx = FacesContext.getCurrentInstance().getExternalContext();
      HttpServletRequest request = (HttpServletRequest)ectx.getRequest();
      HttpServletResponse response = (HttpServletResponse)ectx.getResponse();
      RequestDispatcher dispatcher = request.getRequestDispatcher("loginProxy.jspx");
      dispatcher.forward(request,response);
      return null;
    }


}
