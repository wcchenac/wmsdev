package com.wmstool.wmstool.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class ClothIdentifierException extends RuntimeException {

	public ClothIdentifierException(String message) {
		super(message);
	}

}
