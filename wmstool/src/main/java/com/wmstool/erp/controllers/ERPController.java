package com.wmstool.erp.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wmstool.erp.models.ERPRecord;
import com.wmstool.erp.models.ProductNo;
import com.wmstool.erp.services.ERPService;

@RestController
@RequestMapping("/api/erp")
@CrossOrigin
public class ERPController {

	@Autowired
	private ERPService erpService;

	@GetMapping("/queryERPRecord/{inStockRequestNo}")
	public ResponseEntity<?> getERPRecord(@PathVariable String inStockRequestNo) {
		ERPRecord res = erpService.findInStockRequestNo(inStockRequestNo);
		return new ResponseEntity<ERPRecord>(res, HttpStatus.OK);
	}

	@PostMapping("/addERPRecord")
	public ResponseEntity<?> addERPRecord(@RequestBody ERPRecord erpRecord) {
		ERPRecord res = erpService.createERPRecord(erpRecord);
		return new ResponseEntity<ERPRecord>(res, HttpStatus.CREATED);
	}

	@PostMapping("/addProductNo/{productNo}")
	public ResponseEntity<?> addProductNo(@PathVariable String productNo) {
		ProductNo res = erpService.createProductNo(new ProductNo(productNo));
		return new ResponseEntity<ProductNo>(res, HttpStatus.CREATED);
	}

}
