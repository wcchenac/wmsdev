package com.wmstool.wmstool.exceptions;

import java.util.HashMap;
import java.util.Map;

import javax.validation.ConstraintViolationException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@RestControllerAdvice
public class CustomResponseEntityExceptionHandler extends ResponseEntityExceptionHandler {

	
	//Deprecated due to Controller annotation @Validated
	@ExceptionHandler
	public final ResponseEntity<Object> handleInStockRequestException(InStockRequestException ex, WebRequest request) {
		InStockRequestExceptionResponse exceptionResponse = new InStockRequestExceptionResponse(ex.getMessage());
		System.out.println(ex.getMessage());
		return new ResponseEntity<Object>(exceptionResponse, HttpStatus.BAD_REQUEST);
	}

	@ExceptionHandler
	public final ResponseEntity<Object> handleConstraintViolationException(ConstraintViolationException ex,
			WebRequest request) {

		Map<String, String> errorMap = new HashMap<>();
		String[] firstSplit = ex.getMessage().split(",");

		for (String s : firstSplit) {
			String[] secondSplit = s.split(": ");

			errorMap.put(secondSplit[0].split("\\.", 2)[1], secondSplit[1]);
		}

		return new ResponseEntity<Object>(errorMap, HttpStatus.BAD_REQUEST);

	}

}
