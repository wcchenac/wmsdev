package com.wmstool.wmstool.controllers;

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

import com.wmstool.wmstool.models.ClothInfo;
import com.wmstool.wmstool.models.payloads.InStockRequest;
import com.wmstool.wmstool.models.payloads.ShipRequest;
import com.wmstool.wmstool.services.ClothService;
import com.wmstool.wmstool.services.MapValidationErrorService;

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

		ClothInfo result = clothService.createClothInfo(inStockRequest);
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

	@PatchMapping("/shipStock")
	public void purgeClothIndentifierIsShiped(@Valid @RequestBody ShipRequest shipRequest) {
		clothService.letClothIdentifierisShiped(shipRequest);
	}
}
