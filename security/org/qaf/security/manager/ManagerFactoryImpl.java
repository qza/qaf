package org.qaf.security.manager;

/**
 * @author Qza
 *
 */
public class ManagerFactoryImpl implements ManagerFactory {

    // Manager interfaces
	private KorisnikManager korisnikManager;

	private UlogaManager ulogaManager;

	private KorisnikUlogaManager korisnikulogaManager;

	private OpiduserManager opiduserManager;


	private ManagerFactoryImpl(){}

	protected static final class InstanceHolder {
		protected static final ManagerFactoryImpl factory = new ManagerFactoryImpl();
	}

	public static ManagerFactory getInstance(){
		return InstanceHolder.factory;
	}

	public KorisnikManager getKorisnikManager() {
		if(korisnikManager == null){
			korisnikManager = new KorisnikManagerImpl();
		}
		return korisnikManager;
	}
	public UlogaManager getUlogaManager() {
		if(ulogaManager == null){
			ulogaManager = new UlogaManagerImpl();
		}
		return ulogaManager;
	}
	public KorisnikUlogaManager getKorisnikUlogaManager() {
		if(korisnikulogaManager == null){
			korisnikulogaManager = new KorisnikUlogaManagerImpl();
		}
		return korisnikulogaManager;
	}
	public OpiduserManager getOpiduserManager() {
		if(opiduserManager == null){
			opiduserManager = new OpiduserManagerImpl();
		}
		return opiduserManager;
	}
}
