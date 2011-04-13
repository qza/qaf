package org.qaf.waf.content.model;

// Generated Feb 6, 2010 11:07:02 PM by Hibernate Tools 3.2.0.beta8

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import org.qaf.common.model.BaseEntity;


/**
 * Aplikacija generated by hbm2java
 */
@Entity
@Table(schema="admin", name = "aplikacija", uniqueConstraints = {})
public class Aplikacija extends BaseEntity implements java.io.Serializable {

	// Fields

	private int id;

	private String naziv;

	private String naslov;

	private String templateFajl;

	private String aplikacijaFajl;

	private String parametri;

	private Short vazeci;

	// Constructors

	/** default constructor */
	public Aplikacija() {
	}

	/** minimal constructor */
	public Aplikacija(int id, String naziv, String templateFajl,
			String aplikacijaFajl) {
		this.id = id;
		this.naziv = naziv;
		this.templateFajl = templateFajl;
		this.aplikacijaFajl = aplikacijaFajl;
	}

	/** full constructor */
	public Aplikacija(int id, String naziv, String naslov, String templateFajl,
			String aplikacijaFajl, String parametri, Short vazeci) {
		this.id = id;
		this.naziv = naziv;
		this.naslov = naslov;
		this.templateFajl = templateFajl;
		this.aplikacijaFajl = aplikacijaFajl;
		this.parametri = parametri;
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

	@Column(name = "naziv", unique = false, nullable = false, insertable = true, updatable = true)
	public String getNaziv() {
		return this.naziv;
	}

	public void setNaziv(String naziv) {
		this.naziv = naziv;
	}

	@Column(name = "naslov", unique = false, nullable = true, insertable = true, updatable = true)
	public String getNaslov() {
		return this.naslov;
	}

	public void setNaslov(String naslov) {
		this.naslov = naslov;
	}

	@Column(name = "template_fajl", unique = false, nullable = false, insertable = true, updatable = true)
	public String getTemplateFajl() {
		return this.templateFajl;
	}

	public void setTemplateFajl(String templateFajl) {
		this.templateFajl = templateFajl;
	}

	@Column(name = "aplikacija_fajl", unique = false, nullable = false, insertable = true, updatable = true)
	public String getAplikacijaFajl() {
		return this.aplikacijaFajl;
	}

	public void setAplikacijaFajl(String aplikacijaFajl) {
		this.aplikacijaFajl = aplikacijaFajl;
	}

	@Column(name = "parametri", unique = false, nullable = true, insertable = true, updatable = true)
	public String getParametri() {
		return this.parametri;
	}

	public void setParametri(String parametri) {
		this.parametri = parametri;
	}

	@Column(name = "vazeci", unique = false, nullable = true, insertable = true, updatable = true)
	public Short getVazeci() {
		return this.vazeci;
	}

	public void setVazeci(Short vazeci) {
		this.vazeci = vazeci;
	}

}
