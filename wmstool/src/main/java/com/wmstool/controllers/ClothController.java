package com.wmstool.controllers;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wmstool.models.ClothIdentifier;
import com.wmstool.models.ClothIdentifierBacklog;
import com.wmstool.models.ClothInfo;
import com.wmstool.services.ClothService;

@RestController
@RequestMapping("/api/cloth")
public class ClothController {

	@Autowired
	private ClothService clothService;
	
	@PostMapping("/instock/new")
	public ResponseEntity<?> createClothInfo(@Valid @RequestBody ClothIdentifierBacklog backlog) {
		ClothIdentifier result = clothService.createClothIdentifier(backlog);
		return new ResponseEntity<ClothIdentifier> (result, HttpStatus.CREATED);
	}
}
