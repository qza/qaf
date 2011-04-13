package org.qaf.security.manager;

import java.util.List;

import org.qaf.security.model.Uloga;
import org.qaf.waf.pagin.DataPage;


/**
 * @author Qza
 *
 */
public interface UlogaManager {

	public List<Uloga> fetchAll();

	public Uloga fetch(Integer id);

	public List<Uloga> fetch(Uloga uloga, String[] excludeProperty);

	public Uloga save(Uloga uloga);

	public void delete(Uloga uloga);

	public DataPage<Uloga> getPagedData(Uloga search, int startRow, int maxResult);

}
