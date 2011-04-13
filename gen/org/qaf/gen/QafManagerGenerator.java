package org.qaf.gen;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.StringTokenizer;

import org.apache.velocity.VelocityContext;

public class QafManagerGenerator extends BaseGenerator {

	public static final String TEMPLATE_EntityManager = "EntityManager.vm";
	public static final String TEMPLATE_EntityManagerImpl = "EntityManagerImpl.vm";
	public static final String TEMPLATE_ManagerFactory = "ManagerFactory.vm";
	public static final String TEMPLATE_ManagerFactoryImpl = "ManagerFactoryImpl.vm";
	public static final String TEMPLATE_BaseManagerImpl = "BaseManagerImpl.vm";
	public static final String TEMPLATE_EntityPagedData = "EntityPagedData.vm";

	private String supportPackage = "";

	public void setSupportPackage(String supportPackage) {
		this.supportPackage = supportPackage;
	}

	public String getSupportPackage() {
		return supportPackage;
	}

	public QafManagerGenerator() {
	}

	protected String buildTargetFolder(String packageName, boolean manager) {
		String targetFolder = null;
		String userDir = System.getProperty("user.dir") + SLASH + getSourceFolder();
		String projectLocation = getProjectLocation();
		if (projectLocation != null && !projectLocation.equals(""))
			targetFolder = projectLocation + SLASH + getSourceFolder();
		else
			targetFolder = userDir;

		StringTokenizer tknzr = null;
		if(manager)
			tknzr = new StringTokenizer(getManagerPackage(), ".");
		else
			tknzr = new StringTokenizer(getSupportPackage(), ".");
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
				String entity = entityClass.getSimpleName();
				String entityPackage = entityClass.getPackage().getName();
				if (targetFolder == null)
					targetFolder = buildTargetFolder(entityPackage, true);
				generisiEntityManager(targetFolder, entity, entityPackage);
				generisiEntityManagerImpl(targetFolder, entity, entityPackage);
				generisiEntityPagedData(targetFolder, entity, entityPackage);
			}
			generisiManagerFactory(targetFolder);
			generisiBaseManagerImpl(targetFolder);
			generisiManagerFactoryImpl(targetFolder);
			return true;
		} catch (Exception ex) {
			ex.printStackTrace();
		}
		return false;
	}

	private void generisiEntityManager(String targetFolder, String entity,
			String entityPackage) throws Exception {
		String path = targetFolder + SLASH + entity + "Manager.java";
		String templateFile = getTemplatePath(TEMPLATE_EntityManager);
		VelocityContext context = new VelocityContext();
		context.put("entity", entity);
		context.put("managerPackage", getManagerPackage());
		context.put("entityPackage", entityPackage);
		generisiCommmon(path, templateFile, context);
	}

	private void generisiEntityManagerImpl(String targetFolder, String entity,
			String entityPackage) throws Exception {
		String path = targetFolder + SLASH + entity + "ManagerImpl.java";
		String templateFile = getTemplatePath(TEMPLATE_EntityManagerImpl);
		VelocityContext context = new VelocityContext();
		context.put("entity", entity);
		context.put("managerPackage", getManagerPackage());
		context.put("entityPackage", entityPackage);
		generisiCommmon(path, templateFile, context);
	}

	private void generisiManagerFactory(String targetFolder) throws Exception {
		String path = targetFolder + SLASH + "ManagerFactory.java";
		String templateFile = getTemplatePath(TEMPLATE_ManagerFactory);
		VelocityContext context = new VelocityContext();
		fillShortNames();
		context.put("entityList", getSelectedEntitiesShort());
		context.put("managerPackage", getManagerPackage());
		generisiCommmon(path, templateFile, context);
	}

	private void generisiBaseManagerImpl(String targetFolder) throws Exception {
		String path = targetFolder + SLASH + "BaseManagerImpl.java";
		String templateFile = getTemplatePath(TEMPLATE_BaseManagerImpl);
		VelocityContext context = new VelocityContext();
		fillShortNames();
		context.put("entityList", getSelectedEntitiesShort());
		context.put("daoPackage", getDaoPackage());
		context.put("managerPackage", getManagerPackage());
		generisiCommmon(path, templateFile, context);
	}

	private void generisiManagerFactoryImpl(String targetFolder) throws Exception {
		String path = targetFolder + SLASH + "ManagerFactoryImpl.java";
		String templateFile = getTemplatePath(TEMPLATE_ManagerFactoryImpl);
		VelocityContext context = new VelocityContext();
		fillShortNames();
		context.put("entityList", getSelectedEntitiesShort());
		context.put("managerPackage", getManagerPackage());
		generisiCommmon(path, templateFile, context);
	}

	private void generisiEntityPagedData(String targetFolder, String entity,
							String entityPackage) throws Exception {
		String myTarget = buildTargetFolder(supportPackage, false);
		String path = myTarget + SLASH + entity + "PagedData.java";
		String templateFile = getTemplatePath(TEMPLATE_EntityPagedData);
		VelocityContext context = new VelocityContext();
		context.put("entity", entity);
		context.put("supportPackage", supportPackage);
		context.put("entityPackage", entityPackage);
		context.put("managerPackage", getManagerPackage());
		generisiCommmon(path, templateFile, context);
	}

	/*
	 * Primer upotrebe
	 */
	public static void main(String args[]) throws Exception {
		QafManagerGenerator generator = new QafManagerGenerator();
		List<String> entities = new ArrayList<String>();
		entities.add("org.qaf.security.model.Korisnik");
		entities.add("org.qaf.security.model.Uloga");
		entities.add("org.qaf.security.model.KorisnikUloga");
		entities.add("org.qaf.security.model.Opiduser");
		generator.setSelectedEntities(entities);
		generator.setDaoPackage("org.qaf.security.dao");
		generator.setManagerPackage("org.qaf.security.manager");
		generator.setSupportPackage("org.qaf.security.support");
		generator.setSourceFolder("security");
		generator.generisi();
	}

}
