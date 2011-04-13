/**
 *
 */
package org.qaf.common.model;

/**
 * @author Qza
 *
 */
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.StringTokenizer;

import org.hibernate.HibernateException;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.cfg.AnnotationConfiguration;
import org.hibernate.mapping.Column;
import org.hibernate.mapping.PersistentClass;
import org.hibernate.mapping.RootClass;
import org.hibernate.metadata.ClassMetadata;
import org.hibernate.type.Type;

public class HibernateUtil {

	private static AnnotationConfiguration ancon;

	public static String configFile = "hibernate.cfg.xml";

	public static final SessionFactory sessionFactory;

	static {
		try {
			ancon = new AnnotationConfiguration();
			sessionFactory = configFile != null ? ancon.configure(configFile)
					.buildSessionFactory() : ancon.configure()
					.buildSessionFactory();

		} catch (Throwable ex) {
			System.err.println("Initial SessionFactory creation failed." + ex);
			throw new ExceptionInInitializerError(ex);
		}
	}

	private static final ThreadLocal<Session> session = new ThreadLocal<Session>();

	public static Session currentSession() throws HibernateException {
		Session s = (Session) session.get();
		if (s == null || !s.isOpen()) {
			s = sessionFactory.openSession();
			session.set(s);
		}
		return s;
	}

	public static void closeSession() throws HibernateException {
		Session s = (Session) session.get();
		if (s != null){
			s.close();
		}
		session.set(null);
	}

	private static final ThreadLocal<Transaction> transaction = new ThreadLocal<Transaction>();

	public static void beginTransaction() {
		transaction.set(currentSession().beginTransaction());
	}

	public static ClassMetadata getMetadata(Class entityClass) {
		return sessionFactory.getClassMetadata(entityClass);
	}

	public static void commitTransation() {
		Transaction t = transaction.get();
		if (t != null)
			t.commit();
		transaction.remove();
	}

	public static Transaction getCurrentTransaction() {
		Transaction t = transaction.get();
		if (t == null) {
			beginTransaction();
			t = transaction.get();
		}
		return t;
	}

	@SuppressWarnings("unchecked")
	public static List<String> getMappings(boolean simpleName) {
		List<String> maps = new ArrayList<String>();
		Iterator<RootClass> it = ancon.getClassMappings();
		while (it.hasNext()) {
			RootClass cls = it.next();
			if (simpleName)
				maps.add(cls.getNodeName());
			else
				maps.add(cls.getClassName());
		}
		return maps;
	}

	public static String getTableName(String entityName) {
		PersistentClass pClass = ancon.getClassMapping(entityName);
		return pClass.getRootTable().getName();
	}

	public static String getTableSchema(String entityName) {
		PersistentClass pClass = ancon.getClassMapping(entityName);
		return pClass.getRootTable().getSchema();
	}

	public static String[] getProperties(Class entityClass) {
		ClassMetadata entityMeta = getMetadata(entityClass);
		String[] propsNames = entityMeta.getPropertyNames();
		for (int i = 0; i < propsNames.length; i++) {
			System.out.println(propsNames[i]);
		}
		return propsNames;
	}

	@SuppressWarnings("unchecked")
	public static List<Column> getColumns(String entityClass, String[] to_exclude) {
		List<Column> returnColumns = new ArrayList();
		ArrayList<String> to_exclude_list = new ArrayList<String>(Arrays.asList(to_exclude));
		PersistentClass pClass = ancon.getClassMapping(entityClass);
		Iterator<Column> columnIt = pClass.getRootTable().getColumnIterator();
		while (columnIt.hasNext()) {
			Column col = columnIt.next();
			String colName = col.getName();
			if (!to_exclude_list.contains(colName))
				returnColumns.add(col);
		}
		return returnColumns;
	}

	@SuppressWarnings("unchecked")
	public static String[] getColumns(String entityClass,
			boolean convertToHibernateProperyNames, String[] to_exclude) {
		ArrayList<String> to_exclude_list = new ArrayList<String>(Arrays.asList(to_exclude));
		ArrayList<String> attrs = new ArrayList<String>();
		PersistentClass pClass = ancon.getClassMapping(entityClass);
		Iterator<Column> columnIt = pClass.getRootTable().getColumnIterator();
		while (columnIt.hasNext()) {
			Column col = columnIt.next();
			String colName = col.getName();
			if (!to_exclude_list.contains(colName)) {
				if (convertToHibernateProperyNames)
					attrs.add(convertToHibernatePropertyName(colName));
				else
					attrs.add(colName);
			}

		}
		return attrs.toArray(new String[attrs.size()]);
	}

	public static String getPropertyType(Class entityClass, String propName) {
		ClassMetadata entityMeta = getMetadata(entityClass);
		Type type = entityMeta.getPropertyType(propName);
		return type.getName();
	}

	public static String convertToHibernatePropertyName(String columnName) {
		StringTokenizer tokenizer = new StringTokenizer(columnName, "_");
		StringBuffer buffer = new StringBuffer();
		buffer.append(tokenizer.nextToken());
		while (tokenizer.hasMoreTokens()) {
			buffer.append(capitalize(tokenizer.nextToken()));
		}
		return buffer.toString();
	}

	public static String capitalize(String s) {
		if (s.length() == 0)
			return s;
		return s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase();
	}
}