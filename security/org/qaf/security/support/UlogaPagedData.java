
package org.qaf.security.support;

import org.qaf.security.manager.ManagerFactoryImpl;
import org.qaf.security.manager.UlogaManager;
import org.qaf.security.model.Uloga;
import org.qaf.waf.pagin.DataPage;
import org.qaf.waf.pagin.PagedListDataModel;


/**
 * @author Qza
 *
 */
public class UlogaPagedData extends PagedListDataModel<Uloga> {

	private static int PAGE_SIZE = 10;

	private Uloga search;

	private UlogaManager ulogaManager = ManagerFactoryImpl.getInstance().getUlogaManager();

	public UlogaPagedData(Uloga search) {
		super(PAGE_SIZE);
		this.search = search;
	}

	public UlogaPagedData(boolean reset){
		super(PAGE_SIZE);
		if(reset) this.search = new Uloga();
	}

	public UlogaPagedData(boolean reset, int pageSize){
		super(pageSize);
		if(reset) this.search = new Uloga();
	}

	public DataPage<Uloga> fetchPage(int startRow, int pageSize) {
		return ulogaManager.getPagedData(search, startRow, pageSize);
	}

}