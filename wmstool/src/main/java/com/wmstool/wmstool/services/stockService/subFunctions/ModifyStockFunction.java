package com.wmstool.wmstool.services.stockService.subFunctions;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Query;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.wmstool.wmstool.models.OutStockRequest;
import com.wmstool.wmstool.models.Product;
import com.wmstool.wmstool.models.StockAdjustmentRecord;
import com.wmstool.wmstool.models.StockAllocationRecord;
import com.wmstool.wmstool.models.StockIdentifier;
import com.wmstool.wmstool.models.StockInfo;
import com.wmstool.wmstool.models.TransactionRecord;
import com.wmstool.wmstool.models.payloads.ShipRequest;
import com.wmstool.wmstool.models.payloads.ShrinkStockRequest;
import com.wmstool.wmstool.models.payloads.UpdateInfoRequest;
import com.wmstool.wmstool.repositories.OutStockRequestRepo;
import com.wmstool.wmstool.repositories.StockAdjustmentRecordRepo;
import com.wmstool.wmstool.repositories.StockAllocationRecordRepo;
import com.wmstool.wmstool.repositories.StockIdentifierRepo;
import com.wmstool.wmstool.repositories.StockInfoRepository;
import com.wmstool.wmstool.repositories.TransactionRecordRepo;
import com.wmstool.wmstool.security.UserPrincipal;
import com.wmstool.wmstool.utilities.StockAdjustRecordExcelHelper;
import com.wmstool.wmstool.utilities.StockAllocateRecordExcelHelper;

@Component
public class ModifyStockFunction {

	@Autowired
	@Qualifier("dataDbEntityManagerFactory")
	private EntityManagerFactory emf;

	@Autowired
	private CreateStockFunction createStockFunction;

	@Autowired
	private StockIdentifierRepo stockIdentifierRepo;

	@Autowired
	private StockInfoRepository stockInfoRepository;

	@Autowired
	private OutStockRequestRepo outStockRequestRepo;

	@Autowired
	private TransactionRecordRepo transactionRecordRepo;

	@Autowired
	private StockAllocationRecordRepo stockAllocationRecordRepo;

	@Autowired
	private StockAdjustmentRecordRepo stockAdjustmentRecordRepo;

	@Autowired
	private StockAllocateRecordExcelHelper stockAllocateRecordExcelHelper;

	@Autowired
	private StockAdjustRecordExcelHelper stockAdjustRecordExcelHelper;

	@Autowired
	private StockServiceUtilities stockServiceUtilities;

