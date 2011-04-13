package org.qaf.common.model.dao;

import java.io.Serializable;
import java.util.Iterator;
import java.util.List;

import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Criterion;
import org.hibernate.criterion.Disjunction;
import org.hibernate.criterion.Example;
import org.hibernate.criterion.MatchMode;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Restrictions;
import org.hibernate.mapping.Column;
import org.qaf.common.model.HibernateUtil;


import java.lang.reflect.ParameterizedType;

public class GenericDAOImpl<T, ID extends Serializable> implements GenericDAO<T, ID> {

	protected Class<T> persistentClass = (Class<T>) ((ParameterizedType) getClass()
										.getGenericSuperclass()).getActualTypeArguments()[0];

	protected String tableName = HibernateUtil.getTableName(persistentClass.getName());

	protected String schemaName = HibernateUtil.getTableSchema(persistentClass.getName());

	protected String[] excludeDefault =
				new String[]{"id", "uneo", "izmenio", "datum_unosa", "datum_izmene"};

	protected Session getSession() {
		return HibernateUtil.currentSession();
	}

	public T saveOrUpdate(T object) {
		if (!persistentClass.isInstance(object))
			throw new IllegalArgumentException(
					"Object class does not match dao type.");
		getSession().saveOrUpdate(object);
		return object;
	}

	public boolean deleteById(ID id) {
		if (id != null) {
			Object entity = getSession().get(persistentClass, id);
			if (entity != null) {
				getSession().delete(entity);
				return true;
			}
		}
		return false;
	}

	public boolean deleteEntity(T entity) {
		if (entity != null) {
			getSession().delete(entity);
			return true;
		}
		return false;
	}

	@SuppressWarnings("unchecked")
	public T fetch(ID id) {
		T entity;
		entity = (T) getSession().get(persistentClass, id);
		return entity;
	}

	@SuppressWarnings("unchecked")
	public List<T> fetchAll() {
		List list = getSession().createCriteria(persistentClass)
					.setResultTransformer(Criteria.DISTINCT_ROOT_ENTITY).list();
		return list;
	}

	@SuppressWarnings("unchecked")
    public List<T> findByExample(T exampleInstance, String[] excludeProperty) {
		String[] exclude = (excludeProperty!=null)? excludeProperty : excludeDefault;
        Criteria crit = getSession().createCriteria(persistentClass);
        Example example =  Example.create(exampleInstance);
        example.enableLike();
        example.ignoreCase();
        for (String ex : exclude) {
            example.excludeProperty(ex);
        }
        crit.add(example);
        return crit.list();
    }

	@SuppressWarnings("unchecked")
	public List<T> findByText(String searchText, String sortProp, boolean ascending){
		List<Column> cols = HibernateUtil.
							getColumns(persistentClass.getName(), excludeDefault);
		Iterator<Column> it = cols.iterator();
		Criteria crit = getSession().createCriteria(persistentClass);
		Disjunction disjunction = Restrictions.disjunction();
        while(it.hasNext()){
        	Column col = it.next();
        	String colName = col.getName();
        	String propName = HibernateUtil.convertToHibernatePropertyName(colName);
        	String type = HibernateUtil.getPropertyType(persistentClass, propName);
        	if(type!=null){
	        	if(type.equals("integer") || type.equals("smallint")){
	        		try{
	        			Integer.valueOf(searchText);
	        			Criterion criterium = Restrictions
	        						.eq(propName, Integer.valueOf(searchText));
	        			disjunction.add(criterium);
	        		} catch(NumberFormatException ex) {
	        		}
	        	}
	        	else
	        	if(type.equals("string")){
	        		Criterion criterium = Restrictions.ilike(propName, searchText, MatchMode.ANYWHERE);
	        		disjunction.add(criterium);
	        	}
	        	/*else
		        	if(type.equals("timestamp")){
		        		Disjunction dis = Restrictions.disjunction();
	        			SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
	        			try {
							dis.add(Restrictions.eq(propName, format.parse(searchText)));
						} catch (ParseException e) {
						}
						try{
		        			Integer.valueOf(searchText);
		        			dis.add(Restrictions.sqlRestriction(
		        					"YEAR(DATE("+colName+"))="+searchText+ " OR " +
					        		"MONTH(DATE("+colName+"))="+searchText+ " OR " +
					        		"DAY(DATE("+colName+"))="+searchText));
		        		} catch(NumberFormatException ex) {
		        		}
		        		disjunction.add(dis);
		        	}*/
        	}
        }
        crit.add(disjunction);
        if(sortProp!=null && !sortProp.equals("")){
			if(ascending)
				crit.addOrder(Order.asc(sortProp));
			else
				crit.addOrder(Order.desc(sortProp));
        }

		return crit.list();
	}

	@SuppressWarnings("unchecked")
    public List<T> findByText2(String searchText, String sortColumn, boolean ascending) {
        List<Column> cols = HibernateUtil.
        					getColumns(persistentClass.getName(), excludeDefault);
        String query = "select * from "+schemaName+"."+tableName+" where ";
        Iterator<Column> it = cols.iterator();
        while(it.hasNext()){
        	Column col = it.next();
        	String colName = col.getName();
        	String propName = HibernateUtil.convertToHibernatePropertyName(colName);
        	String type = HibernateUtil.getPropertyType(persistentClass, propName);
        	String condition = null;
        	if(type!=null){
	        	if(type.equals("integer") || type.equals("smallint")){
	        		try{
	        			Integer.valueOf(searchText);
	        			condition = colName + "=" + searchText;
	        		} catch(NumberFormatException ex) {
	        		}
	        	} else
	        	if(type.equals("timestamp")){
	        		try{
	        			Integer.valueOf(searchText);
	        			condition = "( YEAR(" + colName + ") = " + searchText +
	        						"  OR " +
	        						"  MONTH(" + colName + ") = " + searchText +
	        						"  OR " +
	        						"  DAY(" + colName + ") = " + searchText + ")";
	        		} catch(NumberFormatException ex) {
	        		}
	        	}
	        	else
	        	if(type.equals("string") || type.equals("timestamp") || type.equals("date"))
	        		condition = colName + " ilike '%" + searchText + "%'";

	        	if(condition!=null)
	        		if(query.trim().endsWith("where"))
	        			query = query + condition;
	        		else
	        			query = query + " OR " + condition;
        	}
        	System.out.println("\n TYPE ZA KOLONU: " + colName + " JE: " + type + "\n");
        }
        if(sortColumn!=null && !sortColumn.equals("")){
			if(ascending)
				query = query + " order by " + sortColumn + " asc";
			else
				query = query + " order by " + sortColumn + " desc";
        }
        System.out.println("\n\n\n FINAL QUERY = " + query + " \n\n\n");
        return getSession().createSQLQuery(query).list();
   }

	@SuppressWarnings("unchecked")
    protected List<T> findByCriteria(Criterion... criterion) {
        Criteria crit = getSession().createCriteria(persistentClass);
        for (Criterion c : criterion) {
            crit.add(c);
        }
        return crit.list();
   }

}
