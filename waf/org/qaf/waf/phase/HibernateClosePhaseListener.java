package org.qaf.waf.phase;

import javax.faces.event.PhaseEvent;
import javax.faces.event.PhaseId;
import javax.faces.event.PhaseListener;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.qaf.common.model.HibernateUtil;


/**
 * @author Qza
 *
 */
public class HibernateClosePhaseListener implements PhaseListener {

	/**
	 *
	 */
	private static final long serialVersionUID = 3106696896962571826L;

	public void afterPhase(PhaseEvent arg0) {
		HibernateUtil.closeSession();
		log.debug("Hibernate Session Closed.");
	}

	public void beforePhase(PhaseEvent arg0) {

	}

	public PhaseId getPhaseId() {
		return PhaseId.RENDER_RESPONSE;
	}

	private static Log log = LogFactory.getLog(HibernateClosePhaseListener.class);

}
