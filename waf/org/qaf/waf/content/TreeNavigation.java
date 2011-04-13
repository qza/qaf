package org.qaf.waf.content;

import com.icesoft.faces.component.tree.Tree;

import javax.faces.context.FacesContext;
import javax.swing.tree.DefaultMutableTreeNode;
import javax.swing.tree.DefaultTreeModel;

import org.apache.commons.lang.ClassUtils;
import org.qaf.waf.content.model.Aplikacija;
import org.qaf.waf.content.model.Modul;
import org.qaf.waf.content.model.ModulAplikacija;
import org.qaf.waf.content.model.dao.DAOFactory;

import java.util.Iterator;
import java.util.List;
import java.util.Set;

/**
 * The TreeNavigation class is the backing bean for the navigation
 * tree on the left hand side of the application. Each node in the tree is made
 * up of a PageContent which is responsible for the navigation action when a
 * tree node is selected.
 *
 * When the Tree component binding takes place the tree nodes are initialized
 * and the tree is built.  Any addition to the tree navigation must be made to
 * this class.
 *
 */
public class TreeNavigation {

    // binding to component
    private Tree treeComponent;

    // bound to components value attribute
    private DefaultTreeModel model;

    // root node of tree, for delayed construction
    private DefaultMutableTreeNode rootTreeNode;

    // map of all navigation backing beans.
    private NavigationBean navigationBean;

    // initialization flag
    private boolean isInitiated;

    // folder icons for branch nodes
    private String themeBranchContractedIcon;
    private String themeBranchExpandedIcon;

    /**
     * Default constructor of the tree.  The root node of the tree is created at
     * this point.
     */
    public TreeNavigation() {
        // build root node so that children can be attached
        PageContentBean rootObject = new PageContentBean();
        rootObject.setMenuDisplayText("Medis");
        rootObject.setMenuContentTitle("Medis");
        rootObject.setMenuContentInclusionFile("../../content/main.xhtml");
        rootObject.setTemplateName("mainPanel");
        rootObject.setNavigationSelection(navigationBean);
        rootObject.setPageContent(true);
        rootTreeNode = new DefaultMutableTreeNode(rootObject);
        rootObject.setWrapper(rootTreeNode);
        model = new DefaultTreeModel(rootTreeNode);

        // xp folders (default theme)
        themeBranchContractedIcon = "xmlhttp/css/xp/css-images/tree_folder_open.gif";
        themeBranchExpandedIcon = "xmlhttp/css/xp/css-images/tree_folder_close.gif";
    }

    /**
     * Utility method to build the entire navigation tree.
     */
    private void init() {
        // set init flag
        isInitiated = true;

        if (rootTreeNode != null) {

            // get the navigation bean from the faces context
            FacesContext facesContext = FacesContext.getCurrentInstance();
            //Object navigationObject = JSFHelper.getManagedBean("#{navigation}");
            Object navigationObject =
                facesContext.getApplication()
                        .createValueBinding("#{navigation}")
                        .getValue(facesContext);

            if (navigationObject != null && navigationObject instanceof NavigationBean) {

                PageContentBean branchObject =
                        (PageContentBean) rootTreeNode.getUserObject();
                navigationBean = (NavigationBean) navigationObject;

                navigationBean.setSelectedPanel(
                        (PageContentBean) rootTreeNode.getUserObject());
                branchObject.setNavigationSelection(navigationBean);

                /**
                 * Generate the backing bean for each tree node and put it all together
                 */

                DAOFactory factory = DAOFactory.instance(DAOFactory.HIBERNATE);
                List<Modul> moduli = factory.getModulDAO().fetchAll();
                Iterator<Modul> modulIt= moduli.iterator();
                while(modulIt.hasNext()){
                	Modul modul = modulIt.next();
                	branchObject = new PageContentBean();
                    branchObject.setExpanded(false);

                    String modNaziv = modul.getNaziv().replace(" ", "");
                	String modTitle = modul.getNaziv().replace(" ", "");

                    branchObject.setMenuDisplayText(modNaziv);
                    branchObject.setMenuContentTitle(modTitle);
                    branchObject.setTemplateName(ClassUtils.getShortClassName(Modul.class).toLowerCase() + "Panel");
                    branchObject.setNavigationSelection(navigationBean);
                    branchObject.setPageContent(false);
                    DefaultMutableTreeNode branchNode =
                            new DefaultMutableTreeNode(branchObject);
                    branchObject.setWrapper(branchNode);
                    rootTreeNode.add(branchNode);


                    //List<ModulAplikacija> appInModule = factory.getAplikacijaModulDAO().findByModule(modul.getId());
                    Set<ModulAplikacija> appInModule = modul.getModulAplikacije();
                    Iterator<ModulAplikacija> appInModuleIt = appInModule.iterator();
                    while(appInModuleIt.hasNext()){
                    	ModulAplikacija appModule= appInModuleIt.next();
                    	Integer appId = appModule.getAplikacijaId();
                    	Aplikacija aplikacija = factory.getAplikacijaDAO().fetch(appId);

                    	branchObject = new PageContentBean();
                    	String appNaziv = aplikacija.getNaziv().replace(" ", "");
                    	String appTitle = aplikacija.getNaslov().replace(" ", "");
                        branchObject.setMenuDisplayText(appNaziv);
                        branchObject.setMenuContentTitle(appTitle);
                        branchObject.setMenuContentInclusionFile(aplikacija.getAplikacijaFajl());
                        branchObject.setTemplateName(aplikacija.getTemplateFajl());
                        branchObject.setNavigationSelection(navigationBean);
                        DefaultMutableTreeNode leafNode =
                                new DefaultMutableTreeNode(branchObject);
                        branchObject.setWrapper(leafNode);
                        branchObject.setLeaf(true);
                        branchNode.add(leafNode);

                    }

                }

            } else {
            	System.out.println("TreeNavigation...navigationObject is null " + navigationObject);
            }
        }
        else{
        	System.out.println("TreeNavigation...rootTreeNode is null " + rootTreeNode);
        }

    }
    /**
     * Gets the default tree model.  This model is needed for the value
     * attribute of the tree component.
     *
     * @return default tree model used by the navigation tree
     */
    public DefaultTreeModel getModel() {
        return model;
    }

    /**
     * Sets the default tree model.
     *
     * @param model new default tree model
     */
    public void setModel(DefaultTreeModel model) {
        this.model = model;
    }

    /**
     * Gets the tree component binding.
     *
     * @return tree component binding
     */
    public Tree getTreeComponent() {
        return treeComponent;
    }

    /**
     * Sets the tree component binding.
     *
     * @param treeComponent tree component to bind to
     */
    public void setTreeComponent(Tree treeComponent) {
        this.treeComponent = treeComponent;
        if (!isInitiated) {
            init();
        }
    }
}