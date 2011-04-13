/**
 *
 */
package org.qaf.sifarnici.business;

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
import org.qaf.sifarnici.model.Pacijent;
import org.qaf.waf.pagin.DataPage;



/**
 * @author Qza
 *
 */
public class PacijentManagerImpl extends BaseManagerImpl implements PacijentManager {

	public List<Pacijent> dajSvePacijente() {
		return pacijentDao.fetchAll();
	}

	public void obrisi(Pacijent pacijent) {
		HibernateUtil.beginTransaction();
		pacijentDao.deleteEntity(pacijent);
		HibernateUtil.commitTransation();
	}

	public Pacijent sacuvaj(Pacijent pacijent) {
		HibernateUtil.beginTransaction();
		pacijentDao.saveOrUpdate(pacijent);
		HibernateUtil.commitTransation();
		return pacijent;
	}

	public Pacijent dajPacijenta(Integer id) {
		if(id == null) return null;
		return pacijentDao.fetch(id);
	}

	public List<Pacijent> trazi(String searchText, boolean strict) {
		if(searchText == null || searchText.length()==0){
			return dajSvePacijente();
		}
		searchText = searchText.trim();
		Pacijent d = new Pacijent();
		Criteria c = HibernateUtil.currentSession().createCriteria(Pacijent.class);
		return c.list();
	}

	public Pacijent dajPacijenta(String ime, String prezime) {
		if(ime == null && prezime == null){
			return null;
		}
		Session s = HibernateUtil.currentSession();
		Criteria criteria = s.createCriteria(Pacijent.class);
		criteria.add(Restrictions.and(Restrictions.like("ime", ime, MatchMode.EXACT), Restrictions.like("prezime", prezime, MatchMode.EXACT)));
		List<Pacijent> result = criteria.list();
		if(result == null || result.size() == 0) return null;
		return result.get(0);
	}

	public DataPage<Pacijent> traziPagedData(Pacijent search, int startRow, int maxResult) {
		Criteria criteria = buildCriteria(search);
		String countQuery = "select count(*) from qaf.pacijent";
		BigInteger count = (BigInteger) HibernateUtil.currentSession()
								  .createSQLQuery(countQuery).uniqueResult();
		criteria.setMaxResults(maxResult);
		criteria.setFirstResult(startRow);
		return new DataPage<Pacijent>(count.intValue(), startRow, criteria.list());
	}

	private Criteria buildCriteria(Pacijent d){
		if(d==null) d = new Pacijent();
		Criteria criteria = HibernateUtil.currentSession().createCriteria(Pacijent.class);
		if(StringUtils.isEmpty(d.getIme())) d.setIme(null);
		if(StringUtils.isEmpty(d.getPrezime())) d.setPrezime(null);
		criteria.add(Example.create(d).enableLike(MatchMode.START));
		criteria.addOrder(Order.asc("ime"));	return criteria;
	}

}
