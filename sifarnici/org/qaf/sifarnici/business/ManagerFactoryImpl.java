/**
 *
 */
package org.qaf.sifarnici.business;

/**
 * @author Qza
 *
 */
public class ManagerFactoryImpl implements ManagerFactory {

	private PacijentManager pacijentManager;

	private ManagerFactoryImpl(){}

	protected static final class InstanceHolder {
		protected static final ManagerFactoryImpl factory = new ManagerFactoryImpl();
	}

	public static ManagerFactory getInstance(){
		return InstanceHolder.factory;
	}

	public PacijentManager getPacijentManager() {
		if(pacijentManager == null){
			pacijentManager = new PacijentManagerImpl();
		}
		return pacijentManager;
	}

}
