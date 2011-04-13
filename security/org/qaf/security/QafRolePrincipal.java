package org.qaf.security;

import java.security.Principal;

final public class QafRolePrincipal implements Principal, java.io.Serializable {

	private static final long serialVersionUID = 1L;
	private String name;

	protected static final org.apache.commons.logging.Log log =
		org.apache.commons.logging.LogFactory.getLog(QafRolePrincipal.class);

	public QafRolePrincipal(String name) {
		log.info("Kreira se QafRolePrincipal");
		if (name == null)
			throw new NullPointerException("illegal null input");

		this.name = name;
	}

	public String getName() {
		return name;
	}

	public String toString() {
		return ("QafPrincipal:  " + name);
	}

	public boolean equals(Object o) {
		if (o == null)
			return false;
		if (this == o)
			return true;
		if (!(o instanceof QafRolePrincipal))
			return false;
		QafRolePrincipal that = (QafRolePrincipal) o;

		if (this.getName().equals(that.getName()))
			return true;
		return false;
	}

	public int hashCode() {
		return name.hashCode();
	}
}
