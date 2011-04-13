package org.qaf.sifarnici.model.dao;

public abstract class DAOFactory {

    public static final Class HIBERNATE = HibernateDaoFactory.class;

    public static DAOFactory instance(Class factory) {
        try {
            return (DAOFactory)factory.newInstance();
        } catch (Exception ex) {
            throw new RuntimeException("Couldn't create DAOFactory: " + factory);
        }
    }

    // Add your DAO interfaces here
    public abstract PacijentDAO getPacijentDAO();

}
