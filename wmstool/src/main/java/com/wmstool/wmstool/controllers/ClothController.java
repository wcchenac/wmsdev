package com.wmstool.wmstool.controllers;

import java.util.List;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wmstool.wmstool.models.ClothInfo;
import com.wmstool.wmstool.models.OutStockRequest;
import com.wmstool.wmstool.models.payloads.HandleListResponse;
import com.wmstool.wmstool.models.payloads.InStockRequest;
import com.wmstool.wmstool.models.payloads.ShipRequest;
import com.wmstool.wmstool.models.payloads.ShrinkStockRequest;
import com.wmstool.wmstool.services.ClothService;
import com.wmstool.wmstool.services.MapValidationErrorService;

@Validated
@RestController
@RequestMapping("/api/cloth")
@CrossOrigin
public class ClothController {

	@Autowired
	private ClothService clothService;

	/*
	@Autowired
	private MapValidationErrorService mapErrorService;
	 */
	// To be deprecated
	/*
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
	*/

	// Test
	@PostMapping("/inStocks")
	public ResponseEntity<?> createClothInfoes(@RequestBody List<@Valid InStockRequest> inStockRequests) {
//		List<ClothInfo> result = clothService.createClothInfoes(inStockRequests);
		clothService.createClothInfoes(inStockRequests);
//		return new ResponseEntity<List<ClothInfo>>(result, HttpStatus.CREATED);
		return new ResponseEntity<>(HttpStatus.CREATED);
	}
	// Test

	@GetMapping("/queryStock/{productNo}")
	public List<ClothInfo> getClothInfoList(@PathVariable String productNo) {
		return clothService.findClothInfoByProductNo(productNo);
	}

	
	// Test
	@PostMapping("/shrinkStock")
	public ResponseEntity<?> shrinkCloth(@RequestBody ShrinkStockRequest shrinkStockRequest){
		clothService.shrinkCloth(shrinkStockRequest);
		
		return new ResponseEntity<>(HttpStatus.ACCEPTED);
	}
	// Test
	
	//To be deprecated
	@PatchMapping("/purgeStock/{clothIdentifierId}")
	public ResponseEntity<?> letClothIndentifierNotExist(@PathVariable long clothIdentifierId) {
		clothService.letClothIdentifierNotExist(clothIdentifierId);
		
		return new ResponseEntity<>(HttpStatus.ACCEPTED);
	}

	@PatchMapping("/shipStock")
	public ResponseEntity<?> letClothIndentifierIsShiped(@Valid @RequestBody ShipRequest shipRequest) {
		clothService.letClothIdentifierisShiped(shipRequest);
		
		return new ResponseEntity<>(HttpStatus.ACCEPTED);
	}

	@PatchMapping("/rollback/shipStock/{clothIdentifierId}")
	public ResponseEntity<?> letClothIndentifierisNotShiped(@PathVariable long clothIdentifierId) {
		clothService.letClothIdentifierisNotShiped(clothIdentifierId);
		
		return new ResponseEntity<>(HttpStatus.ACCEPTED);
	}

	@GetMapping("/queryStock/shrinkList")
	public List<ClothInfo> getShrinkList() {
		return clothService.getWaitToShrinkList();
	}

	@PatchMapping("/waitToShrink/{clothIdentifierId}")
	public ResponseEntity<?> letClothIdentifierWaitToShrinkIsTrue(@PathVariable long clothIdentifierId) {
		return new ResponseEntity<String>(clothService.letClothIdentifierWaitToShrinkIsTrue(clothIdentifierId),
				HttpStatus.ACCEPTED);
	}

	@PatchMapping("/rollback/waitToShrink/{clothIdentifierId}")
	public ResponseEntity<?> letClothIdentifierWaitToShrinkIsFalse(@PathVariable long clothIdentifierId) {
		clothService.letClothIdentifierWaitToShrinkIsFalse(clothIdentifierId);
		
		return new ResponseEntity<>(HttpStatus.ACCEPTED);
	}

	/*
	@GetMapping("/queryStock/waitHandleList")
	public ResponseEntity<?> getOutStockWaitHandleList() {
		Calendar cal = Calendar.getInstance();
		cal.clear();
		cal.set(2019, 8, 26);

		return new ResponseEntity<List<ClothIdentifier>>(clothService.getOutStockWaitHandleList(true, cal.getTime()),
				HttpStatus.OK);
	}
	*/
	
	@GetMapping("/queryStock/waitHandleList/basic")
	public ResponseEntity<?> getOutStockWaitHandleList() {
		return new ResponseEntity<HandleListResponse>(clothService.getOutStockWaitHandleList(),HttpStatus.OK);
	}
	
	@GetMapping("/queryStock/waitHandleList/interval/{start}&{end}")
	public ResponseEntity<?> getOutStockWaitHandleListwithInterval(@PathVariable String start, @PathVariable String end) {
		return new ResponseEntity<HandleListResponse>(clothService.getOutStockWaitHandleListWithTimeInterval(start, end),HttpStatus.OK);
	}
	
	@PostMapping("/outStock")
	public ResponseEntity<?> requestForOutStock(@RequestBody OutStockRequest outStockRequest) {
		return new ResponseEntity<OutStockRequest>(clothService.createOutStockRequest(outStockRequest), HttpStatus.OK);
	}
}
