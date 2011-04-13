package org.qaf.security;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import org.apache.catalina.util.HexUtils;

public class QafDigest {

	static MessageDigest md = null;

	public QafDigest() {
		this("MD5");
	}

	public static void main(String[] args){
		String str = "zoran123";
		QafDigest dig = new QafDigest();
		String crypted = dig.digest(str);
		System.out.println("String " + str + " has crypted value: " + crypted);
	}

	public QafDigest(String digest) {
		try {
			md = MessageDigest.getInstance(digest);
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
			try {
				md = MessageDigest.getInstance("MD5");
			} catch (NoSuchAlgorithmException ew) {
				ew.printStackTrace();
			}
		}
	}

	public static String digestDefault(String credentials) {
		return new QafDigest().digest(credentials);
	}

	/**
	 * Digest function from Tomcat.
	 */
	public String digest(String credentials) {
		if (md == null) {
			return credentials;
		}

		synchronized (this) {
			try {
				md.reset();
				md.update(credentials.getBytes());
				return (HexUtils.convert(md.digest()));
			} catch (Exception e) {
				e.printStackTrace();
				return credentials;
			}
		}
	}
}
