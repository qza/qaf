package org.qaf.security.manager;

import java.util.List;

import org.qaf.security.model.KorisnikUloga;
import org.qaf.waf.pagin.DataPage;


/**
 * @author Qza
 *
 */
public interface KorisnikUlogaManager {

	public List<KorisnikUloga> fetchAll();

	public KorisnikUloga fetch(Integer id);

	public List<KorisnikUloga> fetch(KorisnikUloga korisnikuloga, String[] excludeProperty);

	public KorisnikUloga save(KorisnikUloga korisnikuloga);

	public void delete(KorisnikUloga korisnikuloga);

	public DataPage<KorisnikUloga> getPagedData(KorisnikUloga search, int startRow, int maxResult);

}
