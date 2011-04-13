/**
 *
 */
package org.qaf.waf.util;

import java.util.Locale;

import javax.faces.application.FacesMessage;
import javax.faces.application.FacesMessage.Severity;
import javax.faces.context.ExternalContext;
import javax.faces.context.FacesContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.qaf.waf.language.LanguageServlet;
import org.qaf.web.sifarnici.beans.BaseBean;


/**
 * @author Qza
 *
 */
public class JSFHelper {

	public static Object getRequestParam(String paramName){
		ExternalContext externalContext = FacesContext.getCurrentInstance().getExternalContext();
		return externalContext.getRequestParameterMap().get(paramName);
	}

	public static String getStringRequestParam(String paramName){
		ExternalContext externalContext = FacesContext.getCurrentInstance().getExternalContext();
		Object prm = externalContext.getRequestParameterMap().get(paramName);
		if(prm==null) return "";
		return String.valueOf(prm);
	}

	public static Integer getIntRequestParam(String paramName){
		Object o = getRequestParam(paramName);
		if(o != null){
			try {
				Integer number = Integer.valueOf(o.toString());
				return number;
			}catch (NumberFormatException nfe){
				return null;
			}
		}
		return null;
	}

	public static Locale getLocaleFromRequest(){
		return FacesContext.getCurrentInstance().getExternalContext().getRequestLocale();
	}

	public static Locale getLocaleFromViewRoot(){
		return FacesContext.getCurrentInstance().getViewRoot().getLocale();
	}

	public static Locale getLocaleFromViewLanguageServlet(){
		String language = getLanguage();
		System.out.println("\n\n GETTING LANGUAGE = " + language );
		return LanguageServlet.locales.get(language);
	}

	public static String getLanguage(){
		ExternalContext externalContext = FacesContext.getCurrentInstance().getExternalContext();
		HttpServletRequest request = (HttpServletRequest) externalContext.getRequest();
		return (String) request.getSession().getAttribute("language");
	}

	public static void addSuccessMessage(String messageText) {
		addMessage(FacesMessage.SEVERITY_INFO, messageText);
	}

	public static void addMessage(Severity severity, String messageID) {
		FacesContext context = FacesContext.getCurrentInstance();
		FacesMessage facesMessage = new FacesMessage(severity, messageID,null);
		context.addMessage(null, facesMessage);
	}

	public static void addErrorMessage(String messageText){
		addMessage(FacesMessage.SEVERITY_ERROR, messageText);
	}

	@SuppressWarnings("unchecked")
	public static <T extends BaseBean> T getManagedBaseBean(String name){
		T t = (T)FacesContext.getCurrentInstance().getExternalContext().
						getRequestMap().get(name);
		return t;
	}

	public static Object getManagedBean(String name){
		return FacesContext.getCurrentInstance().getExternalContext().
						getRequestMap().get(name);
	}

	public static HttpSession getHttpSession(){
		return (HttpSession)FacesContext.getCurrentInstance().getExternalContext().getSession(true);
	}



}
