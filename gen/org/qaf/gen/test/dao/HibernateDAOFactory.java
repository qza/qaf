package org.qaf.gen.test.dao;

import org.hibernate.Session;
import org.qaf.common.model.HibernateUtil;
import org.qaf.common.model.dao.GenericDAOImpl;


/**
 * @author Qza
 *
 */
public class HibernateDAOFactory extends DAOFactory{

	private AplikacijaDAO aplikacijaDAO;
	private ModulAplikacijaDAO modulaplikacijaDAO;
	private GrupaaplikacijaDAO grupaaplikacijaDAO;
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
	public ModulAplikacijaDAO getModulAplikacijaDAO() {
		if(modulaplikacijaDAO == null){
			modulaplikacijaDAO = (ModulAplikacijaDAO)instantiateDao(ModulAplikacijaDAOImpl.class);
		}
		return modulaplikacijaDAO;
	}
	@Override
	public GrupaaplikacijaDAO getGrupaaplikacijaDAO() {
		if(grupaaplikacijaDAO == null){
			grupaaplikacijaDAO = (GrupaaplikacijaDAO)instantiateDao(GrupaaplikacijaDAOImpl.class);
		}
		return grupaaplikacijaDAO;
	}
	@Override
	public ModulDAO getModulDAO() {
		if(modulDAO == null){
			modulDAO = (ModulDAO)instantiateDao(ModulDAOImpl.class);
		}
		return modulDAO;
	}
	
}