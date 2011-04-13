package org.qaf.gen;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import javax.faces.application.FacesMessage;
import javax.faces.context.FacesContext;
import javax.faces.event.ActionEvent;
import javax.faces.event.ValueChangeEvent;
import javax.faces.model.SelectItem;

import org.qaf.common.model.HibernateUtil;


public class QafDaoGeneratorBean extends QafDaoGenerator {

	public QafDaoGeneratorBean() {
	}

	public void izmena(ValueChangeEvent event) {
		System.out.println("Selektovan: " + event.getNewValue());
		if (event != null && event.getNewValue() != null) {
		}
	}

	public SelectItem[] getEntitiesItems() {
		setEntities(HibernateUtil.getMappings(false));
		Iterator<String> it = getEntities().iterator();
		List<SelectItem> itemsList = new ArrayList<SelectItem>();
		while (it.hasNext()) {
			SelectItem item = new SelectItem(it.next());
			itemsList.add(item);
		}
		return itemsList.toArray(new SelectItem[itemsList.size()]);
	}

	public void generisiAction(ActionEvent event) {
		boolean success = generisi();
		int izabranoEntiteta = getSelectedEntities().size();
		int kreiranoObjekata = izabranoEntiteta * 2 + 2;
		FacesContext context = FacesContext.getCurrentInstance();
		FacesMessage message = new FacesMessage();
		if (success) {
			message.setSeverity(FacesMessage.SEVERITY_INFO);
			message.setSummary("Uspesno je kreirano " + kreiranoObjekata
					+ " klasa u paketu " + getDaoPackage());
		} else {
			message.setSeverity(FacesMessage.SEVERITY_ERROR);
			message.setSummary("Doslo je do greske prilikom generisanja klasa!");
		}
		context.addMessage("daoGeneratorForm", message);
	}

}
