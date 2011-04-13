package org.qaf.waf.navigation;

public class NavigationData {

	private String actionMethodName;

	private String actionName;

	private String viewId;

	private NavigationData() {
	}

	public NavigationData(String actionMethodName, String actionName,
			String viewId) {
		this.actionMethodName = actionMethodName;
		this.actionMethodName = actionName;
		this.viewId = viewId;

	}

	public String getActionMethodName() {
		return actionMethodName;
	}

	public String getActionName() {
		return actionName;
	}

	public String getViewId() {
		return viewId;
	}

}