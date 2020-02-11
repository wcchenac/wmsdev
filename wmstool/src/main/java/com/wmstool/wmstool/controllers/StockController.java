package com.wmstool.wmstool.controllers;

import java.util.List;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
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
import com.wmstool.wmstool.services.stockService.StockService;
import com.wmstool.wmstool.utilities.HistoryTreeNode;

@Validated
@RestController
@RequestMapping("/api/stock")
@CrossOrigin
public class StockController {

	@Autowired
	private StockService stockService;

	@PreAuthorize("hasAnyRole('ROLE_Operator','ROLE_Admin')")
	@GetMapping("/queryOrder/{orderType}/{orderNo}")
	public ResponseEntity<?> getOrderContent(@PathVariable(value = "orderType") String orderType,
			@PathVariable(value = "orderNo") String orderNo) {
		final String OrderType_InStock = "inStock";
		final String OrderType_Assemble = "assemble";
		final String OrderType_CustomerReturn = "customerReturn";
		final String OrderType_StoreReturn = "storeReturn";

		switch (orderType) {
		case OrderType_InStock:
			return new ResponseEntity<>(stockService.queryInStockOrder(orderNo), HttpStatus.OK);
		case OrderType_Assemble:
			return new ResponseEntity<>(stockService.queryAssembleOrder(orderNo), HttpStatus.OK);
		case OrderType_CustomerReturn:
			return new ResponseEntity<>(stockService.queryCustomerReturnOrder(orderNo), HttpStatus.OK);
		case OrderType_StoreReturn:
			return new ResponseEntity<>(stockService.queryStoreReturnOrder(orderNo), HttpStatus.OK);
		default:
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	@PreAuthorize("hasAnyRole('ROLE_Operator','ROLE_Admin')")
	@PostMapping("/inStocks")
	public ResponseEntity<?> createStockInfoes(@RequestBody List<@Valid InStockRequest> inStockRequests) {
		try {
			stockService.createStockInfoes(inStockRequests);

			return new ResponseEntity<>(HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();

			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	// TODO: rollbackInStock
	@PreAuthorize("hasAnyRole('ROLE_Admin')")
	@DeleteMapping("/inStocks/rollback")
	public ResponseEntity<?> rollbackInStock(@RequestParam(value = "id") long stockIdentifier) {
		return null;
	}

	@PreAuthorize("hasAnyRole('ROLE_Operator','ROLE_Admin')")
	@PatchMapping("/updateStock")
	public ResponseEntity<?> updateStockInfo(@RequestBody UpdateInfoRequest updateInfoRequest) {
		return new ResponseEntity<>(stockService.updateStockInfo(updateInfoRequest), HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_Normal','ROLE_Operator','ROLE_Admin')")
	@GetMapping("/queryStock/query/2/{productNo}")
	public ResponseEntity<?> getStockInfoListBasic(@PathVariable String productNo) {
		return new ResponseEntity<>(stockService.findBasicStockInfoByProductNo(productNo.toUpperCase()), HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_Sales','ROLE_Operator','ROLE_Admin')")
	@GetMapping("/queryStock/query/1/{productNo}")
	public ResponseEntity<?> getStockInfoList(@PathVariable String productNo) {
		return new ResponseEntity<>(stockService.findStockInfoByProductNoWithQuantity(productNo.toUpperCase()),
				HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_Operator','ROLE_Admin')")
	@PostMapping("/shrinkStock")
	public ResponseEntity<?> shrinkStock(@RequestBody ShrinkStockRequest shrinkStockRequest) {
		try {
			stockService.shrinkStock(shrinkStockRequest);

			return new ResponseEntity<>(HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();

			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	@PreAuthorize("hasAnyRole('ROLE_Operator','ROLE_Admin')")
	@PatchMapping("/shipStock")
	public ResponseEntity<?> letStockIndentifierIsShiped(@Valid @RequestBody ShipRequest shipRequest) {
		stockService.letStockIdentifierisShiped(shipRequest);

		return new ResponseEntity<>(HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_Operator','ROLE_Admin')")
	@PatchMapping("/shipStock/rollback/{stockIdentifierId}")
	public ResponseEntity<?> letStockIndentifierisNotShiped(@PathVariable long stockIdentifierId) {
		stockService.letStockIdentifierisNotShiped(stockIdentifierId);

		return new ResponseEntity<>(HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_Operator','ROLE_Admin')")
	@GetMapping("/queryStock/shrinkList")
	public List<StockInfo> getShrinkList() {
		return stockService.getWaitToShrinkList();
	}

	@PreAuthorize("hasAnyRole('ROLE_Operator','ROLE_Admin')")
	@PatchMapping("/waitToShrink/{stockIdentifierId}")
	public ResponseEntity<?> letStockIdentifierWaitToShrinkIsTrue(@PathVariable long stockIdentifierId) {
		return new ResponseEntity<>(stockService.letStockIdentifierWaitToShrinkIsTrue(stockIdentifierId),
				HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_Operator','ROLE_Admin')")
	@PatchMapping("/waitToShrink/rollback/{stockIdentifierId}")
	public ResponseEntity<?> letStockIdentifierWaitToShrinkIsFalse(@PathVariable long stockIdentifierId) {
		stockService.letStockIdentifierWaitToShrinkIsFalse(stockIdentifierId);

		return new ResponseEntity<>(HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_Operator','ROLE_Admin')")
	@GetMapping("/outStock/waitHandleList/basic")
	public ResponseEntity<?> getOutStockWaitHandleList() {
		return new ResponseEntity<>(stockService.getOutStockWaitHandleList(), HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_Operator','ROLE_Admin')")
	@GetMapping("/outStock/waitHandleList/interval")
	public ResponseEntity<?> getOutStockWaitHandleListwithInterval(@RequestParam(value = "startDate") String start,
			@RequestParam(value = "endDate") String end) {
		return new ResponseEntity<>(stockService.getOutStockWaitHandleListWithTimeInterval(start, end), HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_Operator','ROLE_Admin')")
	@PostMapping("/outStock")
	public ResponseEntity<?> requestForOutStock(@RequestBody OutStockRequest outStockRequest) {
		return new ResponseEntity<>(stockService.createOutStockRequest(outStockRequest), HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_Operator','ROLE_Admin')")
	@PatchMapping("/outStock/rollback/{outStockRequestId}")
	public ResponseEntity<?> deleteOutStockRequest(@PathVariable long outStockRequestId) {
		stockService.deleteOutStockRequest(outStockRequestId);

		return new ResponseEntity<>(HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_Operator','ROLE_Admin')")
	@PatchMapping("/outStock/update")
	public ResponseEntity<?> updateOutStockRequest(@RequestBody OutStockUpdateRequest outStockUpdateRequest) {
		try {
			stockService.updateOutStockRequest(outStockUpdateRequest);

			return new ResponseEntity<>(HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();

			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	@PreAuthorize("hasAnyRole('ROLE_Operator','ROLE_Admin')")
	@GetMapping("/queryStock/history/{productNo}")
	public ResponseEntity<?> getHistoryTree(@PathVariable String productNo,
			@RequestParam(value = "startDate") String start, @RequestParam(value = "endDate") String end) {
		return new ResponseEntity<List<HistoryTreeNode>>(
				stockService.findPeriodStockIdentifierHistory(productNo.toUpperCase(), start, end), HttpStatus.OK);
	}

	@GetMapping("/stockManagement/daily/stockCompare")
	public ResponseEntity<?> dailyStockComparison() {
		try {
			stockService.stockFullyComparison();

			return new ResponseEntity<>(HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();

			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	@GetMapping("/stockManagement/weekly/syncProductCategory")
	public ResponseEntity<?> syncProductCategory() {
		try {
			stockService.syncProductCategory();

			return new ResponseEntity<>(HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();

			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}
}
