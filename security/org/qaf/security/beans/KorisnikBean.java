package org.qaf.security.beans;

import javax.faces.event.ActionEvent;

import org.qaf.security.QafDigest;
import org.qaf.security.model.Korisnik;
import org.qaf.security.support.KorisnikPagedData;
import org.qaf.waf.content.PageContentBean;
import org.qaf.waf.popup.QafPopup;
import org.qaf.waf.util.JSFHelper;


public class KorisnikBean extends BaseBean<Korisnik> {

	public static final String new_path = "../../content/security/korisnik/new.jspx";

	public static final String edit_path = "../../content/security/korisnik/edit.jspx";

	public static String sortProperty = "korisnickoIme";

	public static final String PRM_KORISNIK_ID = "korisnikId";

	private Korisnik korisnik = new Korisnik();

	private PageContentBean newPanel = new PageContentBean();

	private PageContentBean editPanel = new PageContentBean();

	@Override
	public void initData() {
		// TODO Auto-generated method stub
		data = new KorisnikPagedData(PAGE_SIZE, sortProperty, ascending);
	}

	public String prikaziSve() {
		data = new KorisnikPagedData(PAGE_SIZE, sortProperty, ascending);
		return "korisnici";
	}

	public void noviKorisnikPanel(ActionEvent event) {
		this.korisnik = new Korisnik();
		newPanel = createPanel("Novi korisnik", new_path);
		newPanel.contentVisibleAction(event);
	}

	public void promeniKorisnikaPanel(ActionEvent event) {
		Integer editId = JSFHelper.getIntRequestParam(PRM_KORISNIK_ID);
		if(editId!=null)
			korisnik = korisnikManager.fetch(editId);
		else{
			int count = getSelection().size();
			if(count==0){
				setActiveModalPopup(KorisnikPopups.EDIT_NOT_CHECKED());
				return;
			}
			else{
				korisnik = korisnikManager.fetch(getSelection().iterator().next().getId());
			}
		}
		editPanel = createPanel("Izmena korisnika", edit_path);
		editPanel.contentVisibleAction(event);
	}

	public void sacuvajKorisnik(ActionEvent event) {
		korisnik.setLoginNeuspesanPuta(new Integer(0));
		korisnik.setLoginUspesanPuta(new Integer(0));
		korisnik.setLozinka(QafDigest.digestDefault(korisnik.getLozinka()));
		korisnik = korisnikManager.save(korisnik);
		setRenderedPopup(false);
		data = new KorisnikPagedData(PAGE_SIZE, sortProperty, ascending);
		getNavigationBean().back();
		setActiveModalPopup(KorisnikPopups.CREATE_INFO(korisnik.getKorisnickoIme()));
	}

	public void promeniKorisnika(ActionEvent event) {
		korisnik = korisnikManager.save(korisnik);
		setRenderedPopup(false);
		data = new KorisnikPagedData(PAGE_SIZE, sortProperty, ascending);
		getNavigationBean().back();
		setActiveModalPopup(KorisnikPopups.EDIT_INFO(korisnik.getKorisnickoIme()));
	}

	public void obrisiKorisnikaCheck(ActionEvent event) {
		int count = getSelection().size();
		if(count==0) setActiveModalPopup(KorisnikPopups.DELETE_NOT_CHECKED());
		else {
			QafPopup popup = KorisnikPopups.DELETE_CHECK(count);
			popup.setWithButtons(true);
			setActiveModalPopup(popup);
		}
	}

	public void okPopup(ActionEvent event){
		obrisiKorisnika(event);
	}

	public void obrisiKorisnika(ActionEvent event) {
		int count = getSelection().size();
		if(count>0){
			if(count==1){
				Korisnik k = getSelection().iterator().next();
				String ime = k.getKorisnickoIme();
				this.korisnik = korisnikManager.fetch(k.getId());
				korisnikManager.delete(korisnik);
				setActiveModalPopup(KorisnikPopups.DELETE_INFO(ime));
			} else {
				korisnikManager.delete(getSelection());
				setActiveModalPopup(KorisnikPopups.DELETE_INFO_BATCH());
			}
			data = new KorisnikPagedData(PAGE_SIZE, sortProperty, ascending);
			this.korisnik = new Korisnik();
		}
		else
			setActiveModalPopup(KorisnikPopups.DELETE_NOT_CHECKED());
	}

	public void stampaKorisnik(ActionEvent event) {

	}

	public void traziKorisnik(ActionEvent event) {
		selection.clear();
		data = new KorisnikPagedData(PAGE_SIZE, searchText, sortProperty, ascending);
	}

	public void sortiraj(ActionEvent event){
		String sort = JSFHelper.getStringRequestParam("sort");
		boolean old = this.ascending;
		this.ascending = !old;
		data = new KorisnikPagedData(PAGE_SIZE, searchText, sort, ascending);
	}

	public void setKorisnik(Korisnik korisnik) {
		this.korisnik = korisnik;
	}

	public Korisnik getKorisnik() {
		return korisnik;
	}

}
