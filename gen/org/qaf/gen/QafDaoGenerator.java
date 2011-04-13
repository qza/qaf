package org.qaf.gen;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.StringTokenizer;
import org.apache.velocity.VelocityContext;

/*
 * Qaf DAO generator generise paket sa DAO interfejsima, DAO implementacijama, DAOFactory i
 * HibernateDAOImplementation klasama. Generator je moguce pokrenuti za sve mapirane entitete
 * u fajlu hibernate.cfg.xml.
 *
 * Pokrece se putem izmene main metode ili putem web interfejsa (WEB-INF/pages/dao_generator.jspx).
 * Pokretanje putem web interfejsa zahteva da se sadrzaj sa putanje TEMPLATE_FOLDER, odnosno:
 * org/qaf/gen/templates/ kopira u odnosu na root servera, npr na putanju: /var/www/
 */

public class QafDaoGenerator extends BaseGenerator{

	public static final String TEMPLATE_EntityDAO = "EntityDAO.vm";
	public static final String TEMPLATE_EntityDAOImpl = "EntityDAOImpl.vm";
	public static final String TEMPLATE_DAOFactory = "DAOFactory.vm";
	public static final String TEMPLATE_HibernateDAOFactory = "HibernateDAOFactory.vm";

	public QafDaoGenerator() {
	}

	protected String buildTargetFolder(String packageName){
		String targetFolder = null;
		String userDir = System.getProperty("user.dir") + SLASH + getSourceFolder();
		String projectLocation = getProjectLocation();
		if (projectLocation != null && !projectLocation.equals(""))
			targetFolder = projectLocation + SLASH + getSourceFolder();
		else
			targetFolder = userDir;
		StringTokenizer tknzr = new StringTokenizer(
				getDaoPackage(), ".");
		while (tknzr.hasMoreTokens()) {
			targetFolder = targetFolder + SLASH + tknzr.nextToken();
		}
		return targetFolder;
	}

	public boolean generisi() {
		try {
			String targetFolder = null;
			Iterator<String> it = getSelectedEntities().iterator();
			while (it.hasNext()) {
				String entityClassName = it.next();
				Class entityClass = Class.forName(entityClassName);
				String dao = entityClass.getSimpleName();
				String entityPackage = entityClass.getPackage().getName();
				if (targetFolder == null)
					targetFolder = buildTargetFolder(entityPackage);
				generisiEntityDAO(targetFolder, dao, entityPackage);
				generisiEntityDAOImpl(targetFolder, dao, entityPackage);
			}
			generisiDAOFactory(targetFolder);
			generisiHibernateDAOFactory(targetFolder);
			return true;
		} catch (Exception ex) {
			ex.printStackTrace();
		}
		return false;
	}

	private void generisiEntityDAO(String targetFolder, String dao,
			String entityPackage) throws Exception {
		String path = targetFolder + SLASH + dao + "DAO.java";
		String templateFile = getTemplatePath(TEMPLATE_EntityDAO);
		VelocityContext context = new VelocityContext();
		context.put("dao", dao);
		context.put("daoPackage", getDaoPackage());
		context.put("entityPackage", entityPackage);
		generisiCommmon(path, templateFile, context);
	}

	private void generisiEntityDAOImpl(String targetFolder, String dao,
			String entityPackage) throws Exception {
		String path = targetFolder + SLASH + dao + "DAOImpl.java";
		String templateFile = getTemplatePath(TEMPLATE_EntityDAOImpl);
		VelocityContext context = new VelocityContext();
		context.put("dao", dao);
		context.put("daoPackage", getDaoPackage());
		context.put("entityPackage", entityPackage);
		generisiCommmon(path, templateFile, context);
	}

	private void generisiDAOFactory(String targetFolder) throws Exception {
		String path = targetFolder + SLASH + "DAOFactory.java";
		String templateFile = getTemplatePath(TEMPLATE_DAOFactory);
		VelocityContext context = new VelocityContext();
		fillShortNames();
		context.put("daoList", getSelectedEntitiesShort());
		context.put("daoPackage", getDaoPackage());
		generisiCommmon(path, templateFile, context);
	}

	private void generisiHibernateDAOFactory(String targetFolder)
			throws Exception {
		String path = targetFolder + SLASH + "HibernateDAOFactory.java";
		String templateFile = getTemplatePath(TEMPLATE_HibernateDAOFactory);
		VelocityContext context = new VelocityContext();
		fillShortNames();
		context.put("daoList", getSelectedEntitiesShort());
		context.put("daoPackage", getDaoPackage());
		generisiCommmon(path, templateFile, context);
	}

	/*
	 * Primer upotrebe
	 */
	public static void main(String args[]) throws Exception {
		QafDaoGenerator generator = new QafDaoGenerator();
		List<String> entities = new ArrayList<String>();
		entities.add("org.qaf.security.model.Korisnik");
		entities.add("org.qaf.security.model.Uloga");
		entities.add("org.qaf.security.model.KorisnikUloga");
		entities.add("org.qaf.security.model.Opiduser");
		generator.setSelectedEntities(entities);
		generator.setDaoPackage("org.qaf.security.model.dao");
		generator.setSourceFolder("security");
		generator.generisi();
	}

}
