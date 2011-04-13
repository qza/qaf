package org.qaf.security.manager;


import java.math.BigInteger;
import java.util.Iterator;
import java.util.List;

import org.apache.commons.lang.StringUtils;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Example;
import org.hibernate.criterion.MatchMode;
import org.hibernate.criterion.Order;
import org.qaf.common.model.HibernateUtil;
import org.qaf.security.model.Korisnik;
import org.qaf.waf.pagin.DataPage;

/**
 * @author Qza
 *
 */
public class KorisnikManagerImpl extends BaseManagerImpl implements KorisnikManager {

	public List<Korisnik> fetchAll() {
		return korisnikDAO.fetchAll();
	}

	public Korisnik fetch(Integer id) {
		if(id == null) return null;
		return korisnikDAO.fetch(id);
	}

	public List<Korisnik> fetch(Korisnik korisnik, String[] excludeProperty) {
		if(korisnik == null) return null;
		return korisnikDAO.findByExample(korisnik, excludeProperty);
	}

	public Korisnik save(Korisnik korisnik) {
		HibernateUtil.beginTransaction();
		korisnikDAO.saveOrUpdate(korisnik);
		HibernateUtil.commitTransation();
		return korisnik;
	}

	public void delete(Korisnik korisnik) {
		HibernateUtil.beginTransaction();
		korisnikDAO.deleteEntity(korisnik);
		HibernateUtil.commitTransation();
	}

	public void delete(List<Korisnik> korisnikList) {
		Iterator<Korisnik> it = korisnikList.iterator();
		HibernateUtil.beginTransaction();
		while(it.hasNext()){
			Korisnik korisnik = it.next();
			korisnikDAO.deleteEntity(korisnik);
		}
		HibernateUtil.commitTransation();
	}

	@SuppressWarnings("unchecked")
	public DataPage<Korisnik> getPagedData(Korisnik korisnik, String searchText,
										   int startRow, int maxResults,
										   String sortProperty, boolean ascending){
		List<Korisnik> sviKorisnici = null;
		if(searchText!=null){
			sviKorisnici = korisnikDAO.findByText(searchText, sortProperty, ascending);
			int size = sviKorisnici.size();
			return new DataPage<Korisnik>(size, startRow, sviKorisnici);
		} else {
			String countQuery = "select count(*) from admin.korisnik";
			BigInteger count = (BigInteger) HibernateUtil.currentSession()
									  .createSQLQuery(countQuery).uniqueResult();
			Criteria criteria = buildCriteria(korisnik, sortProperty, ascending);
			criteria.setMaxResults(maxResults);
			criteria.setFirstResult(startRow);
			sviKorisnici = criteria.list();
			return new DataPage<Korisnik>(count.intValue(), startRow, sviKorisnici);
		}
	}

	private Criteria buildCriteria(Korisnik korisnik, String sortProperty, boolean ascending){
		Session s = HibernateUtil.currentSession();
		Criteria criteria = s.createCriteria(Korisnik.class);
		if(korisnik!=null){
			if(StringUtils.isEmpty(korisnik.getKorisnickoIme())) korisnik.setKorisnickoIme(null);
			if(StringUtils.isEmpty(korisnik.getEmail())) korisnik.setEmail(null);
			criteria.add(Example.create(korisnik).enableLike(MatchMode.ANYWHERE));
		}
		if(sortProperty!=null && !sortProperty.equals("")){
			if(ascending)
				criteria.addOrder(Order.asc(sortProperty));
			else
				criteria.addOrder(Order.desc(sortProperty));
		}
		return criteria;
	}

}

