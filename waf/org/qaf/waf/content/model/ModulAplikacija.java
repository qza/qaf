package org.qaf.waf.content.model;

// Generated Feb 7, 2010 12:21:36 AM by Hibernate Tools 3.2.0.beta8

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import org.qaf.common.model.BaseEntity;


/**
 * ModulAplikacija generated by hbm2java
 */
@Entity
@Table(schema="admin", name = "\"modul-aplikacija\"", uniqueConstraints = {})
public class ModulAplikacija extends BaseEntity implements java.io.Serializable {

	// Fields

	private int id;

	private Integer modulId;

	private Integer aplikacijaId;

	private Short vazeci;

	// Constructors

	/** default constructor */
	public ModulAplikacija() {
	}

	/** minimal constructor */
	public ModulAplikacija(int id) {
		this.id = id;
	}

	/** full constructor */
	public ModulAplikacija(int id, Integer modulId, Integer aplikacijaId,
			Short vazeci) {
		this.id = id;
		this.modulId = modulId;
		this.aplikacijaId = aplikacijaId;
		this.vazeci = vazeci;
	}

	// Property accessors
	@Id
	@Column(name = "id", unique = true, nullable = false, insertable = true, updatable = true)
	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	@Column(name = "modul_id", unique = false, nullable = true, insertable = true, updatable = true)
	public Integer getModulId() {
		return this.modulId;
	}

	public void setModulId(Integer modulId) {
		this.modulId = modulId;
	}

	@Column(name = "aplikacija_id", unique = false, nullable = true, insertable = true, updatable = true)
	public Integer getAplikacijaId() {
		return this.aplikacijaId;
	}

	public void setAplikacijaId(Integer aplikacijaId) {
		this.aplikacijaId = aplikacijaId;
	}

	@Column(name = "vazeci", unique = false, nullable = true, insertable = true, updatable = true)
	public Short getVazeci() {
		return this.vazeci;
	}

	public void setVazeci(Short vazeci) {
		this.vazeci = vazeci;
	}

}
