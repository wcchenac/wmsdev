package com.wmstool.wmstool.models.payloads;

import javax.validation.constraints.NotBlank;

public class RegisterRequest {

	@NotBlank(message = "EmployeeId is required")
	private String employeeId;

	@NotBlank(message = "Please enter your fullName")
	private String fullName;

	@NotBlank(message = "Password is required")
	private String password;

	private String confirmPassword;

	@NotBlank(message = "Role is required")
	private String role;

	public String getEmployeeId() {
		return employeeId;
	}

	public void setEmployeeId(String employeeId) {
		this.employeeId = employeeId;
	}

	public String getFullName() {
		return fullName;
	}

	public void setFullName(String fullName) {
		this.fullName = fullName;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getConfirmPassword() {
		return confirmPassword;
	}

	public void setConfirmPassword(String confirmPassword) {
		this.confirmPassword = confirmPassword;
	}

	public String getRole() {
		return role;
	}

	public void setRole(String role) {
		this.role = role;
	}

}
