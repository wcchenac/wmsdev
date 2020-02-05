package com.wmstool.wmstool.services.stockService;

import java.io.IOException;
import java.util.List;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wmstool.wmstool.models.OutStockRequest;
import com.wmstool.wmstool.models.StockInfo;
import com.wmstool.wmstool.models.payloads.HandleListResponse;
import com.wmstool.wmstool.models.payloads.InStockRequest;
import com.wmstool.wmstool.models.payloads.OutStockUpdateRequest;
import com.wmstool.wmstool.models.payloads.QueryOrderResponse;
import com.wmstool.wmstool.models.payloads.QueryProductNoResponse;
import com.wmstool.wmstool.models.payloads.ShipRequest;
import com.wmstool.wmstool.models.payloads.ShrinkStockRequest;
import com.wmstool.wmstool.models.payloads.UpdateInfoRequest;
import com.wmstool.wmstool.services.stockService.subFunctions.CompareStockFunction;
import com.wmstool.wmstool.services.stockService.subFunctions.CreateStockFunction;
import com.wmstool.wmstool.services.stockService.subFunctions.ModifyStockFunction;
import com.wmstool.wmstool.services.stockService.subFunctions.OutStockRequestFunction;
import com.wmstool.wmstool.services.stockService.subFunctions.QueryOrderFunction;
import com.wmstool.wmstool.services.stockService.subFunctions.QueryStockFunction;
import com.wmstool.wmstool.utilities.HistoryTreeNode;

@Service
@Transactional
public class StockService {

	@Autowired
	private QueryOrderFunction queryOrderFunction;

	@Autowired
	private QueryStockFunction queryStockFunction;

	@Autowired
	private ModifyStockFunction modifyStockFunction;

	@Autowired
	private CreateStockFunction createStockFunction;

	@Autowired
	private OutStockRequestFunction outStockRequestFunction;

	@Autowired
	private CompareStockFunction compareStockFunction;

	/**
	 * Return a response containing current 'in-stock' order content fetching from
	 * second db and previous process records fetching from first db
	 */
	public QueryOrderResponse queryInStockOrder(String inStockOrderNo) {
		return queryOrderFunction.queryInStockOrder(inStockOrderNo);
	}

	/**
	 * Return a response containing current 'assemble' order content fetching from
	 * second db and previous process records fetching from first db
	 */
	public QueryOrderResponse queryAssembleOrder(String assembleOrderNo) {
		return queryOrderFunction.queryAssembleOrder(assembleOrderNo);
	}

	/**
	 * Return a response containing current 'customer return' order content fetching
	 * from second db and previous process records fetching from first db
	 */
	public QueryOrderResponse queryCustomerReturnOrder(String returnOrderNo) {
		return queryOrderFunction.queryCustomerReturnOrder(returnOrderNo);
	}

	/**
	 * Return a response containing current 'store return' order content fetching
	 * from second db and previous process records fetching from first db
	 */
	public QueryOrderResponse queryStoreReturnOrder(String returnOrderNo) {
		return queryOrderFunction.queryStoreReturnOrder(returnOrderNo);
	}

	/**
	 * Save inStockRequest in List as StockInfo/InStockOrderRecord to first db
	 */
	public List<StockInfo> createStockInfoes(List<InStockRequest> inStockRequests) {
		return createStockFunction.createStockInfoes(inStockRequests);
	}

	/**
	 * Update certain StockInfo contents
	 */
	public String updateStockInfo(UpdateInfoRequest updateInfoRequest) {
		return modifyStockFunction.updateStockInfo(updateInfoRequest);
	}

	/**
	 * Return a response containing 'less' information for certain productNo
	 * fetching from second db and a list of StockInfoes with certain productNo
	 * fetching from first db
	 */
	public QueryProductNoResponse findBasicStockInfoByProductNo(String productNo) {
		return queryStockFunction.findBasicStockInfoByProductNo(productNo);
	}

	/**
	 * Return a response containing information for certain productNo fetching from
	 * second db and a list of StockInfoes with certain productNo fetching from
	 * first db
	 */
	public QueryProductNoResponse findStockInfoByProductNo(String productNo) {
		return queryStockFunction.findStockInfoByProductNo(productNo);
	}

