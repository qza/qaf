package org.qaf.waf.phase;

import java.util.Locale;

import javax.faces.context.FacesContext;
import javax.faces.event.PhaseEvent;
import javax.faces.event.PhaseId;
import javax.faces.event.PhaseListener;
import javax.servlet.http.HttpSession;

import org.qaf.waf.language.LanguageServlet;


public class LocalePhaseListener implements PhaseListener{

	private static final long serialVersionUID = 4141208396015381637L;

	public void afterPhase(PhaseEvent arg0) {
	}

	public void beforePhase(PhaseEvent arg0) {
		if(arg0.getPhaseId().equals(PhaseId.RENDER_RESPONSE)){
			FacesContext context= FacesContext.getCurrentInstance();
			HttpSession session = (HttpSession) context.getExternalContext().getSession(false);
			String lan = (String) session.getAttribute("language");
			Locale newLocale = (Locale) LanguageServlet.locales.get(lan);
			context.getViewRoot().setLocale(newLocale);
		}
	}

	public PhaseId getPhaseId() {
		return PhaseId.ANY_PHASE;
	}

}
