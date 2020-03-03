package com.wmstool.wmstool.services.stockService.subFunctions;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.persistence.criteria.Predicate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.wmstool.wmstool.models.History;
import com.wmstool.wmstool.models.Product;
import com.wmstool.wmstool.models.StockAdjustmentRecord;
import com.wmstool.wmstool.models.StockAllocationRecord;
import com.wmstool.wmstool.models.StockIdentifier;
import com.wmstool.wmstool.repositories.HistoryRepository;
import com.wmstool.wmstool.repositories.StockAdjustmentRecordRepo;
import com.wmstool.wmstool.repositories.StockAllocationRecordRepo;
import com.wmstool.wmstool.repositories.StockIdentifierRepo;
import com.wmstool.wmstool.repositories.StockInfoRepository;
import com.wmstool.wmstool.repositories.TransactionRecordRepo;
import com.wmstool.wmstool.security.UserPrincipal;
import com.wmstool.wmstool.utilities.StockAdjustRecordExcelHelper;
import com.wmstool.wmstool.utilities.StockAllocateRecordExcelHelper;

@Component
public class DeleteStockFunction {

	@Autowired
	private StockIdentifierRepo stockIdentifierRepo;

	@Autowired
	private StockInfoRepository stockInfoRepository;

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

	@Autowired
	private HistoryRepository historyRepository;

//	public boolean rollbackInStock(long stockIdentifierId) {
//		Optional<StockInfo> resInfo = stockInfoRepository.findByStockIdentifierId(stockIdentifierId);
//		Optional<TransactionRecord> resTrans = transactionRecordRepo.findByStockIdentifierId(stockIdentifierId);
//		Optional<InStockOrderRecord> resInStockOrder = inStockOrderRepo.findByStockIdentifierId(stockIdentifierId);
//		Optional<StockIdentifier> resIdentifier = stockIdentifierRepo.findById(stockIdentifierId);
//
//		if (resInfo.isPresent() && resTrans.isPresent() && resInStockOrder.isPresent() && resIdentifier.isPresent()) {
//			stockInfoRepository.deleteByStockIdentifierId(stockIdentifierId);
//			transactionRecordRepo.deleteByStockIdentifierId(stockIdentifierId);
//			inStockOrderRepo.deleteByStockIdentifierId(stockIdentifierId);
//			stockIdentifierRepo.deleteById(stockIdentifierId);
//
//			// TODO: history rollback
//
//			Product p = new Product(resIdentifier.get());
//
//			p.setQuantity("-" + p.getQuantity());
//
//			stockServiceUtilities.updateProductQuantity(p.getProductNo(), p);
//
//			return true;
//		} else {
//			return false;
//		}
//	}

	// TODO: roll-back shrink process
	public boolean rollbackShrink(long oldStockIdentifierId) {
		try {
			Map<String, Map<String, Map<String, String>>> productResult = new HashMap<>();
			String Editor = ((UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
					.getFullName();

			History oldHistory = historyRepository.findByCurrentIdentifierId(oldStockIdentifierId).get();
			Long[] childrenIdentifiers = oldHistory.getChildrenIdentifierId();

			// roll-back old history information
			oldHistory.setChildrenIdentifierId(new Long[0]);

			// delete children history
			for (long id : childrenIdentifiers) {
				historyRepository.deleteByCurrentIdentifierId(id);
			}

			// delete transaction records/allocation records/adjustment records
			long oldTRId = transactionRecordRepo.findByStockIdentifierIdAndTransactionType(oldStockIdentifierId, "SKO")
					.get().getId();
			transactionRecordRepo.deleteById(oldTRId);

			stockAllocationRecordRepo.deleteByIssuedByTransactionRecord(oldTRId);
			stockAdjustmentRecordRepo.deleteByIssuedByTransactionRecord(oldTRId);

			for (long id : childrenIdentifiers) {
				// TODO : data not found
				transactionRecordRepo.deleteByStockIdentifierIdAndTransactionType(id, "SKI");
			}

			// delete children stockInfo
			for (long id : childrenIdentifiers) {
				stockInfoRepository.deleteByStockIdentifierId(id);
			}

			// delete children stockIdentifier and update Product quantity
			// and roll-back oldIdentifier information
			// children identifiers decreasing quantity
			for (long id : childrenIdentifiers) {
				StockIdentifier res = stockIdentifierRepo.findById(id).get();

				res.setQuantity("-" + res.getQuantity());

				Product p = new Product(res);

				stockServiceUtilities.contentCollector(p, productResult);

				stockIdentifierRepo.deleteById(id);
			}

			StockIdentifier res = stockIdentifierRepo.findById(oldStockIdentifierId).get();

			stockServiceUtilities.rollbackIdentifierInfo("shrink", res, Editor);

			Product p = new Product(res);

			stockServiceUtilities.contentCollector(p, productResult);

			stockServiceUtilities.updateProductQuantityWithList(productResult);

			generateNewFile();

			return true;
		} catch (Exception e) {
			e.printStackTrace();

			return false;
		}
	}

	private void generateNewFile() throws IOException {
		LocalDate now = LocalDate.now();
		LocalDateTime startTime = LocalDateTime.of(now, LocalTime.MIN);
		LocalDateTime endTime = LocalDateTime.of(now, LocalTime.MAX);

		String allocationFileName = stockAllocateRecordExcelHelper.deleteAndCreateNewFile(now);
		String adjustmentFileName = stockAdjustRecordExcelHelper.deleteAndCreateNewFile(now);

		Specification<StockAllocationRecord> alloSpecification = (Specification<StockAllocationRecord>) (root, query,
				criteriaBuilder) -> {
			Predicate[] predicates = new Predicate[1];

			predicates[0] = criteriaBuilder.between(root.get("createdAt"), startTime, endTime);

			query.orderBy(criteriaBuilder.asc(root.get("createdAt")));

			return criteriaBuilder.and(predicates);
		};

		Specification<StockAdjustmentRecord> adjSpecification = (Specification<StockAdjustmentRecord>) (root, query,
				criteriaBuilder) -> {
			Predicate[] predicates = new Predicate[1];

			predicates[0] = criteriaBuilder.between(root.get("createdAt"), startTime, endTime);

			query.orderBy(criteriaBuilder.asc(root.get("createdAt")));

			return criteriaBuilder.and(predicates);
		};

		List<StockAllocationRecord> resultOfAllo = stockAllocationRecordRepo.findAll(alloSpecification);
		List<StockAdjustmentRecord> resultOfAdj = stockAdjustmentRecordRepo.findAll(adjSpecification);

		stockAllocateRecordExcelHelper.modifyExisting(resultOfAllo, now, allocationFileName);
		stockAdjustRecordExcelHelper.modifyExisting(resultOfAdj, now, adjustmentFileName);
	}
}