	/**
	 * Return a response containing information for certain productNo fetching from
	 * second db and a list of StockInfoes with certain productNo fetching from
	 * first db and current total quantity
	 */
	public QueryProductNoResponse findStockInfoByProductNoWithQuantity(String productNo) {
		return queryStockFunction.findStockInfoByProductNoWithQuantity(productNo);
	}

	/**
	 * Using given information containing in ShipRequest to mark certain
	 * stockIdentifier ship status is true and save a record to
	 * OutStockReqeust/TransactionRecord/Product repository
	 */
	public void letStockIdentifierisShiped(ShipRequest shipRequest) {
		modifyStockFunction.letStockIdentifierisShiped(shipRequest);
	}

	/**
	 * Cancel certain stockIdentifier ship process and update the corresponding
	 * OutStockReqeust/TransactionRecord as deleted, update Product repository
	 */
	public void letStockIdentifierisNotShiped(long stockIdentifierId) {
		modifyStockFunction.letStockIdentifierisNotShiped(stockIdentifierId);
	}

	/**
	 * Fetch a list of StockInfo assigned to shrinking process
	 */
	public List<StockInfo> getWaitToShrinkList() {
		return queryStockFunction.getWaitToShrinkList();
	}

	/**
	 * Mark certain stockIdentifier waiting for shrinking process and save a record
	 * to outStockReqeust repository/TransactionRecord/Product repository
	 */
	public String letStockIdentifierWaitToShrinkIsTrue(long stockIdentifierId) {
		return modifyStockFunction.letStockIdentifierWaitToShrinkIsTrue(stockIdentifierId);
	}

	/**
	 * Cancel certain stockIdentifier shrinking process and update the corresponding
	 * outStockRequest record as deleted
	 */
	public void letStockIdentifierWaitToShrinkIsFalse(long stockIdentifierId) {
		modifyStockFunction.letStockIdentifierWaitToShrinkIsFalse(stockIdentifierId);
	}

	/**
	 * Using given information containing in ShrinkStockRequest to update old
	 * StockIdentifier and create new StockIdentifier/StockInfo
	 */
	public void shrinkStock(ShrinkStockRequest shrinkStockRequest) throws IOException {
		modifyStockFunction.shrinkStock(shrinkStockRequest);
	}

	/**
	 * Save a special outStockRequest to repository
	 */
	public OutStockRequest createOutStockRequest(OutStockRequest outStockRequest) {
		return outStockRequestFunction.createOutStockRequest(outStockRequest);
	}

	/**
	 * Delete method for special outStockRequest
	 */
	public void deleteOutStockRequest(long outStockRequestId) {
		outStockRequestFunction.deleteOutStockRequest(outStockRequestId);
	}

	/**
	 * Return a response containing a list of waitHandle records created at 'today'
	 * in outStockRequest repository and a list of create users collected in
	 * previous list
	 */
	public HandleListResponse getOutStockWaitHandleList() {
		return outStockRequestFunction.getOutStockWaitHandleList();
	}

	/**
	 * Return a response containing a list of waitHandle records created between
	 * 'start' and 'end' in outStockRequest repository and a list of create users
	 * collected in previous list
	 */
	public HandleListResponse getOutStockWaitHandleListWithTimeInterval(String start, String end) {
		return outStockRequestFunction.getOutStockWaitHandleListWithTimeInterval(start, end);
	}

	/**
	 * Update outStockRequest using given outStockUpdateRequest, and create excel at
	 * server for user download
	 */
	public void updateOutStockRequest(OutStockUpdateRequest outStockUpdateRequest) throws IOException {
		outStockRequestFunction.updateOutStockRequest(outStockUpdateRequest);
	}

	/**
	 * Based on each start StockIdentifier, collect process histories from
	 * InStock(Start) to Shrink/Ship(End) with a certain productNo in a period time,
	 * and return the result list with a hierarchical structure
	 */
	public List<HistoryTreeNode> findPeriodStockIdentifierHistory(String productNo, String start, String end) {
		return queryStockFunction.findPeriodStockIdentifierHistory(productNo, start, end);
	}

	/**
	 * Daily stock comparison between 2 databases based on TransactionRecord
	 */
	public void stockComparisonByTransactionRecord() throws IOException {
		compareStockFunction.stockComparisonByTransactionRecord();
	}

	/**
	 * Weakly stock comparison between 2 databases
	 */
	public void stockFullyComparison() throws IOException {
		compareStockFunction.stockFullyComparison();
	}
}
