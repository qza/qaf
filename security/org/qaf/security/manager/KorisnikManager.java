package org.qaf.security.manager;

import java.util.List;

import org.qaf.security.model.Korisnik;
import org.qaf.waf.pagin.DataPage;


/**
 * @author Qza
 *
 */
public interface KorisnikManager {

	public List<Korisnik> fetchAll();

	public Korisnik fetch(Integer id);

	public List<Korisnik> fetch(Korisnik korisnik, String[] excludeProperty);

	public Korisnik save(Korisnik korisnik);

	public void delete(Korisnik korisnik);

	public void delete(List<Korisnik> korisnikList);

	public DataPage<Korisnik> getPagedData(Korisnik search, String searchText, int startRow, int maxResult, String sortProperty, boolean ascending);

}
