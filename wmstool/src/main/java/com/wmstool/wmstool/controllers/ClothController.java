package com.wmstool.wmstool.controllers;

import java.io.IOException;
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
import com.wmstool.wmstool.models.payloads.OutStockUpdateRequest;
import com.wmstool.wmstool.models.payloads.QueryOrderResponse;
import com.wmstool.wmstool.models.payloads.QueryProductNoResponse;
import com.wmstool.wmstool.models.payloads.ShipRequest;
import com.wmstool.wmstool.models.payloads.ShrinkStockRequest;
import com.wmstool.wmstool.services.ClothService;

@Validated
@RestController
@RequestMapping("/api/cloth")
@CrossOrigin
public class ClothController {

	@Autowired
	private ClothService clothService;

	@GetMapping("/queryInStockOrder/{inStockOrderNo}")
	public ResponseEntity<?> getInStockOrder(@PathVariable String inStockOrderNo) {
		return new ResponseEntity<QueryOrderResponse>(clothService.queryInStockOrder(inStockOrderNo), HttpStatus.OK);
	}

	// Test
//	@GetMapping("/queryAssembleStockOrder/{assembleOrderNo}")
//	public ResponseEntity<?> getAssembleOrderContents(@PathVariable String assembleOrderNo) {
//		return clothService.getAssembleOrderContent(assembleOrderNo);
//	}
	// Test

	@PostMapping("/inStocks")
	public ResponseEntity<?> createClothInfoes(@RequestBody List<@Valid InStockRequest> inStockRequests) {
		clothService.createClothInfoes(inStockRequests);

		return new ResponseEntity<>(HttpStatus.CREATED);
	}

	@GetMapping("/queryStock/{productNo}/basic")
	public ResponseEntity<?> getClothInfoListBasic(@PathVariable String productNo) {
		return new ResponseEntity<QueryProductNoResponse>(
				clothService.findBasicClothInfoByProductNo(productNo.toUpperCase()), HttpStatus.OK);
	}
	
	@GetMapping("/queryStock/{productNo}")
	public ResponseEntity<?> getClothInfoList(@PathVariable String productNo) {
		return new ResponseEntity<QueryProductNoResponse>(
				clothService.findClothInfoByProductNo(productNo.toUpperCase()), HttpStatus.OK);
	}

	@PostMapping("/shrinkStock")
	public ResponseEntity<?> shrinkCloth(@RequestBody ShrinkStockRequest shrinkStockRequest) {
		clothService.shrinkCloth(shrinkStockRequest);

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

	@GetMapping("/outStock/waitHandleList/basic")
	public ResponseEntity<?> getOutStockWaitHandleList() {
		return new ResponseEntity<HandleListResponse>(clothService.getOutStockWaitHandleList(), HttpStatus.OK);
	}

	@GetMapping("/outStock/waitHandleList/interval/{start}&{end}")
	public ResponseEntity<?> getOutStockWaitHandleListwithInterval(@PathVariable String start,
			@PathVariable String end) {
		return new ResponseEntity<HandleListResponse>(
				clothService.getOutStockWaitHandleListWithTimeInterval(start, end), HttpStatus.OK);
	}

	@PostMapping("/outStock")
	public ResponseEntity<?> requestForOutStock(@RequestBody OutStockRequest outStockRequest) {
		return new ResponseEntity<OutStockRequest>(clothService.createOutStockRequest(outStockRequest), HttpStatus.OK);
	}

	@PatchMapping("/rollback/outStock/{outStockRequestId}")
	public ResponseEntity<?> deleteOutStockRequest(@PathVariable long outStockRequestId) {
		clothService.deleteOutStockRequest(outStockRequestId);

		return new ResponseEntity<>(HttpStatus.ACCEPTED);
	}
	
	@PatchMapping("/outStock/update")
	public ResponseEntity<?> updateOutStockRequest(@RequestBody OutStockUpdateRequest outStockUpdateRequest)
			throws IOException {
		try {
			clothService.updateOutStockRequest(outStockUpdateRequest);
			return new ResponseEntity<>(HttpStatus.OK);

		} catch (Exception e) {
			System.out.println(e.getMessage());
			e.printStackTrace();
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

}
