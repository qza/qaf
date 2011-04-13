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
import org.qaf.security.model.Uloga;
import org.qaf.waf.pagin.DataPage;

/**
 * @author Qza
 *
 */
public class UlogaManagerImpl extends BaseManagerImpl implements UlogaManager {

	public List<Uloga> fetchAll() {
		return ulogaDAO.fetchAll();
	}

	public Uloga fetch(Integer id) {
		if(id == null) return null;
		return ulogaDAO.fetch(id);
	}

	public List<Uloga> fetch(Uloga uloga, String[] excludeProperty) {
		if(uloga == null) return null;
		return ulogaDAO.findByExample(uloga, excludeProperty);
	}

	public Uloga save(Uloga uloga) {
		HibernateUtil.beginTransaction();
		ulogaDAO.saveOrUpdate(uloga);
		HibernateUtil.commitTransation();
		return uloga;
	}

	public void delete(Uloga uloga) {
		HibernateUtil.beginTransaction();
		ulogaDAO.deleteEntity(uloga);
		HibernateUtil.commitTransation();
	}

	public DataPage<Uloga> getPagedData(Uloga search, int startRow, int maxResult){
		return null;
	}
}

