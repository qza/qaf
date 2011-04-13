package org.qaf.security;

import java.io.IOException;
import java.security.Principal;
import java.util.List;
import java.util.NoSuchElementException;

import javax.faces.context.ExternalContext;
import javax.faces.context.FacesContext;
import javax.faces.event.ActionEvent;
import javax.security.auth.Subject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.qaf.security.manager.KorisnikManager;
import org.qaf.security.manager.ManagerFactoryImpl;
import org.qaf.security.manager.OpiduserManager;
import org.qaf.security.model.Korisnik;
import org.qaf.security.model.Opiduser;


public class LoginBean {

	protected static final org.apache.commons.logging.Log log =
		org.apache.commons.logging.LogFactory.getLog(LoginBean.class);

	public String getRemoteUser() {
		FacesContext context= FacesContext.getCurrentInstance();
		HttpServletRequest request = (HttpServletRequest) context.getExternalContext().getRequest();
		String remoteUser = request.getRemoteUser();
		if(remoteUser!=null) return request.getRemoteUser();
		else {
			HttpSession sesija=(HttpSession) context.getExternalContext().getSession(true);
			Subject subject = (Subject) sesija.getAttribute("javax.security.auth.subject");
			try{
				Principal princ = subject.getPrincipals().iterator().next();
				String princName = princ.getName();
				return princName;
			}catch(NoSuchElementException ex){
				return "NO USER";
			}
		}
	}

	public void logout(ActionEvent event){
		log.info("Loging out....");

		FacesContext context= FacesContext.getCurrentInstance();
		ExternalContext ec = context.getExternalContext();
		HttpServletRequest request = (HttpServletRequest) ec.getRequest();
		HttpSession sesija=(HttpSession) ec.getSession(false);

		String remoteUser = request.getRemoteUser();

		Opiduser opiduser = new Opiduser();

		Korisnik k = new Korisnik();

		k.setKorisnickoIme(remoteUser);

		KorisnikManager kMan = ManagerFactoryImpl.getInstance().getKorisnikManager();

		k = kMan.fetch(k, null).iterator().next();

		if(k.getOpidusers().size()>0) {
			opiduser.setEmail(k.getEmail());
			OpiduserManager oMan = ManagerFactoryImpl.getInstance().getOpiduserManager();
			List<Opiduser> osers = oMan.fetch(opiduser, null);
			if(osers.size()>0){
				opiduser = osers.iterator().next();;
				k.getOpidusers().remove(opiduser);
				ManagerFactoryImpl.getInstance().getKorisnikManager().save(k);
				oMan.delete(opiduser);
			}
		}

		try {
			sesija.invalidate();
			ec.redirect("/qaf/");
		} catch (IOException e) {
			log.error(e);
			e.printStackTrace();
		}
	}

	public void setRemoteUser(){
	}


}
