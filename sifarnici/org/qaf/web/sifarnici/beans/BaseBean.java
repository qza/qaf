/**
 *
 */
package org.qaf.web.sifarnici.beans;

import javax.faces.event.ActionEvent;
import javax.faces.model.SelectItem;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.qaf.sifarnici.business.ManagerFactory;
import org.qaf.sifarnici.business.ManagerFactoryImpl;
import org.qaf.sifarnici.business.PacijentManager;

import com.icesoft.faces.component.ext.HtmlInputText;

/**
 * @author Qza
 *
 */
public abstract class BaseBean {

	protected ManagerFactory factory = ManagerFactoryImpl.getInstance();
	protected PacijentManager pacijentManager = factory.getPacijentManager();

	private boolean renderedPopup;

	private HtmlInputText inputSearchText;

	public HtmlInputText getInputSearchText() {
		return inputSearchText;
	}

	public void setInputSearchText(HtmlInputText inputSearchText) {
		this.inputSearchText = inputSearchText;
	}

	public boolean isRenderedPopup() {
		return renderedPopup;
	}

	public void setRenderedPopup(boolean renderedPopup) {
		this.renderedPopup = renderedPopup;
	}

	public void zatvoriPopup(ActionEvent event){
		this.setRenderedPopup(false);
	}

	//za pretragu entiteta
	protected String searchText;

	protected boolean hasData = true;

	public boolean isHasData() {
		return hasData;
	}

	public void setHasData(boolean hasData) {
		this.hasData = hasData;
	}

	public String getSearchText() {
		return searchText;
	}

	public void setSearchText(String searchText) {
		this.searchText = searchText;
	}

	protected static Log log = LogFactory.getLog(BaseBean.class);

}
