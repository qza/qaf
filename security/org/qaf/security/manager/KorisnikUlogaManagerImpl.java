package org.qaf.security.manager;


import java.math.BigInteger;
import java.util.List;

import org.apache.commons.lang.StringUtils;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Example;
import org.hibernate.criterion.MatchMode;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Restrictions;
import org.qaf.common.model.HibernateUtil;
import org.qaf.security.model.KorisnikUloga;
import org.qaf.waf.pagin.DataPage;

/**
 * @author Qza
 *
 */
public class KorisnikUlogaManagerImpl extends BaseManagerImpl implements KorisnikUlogaManager {

	public List<KorisnikUloga> fetchAll() {
		return korisnikulogaDAO.fetchAll();
	}

	public KorisnikUloga fetch(Integer id) {
		if(id == null) return null;
		return korisnikulogaDAO.fetch(id);
	}

	public List<KorisnikUloga> fetch(KorisnikUloga korisnikuloga, String[] excludeProperty) {
		if(korisnikuloga == null) return null;
		return korisnikulogaDAO.findByExample(korisnikuloga, excludeProperty);
	}

	public KorisnikUloga save(KorisnikUloga korisnikuloga) {
		HibernateUtil.beginTransaction();
		korisnikulogaDAO.saveOrUpdate(korisnikuloga);
		HibernateUtil.commitTransation();
		return korisnikuloga;
	}

	public void delete(KorisnikUloga korisnikuloga) {
		HibernateUtil.beginTransaction();
		korisnikulogaDAO.deleteEntity(korisnikuloga);
		HibernateUtil.commitTransation();
	}

	public DataPage<KorisnikUloga> getPagedData(KorisnikUloga search, int startRow, int maxResult){
		return null;
	}
}

