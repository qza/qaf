
package org.qaf.security.support;

import org.qaf.security.manager.KorisnikUlogaManager;
import org.qaf.security.manager.ManagerFactoryImpl;
import org.qaf.security.model.KorisnikUloga;
import org.qaf.waf.pagin.DataPage;
import org.qaf.waf.pagin.PagedListDataModel;


/**
 * @author Qza
 *
 */
public class KorisnikUlogaPagedData extends PagedListDataModel<KorisnikUloga> {

	private static int PAGE_SIZE = 10;

	private KorisnikUloga search;

	private KorisnikUlogaManager korisnikulogaManager = ManagerFactoryImpl.getInstance().getKorisnikUlogaManager();

	public KorisnikUlogaPagedData(KorisnikUloga search) {
		super(PAGE_SIZE);
		this.search = search;
	}

	public KorisnikUlogaPagedData(boolean reset){
		super(PAGE_SIZE);
		if(reset) this.search = new KorisnikUloga();
	}

	public KorisnikUlogaPagedData(boolean reset, int pageSize){
		super(pageSize);
		if(reset) this.search = new KorisnikUloga();
	}

	public DataPage<KorisnikUloga> fetchPage(int startRow, int pageSize) {
		return korisnikulogaManager.getPagedData(search, startRow, pageSize);
	}

}