	/**
	 * Using given information containing in ShipRequest to mark certain
	 * stockIdentifier ship status is true and save a record to
	 * OutStockReqeust/TransactionRecord/Product repository
	 */
	public void letStockIdentifierisShiped(ShipRequest shipRequest) {
		// TODO: data not found exception
		StockIdentifier res = stockIdentifierRepo.findById(shipRequest.getStockIdentifierId()).get();
		StockInfo resInfo = stockInfoRepository.findByStockIdentifierId(res.getId()).get();

		// Create OutStockRequest object, set extra information and save it
		String Editor = ((UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
				.getFullName();
		OutStockRequest outStockRequest = new OutStockRequest(res, resInfo, shipRequest.getReason(), Editor);
		outStockRequest.setOutStockType(0);
		outStockRequestRepo.save(outStockRequest);

		// Update related information in StockIdentifier
		res.setExist(false);
		res.setEliminateType("0");
		res.setEliminateReason(shipRequest.getReason());
		res.setEliminateDate(LocalDate.now().toString());
		res.setOutStock(true);
		res.setOutStockAt(LocalDateTime.now());
		res.setUpdatedBy(Editor);

		// Create TransactionRecord for ship and save it
		TransactionRecord transactionRecord = new TransactionRecord(res, Editor);
		transactionRecord.setOperator("-1");
		transactionRecord.setTransactionType("SPO");
		transactionRecordRepo.save(transactionRecord);

		// Create Product object to update Product quantity in db
		Product p = new Product(res);
		p.setQuantity("-" + p.getQuantity());
		stockServiceUtilities.updateProductQuantity(res.getProductNo(), p);
	}

	/**
	 * Cancel certain stockIdentifier ship process and update the corresponding
	 * OutStockReqeust/TransactionRecord as deleted, update Product repository
	 */
	public void letStockIdentifierisNotShiped(long stockIdentifierId) {
		// TODO: data not found exception
		StockIdentifier resIdentifier = stockIdentifierRepo.findById(stockIdentifierId).get();
		String Editor = ((UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
				.getFullName();

		// Update relative information in StockIdentifier
		resIdentifier.setExist(true);
		resIdentifier.setEliminateType(null);
		resIdentifier.setEliminateReason(null);
		resIdentifier.setEliminateDate(null);
		resIdentifier.setOutStock(false);
		resIdentifier.setOutStockAt(null);
		resIdentifier.setUpdatedBy(Editor);

		// Set relative status in OutStockRequest
		// TODO: data not found exception
		OutStockRequest resOutStockRequest = outStockRequestRepo
				.findByStockIdentifierIdAndIsDeleted(stockIdentifierId, false).get();

		resOutStockRequest.setDeleted(true);
		resOutStockRequest.setUpdatedBy(Editor);

		// Delete TransactionRecord
		// TODO: data not found exception
		transactionRecordRepo.delete(
				transactionRecordRepo.findByStockIdentifierIdAndTransactionType(stockIdentifierId, "SPO").get());

		// Create Product object to update Product quantity in db
		Product p = new Product(resIdentifier);
		stockServiceUtilities.updateProductQuantity(resIdentifier.getProductNo(), p);
	}

	/**
	 * Mark certain stockIdentifier waiting for shrinking process and save a record
	 * to outStockReqeust repository/TransactionRecord/Product repository
	 */
	public String letStockIdentifierWaitToShrinkIsTrue(long stockIdentifierId) {
		// TODO: data not found exception
		StockIdentifier resIdentifier = stockIdentifierRepo.findById(stockIdentifierId).get();
		StockInfo resInfo = stockInfoRepository.findByStockIdentifierId(resIdentifier.getId()).get();
		String Editor = ((UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
				.getFullName();
		OutStockRequest outStockRequest = new OutStockRequest(resIdentifier, resInfo,
				resIdentifier.getType().equals("雜項") ? "分裝" : "減肥", Editor);

		resIdentifier.setWaitToShrink(true);
		resIdentifier.setOutStock(true);
		resIdentifier.setOutStockAt(LocalDateTime.now());
		resIdentifier.setUpdatedBy(Editor);
		// TODO: avoid multiple click

		// Set extra information in OutStockRequest
		outStockRequest.setOutStockType(1);
		outStockRequestRepo.save(outStockRequest);

		return resIdentifier.getProductNo();
	}

	/**
	 * Cancel certain stockIdentifier shrinking process and update the corresponding
	 * outStockRequest record as deleted
	 */
	public void letStockIdentifierWaitToShrinkIsFalse(long stockIdentifierId) {
		// TODO: data not found exception
		StockIdentifier resIdentifier = stockIdentifierRepo.findById(stockIdentifierId).get();

		// Set delete status in OutStockRequest
		OutStockRequest resOutStockRequest = outStockRequestRepo
				.findByStockIdentifierIdAndIsDeleted(stockIdentifierId, false).get();
		String Editor = ((UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
				.getFullName();

		resOutStockRequest.setDeleted(true);
		resOutStockRequest.setUpdatedBy(Editor);

		// Update relative information in StockIdentifier
		resIdentifier.setWaitToShrink(false);
		resIdentifier.setOutStock(false);
		resIdentifier.setOutStockAt(null);
		resIdentifier.setUpdatedBy(Editor);
	}

	/**
	 * Update certain StockInfo contents
	 */
	public String updateStockInfo(UpdateInfoRequest updateInfoRequest) {
		// TODO: data not found exception
		StockInfo res = stockInfoRepository.findById(updateInfoRequest.getId()).get();

		if (res.getColor() != updateInfoRequest.getColor()) {
			res.setColor(updateInfoRequest.getColor());
		}
		if (!res.getDefect().equals(updateInfoRequest.getDefect())) {
			res.setDefect(updateInfoRequest.getDefect());
		}
		if (res.getRecord() == null) {
			res.setRecord(updateInfoRequest.getRecord());
		} else {
			if (!res.getRecord().equals(updateInfoRequest.getRecord()))
				res.setRecord(updateInfoRequest.getRecord());
		}
		if (!res.getRemark().equals(updateInfoRequest.getRemark())) {
			res.setRemark(updateInfoRequest.getRemark());
		}

		String Editor = ((UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
				.getFullName();
		res.setUpdatedBy(Editor);

		return res.getStockIdentifier().getProductNo();
	}

	/**
	 * Using given information containing in ShrinkStockRequest to update old
	 * StockIdentifier and create new StockIdentifier/StockInfo
	 */
	public void shrinkStock(ShrinkStockRequest shrinkStockRequest) throws IOException {
		LocalDate now = LocalDate.now();
		float allocation = shrinkStockRequest.getAllocation();
		float adjustment = shrinkStockRequest.getAdjustment();
		String allocationString = String.format("%.2f", allocation);
		String adjustmentString = String.format("%.2f", adjustment);

		// find old stockIdentifier, and set to not exist
		// TODO: data not found exception
		StockIdentifier oldIdentifier = stockIdentifierRepo.findById(shrinkStockRequest.getOldStockIdentifierId())
				.get();
		String Editor = ((UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
				.getFullName();

		oldIdentifier.setExist(false);
		oldIdentifier.setEliminateType("1");
		oldIdentifier.setEliminateDate(LocalDate.now().toString());
		oldIdentifier.setEliminateReason("減肥");
		oldIdentifier.setAdjustment(adjustmentString);
		oldIdentifier.setUpdatedBy(Editor);

		// Create TransactionRecord for oldStock shrink and save it
		TransactionRecord transactionRecord = new TransactionRecord(oldIdentifier, Editor);

		transactionRecord.setOperator("-1");
		transactionRecord.setTransactionType("SKO");

		transactionRecordRepo.save(transactionRecord);

		String productNo = oldIdentifier.getProductNo();
		String unit = oldIdentifier.getUnit();

		// Create Product object to update Product quantity in db
		Product p = new Product(oldIdentifier);
		p.setQuantity("-" + p.getQuantity());
		stockServiceUtilities.updateProductQuantity(productNo, p);

		// Then batch create new stockInfo for offspring
		createStockFunction.createStockInfoes(shrinkStockRequest.getInStockRequests());

		// Create StockAllocationRecord object
		// and output to record file when allocation != 0
		if (allocation != 0) {
			String unitReference = productBaseUnitRetrieve(productNo);

			// Create StockAllocationRecord, and save
			StockAllocationRecord stockAllocationRecord = new StockAllocationRecord(productNo, unit);

			stockAllocationRecord.setQuantity(allocationString);
			stockAllocationRecord.setIssuedByStockIdentifier(oldIdentifier.getId());

			// If oldIdentifier unit != unitReference, do quantity conversion
			if (unitReference.equals(unit)) {
				stockAllocationRecord.setRealQuantity(allocationString);
			} else {
				stockAllocationRecord.setRealQuantity(String.format("%.2f", allocation * 3.0));
			}

			stockAllocationRecordRepo.save(stockAllocationRecord);

			// Output to file
			String allocationFileName = stockAllocateRecordExcelHelper.createNewFile(now);
			stockAllocateRecordExcelHelper.modifyExisting(stockAllocationRecord, now, allocationFileName);
		}

		// Create StockAdjustmentRecord object
		// and output to record file when adjustment != 0
		if (adjustment != 0) {
			String unitReference = productBaseUnitRetrieve(productNo);

			// Create StocAdjustmnetRecord, and save
			StockAdjustmentRecord stockAdjustmentRecord = new StockAdjustmentRecord(productNo, unit);

			stockAdjustmentRecord.setQuantity(adjustmentString);
			stockAdjustmentRecord.setIssuedByStockIdentifier(oldIdentifier.getId());

			// If oldIdentifier unit != unitReference, do quantity conversion
			if (unitReference.equals(unit)) {
				stockAdjustmentRecord.setRealQuantity(adjustmentString);
			} else {
				stockAdjustmentRecord.setRealQuantity(String.format("%.2f", adjustment * 3.0));
			}

			stockAdjustmentRecordRepo.save(stockAdjustmentRecord);

			// Output to file
			String adjustmentFileName = stockAdjustRecordExcelHelper.createNewFile(now);
			stockAdjustRecordExcelHelper.modifyExisting(stockAdjustmentRecord, now, adjustmentFileName);
		}
	}

	/**
	 * Retrieve certain product base unit from 2nd db
	 */
	private String productBaseUnitRetrieve(String productNo) {
		String queryProductInfoSQLStatement = "SELECT UNIT FROM dbo.PRODUCT WHERE CODE=?1";
		EntityManager em = emf.createEntityManager();
		Query q = em.createNativeQuery(queryProductInfoSQLStatement);

		q.setParameter(1, productNo);

		// The format of q.getResultList() is : { Row n : [UNIT] }
		return stockServiceUtilities.unitMappingHelper(q.getResultList().get(0).toString());
	}

}
