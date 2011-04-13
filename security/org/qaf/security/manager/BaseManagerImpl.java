package org.qaf.security.manager;

import org.qaf.security.dao.DAOFactory;
import org.qaf.security.dao.KorisnikDAO;
import org.qaf.security.dao.KorisnikUlogaDAO;
import org.qaf.security.dao.OpiduserDAO;
import org.qaf.security.dao.UlogaDAO;

/**
 * @author Qza
 *
 */
public class BaseManagerImpl {

	protected DAOFactory factory = DAOFactory.instance(DAOFactory.HIBERNATE);

	protected KorisnikDAO korisnikDAO = factory.getKorisnikDAO();

	protected UlogaDAO ulogaDAO = factory.getUlogaDAO();

	protected KorisnikUlogaDAO korisnikulogaDAO = factory.getKorisnikUlogaDAO();

	protected OpiduserDAO opiduserDAO = factory.getOpiduserDAO();

	public BaseManagerImpl(){}

}
