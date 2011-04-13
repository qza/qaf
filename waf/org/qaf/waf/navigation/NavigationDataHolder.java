package org.qaf.waf.navigation;

import java.util.EmptyStackException;
import java.util.Stack;

public class NavigationDataHolder {

	private Stack<NavigationData> returnPageList = new Stack<NavigationData>();

	public void recordNavigation(String actionMethodName, String actionName, String viewId) {
		returnPageList.push(new NavigationData(actionMethodName, actionName,
				viewId));
	}

	public NavigationData getLastRecordedNavigationData() {
		NavigationData lastNavigationData = null;
		try {
			lastNavigationData = (NavigationData) returnPageList.pop();
		} catch (EmptyStackException emptyStackException) {
			// ok
		}
		return lastNavigationData;
	}

}