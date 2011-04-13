package org.qaf.security.manager;

import java.util.List;

import org.qaf.security.model.Opiduser;
import org.qaf.waf.pagin.DataPage;


/**
 * @author Qza
 *
 */
public interface OpiduserManager {

	public List<Opiduser> fetchAll();

	public Opiduser fetch(Integer id);

	public List<Opiduser> fetch(Opiduser opiduser, String[] excludeProperty);

	public Opiduser save(Opiduser opiduser);

	public void delete(Opiduser opiduser);

	public DataPage<Opiduser> getPagedData(Opiduser search, int startRow, int maxResult);

}
