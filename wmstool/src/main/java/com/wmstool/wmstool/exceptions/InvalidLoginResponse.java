package com.wmstool.wmstool.exceptions;

public class InvalidLoginResponse {

	private String username;
	private String password;

	public InvalidLoginResponse() {
		this.username = "無效的員工編號";
		this.password = "無效的密碼";
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

}
