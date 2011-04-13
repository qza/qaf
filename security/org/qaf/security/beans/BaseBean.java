/**
 *
 */
package org.qaf.security.beans;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.qaf.security.manager.KorisnikManager;
import org.qaf.security.manager.KorisnikUlogaManager;
import org.qaf.security.manager.ManagerFactory;
import org.qaf.security.manager.ManagerFactoryImpl;
import org.qaf.security.manager.UlogaManager;
import org.qaf.waf.beans.QafBaseBean;


/**
 * @author Qza
 *
 */
public abstract class BaseBean<T> extends QafBaseBean<T>{

	protected static Log log = LogFactory.getLog(BaseBean.class);

	protected ManagerFactory factory = ManagerFactoryImpl.getInstance();

	protected KorisnikManager korisnikManager = factory.getKorisnikManager();

	protected KorisnikUlogaManager korisnikUlogaManager = factory.getKorisnikUlogaManager();

	protected UlogaManager ulogaManager = factory.getUlogaManager();

}
