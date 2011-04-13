package org.qaf.gen;

import java.io.File;
import java.io.FileWriter;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.apache.velocity.VelocityContext;

public class BaseGenerator {

	public static final String SLASH = File.separator;

	public static final String TEMPLATE_FOLDER = "/gen/org/qaf/gen/templates/";

	private String projectLocation = "";
	
	private String sourceFolder = "";

	private String daoPackage = "";

	private String managerPackage = "";

	private List<String> entities;

	private List<String> selectedEntities = new ArrayList<String>();

	private List<String> selectedEntitiesShort = new ArrayList<String>();

	public BaseGenerator(){
	}

	protected void generisiCommmon(String path, String templateFile,
			VelocityContext context) throws Exception {
		File file = new File(path);
		FileWriter writer = new FileWriter(file);
		VelocityUtil.writeTemplate(templateFile, context, writer);
	}

	protected String getTemplatePath(String templateFile) {
		String templatePath = TEMPLATE_FOLDER + templateFile;
		return templatePath;
	}

	protected String getShortName(String entityClassName) throws Exception {
		Class entityClass = Class.forName(entityClassName);
		String dao = entityClass.getSimpleName();
		return dao;
	}

	protected void fillShortNames() throws Exception {
		if (getSelectedEntitiesShort().size() == 0) {
			Iterator<String> selectedEntitiesIt = getSelectedEntities().iterator();
			while (selectedEntitiesIt.hasNext()) {
				String shortName = getShortName(selectedEntitiesIt.next());
				getSelectedEntitiesShort().add(shortName);
			}
		}
	}

	public void setProjectLocation(String projectLocation) {
		this.projectLocation = projectLocation;
	}

	public String getProjectLocation() {
		return projectLocation;
	}

	public void setSourceFolder(String sourceFolder) {
		this.sourceFolder = sourceFolder;
	}

	public String getSourceFolder() {
		return sourceFolder;
	}

	public void setDaoPackage(String daoPackage) {
		this.daoPackage = daoPackage;
	}

	public String getDaoPackage() {
		return daoPackage;
	}

	public void setManagerPackage(String managerPackage) {
		this.managerPackage = managerPackage;
	}

	public String getManagerPackage() {
		return managerPackage;
	}

	public void setEntities(List<String> entities) {
		this.entities = entities;
	}

	public List<String> getEntities() {
		return this.entities;
	}

	public void setSelectedEntities(List<String> selectedEntities) {
		this.selectedEntities = selectedEntities;
	}

	public List<String> getSelectedEntities() {
		return selectedEntities;
	}

	public void setSelectedEntitiesShort(List<String> selectedEntitiesShort) {
		this.selectedEntitiesShort = selectedEntitiesShort;
	}

	public List<String> getSelectedEntitiesShort() {
		return selectedEntitiesShort;
	}

}
