package org.qaf.waf.pagin;

import java.math.BigInteger;

import org.hibernate.Criteria;
import org.hibernate.criterion.Example;
import org.hibernate.criterion.MatchMode;
import org.qaf.common.model.BaseEntity;
import org.qaf.common.model.HibernateUtil;


public class GenericPLDM extends PagedListDataModel<BaseEntity> {

	private BaseEntity searchEntity;
	private String entityName;
	private Class<?> entityClass;

	public static int fetchCallsCount = 0;

	public static final String DEFAULT_SCHEMA = "qaf";

	public GenericPLDM(String className, int pageSize) {
		super(pageSize);
		this.entityName = className;
		try {
			this.entityClass = Class.forName(className);
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
		}
	}

	public GenericPLDM(boolean reset){
		super(5);
		//if(reset) this.search = new Pacijent();
	}

	public GenericPLDM(boolean reset, int pageSize){
		super(pageSize);
		//if(reset) this.search = new Pacijent();
	}

	@SuppressWarnings("unchecked")
	@Override
	public DataPage<BaseEntity> fetchPage(int startRow, int maxResult) {
		System.out.println(++fetchCallsCount + "FETCH CALL (start=" + startRow+ ", maxresult" + maxResult +" \n\n");
		Object newInstance = null;
		try {
			newInstance = entityClass.newInstance();
		} catch (InstantiationException e) {
			e.printStackTrace();
		} catch (IllegalAccessException e) {
			e.printStackTrace();
		}
		String tableName = HibernateUtil.getTableName(entityName);
		String tableSchema = HibernateUtil.getTableSchema(entityName);
		if(tableSchema==null) tableSchema = DEFAULT_SCHEMA;
		Criteria criteria = HibernateUtil.currentSession().createCriteria(entityClass);
		if(newInstance!=null)
			criteria.add(Example.create(newInstance).enableLike(MatchMode.START));
		String countQuery = "select count(*) from " + tableSchema + "." + tableName;
		BigInteger count = (BigInteger) HibernateUtil.currentSession()
							.createSQLQuery(countQuery).uniqueResult();
		criteria.setMaxResults(maxResult);
		criteria.setFirstResult(startRow);
		return new DataPage<BaseEntity>(count.intValue(), startRow, criteria.list());
	}


}



