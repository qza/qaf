package org.qaf.security.model;

// Generated Feb 9, 2010 8:52:41 AM by Hibernate Tools 3.2.0.beta8

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

/**
 * Opiduser generated by hbm2java
 */
@Entity
@Table(schema="admin", name = "opiduser", uniqueConstraints = {})
public class Opiduser implements java.io.Serializable {

	// Fields

	private int id;

	private Korisnik korisnik;

	private String identity;

	private String email;

	private String ime;

	private String prezime;

	private String language;

	// Constructors

	/** default constructor */
	public Opiduser() {
	}

	/** minimal constructor */
	public Opiduser(int id, String identity, String email) {
		this.id = id;
		this.identity = identity;
		this.email = email;
	}

	/** full constructor */
	public Opiduser(int id, Korisnik korisnik, String identity, String email,
			String ime, String prezime, String language) {
		this.id = id;
		this.korisnik = korisnik;
		this.identity = identity;
		this.email = email;
		this.ime = ime;
		this.prezime = prezime;
		this.language = language;
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

	@ManyToOne(cascade = {}, fetch = FetchType.LAZY)
	@JoinColumn(name = "korisnik_id", unique = false, nullable = true, insertable = true, updatable = true)
	public Korisnik getKorisnik() {
		return this.korisnik;
	}

	public void setKorisnik(Korisnik korisnik) {
		this.korisnik = korisnik;
	}

	@Column(name = "identity", unique = false, nullable = false, insertable = true, updatable = true)
	public String getIdentity() {
		return this.identity;
	}

	public void setIdentity(String identity) {
		this.identity = identity;
	}

	@Column(name = "email", unique = false, nullable = false, insertable = true, updatable = true)
	public String getEmail() {
		return this.email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	@Column(name = "ime", unique = false, nullable = true, insertable = true, updatable = true)
	public String getIme() {
		return this.ime;
	}

	public void setIme(String ime) {
		this.ime = ime;
	}

	@Column(name = "prezime", unique = false, nullable = true, insertable = true, updatable = true)
	public String getPrezime() {
		return this.prezime;
	}

	public void setPrezime(String prezime) {
		this.prezime = prezime;
	}

	@Column(name = "language", unique = false, nullable = true, insertable = true, updatable = true)
	public String getLanguage() {
		return this.language;
	}

	public void setLanguage(String language) {
		this.language = language;
	}

}
