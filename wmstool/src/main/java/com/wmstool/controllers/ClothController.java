package com.wmstool.controllers;

import java.util.List;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wmstool.models.ClothInfo;
import com.wmstool.models.payloads.InStockRequest;
import com.wmstool.services.ClothService;
import com.wmstool.services.MapValidationErrorService;

@RestController
@RequestMapping("/api/cloth")
@CrossOrigin
public class ClothController {

	@Autowired
	private ClothService clothService;

	@Autowired
	private MapValidationErrorService mapErrorService;

	@PostMapping("/inStock")
	public ResponseEntity<?> createClothInfo(@Valid @RequestBody InStockRequest inStockRequest,
			BindingResult bindingResult) {
		ResponseEntity<?> errorMap = mapErrorService.mapValidationService(bindingResult);

		if (errorMap != null) {
			return errorMap;
		}

		ClothInfo result = clothService.createClothInfo(inStockRequest, inStockRequest.getIsNew());
		return new ResponseEntity<ClothInfo>(result, HttpStatus.CREATED);
	}

	@GetMapping("/queryStock/{productNo}")
	public List<ClothInfo> getClothInfos(@PathVariable String productNo) {
		return clothService.findClothInfoByProductNo(productNo.toUpperCase());
	}

	@PatchMapping("/purgeStock/{clothIdentifierId}")
	public void purgeClothIndentifierNotExist(@PathVariable long clothIdentifierId) {
		clothService.letClothIdentifierNotExist(clothIdentifierId);
	}
	
	@PatchMapping("/shipStock/{clothIdentifierId}")
	public void purgeClothIndentifierIsShiped(@PathVariable long clothIdentifierId) {
		clothService.letClothIdentifierNotExist(clothIdentifierId);
		clothService.letClothIdentifierisShiped(clothIdentifierId);
	}
}
