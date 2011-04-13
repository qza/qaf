package org.qaf.security.dao;

import java.util.List;

import org.qaf.common.model.dao.GenericDAOImpl;
import org.qaf.security.model.Korisnik;


/**
 * @author Qza
 *
 */
public class KorisnikDAOImpl extends GenericDAOImpl<Korisnik, Integer> implements KorisnikDAO{

	public static void main(String args[]){
		KorisnikDAO dao = new KorisnikDAOImpl();
		List<Korisnik> korisnici = dao.findByText("mar","korisnickoIme",true);
		System.out.println("UKUPNO - " + korisnici.size());
	}
}