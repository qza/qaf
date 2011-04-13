package org.qaf.waf.pagin;

public abstract class SortedFilteredPagedListDataModel<T> extends
		PagedListDataModel<T> {

	protected T search;

	protected String searchText;

	protected String sortProperty = "";

	protected boolean ascending = true;

	public SortedFilteredPagedListDataModel(int pageSize, T search) {
		super(pageSize);
		this.search = search;
	}

	public SortedFilteredPagedListDataModel(int pageSize, String searchText,
			String sortProperty, boolean ascending) {
		super(pageSize);
		this.sortProperty = sortProperty;
		this.ascending = ascending;
		this.setSearchText(searchText);
	}

	public SortedFilteredPagedListDataModel(int pageSize, String sortProperty,
			boolean ascending) {
		super(pageSize);
		this.sortProperty = sortProperty;
		this.ascending = ascending;
	}

	public T getSearch() {
		return search;
	}

	public void setSearchText(String searchText) {
		this.searchText = searchText;
	}

	public String getSearchText() {
		return searchText;
	}

	public void setSortProperty(String sortProperty) {
		this.sortProperty = sortProperty;
	}

	public String getSortProperty() {
		return sortProperty;
	}

	public void setAscending(boolean ascending) {
		this.ascending = ascending;
	}

	public boolean isAscending() {
		return ascending;
	}

}
