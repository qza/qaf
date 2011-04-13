/**
 *
 */
package org.qaf.sifarnici.business;

import org.qaf.sifarnici.model.dao.DAOFactory;
import org.qaf.sifarnici.model.dao.PacijentDAO;

/**
 * @author Zoran Kokovic
 *
 */
public class BaseManagerImpl {

	protected DAOFactory factory = DAOFactory.instance(DAOFactory.HIBERNATE);
	protected PacijentDAO pacijentDao = factory.getPacijentDAO();

	public BaseManagerImpl(){}


}
