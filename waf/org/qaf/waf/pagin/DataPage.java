package org.qaf.waf.pagin;

import java.util.List;

/**
 * @author Qza
 */
public class DataPage<T> {

  private int datasetSize;
  private int startRow;
  private List<T> data;

  public DataPage(int datasetSize, int startRow, List<T> data) {
    this.datasetSize = datasetSize;
    this.startRow = startRow;
    this.data = data;
  }

  public int getDatasetSize() {
    return datasetSize;
  }

  public int getStartRow() {
    return startRow;
  }

  public List<T> getData() {
    return data;
  }

  public void refreshDataSetSize(){
	this.datasetSize = this.data.size();
  }

}