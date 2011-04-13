package org.qaf.common.model;

import javax.persistence.Transient;

public abstract class BaseEntity {

	private boolean selected = false;

	public void setSelected(boolean selected) {
		this.selected = selected;
	}

	@Transient
	public boolean isSelected() {
		return selected;
	}

}
