package org.qaf.waf.content.model.dao;

import org.hibernate.Session;
import org.qaf.common.model.HibernateUtil;
import org.qaf.common.model.dao.GenericDAOImpl;


public class HibernateDaoFactory extends DAOFactory{

	private AplikacijaDAO aplikacijaDAO;
	private ModulAplikacijaDAO aplikacijaModulDAO;
	private ModulDAO modulDAO;

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
	public AplikacijaDAO getAplikacijaDAO() {
		if(aplikacijaDAO == null){
			aplikacijaDAO = (AplikacijaDAO)instantiateDao(AplikacijaDAOImpl.class);
		}
		return aplikacijaDAO;
	}

	@Override
	public ModulAplikacijaDAO getAplikacijaModulDAO() {
		if(aplikacijaModulDAO == null){
			aplikacijaModulDAO = (ModulAplikacijaDAO)instantiateDao(ModulAplikacijaDAOImpl.class);
		}
		return aplikacijaModulDAO;
	}

	@Override
	public ModulDAO getModulDAO() {
		if(modulDAO == null){
			modulDAO = (ModulDAO)instantiateDao(ModulDAOImpl.class);
		}
		return modulDAO;
	}

}
