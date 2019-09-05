package com.wmstool.wmstool.services;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.validation.BindingResult;

@Service
public class MapValidationErrorService {

	public ResponseEntity<?> mapValidationService(BindingResult result) {
		if(result.hasErrors()) {
			Map<String, String> errorMap = new HashMap<>();
			result.getFieldErrors().stream().forEach(err -> errorMap.put(err.getField(), err.getDefaultMessage()));
			return new ResponseEntity<Map<String, String>> (errorMap, HttpStatus.BAD_REQUEST);
		}	
		return null;
	}

}
