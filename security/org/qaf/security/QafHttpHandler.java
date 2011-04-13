package org.qaf.security;

import java.io.IOException;

import javax.security.auth.callback.Callback;
import javax.security.auth.callback.CallbackHandler;
import javax.security.auth.callback.NameCallback;
import javax.security.auth.callback.PasswordCallback;
import javax.security.auth.callback.UnsupportedCallbackException;
import javax.servlet.http.HttpServletRequest;

public class QafHttpHandler implements CallbackHandler {

	protected static final org.apache.commons.logging.Log log = org.apache.commons.logging.LogFactory
			.getLog(QafHttpHandler.class);

	private String username;

	private String password;

	public QafHttpHandler() {
		log.info("Kreira se empty QafHttpHandler");
	}

	public QafHttpHandler(HttpServletRequest request) {
		log.info("Kreira se QafHttpHandler");
		username = request.getRemoteUser();
		System.out.println("Remote user is: " + request.getRemoteUser());
	}

	public QafHttpHandler(String username, String password) {
		log.info("Kreira se QafHttpHandler");
		this.username = username;
		this.password = password;
	}

	public void handle(Callback[] cb) throws IOException,
			UnsupportedCallbackException {
		String nameStr = "javax.security.auth.callback.NameCallback";
		String passStr = "javax.security.auth.callback.PasswordCallback";
		log.info("Handluje QafHttpHandler");
		for (int i = 0; i < cb.length; i++) {
			Callback c = cb[i];
			String className = c.getClass().getName().trim();
			if (className.equalsIgnoreCase(nameStr)) {
				NameCallback nc = (NameCallback) c;
				nc.setName(username);
			} else {
				if (className.equalsIgnoreCase(passStr)) {
					PasswordCallback pc = (PasswordCallback) c;
					pc.setPassword(("crypted"+password).toCharArray());
				} else {
					UnsupportedCallbackException ex = new UnsupportedCallbackException(
							c, "QafHttpHandler");
					log.error(ex);
					throw ex;
				}
			}
		}
	}

}
