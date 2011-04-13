package org.qaf.waf.validate;

import javax.faces.application.FacesMessage;
import javax.faces.component.UIComponent;
import javax.faces.context.FacesContext;
import javax.faces.validator.Validator;
import javax.faces.validator.ValidatorException;

import com.icesoft.faces.component.ext.HtmlInputText;

public class EmailValidator implements Validator{

    public void validate(FacesContext context, UIComponent component, Object value)
            throws ValidatorException {
        String email = (String) value;
        if(!email.contains("@")) {
        	if(component instanceof HtmlInputText){
            	HtmlInputText htmlComponent = (HtmlInputText) component;
            	htmlComponent.setStyle("border: solid red;");
            }
            FacesMessage message = new FacesMessage();
            message.setSeverity(FacesMessage.SEVERITY_ERROR);
            message.setSummary(" Email nije validan!");
            context.addMessage(component.getId(), message);
            throw new ValidatorException(message);
        }
    }
}
