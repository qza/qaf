package org.qaf.sifarnici.model.dao;

import org.hibernate.Session;
import org.qaf.common.model.HibernateUtil;
import org.qaf.common.model.dao.GenericDAOImpl;


public class HibernateDaoFactory extends DAOFactory{

	private PacijentDAO pacijentDAO;

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
	public PacijentDAO getPacijentDAO() {
		if(pacijentDAO == null){
			pacijentDAO = (PacijentDAO)instantiateDao(PacijentDAOImpl.class);
		}
		return pacijentDAO;
	}

}
