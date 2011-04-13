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
public class HibernateOpenPhaseListener implements PhaseListener {

	private static final long serialVersionUID = -8348401765560947617L;

	public void beforePhase(PhaseEvent arg0) {
		HibernateUtil.currentSession();
		log.debug("Hibernate Session opened.");
	}

	public PhaseId getPhaseId() {
		return PhaseId.INVOKE_APPLICATION;
	}

	private static Log log = LogFactory.getLog(HibernateOpenPhaseListener.class);

	public void afterPhase(PhaseEvent arg0) {
		// TODO Auto-generated method stub
	}

}
