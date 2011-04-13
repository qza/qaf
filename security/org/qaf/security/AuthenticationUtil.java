package org.qaf.security;

import java.security.AccessControlException;
import java.security.Permission;
import java.security.PrivilegedActionException;
import java.security.PrivilegedExceptionAction;

import javax.security.auth.Subject;

public class AuthenticationUtil {

	@SuppressWarnings("unchecked")
	public static boolean permitted(Subject subj, final Permission p) {
		final SecurityManager sm;
		if (System.getSecurityManager() == null) {
			sm = new SecurityManager();
		} else {
			sm = System.getSecurityManager();
		}
		try {
			Subject.doAsPrivileged(subj, new PrivilegedExceptionAction() {
				public Object run() {
					sm.checkPermission(p);
					return null;
				}
			}, null);
			return true;
		} catch (AccessControlException ace) {
			return false;
		} catch (PrivilegedActionException pae) {
			return false;
		}
	}

}
