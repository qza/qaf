package org.qaf.waf.language;

import java.io.IOException;
import java.util.HashMap;
import java.util.Locale;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.qaf.waf.util.ResourceUtil;


public class LanguageServlet extends HttpServlet {

	private static final long serialVersionUID = -1970879533261122751L;

	private static final String URL_PROTOCOL = "https";
	private static final String URL_SERVER = "localhost";
	private static final String URL_PATH = "/qaf/login";

	private static final String URL = URL_PROTOCOL + "://" + URL_SERVER + URL_PATH;

	public static final String BUNDLE_NAME = "org.qaf.waf.language.QafMessages";

	private static final String[] LABELS = new String[]{
						"titleLabel","usernameLabel","passwordLabel",
						"loginLabel","qafAccountLabel","resetLabel",
						"openidLabel"};

	protected static final org.apache.commons.logging.Log log =
		org.apache.commons.logging.LogFactory.getLog(LanguageServlet.class);

    public static HashMap<String, Locale> locales = null;

    static{
    	locales = new HashMap<String, Locale>(4);
    	locales.put("serbian", new Locale("sr", "SR"));
        locales.put("english", new Locale("en", "UK"));
        locales.put("deutsche", new Locale("de", "DE"));
        locales.put("french", new Locale("fr", "FR"));
    }

    @Override
    public void init() throws ServletException {
        super.init();
        log.info("Inicijalizovan.");
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
    	log.info("Do GET...");
    	String language = request.getParameter("language");
    	HttpSession ses = request.getSession(true);
    	ses.setAttribute("language", language);
    	for(int i =0; i<LABELS.length;i++){
    		ses.setAttribute(LABELS[i], getBundleLabel(language, LABELS[i]));
    	}
		if (language != null) response.sendRedirect(URL);
		else throw new ServletException("Bad parameter language=" + language);
   }

    private String getBundleLabel(String language, String key){
    	return ResourceUtil.getMessageResourceString(BUNDLE_NAME, key, null, locales.get(language), false);
    }

}