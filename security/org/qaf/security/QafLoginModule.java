package org.qaf.security;

import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Vector;

import javax.security.auth.Subject;
import javax.security.auth.callback.Callback;
import javax.security.auth.callback.CallbackHandler;
import javax.security.auth.callback.NameCallback;
import javax.security.auth.callback.PasswordCallback;
import javax.security.auth.login.LoginException;
import javax.security.auth.spi.LoginModule;

import org.hibernate.HibernateException;
import org.hibernate.Session;
import org.qaf.common.model.HibernateUtil;
import org.qaf.security.model.Korisnik;
import org.qaf.security.model.KorisnikUloga;
import org.qaf.security.model.Uloga;


public class QafLoginModule implements LoginModule {

	// initial state
	CallbackHandler handler;
	Subject subject;
	Map sharedState;
	Map options;
	QafDigest digest;
	// temporary state
	Vector principals;
	Vector credentials;
	// authentication status
	boolean success;
	// configurable options
	boolean debug;

	protected static final org.apache.commons.logging.Log log =
		org.apache.commons.logging.LogFactory.getLog(QafLoginModule.class);

	public QafLoginModule() {
		credentials = new Vector();
		principals = new Vector();
		success = false;
		debug = false;
	}

	/**
	 * Initialize state.
	 */
	public void initialize(Subject subject, CallbackHandler handler,
						   Map sharedState, Map options) {
		log.info("Inicijalizuje se QafLoginModule");
		this.handler = handler;
		this.subject = subject;
		this.sharedState = sharedState;
		this.options = options;
		if (options.containsKey("debug")) {
			debug = "true".equalsIgnoreCase((String) options.get("debug"));
		}
		if (options.containsKey("digest")) {
			digest = new QafDigest((String) options.get("digest"));
		} else {
			digest = new QafDigest();
		}
	}

	/**
	 * First phase of login process.
	 */
	public boolean login() throws LoginException {
		log.info("Loginuje se guest.");
		if (handler == null) {
			throw new LoginException("Error: no CallbackHandler available");
		}
		try {
			Callback[] callbacks = new Callback[] { new NameCallback("User: "),
					new PasswordCallback("Password: ", false) };
			handler.handle(callbacks);
			String username = ((NameCallback) callbacks[0]).getName();
			char[] password = ((PasswordCallback) callbacks[1]).getPassword();
			((PasswordCallback) callbacks[1]).clearPassword();
			String psw = String.valueOf(password);
			boolean kriptovano = psw.startsWith("crypted");
     		success = validate(username, password, kriptovano);

     		psw = null;
			callbacks[0] = null;
			callbacks[1] = null;
			if (!success) {
				throw new LoginException(
						"Authentication failed: Password does not match");
			}
			return true;
		} catch (LoginException e) {
			log.error(e);
			throw e;
		} catch (Exception e) {
			log.error(e);
			success = false;
			throw new LoginException(e.getMessage());
		}
	}

	/**
	 * Second phase of login - by now we know user is authenticated and we just
	 * need to update the subject.
	 */
	@SuppressWarnings("unchecked")
	public boolean commit() throws LoginException {
		if (success) {
			log.info("Usepsno ulogovan");
			if (subject.isReadOnly()) {
				throw new LoginException("Subject is read-only");
			}
			try {
				log.info("Uzimam principals");
				log.info("ukupno" + principals.size());
				subject.getPrincipals().addAll(principals);
				principals.clear();
				return true;
			} catch (Exception e) {
				throw new LoginException(e.getMessage());
			}
		} else {
			principals.clear();
		}
		return true;
	}

	/**
	 * Second phase - somebody else rejected user so we need to clear our state.
	 */
	public boolean abort() throws LoginException {
		success = false;
		logout();
		return true;
	}

	/**
	 * User is logging out - clear our information from the subject.
	 */
	public boolean logout() throws LoginException {
		principals.clear();
		// remove the principals the login module added
		Iterator i = subject.getPrincipals(QafUserPrincipal.class).iterator();
		while (i.hasNext()) {
			QafUserPrincipal p = (QafUserPrincipal) i.next();
			subject.getPrincipals().remove(p);
		}
		return true;
	}

	/**
	 * Validate the user name and password. This is the Hibernate-specific code.
	 */
	@SuppressWarnings("unchecked")
	private boolean validate(String username, char[] password, boolean kriptovano) throws Exception {
		String passStr = "";
		if(kriptovano){
			passStr = String.valueOf(password);
			passStr = passStr.replace("crypted", "");
			passStr = passStr.trim();
		}
		System.out.println(this.getClass().getName()+" : "+"validate");
		boolean valid = false;
		List users = null;
		Session s = null;
		try {
			s = HibernateUtil.currentSession();
			String q = "from Korisnik where korisnicko_ime='" + username + "'" ;
			users = s.createQuery(q).list();
		} catch (Exception e) {
			log.error(e);
			e.printStackTrace();
		} finally {
			if (s != null) {
				try {
					s.close();
				} catch (HibernateException e) {
					log.error(e);
					e.printStackTrace();
				}
			}
		}

		// are there no matching records?...
		if (users == null || users.size() == 0) {
			return false;
		}

		// compare passwords...
		Korisnik user = (Korisnik) users.get(0);
		String hash = user.getLozinka();
		Integer userId = user.getId();
		if (hash != null && password != null && password.length > 0) {
			if(kriptovano){
				valid = hash.equals(passStr);
			}
			else{
				valid = hash.equals(digest.digest(new String(password)));
			}
		}
		log.info("Lozinka se poklapa: " + valid);
		if (valid) {
			QafUserPrincipal mp = new QafUserPrincipal(username);
			this.principals.add(mp);
			try {
				s = HibernateUtil.currentSession();
				String q = "from KorisnikUloga where korisnik_id=" + userId + "" ;
				List<KorisnikUloga> kus = s.createQuery(q).list();
				Iterator<KorisnikUloga> it = kus.iterator();
				if(!it.hasNext()) return false;
				while(it.hasNext()){
					Integer kuid = it.next().getUlogaId();
					String q2 = "from Uloga where id=" + kuid + "" ;
					Uloga uloga = (Uloga) s.createQuery(q2).uniqueResult();
					String ulogaName = uloga.getNaziv();
					QafRolePrincipal mr = new QafRolePrincipal(ulogaName);
					this.principals.add(mr);
				}
			} catch (Exception e) {
				log.error(e);
				e.printStackTrace();
			}
		}
		return valid;
	}

}
