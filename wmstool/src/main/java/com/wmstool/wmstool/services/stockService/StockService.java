package com.wmstool.wmstool.services.stockService;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.List;
import java.util.Map;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wmstool.wmstool.models.History;
import com.wmstool.wmstool.models.OutStockRequest;
import com.wmstool.wmstool.models.StockInfo;
import com.wmstool.wmstool.models.payloads.HandleListResponse;
import com.wmstool.wmstool.models.payloads.InStockRequest;
import com.wmstool.wmstool.models.payloads.OutStockUpdateRequest;
import com.wmstool.wmstool.models.payloads.ProductInformation;
import com.wmstool.wmstool.models.payloads.QueryOrderResponse;
import com.wmstool.wmstool.models.payloads.QueryProductNoResponse;
import com.wmstool.wmstool.models.payloads.ShipRequest;
import com.wmstool.wmstool.models.payloads.ShrinkStockRequest;
import com.wmstool.wmstool.models.payloads.UpdateInfoRequest;
import com.wmstool.wmstool.services.stockService.subFunctions.CompareStockFunction;
import com.wmstool.wmstool.services.stockService.subFunctions.CreateStockFunction;
import com.wmstool.wmstool.services.stockService.subFunctions.DeleteStockFunction;
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
	private DeleteStockFunction deleteStockFunction;

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
	 * Return a response of 'OutStockToStore' order content fetching from second db
	 */
	public List<ProductInformation> queryOutStockToStoreOrder(String outStockToStoreOrderNo) {
		return queryOrderFunction.queryOutStockToStoreOrder(outStockToStoreOrderNo);
	}

	/**
	 * Save inStockRequest in List as StockInfo/InStockOrderRecord to first db
	 */
	public void createStockInfoes(List<InStockRequest> inStockRequests) {
		createStockFunction.createStockInfoes(inStockRequests);
	}

	/**
	 * Update certain StockInfo contents
	 */
	public String updateStockInfo(UpdateInfoRequest updateInfoRequest) {
		return modifyStockFunction.updateStockInfo(updateInfoRequest);
	}

	/**
	 * Collect all inStockRecord with certain orderType/orderNo, and return result
	 * with structure {productNo: StockInfo list}
	 */
	public Map<String, List<StockInfo>> getInStockRollbackList(String orderType, String orderNo) {
		return queryStockFunction.getInStockRollbackList(orderType, orderNo);
	}

	/**
	 * Delete related
	 * StockIdentifier/StockIdentifierInfo/InStockRecord/TransactionRecord/History
	 */
	public void inStockRollback(List<Long> identifierIdList) {
		deleteStockFunction.rollbackInStock(identifierIdList);
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
	 * first db and current total quantity
	 */
	public QueryProductNoResponse findDetailStockInfoByProductNo(String productNo) {
		return queryStockFunction.findDetailStockInfoByProductNo(productNo);
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
	 * Using given information containing in ShipRequest list to mark certain
	 * stockIdentifier ship status is true and save a record to
	 * OutStockReqeust/TransactionRecord/Product repository
	 */
	public void letStockIdentifiersAreShiped(List<ShipRequest> shipRequests) {
		modifyStockFunction.letStockIdentifiersAreShiped(shipRequests);
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
	 * Return the last 5 shrink HistoryTreeNode with given productNo
	 */
	public List<HistoryTreeNode> getShrinkRollbackList(String productNo) {
		return queryStockFunction.findByPeriodTransactionRecord(productNo);
	}

	/**
	 * Delete related
	 * StockIdentifier/StockIdentifierInfo/TransactionRecord/AdjustmentRecord/AllocationRecord/History
	 */
	public void rollbackShrinkStock(long stockIdentifierId) {
		deleteStockFunction.rollbackShrink(stockIdentifierId);
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
	 * Daily stock comparison between 2 databases
	 */
	public void stockFullyComparison() throws IOException {
		compareStockFunction.stockFullyComparison();
	}

	/**
	 * Weekly sync product category from 2nd DB to 1st DB
	 */
	public void syncProductCategory() {
		compareStockFunction.syncProductCategory();
	}

	/**
	 * Return a response containing all category in designed structure
	 */
	public List<Map<String, String>> getAllCategory() {
		return queryStockFunction.getAllCategory();
	}

	/**
	 * Collect all stock by certain category and output to an excel file
	 */
	public void collectCategoyDetails(String category) throws FileNotFoundException, IOException {
		queryStockFunction.findCategoryDetails(category);
	}

	public History updateById(Long id) {
		return queryStockFunction.findById(id);
	}

	public History findById(Long id) {
		return queryStockFunction.updateById(id);
	}
}
