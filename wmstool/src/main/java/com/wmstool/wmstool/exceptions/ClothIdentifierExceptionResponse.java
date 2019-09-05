package com.wmstool.wmstool.exceptions;

public class ClothIdentifierExceptionResponse {

	private String clothIdentifier;

	public ClothIdentifierExceptionResponse(String clothIdentifier) {
		this.clothIdentifier = clothIdentifier;
	}

	public String getClothIdentifier() {
		return clothIdentifier;
	}

	public void setClothIdentifier(String clothIdentifier) {
		this.clothIdentifier = clothIdentifier;
	}

}
