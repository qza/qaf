/**
 *
 */
package org.qaf.web.sifarnici.beans;

import javax.faces.event.ActionEvent;
import org.hibernate.HibernateException;
import org.qaf.sifarnici.model.Pacijent;
import org.qaf.waf.util.JSFHelper;
import org.qaf.web.sifarnici.support.PacijentPagedData;



/**
 * @author Qza
 *
 */
public class PacijentBean extends BaseBean {

	private PacijentPagedData pacijenti;

	public PacijentPagedData getPacijenti() {
		return pacijenti;
	}

	private Pacijent pacijent = new Pacijent();

	private Pacijent search = new Pacijent();

	public Pacijent getSearch() {
		return search;
	}

	public void setSearch(Pacijent search) {
		this.search = search;
	}

	private boolean prikaziKoncerte;

	public boolean isPrikaziKoncerte() {
		return prikaziKoncerte;
	}

	public void zatvoriPopupKoncerti(ActionEvent event){
		this.prikaziKoncerte = false;
	}
	public void otvoriPopupKoncerti(ActionEvent event){
		String dirigentId = (String)JSFHelper.getRequestParam(PARAM_PACIJENT_ID);
		this.pacijent = pacijentManager.dajPacijenta(Integer.valueOf(dirigentId));
		this.prikaziKoncerte = true;
	}

	public void setPrikaziKoncerte(boolean prikaziKoncerte) {
		this.prikaziKoncerte = prikaziKoncerte;
	}

	public Pacijent getPacijent() {
		return pacijent;
	}

	public void setPacijent(Pacijent pacijent) {
		this.pacijent = pacijent;
	}

	public void noviPacijentPopup(ActionEvent event){
		this.pacijent = new Pacijent();
		setRenderedPopup(true);
	}

	protected static String PARAM_PACIJENT_ID = "pacijentId";

	public void traziPacijent(ActionEvent event){

	}

	public String noviPacijent(){
		this.pacijent = new Pacijent();
		return "noviDirigent";
	}

	public String prikaziSve(){
		this.pacijenti = new PacijentPagedData(true);
		return "pacijenti";
	}

	public String obrisiPacijenta(){
		Integer pacijentId = JSFHelper.getIntRequestParam(PARAM_PACIJENT_ID);
		if(pacijentId != null){
			Pacijent d = pacijentManager.dajPacijenta(pacijentId);
			try {
				pacijentManager.obrisi(d);
			}catch(HibernateException he){
				log.error(he);
				JSFHelper.addErrorMessage("Greska: " + d.getIme()+" "+d.getPrezime());
				return null;
			}
			this.pacijenti = new PacijentPagedData(pacijent);
			JSFHelper.addSuccessMessage("Uspesno: " + d.getIme()+" "+d.getPrezime());
		}
		return null;
	}

	public String promeniDirigenta(){
		Integer dirigentId = JSFHelper.getIntRequestParam(PARAM_PACIJENT_ID);
		pacijent = pacijentManager.dajPacijenta(dirigentId);
		setRenderedPopup(true);
		return null;
	}

	public void sacuvajDirigentaPopup(ActionEvent event){
		pacijent = pacijentManager.sacuvaj(pacijent);
		setRenderedPopup(false);
		JSFHelper.addSuccessMessage("Uspesno je sacuvan: " + pacijent.getIme()+" "+pacijent.getPrezime());
		this.pacijenti = new PacijentPagedData(pacijent);
	}

	public String sacuvajDirigenta(){
		pacijentManager.sacuvaj(pacijent);
		JSFHelper.addSuccessMessage("Uspesno je sacuvan 2: " + pacijent.getIme()+" "+pacijent.getPrezime());
		this.pacijenti = new PacijentPagedData(pacijent);
		return null;
	}
}
