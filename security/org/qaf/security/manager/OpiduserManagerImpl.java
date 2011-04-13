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
import org.qaf.security.model.Opiduser;
import org.qaf.waf.pagin.DataPage;

/**
 * @author Qza
 *
 */
public class OpiduserManagerImpl extends BaseManagerImpl implements OpiduserManager {

	public List<Opiduser> fetchAll() {
		return opiduserDAO.fetchAll();
	}

	public Opiduser fetch(Integer id) {
		if(id == null) return null;
		return opiduserDAO.fetch(id);
	}

	public List<Opiduser> fetch(Opiduser opiduser, String[] excludeProperty) {
		if(opiduser == null) return null;
		return opiduserDAO.findByExample(opiduser, excludeProperty);
	}

	public Opiduser save(Opiduser opiduser) {
		HibernateUtil.beginTransaction();
		opiduserDAO.saveOrUpdate(opiduser);
		HibernateUtil.commitTransation();
		return opiduser;
	}

	public void delete(Opiduser opiduser) {
		HibernateUtil.beginTransaction();
		opiduserDAO.deleteEntity(opiduser);
		HibernateUtil.commitTransation();
	}

	public DataPage<Opiduser> getPagedData(Opiduser search, int startRow, int maxResult){
		return null;
	}
}

