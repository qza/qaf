package org.qaf.waf.popup;

public class QafDefaultPopups {

	public static QafPopup NOT_CHECKED_WARNING(String message){
		QafPopup pop = new QafPopup(QafPopup.Type.WARNING,
										"POPUP_NOT_CHECKED_WARNING",
										message, "", null );
		return pop;
	}

	public static QafPopup DELETE_CHECK_WARNING(String message){
		QafPopup pop = new QafPopup(QafPopup.Type.WARNING,
										"POPUP_DELETE_CHECK_WARNING",
										message, "", null );
		return pop;
	}

	public static QafPopup CREATE_INFO(String message){
		QafPopup pop = new QafPopup(QafPopup.Type.INFO,
										"POPUP_CREATE_INFO",
										message, "", null );
		return pop;
	}

	public static QafPopup DELETE_INFO(String message){
		QafPopup pop = new QafPopup(QafPopup.Type.INFO,
										"POPUP_DELETE_INFO",
										message, "", null );
		return pop;
	}



}
