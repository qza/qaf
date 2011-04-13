/**
 *
 */
package org.qaf.sifarnici.business;

import java.util.List;

import org.qaf.sifarnici.model.Pacijent;
import org.qaf.waf.pagin.DataPage;



/**
 * @author Qza
 *
 */
public interface PacijentManager {

	public List<Pacijent> dajSvePacijente();

	public Pacijent dajPacijenta(Integer id);

	public Pacijent sacuvaj(Pacijent pacijent);

	public void obrisi(Pacijent dirigent);

	public List<Pacijent> trazi(String searchText, boolean strict);

	public Pacijent dajPacijenta(String ime, String prezime);

	public DataPage<Pacijent> traziPagedData(Pacijent search, int startRow, int maxResult);

}
