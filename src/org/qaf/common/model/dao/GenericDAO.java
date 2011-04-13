package org.qaf.common.model.dao;

import java.io.Serializable;
import java.util.List;

public interface GenericDAO<T, ID extends Serializable> {

	public T saveOrUpdate(T object);

	public boolean deleteById(ID id);

	public boolean deleteEntity(T object);

	public T fetch(ID id);

	public List<T> fetchAll();

	public List<T> findByText(String searchText, String sortColumn, boolean ascending);

	public List<T> findByText2(String searchText, String sortColumn, boolean ascending);

	public List<T> findByExample(T exampleInstance, String[] excludeProperty);

}
