
package org.qaf.security.support;

import org.qaf.security.manager.ManagerFactoryImpl;
import org.qaf.security.manager.OpiduserManager;
import org.qaf.security.model.Opiduser;
import org.qaf.waf.pagin.DataPage;
import org.qaf.waf.pagin.PagedListDataModel;


/**
 * @author Qza
 *
 */
public class OpiduserPagedData extends PagedListDataModel<Opiduser> {

	private static int PAGE_SIZE = 10;

	private Opiduser search;

	private OpiduserManager opiduserManager = ManagerFactoryImpl.getInstance().getOpiduserManager();

	public OpiduserPagedData(Opiduser search) {
		super(PAGE_SIZE);
		this.search = search;
	}

	public OpiduserPagedData(boolean reset){
		super(PAGE_SIZE);
		if(reset) this.search = new Opiduser();
	}

	public OpiduserPagedData(boolean reset, int pageSize){
		super(pageSize);
		if(reset) this.search = new Opiduser();
	}

	public DataPage<Opiduser> fetchPage(int startRow, int pageSize) {
		return opiduserManager.getPagedData(search, startRow, pageSize);
	}

}