
package org.qaf.security.support;

import org.qaf.security.manager.KorisnikManager;
import org.qaf.security.manager.ManagerFactoryImpl;
import org.qaf.security.model.Korisnik;
import org.qaf.waf.pagin.DataPage;
import org.qaf.waf.pagin.SortedFilteredPagedListDataModel;


/**
 * @author Qza
 *
 */
public class KorisnikPagedData extends SortedFilteredPagedListDataModel<Korisnik> {

	private KorisnikManager korisnikManager = ManagerFactoryImpl.getInstance().getKorisnikManager();

	public KorisnikPagedData(int pageSize, Korisnik search) {
		super(pageSize, search);
	}

	public KorisnikPagedData(int pageSize, String searchText, String sortProperty, boolean ascending){
		super(pageSize, searchText, sortProperty, ascending);
	}

	public KorisnikPagedData(int pageSize, String sortProperty, boolean ascending){
		super(pageSize, sortProperty, ascending);
	}

	public DataPage<Korisnik> fetchPage(int startRow, int pageSize) {
		DataPage<Korisnik> page = korisnikManager.getPagedData(search, searchText,
								  startRow, pageSize, sortProperty, ascending);
		return page;
	}

}