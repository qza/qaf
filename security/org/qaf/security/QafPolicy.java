package org.qaf.security;

import java.security.CodeSource;
import java.security.PermissionCollection;
import java.security.Policy;
import java.security.Principal;
import java.security.ProtectionDomain;

public class QafPolicy  extends Policy {

	private Policy deferredPolicy;

	public QafPolicy(Policy p) {
		deferredPolicy = p;
	}

	public PermissionCollection getPermissions(CodeSource cs) {
		PermissionCollection pc = deferredPolicy.getPermissions(cs);
		System.out.println("getPermissions was called for codesource");
		return pc;
	}

	public PermissionCollection getPermissions(ProtectionDomain domain) {

		PermissionCollection pc = deferredPolicy.getPermissions(domain);
		System.out.println("getPermissions was called for domain");
		Principal[] principals = domain.getPrincipals();
		System.out.println("retrieved " + principals.length + " principals");

		for (int i=0; i< principals.length; i++) {

			Principal p = principals[i];
			System.out.println("This is principal" + p);
			/*CustomPermission[] pms = null;
			if (p instanceof CustomPrincipal ) {

				System.out.println(p.getName()  + " is a CustomPrincipal");

				// Get the permissions belonging to the principal here.
				// Here we just add an example permission
				CustomPermission[] test =  { new CustomPermission("AccessToCompany1Building") };
				pms = test;
			} else {
			  System.out.println(p.getName()  + " is not a CustomPrincipal");
			}

			// Nothing to do
			if (pms == null)  continue;

			for(int j=0; j< pms.length; j++) {
				System.out.println("Adding permission = " + pms[j]);
				pc.add(pms[j]);
			}*/

		}

		System.out.println(pc);
		return pc;
	}

	public void refresh() {
		deferredPolicy.refresh();
	}

}
