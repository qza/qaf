package org.qaf.web.sifarnici.support;

import org.qaf.sifarnici.business.ManagerFactoryImpl;
import org.qaf.sifarnici.business.PacijentManager;
import org.qaf.sifarnici.model.Pacijent;
import org.qaf.waf.pagin.DataPage;
import org.qaf.waf.pagin.PagedListDataModel;


public class PacijentPagedData extends PagedListDataModel<Pacijent> {

	private static int PAGE_SIZE = 5;

	private Pacijent search;

	private PacijentManager pacijentManager = ManagerFactoryImpl.getInstance().getPacijentManager();

	public PacijentPagedData(Pacijent search) {
		super(PAGE_SIZE);
		this.search = search;
	}

	public PacijentPagedData(boolean reset){
		super(PAGE_SIZE);
		if(reset) this.search = new Pacijent();
	}

	public PacijentPagedData(boolean reset, int pageSize){
		super(pageSize);
		if(reset) this.search = new Pacijent();
	}

	public DataPage<Pacijent> fetchPage(int startRow, int pageSize) {
		return pacijentManager.traziPagedData(search, startRow, pageSize);
	}

}