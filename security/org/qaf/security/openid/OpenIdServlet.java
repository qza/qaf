package org.qaf.security.openid;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Enumeration;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.security.auth.Subject;
import javax.security.auth.login.LoginContext;
import javax.security.auth.login.LoginException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.expressme.openid.Association;
import org.expressme.openid.Authentication;
import org.expressme.openid.Endpoint;
import org.expressme.openid.OpenIdException;
import org.expressme.openid.OpenIdManager;
import org.hibernate.Session;
import org.qaf.common.model.HibernateUtil;
import org.qaf.security.QafHttpHandler;
import org.qaf.security.model.Korisnik;
import org.qaf.security.model.Opiduser;



/**
 * Sample servlet using JOpenID.
 *
 * @author Michael Liao (askxuefeng@gmail.com)
 */
public class OpenIdServlet extends HttpServlet {

	private static final long serialVersionUID = -238323449173640772L;

	static final long ONE_HOUR = 3600000L;
    static final long TWO_HOUR = ONE_HOUR * 2L;
    static final String ATTR_MAC = "openid_mac";
    static final String ATTR_ALIAS = "openid_alias";

    protected static final org.apache.commons.logging.Log log =
		org.apache.commons.logging.LogFactory.getLog(OpenIdServlet.class);

    private OpenIdManager manager;

    @Override
    public void init() throws ServletException {
        super.init();
        manager = new OpenIdManager();
        manager.setRealm("http://localhost");
        manager.setReturnTo("http://localhost/qaf/openid");
        log.info("Inicijalizovan openidservlet i manager");
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
    	log.info("Openid servlet doGet...");
		String op = request.getParameter("op");
		log.info("	doGet parametar op = " + op);
		if (op == null) {
			log.info("Received response");
			log(">>>>>>>> openid.response_nonce==>" + request.getParameter("openid.response_nonce"));
			checkNonce(request.getParameter("openid.response_nonce"));
			HttpSession session = request.getSession();
			byte[] mac_key = (byte[]) session.getAttribute(ATTR_MAC);
			String alias = (String) session.getAttribute(ATTR_ALIAS);
			Authentication authentication = manager.getAuthentication(request, mac_key, alias);
			String identity = authentication.getIdentity();
			String email = authentication.getEmail();
			String name = authentication.getFirstname();
			String lastname = authentication.getLastname();
			String language = authentication.getLanguage();
			Session s = HibernateUtil.currentSession();
			String q = "from Opiduser o where o.identity='" + identity + "' and o.email='" + email + "'";
			s.beginTransaction();
			List opids = s.createQuery(q).list();
			if(opids.size()>0){
				Opiduser opiduser = (Opiduser) opids.iterator().next();
				s.delete(opiduser);
				s.getTransaction().commit();
				throw new ServletException("Vec prijavljen korisnik!");
			}
			else{
				String q2 = " from Korisnik k where k.email='" + email + "'";
				Korisnik korisnik = (Korisnik) s.createQuery(q2).uniqueResult();
				if(korisnik!=null){
					Opiduser opiduser = new Opiduser();
					opiduser.setIdentity(identity);
					opiduser.setEmail(email);
					opiduser.setIme(name);
					opiduser.setPrezime(lastname);
					opiduser.setLanguage(language);
					opiduser.setKorisnik(korisnik);
					s.save(opiduser);
					s.getTransaction().commit();
					try {
						QafHttpHandler handler = new QafHttpHandler(korisnik.getKorisnickoIme(),korisnik.getLozinka());
						log.info("Kreirao sam handlera, spremam se da logujem preko Login contexta");
						LoginContext lc = new LoginContext("Qaf", handler);
						lc.login();
						log.info("Ulogovao sam korisnika preko Login contexta");
						Subject sub = lc.getSubject();
						session.setAttribute("javax.security.auth.subject", sub);
						log.info("Uzeo sam subject sa pincipals: " + sub.getPrincipals());
					} catch (LoginException e) {
						s.getTransaction().rollback();
						log.error(e);
						e.printStackTrace();
					}
				} else{
					s.getTransaction().rollback();
					throw new ServletException("Ne postoji qaf nalog!");
				}
			}

			String nextJSP = "WEB-INF/pages/home.iface";
			String nextUrl = "http://localhost/qaf";

			// response.sendRedirect(response.encodeRedirectURL(nextUrl));
			request.setAttribute("opid", "true");
			getServletContext().getRequestDispatcher("/").forward(request,response);

		} else if ("Google".equals(op) || "Yahoo".equals(op)) {
			String returnToAddres = "http://" + request.getServerName() + "/qaf/openid";
			manager.setReturnTo(returnToAddres);
			Endpoint endpoint = manager.lookupEndpoint(op);
			Association association = manager.lookupAssociation(endpoint);
			HttpSession session = request.getSession();
			session.setAttribute(ATTR_MAC, association.getRawMacKey());
			session.setAttribute(ATTR_ALIAS, endpoint.getAlias());
			String url = manager.getAuthenticationUrl(endpoint, association);
			log.info("Openid servlet redirecting url = " + url);
			response.sendRedirect(url);
		} else {
			throw new ServletException("Bad parameter op=" + op);
		}
    }

    void checkNonce(String nonce) {
        // check response_nonce to prevent replay-attack:
        if (nonce==null || nonce.length()<20)
            throw new OpenIdException("Verify failed.");
        // make sure the time of server is correct:
        long nonceTime = getNonceTime(nonce);
        long diff = Math.abs(System.currentTimeMillis() - nonceTime);
        if (diff > ONE_HOUR)
            throw new OpenIdException("Bad nonce time.");
        if (isNonceExist(nonce))
            throw new OpenIdException("Verify nonce failed.");
        storeNonce(nonce, nonceTime + TWO_HOUR);
    }

    // simulate a database that store all nonce:
    private Set<String> nonceDb = new HashSet<String>();

    // check if nonce is exist in database:
    boolean isNonceExist(String nonce) {
        return nonceDb.contains(nonce);
    }

    // store nonce in database:
    void storeNonce(String nonce, long expires) {
        nonceDb.add(nonce);
    }

    long getNonceTime(String nonce) {
        try {
            return new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ")
                    .parse(nonce.substring(0, 19) + "+0000")
                    .getTime();
        }
        catch(ParseException e) {
            throw new OpenIdException("Bad nonce time.");
        }
    }

    public static void logRequest(HttpServletRequest request){
    	log.info("\n\n");
		log.info("		Path info: " + request.getPathInfo());
		log.info("Path translated: " + request.getPathTranslated());
		log.info("		 Protocol: " + request.getProtocol());
		log.info("	  Request URI: " + request.getRequestURI());
		log.info("	  Request URL: " + request.getRequestURL().toString());
		log.info("Parameter names: " + request.getParameterNames().toString());
		log.info("   Query string: " + request.getQueryString());

		Enumeration en = request.getAttributeNames();
		while(en.hasMoreElements()){
			String atrName = en.nextElement().toString();
			System.out.println("		ATTR " + atrName + " : " + request.getAttribute(atrName));
		}

		Enumeration en2 = request.getParameterNames();
		while(en2.hasMoreElements()){
			String prmName = en2.nextElement().toString();
			System.out.println("		PRM " + prmName + " : " + request.getParameter(prmName));
		}
    }
}
