package org.qaf.security.manager;

/**
 * @author Qza
 *
 */
public interface ManagerFactory {

    // Manager interfaces
    public KorisnikManager getKorisnikManager();

	public UlogaManager getUlogaManager();

	public KorisnikUlogaManager getKorisnikUlogaManager();

	public OpiduserManager getOpiduserManager();

	
}
