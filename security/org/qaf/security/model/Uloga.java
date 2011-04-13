package org.qaf.security.model;

// Generated Feb 9, 2010 8:52:41 AM by Hibernate Tools 3.2.0.beta8

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * Uloga generated by hbm2java
 */
@Entity
@Table(schema="admin", name = "uloga", uniqueConstraints = {})
public class Uloga implements java.io.Serializable {

	// Fields

	private int id;

	private String naziv;

	private String opis;

	private Integer nadUlogaId;

	// Constructors

	/** default constructor */
	public Uloga() {
	}

	/** minimal constructor */
	public Uloga(int id, String naziv) {
		this.id = id;
		this.naziv = naziv;
	}

	/** full constructor */
	public Uloga(int id, String naziv, String opis, Integer nadUlogaId) {
		this.id = id;
		this.naziv = naziv;
		this.opis = opis;
		this.nadUlogaId = nadUlogaId;
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

	@Column(name = "opis", unique = false, nullable = true, insertable = true, updatable = true)
	public String getOpis() {
		return this.opis;
	}

	public void setOpis(String opis) {
		this.opis = opis;
	}

	@Column(name = "nad_uloga_id", unique = false, nullable = true, insertable = true, updatable = true)
	public Integer getNadUlogaId() {
		return this.nadUlogaId;
	}

	public void setNadUlogaId(Integer nadUlogaId) {
		this.nadUlogaId = nadUlogaId;
	}

}