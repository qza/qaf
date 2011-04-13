package org.qaf.gen;

import java.io.Writer;

import org.apache.velocity.Template;
import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.Velocity;
import org.apache.velocity.exception.ParseErrorException;
import org.apache.velocity.exception.ResourceNotFoundException;

public class VelocityUtil {

	public static final String PROPERTIES_FILE = "velocity.properties";

	static void init(){
		try {
			Velocity.init(PROPERTIES_FILE);

		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public static void writeTemplate(String templateFile, VelocityContext context,
									   Writer writer){
		Template template =  null;
	    try {
			template = Velocity.getTemplate(templateFile);
			if ( template != null) template.merge(context, writer);
	        writer.flush();
	        writer.close();
	    }
	    catch( ResourceNotFoundException rnfe ) {
	    	rnfe.printStackTrace();
	    }
	    catch( ParseErrorException pee ) {
	        pee.printStackTrace();
	    }
	    catch (Exception e) {
			e.printStackTrace();
		}
	}

}
