package org.qaf.waf.content;

public class NavigationBean {

    // selected page content bean.
    private PageContentBean selectedPanel;

    private PageContentBean previousPanel;

    /**
     * Gets the currently selected content panel.
     *
     * @return currently selected content panel.
     */
    public PageContentBean getSelectedPanel() {
        return selectedPanel;
    }

    /**
     * Sets the selected panel to the specified panel.
     *
     * @param selectedPanel a none null page content bean.
     */
    public void setSelectedPanel(PageContentBean selectedPanel) {
        if (selectedPanel != null && selectedPanel.isPageContent()) {
        	this.previousPanel = this.selectedPanel;
            this.selectedPanel = selectedPanel;
        }
    }

    public void back(){
    	this.selectedPanel = this.previousPanel;
    }

}
