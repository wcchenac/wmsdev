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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.wmstool.wmstool.models.OutStockRequest;
import com.wmstool.wmstool.models.StockInfo;
import com.wmstool.wmstool.models.payloads.InStockRequest;
import com.wmstool.wmstool.models.payloads.OutStockUpdateRequest;
import com.wmstool.wmstool.models.payloads.ShipRequest;
import com.wmstool.wmstool.models.payloads.ShrinkStockRequest;
import com.wmstool.wmstool.models.payloads.UpdateInfoRequest;
import com.wmstool.wmstool.services.StockService;
import com.wmstool.wmstool.utilities.HistoryTreeNode;

@Validated
@RestController
@RequestMapping("/api/stock")
@CrossOrigin
public class StockController {

	@Autowired
	private StockService stockService;

	@GetMapping("/queryOrder/{orderType}/{orderNo}")
	public ResponseEntity<?> getOrderContent(@PathVariable(value = "orderType") String orderType,
			@PathVariable(value = "orderNo") String orderNo) {
		final String OrderType_InStock = "inStock";
		final String OrderType_Assemble = "assemble";

		switch (orderType) {
		case OrderType_InStock:
			return new ResponseEntity<>(stockService.queryInStockOrder(orderNo), HttpStatus.OK);
		case OrderType_Assemble:
			return new ResponseEntity<>(stockService.queryAssembleOrder(orderNo), HttpStatus.OK);
		default:
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	@PostMapping("/inStocks")
	public ResponseEntity<?> createStockInfoes(@RequestBody List<@Valid InStockRequest> inStockRequests) {
		stockService.createStockInfoes(inStockRequests);

		return new ResponseEntity<>(HttpStatus.OK);
	}

	@PatchMapping("/updateStock")
	public ResponseEntity<?> updateStockInfo(@RequestBody UpdateInfoRequest updateInfoRequest) {
		return new ResponseEntity<>(stockService.updateStockInfo(updateInfoRequest), HttpStatus.OK);
	}

	@GetMapping("/queryStock/query/{productNo}/basic")
	public ResponseEntity<?> getStockInfoListBasic(@PathVariable String productNo) {
		return new ResponseEntity<>(stockService.findBasicStockInfoByProductNo(productNo.toUpperCase()), HttpStatus.OK);
	}

	@GetMapping("/queryStock/query/{productNo}")
	public ResponseEntity<?> getStockInfoList(@PathVariable String productNo) {
		return new ResponseEntity<>(stockService.findStockInfoByProductNo(productNo.toUpperCase()), HttpStatus.OK);
	}

	@PostMapping("/shrinkStock")
	public ResponseEntity<?> shrinkStock(@RequestBody ShrinkStockRequest shrinkStockRequest) {
		try {
			stockService.shrinkStock(shrinkStockRequest);

			return new ResponseEntity<>(HttpStatus.OK);

		} catch (Exception e) {
			System.out.println(e.getMessage());
			e.printStackTrace();
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	@PatchMapping("/shipStock")
	public ResponseEntity<?> letStockIndentifierIsShiped(@Valid @RequestBody ShipRequest shipRequest) {
		stockService.letStockIdentifierisShiped(shipRequest);

		return new ResponseEntity<>(HttpStatus.OK);
	}

	@PatchMapping("/shipStock/rollback/{stockIdentifierId}")
	public ResponseEntity<?> letStockIndentifierisNotShiped(@PathVariable long stockIdentifierId) {
		stockService.letStockIdentifierisNotShiped(stockIdentifierId);

		return new ResponseEntity<>(HttpStatus.OK);
	}

	@GetMapping("/queryStock/shrinkList")
	public List<StockInfo> getShrinkList() {
		return stockService.getWaitToShrinkList();
	}

	@PatchMapping("/waitToShrink/{stockIdentifierId}")
	public ResponseEntity<?> letStockIdentifierWaitToShrinkIsTrue(@PathVariable long stockIdentifierId) {
		return new ResponseEntity<>(stockService.letStockIdentifierWaitToShrinkIsTrue(stockIdentifierId),
				HttpStatus.OK);
	}

	@PatchMapping("/waitToShrink/rollback/{stockIdentifierId}")
	public ResponseEntity<?> letStockIdentifierWaitToShrinkIsFalse(@PathVariable long stockIdentifierId) {
		stockService.letStockIdentifierWaitToShrinkIsFalse(stockIdentifierId);

		return new ResponseEntity<>(HttpStatus.OK);
	}

	@GetMapping("/outStock/waitHandleList/basic")
	public ResponseEntity<?> getOutStockWaitHandleList() {
		return new ResponseEntity<>(stockService.getOutStockWaitHandleList(), HttpStatus.OK);
	}

	@GetMapping("/outStock/waitHandleList/interval")
	public ResponseEntity<?> getOutStockWaitHandleListwithInterval(@RequestParam(value = "startDate") String start,
			@RequestParam(value = "endDate") String end) {
		return new ResponseEntity<>(stockService.getOutStockWaitHandleListWithTimeInterval(start, end), HttpStatus.OK);
	}

	@PostMapping("/outStock")
	public ResponseEntity<?> requestForOutStock(@RequestBody OutStockRequest outStockRequest) {
		return new ResponseEntity<>(stockService.createOutStockRequest(outStockRequest), HttpStatus.OK);
	}

	@PatchMapping("/outStock/rollback/{outStockRequestId}")
	public ResponseEntity<?> deleteOutStockRequest(@PathVariable long outStockRequestId) {
		stockService.deleteOutStockRequest(outStockRequestId);

		return new ResponseEntity<>(HttpStatus.OK);
	}

	@PatchMapping("/outStock/update")
	public ResponseEntity<?> updateOutStockRequest(@RequestBody OutStockUpdateRequest outStockUpdateRequest) {
		try {
			stockService.updateOutStockRequest(outStockUpdateRequest);

			return new ResponseEntity<>(HttpStatus.OK);

		} catch (Exception e) {
			System.out.println(e.getMessage());
			e.printStackTrace();
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	@GetMapping("/queryStock/history/{productNo}")
	public ResponseEntity<?> getHistoryTree(@PathVariable String productNo,
			@RequestParam(value = "startDate") String start, @RequestParam(value = "endDate") String end) {
		return new ResponseEntity<List<HistoryTreeNode>>(
				stockService.findPeriodStockIdentifierHistory(productNo.toUpperCase(), start, end), HttpStatus.OK);
	}

	@GetMapping("/stockManagement/dailyCompare")
	public void dailyStockComparison() {
		try {
			stockService.stockComparisonByTransactionRecord();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	@GetMapping("/test")
	public void test() {
		try {
			stockService.stockFullyComparison();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

}
