package org.qaf.waf.beans;

import java.util.ArrayList;
import java.util.List;

import javax.faces.event.ActionEvent;

import org.apache.commons.lang.ClassUtils;
import org.qaf.common.model.BaseEntity;
import org.qaf.waf.content.NavigationBean;
import org.qaf.waf.content.PageContentBean;
import org.qaf.waf.content.model.Modul;
import org.qaf.waf.pagin.PagedListDataModel;
import org.qaf.waf.popup.QafPopup;
import org.qaf.waf.util.JSFHelper;

import com.icesoft.faces.component.ext.HtmlDataTable;
import com.icesoft.faces.component.ext.HtmlInputText;
import com.icesoft.faces.component.ext.RowSelectorEvent;

public abstract class QafBaseBean<T> {

	public static int PAGE_SIZE = 10;

	protected boolean hasData = true;

	private HtmlInputText inputSearchText;

	private HtmlDataTable baseTable;

	protected String searchText;

	protected List<T> selection = new ArrayList<T>();

	protected PagedListDataModel<T> data;

	protected boolean ascending = true;

	private QafPopup activeModalPopup;

	private boolean renderedPopup;

	public abstract void initData();

	public static final String PRM_BYPASS_VALIDATION = "bypassValidation";

	public PagedListDataModel<T> getData() {
		if(data!=null) return data;
		else{
			initData();
			return data;
		}
	}

	public void osvezi(ActionEvent event) {
		initData();
		searchText = "";
		selection.clear();
		baseTable.setFirst(0);
	}

	public static NavigationBean getNavigationBean(){
		return (NavigationBean) JSFHelper.getManagedBean("navigation");
	}

	public void nazad(ActionEvent event) {
		getNavigationBean().back();
	}

	public void rowSelectionListener(RowSelectorEvent event) {
		selection.clear();
		List<T> current = getData().getPage().getData();
		for (int i = 0; i < current.size(); i++) {
			T k = (T) current.get(i);
			if (((BaseEntity) k).isSelected()) selection.add(k);
		}
	}

	protected PageContentBean createPanel(String title, String includeFilePath){
		PageContentBean bean = new PageContentBean();
		bean.setExpanded(false);
		bean.setMenuDisplayText(title);
		bean.setMenuContentTitle(title);
		bean.setMenuContentInclusionFile(includeFilePath);
		String moduleClass = ClassUtils.getShortClassName(Modul.class).toLowerCase();
		bean.setTemplateName(moduleClass + "Panel");
		bean.setNavigationSelection(getNavigationBean());
		bean.setPageContent(true);
		return bean;
	}

	public int getPageSize() {
		return PAGE_SIZE;
	}

	public void setPageSize(int pageSize) {
		PAGE_SIZE = pageSize;
	}

	public void setSelection(ArrayList<T> selection) {
		this.selection = selection;
	}

	public List<T> getSelection() {
		return selection;
	}

	public HtmlInputText getInputSearchText() {
		return inputSearchText;
	}

	public void setInputSearchText(HtmlInputText inputSearchText) {
		this.inputSearchText = inputSearchText;
	}

	public void setActiveModalPopup(QafPopup activeModalPopup) {
		this.activeModalPopup = activeModalPopup;
		setRenderedPopup(true);
	}

	public QafPopup getActiveModalPopup() {
		return activeModalPopup;
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


	public void setBaseTable(HtmlDataTable baseTable) {
		this.baseTable = baseTable;
	}

	public HtmlDataTable getBaseTable() {
		return baseTable;
	}

}
