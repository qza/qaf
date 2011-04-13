package org.qaf.waf.util;

import java.text.MessageFormat;
import java.util.Locale;
import java.util.MissingResourceException;
import java.util.ResourceBundle;

/**
 * @author Qza
 *
 */
public class ResourceUtil {

	protected static ClassLoader getCurrentClassLoader(Object defaultObject) {
		ClassLoader loader = Thread.currentThread().getContextClassLoader();
		if (loader == null)
			loader = defaultObject.getClass().getClassLoader();
		return loader;
	}

	public static String getMessageResourceString(String bundleName,
			String key, Object params[], Locale locale, boolean returnSourceIfNotFound) {
		String text = null;
		ResourceBundle bundle = ResourceBundle.getBundle(bundleName, locale,
				getCurrentClassLoader(params));
		try {
			text = bundle.getString(key);
		} catch (MissingResourceException e) {
			if(returnSourceIfNotFound) return key;
			text = "?? key " + key + " not found ??";
		}
		if (params != null) {
			MessageFormat mf = new MessageFormat(text, locale);
			text = mf.format(params, new StringBuffer(), null).toString();
		}
		return text;
	}

}
