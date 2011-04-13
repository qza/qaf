package org.qaf.waf.content.model.dao;

import java.util.List;

import org.qaf.common.model.dao.GenericDAO;
import org.qaf.waf.content.model.ModulAplikacija;


public interface ModulAplikacijaDAO extends GenericDAO<ModulAplikacija, Integer>{

	public List<ModulAplikacija> findByModule(Integer moduleId);

}
