package org.qaf.waf.beans;

import javax.faces.event.ValueChangeEvent;
import javax.faces.model.DataModel;
import javax.faces.model.ListDataModel;
import javax.faces.model.SelectItem;

import org.hibernate.EntityMode;
import org.hibernate.metadata.ClassMetadata;
import org.qaf.common.model.HibernateUtil;
import org.qaf.waf.pagin.GenericPLDM;


import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.io.Serializable;

/**
 * The ColumnsBean object generates data for the ice:columns example.
 *
 * @since 1.5
 */
public class ColumnsBean implements Serializable {

	/**
	 *
	 */
	private static final long serialVersionUID = 8068741942777294772L;

	private DataModel columnDataModel;

	private DataModel rowDataModel;

	private Map<CellKey, Object> cellMap = new HashMap<CellKey, Object>();

	private SelectItem[] rowsItems = new SelectItem[] {
			new SelectItem(new Integer(5)), new SelectItem(new Integer(10)),
			new SelectItem(new Integer(15)), new SelectItem(new Integer(20)) };

	private SelectItem[] entityItems;

	private int rows = 5;

	private String selectedEntityName = "";

	private Class entityClass = null;

	private static int GENERATED_COUNT = 0;

	public ColumnsBean() {
		List<String> mappings = HibernateUtil.getMappings(false);
		int size = mappings.size();
		entityItems = new SelectItem[size];
		for (int i = 0; i < size; i++) {
			entityItems[i] = new SelectItem(mappings.get(i));
		}
	}

	public int getRows() {
		return rows;
	}

	public DataModel getRowDataModel() {
		return rowDataModel;
	}

	public DataModel getColumnDataModel() {
		return columnDataModel;
	}

	public SelectItem[] getRowsItems() {
		return rowsItems;
	}

	public void setEntityItems(SelectItem[] entityItems) {
		this.entityItems = entityItems;
	}

	public SelectItem[] getEntityItems() {
		return entityItems;
	}

	public void setRowsItems(SelectItem[] rowsItems) {
		this.rowsItems = rowsItems;
	}

	/**
	 * Called from the ice:dataTable. This method uses the columnDataModel and
	 * rowDataModel with the CellKey utility class to display the correct cell
	 * value.
	 *
	 * @return data which should be displayed for the given model state.
	 */
	public Object getCellValue() {
		if (rowDataModel.isRowAvailable() && columnDataModel.isRowAvailable()) {
			Object row = rowDataModel.getRowData();
			String column = (String) columnDataModel.getRowData();
			ClassMetadata pacijentMeta = HibernateUtil.getMetadata(entityClass);
			Object value = pacijentMeta.getPropertyValue(row, column, EntityMode.POJO);
			CellKey key = new CellKey(row, column);
			if (!cellMap.containsKey(key)) {
				cellMap.put(key, value);
			}
			return cellMap.get(key);
		}
		return null;
	}

	/**
	 * Updates the table model data.
	 *
	 * @param event
	 *            Event fired from the ice:selectOneMenu component which
	 *            specifies whether the column count has changed.
	 */
	public void updateTableRows(ValueChangeEvent event) {
		if (event != null && event.getNewValue() != null
				&& event.getNewValue() instanceof Integer) {
			rows = ((Integer) event.getNewValue()).intValue();
		}
		cellMap.clear();
		generatePagedModel();
	}

	/**
	 * Updates the table model data.
	 *
	 * @param event
	 *            Event fired from the ice:selectOneMenu component which
	 *            specifies whether the table entity has changed.
	 */
	public void updateTableEntity(ValueChangeEvent event) {
		if (event != null && event.getNewValue() != null
				&& event.getNewValue() instanceof String) {
			setSelectedEntityName((String) event.getNewValue());
		}
		cellMap.clear();
		generatePagedModel();
	}

	private void generatePagedModel() {
		if (rows > 0)
			rowDataModel = new GenericPLDM(selectedEntityName, rows);
		else
			rowDataModel = new GenericPLDM(selectedEntityName, 10);
		System.out.println("\n\n\n GENERATED_COUNT = " + (++GENERATED_COUNT) + "\n\n\n");
		String[] exclude = new String[]{"id","uneo","izmenio","datumUnosa","datumIzmene"};
		String[] propsNames = HibernateUtil.getColumns(entityClass.getName(), true, exclude);
		List<String> columnList = new ArrayList<String>(Arrays.asList(propsNames));
		if (columnDataModel == null) {
			columnDataModel = new ListDataModel(columnList);
		} else {
			columnDataModel.setWrappedData(columnList);
		}
	}

	public void setSelectedEntityName(String selectedEntityName) {
		this.selectedEntityName = selectedEntityName;
		try {
			entityClass = Class.forName(selectedEntityName);
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
		}
	}

	public String getSelectedEntityName() {
		return selectedEntityName;
	}

	/**
	 * Utility class used to keep track of the cells in a table.
	 */
	private class CellKey {
		private final Object row;

		private final Object column;

		/**
		 * @param row
		 * @param column
		 */
		public CellKey(Object row, Object column) {
			this.row = row;
			this.column = column;
		}

		/**
		 * @see java.lang.Object#equals(java.lang.Object)
		 */
		public boolean equals(Object obj) {
			if (obj == null) {
				return false;
			}
			if (obj == this) {
				return true;
			}
			if (obj instanceof CellKey) {
				CellKey other = (CellKey) obj;
				return other.row.equals(row) && other.column.equals(column);
			}
			return super.equals(obj);
		}

		/**
		 * @see java.lang.Object#hashCode()
		 */
		public int hashCode() {
			return (12345 + row.hashCode()) * (67890 + column.hashCode());
		}

		/**
		 * @see java.lang.Object#toString()
		 */
		public String toString() {
			return row.toString() + "," + column.toString();
		}
	}

}
