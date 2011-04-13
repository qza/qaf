package org.qaf.waf.navigation;

import javax.faces.application.NavigationHandler;
import javax.faces.component.UIViewRoot;
import javax.faces.context.FacesContext;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.qaf.waf.util.JSFHelper;


public class QafNavigationHandler extends NavigationHandler {

	protected static final Log log = LogFactory.getLog(QafNavigationHandler.class);

	protected NavigationHandler baseHandler;

	public QafNavigationHandler(NavigationHandler baseHandler) {
		super();
		this.baseHandler = baseHandler;
	}

	public void handleNavigation(FacesContext facesContext, String actionMethod,
								 String actionName) {
		log.info("Handling navigation.... Method: " + actionMethod + "	Name: " + actionName);
		UIViewRoot viewRoot = FacesContext.getCurrentInstance().getViewRoot();
		String viewId = viewRoot.getViewId();
		NavigationDataHolder navigationalDataHolder =
			(NavigationDataHolder) JSFHelper.getManagedBean("#{NavigationSessionHolder}");
		if(navigationalDataHolder!=null){
			if (actionName!=null && actionName.indexOf("@backToPrev@") > -1) {
				log.info("Navigating to previous page....");
				navigateToPreviousPage(facesContext, viewRoot, navigationalDataHolder);
			} else {
				log.info("Navigating to next page....");
				navigationalDataHolder.recordNavigation(actionMethod, actionName, viewId);
				baseHandler.handleNavigation(facesContext, actionMethod, actionName);
			}
		}
	}

	private void navigateToPreviousPage(FacesContext facesContext,
			UIViewRoot viewRoot, NavigationDataHolder navigationalDataHolder) {
		NavigationData navigationData = navigationalDataHolder
				.getLastRecordedNavigationData();
		viewRoot.setViewId(navigationData.getViewId());
		baseHandler.handleNavigation(facesContext, navigationData
				.getActionMethodName(), navigationData.getActionName());
	}

}