package org.qaf.waf.ui;

import java.util.ArrayList;


public class InputFieldManager {

    private ArrayList<InputField> fields = new ArrayList<InputField>();

    public InputFieldManager() {
        fields.add(new InputField("Name:", ""));
        fields.add(new InputField("Address:", ""));
        fields.add(new InputField("Phone:", ""));
        fields.add(new InputField("Email:", ""));
        fields.add(new InputField("City:", ""));
        fields.add(new InputField("Province/State:", ""));
        fields.add(new InputField("Postal/Zip Code:", ""));
     }

     public ArrayList getFields(){
        return fields;
    }

     public String register(){
         return "success";
     }

     public String back(){
         return "back";
     }

}
