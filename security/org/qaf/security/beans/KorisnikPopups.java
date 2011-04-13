package org.qaf.security.beans;

import org.qaf.waf.language.LanguageServlet;
import org.qaf.waf.popup.QafDefaultPopups;
import org.qaf.waf.popup.QafPopup;
import org.qaf.waf.util.JSFHelper;
import org.qaf.waf.util.ResourceUtil;

public abstract class KorisnikPopups {

	private static String getBundleLabel(String key, String[] prms){
    	return ResourceUtil.getMessageResourceString(LanguageServlet.BUNDLE_NAME,
    						key, prms, JSFHelper.getLocaleFromViewRoot(), false);
    }

	public static QafPopup DELETE_NOT_CHECKED() {
		String message = "POPUP_NIJE_IZABRAN_KORISNIK_BRISANJE";
		String bundled = getBundleLabel(message, null);
		return QafDefaultPopups.NOT_CHECKED_WARNING(bundled);
	}

	public static QafPopup EDIT_NOT_CHECKED() {
		String message = "POPUP_NIJE_IZABRAN_KORISNIK_IZMENA";
		String bundled = getBundleLabel(message, null);
		return QafDefaultPopups.NOT_CHECKED_WARNING(bundled);
	}

	public static QafPopup DELETE_CHECK(int count) {
		String message = "DELETE_KORINSIK_CHECK";
		String bundled = getBundleLabel(message, new String[]{count+""});
		return QafDefaultPopups.DELETE_CHECK_WARNING(bundled);
	}

	public static QafPopup CREATE_INFO(String korisnickoIme) {
		String message = "CREATE_KORINSIK_INFO";
		String bundled = getBundleLabel(message, new String[]{korisnickoIme});
		return QafDefaultPopups.CREATE_INFO(bundled);
	}

	public static QafPopup EDIT_INFO(String korisnickoIme) {
		String message = "EDIT_KORINSIK_INFO";
		String bundled = getBundleLabel(message, new String[]{korisnickoIme});
		return QafDefaultPopups.CREATE_INFO(bundled);
	}

	public static QafPopup DELETE_INFO(String korisnickoIme) {
		String message = "DELETE_KORINSIK_INFO";
		String bundled = getBundleLabel(message, new String[]{korisnickoIme});
		return QafDefaultPopups.DELETE_INFO(bundled);
	}

	public static QafPopup DELETE_INFO_BATCH() {
		String message = "DELETE_BATCH_KORISNIK_INFO";
		String bundled = getBundleLabel(message, null);
		return QafDefaultPopups.DELETE_INFO(bundled);
	}

}
