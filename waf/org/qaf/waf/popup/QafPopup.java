package org.qaf.waf.popup;

public class QafPopup {

	public enum Type {
		SUCCESS("images/popup_success.png"), INFO("images/popup_info.png"),
		WARNING("images/popup_warning.png"), ERROR("images/popup_error.png") ;
		private String image;
		Type(String image) {
			this.image = image;
		}
		public String getImage() {
			return this.image;
		}
	}

	private String title;

	private Type type;

	private String includeFile;

	private String message;

	private String conclusion;

	private boolean rendered;

	private boolean withButtons = false;

	public QafPopup(Type type, String title, String message, String conclustion, String includeFile) {
		this.type = type;
		this.message = message;
		this.title = title;
		this.conclusion = conclustion;
		this.includeFile = includeFile;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getTitle() {
		return title;
	}

	public void setType(Type type) {
		this.type = type;
	}

	public Type getType() {
		return type;
	}

	public void setIncludeFile(String includeFile) {
		this.includeFile = includeFile;
	}

	public String getIncludeFile() {
		return includeFile;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public String getMessage() {
		return message;
	}

	public void setConclusion(String conclusion) {
		this.conclusion = conclusion;
	}

	public String getConclusion() {
		return conclusion;
	}

	public void setRendered(boolean rendered) {
		this.rendered = rendered;
	}

	public boolean isRendered() {
		return rendered;
	}

	public void setWithButtons(boolean withButtons) {
		this.withButtons = withButtons;
	}

	public boolean isWithButtons() {
		return withButtons;
	}

}
