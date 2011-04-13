package org.qaf.waf.validate;

import javax.faces.component.UIComponent;
import javax.faces.context.FacesContext;
import javax.faces.convert.Converter;

import org.apache.commons.lang.StringUtils;

public class NullConverter implements Converter{

	public static final String NULL = "-[NULL]-";

	public Object getAsObject(FacesContext arg0, UIComponent arg1, String value) {
		if(StringUtils.isEmpty(value)){
            return NULL;
        }
		return value;
	}

	public String getAsString(FacesContext arg0, UIComponent arg1, Object value) {
		if(value==null){
            return "";
        }
		return value.toString();
	}

}
