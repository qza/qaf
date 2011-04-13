package org.qaf.security.dao;

import org.hibernate.Session;
import org.qaf.common.model.HibernateUtil;
import org.qaf.common.model.dao.GenericDAOImpl;


/**
 * @author Qza
 *
 */
public class HibernateDAOFactory extends DAOFactory{

	private KorisnikDAO korisnikDAO;
	private UlogaDAO ulogaDAO;
	private KorisnikUlogaDAO korisnikulogaDAO;
	private OpiduserDAO opiduserDAO;
	
	protected Session getCurrentSession(){
		return HibernateUtil.currentSession();
	}

	private GenericDAOImpl instantiateDao(Class daoClass){
		try {
			GenericDAOImpl dao = (GenericDAOImpl)daoClass.newInstance();
			return dao;
		} catch (Exception e){
			throw new RuntimeException("Can not instantiate Dao: "+daoClass, e);
		}
	}

	@Override
	public KorisnikDAO getKorisnikDAO() {
		if(korisnikDAO == null){
			korisnikDAO = (KorisnikDAO)instantiateDao(KorisnikDAOImpl.class);
		}
		return korisnikDAO;
	}
	@Override
	public UlogaDAO getUlogaDAO() {
		if(ulogaDAO == null){
			ulogaDAO = (UlogaDAO)instantiateDao(UlogaDAOImpl.class);
		}
		return ulogaDAO;
	}
	@Override
	public KorisnikUlogaDAO getKorisnikUlogaDAO() {
		if(korisnikulogaDAO == null){
			korisnikulogaDAO = (KorisnikUlogaDAO)instantiateDao(KorisnikUlogaDAOImpl.class);
		}
		return korisnikulogaDAO;
	}
	@Override
	public OpiduserDAO getOpiduserDAO() {
		if(opiduserDAO == null){
			opiduserDAO = (OpiduserDAO)instantiateDao(OpiduserDAOImpl.class);
		}
		return opiduserDAO;
	}
	
}