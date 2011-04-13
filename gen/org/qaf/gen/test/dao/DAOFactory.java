package org.qaf.gen.test.dao;

/**
 * @author Qza
 *
 */
public abstract class DAOFactory {

    public static final Class HIBERNATE = HibernateDAOFactory.class;

    public static DAOFactory instance(Class factory) {
        try {
            return (DAOFactory)factory.newInstance();
        } catch (Exception ex) {
            throw new RuntimeException("Couldn't create DAOFactory: " + factory);
        }
    }

    // Add your DAO interfaces here
    public abstract AplikacijaDAO getAplikacijaDAO();
	public abstract ModulAplikacijaDAO getModulAplikacijaDAO();
	public abstract GrupaaplikacijaDAO getGrupaaplikacijaDAO();
	public abstract ModulDAO getModulDAO();
	
}
