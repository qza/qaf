package org.qaf.waf.content.model.dao;

import java.util.List;

import org.hibernate.Criteria;
import org.hibernate.criterion.Restrictions;
import org.qaf.common.model.dao.GenericDAOImpl;
import org.qaf.waf.content.model.ModulAplikacija;


public class ModulAplikacijaDAOImpl extends GenericDAOImpl<ModulAplikacija, Integer> implements ModulAplikacijaDAO{

	@SuppressWarnings("unchecked")
	public List<ModulAplikacija> findByModule(Integer moduleId){
		Criteria criteria = getSession().createCriteria(ModulAplikacija.class);
		criteria.add(Restrictions.eq("modulId", moduleId));
		criteria.add(Restrictions.eq("vazeci", Short.valueOf("1")));
		List<ModulAplikacija> list = criteria.list();
		return list;
	}
}
