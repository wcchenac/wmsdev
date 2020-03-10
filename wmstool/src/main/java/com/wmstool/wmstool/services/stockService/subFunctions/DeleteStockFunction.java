package com.wmstool.wmstool.services.stockService.subFunctions;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import javax.persistence.criteria.Predicate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.wmstool.wmstool.models.History;
import com.wmstool.wmstool.models.InStockOrderRecord;
import com.wmstool.wmstool.models.Product;
import com.wmstool.wmstool.models.StockAdjustmentRecord;
import com.wmstool.wmstool.models.StockAllocationRecord;
import com.wmstool.wmstool.models.StockIdentifier;
import com.wmstool.wmstool.models.StockInfo;
import com.wmstool.wmstool.models.TransactionRecord;
import com.wmstool.wmstool.repositories.HistoryRepository;
import com.wmstool.wmstool.repositories.InStockOrderRepo;
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
	private InStockOrderRepo inStockOrderRepo;

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

	/**
	 * Take in identifier list to roll-back inStock process
	 */
	public boolean rollbackInStock(List<Long> stockIdentifierIdList) {
		try {
			Map<String, Map<String, Map<String, String>>> productResult = new HashMap<>();

			for (long stockIdentifierId : stockIdentifierIdList) {
				Optional<StockInfo> resInfo = stockInfoRepository.findByStockIdentifierId(stockIdentifierId);
				Optional<TransactionRecord> resTrans = transactionRecordRepo
						.findByStockIdentifierIdAndOperator(stockIdentifierId, "1");
				Optional<InStockOrderRecord> resInStockOrder = inStockOrderRepo
						.findByStockIdentifierId(stockIdentifierId);
				Optional<StockIdentifier> resIdentifier = stockIdentifierRepo.findById(stockIdentifierId);
				Optional<History> resHistory = historyRepository.findByCurrentIdentifierId(stockIdentifierId);

				if (resInfo.isPresent() && resTrans.isPresent() && resInStockOrder.isPresent()
						&& resIdentifier.isPresent() && resHistory.isPresent()) {
					stockInfoRepository.deleteByStockIdentifierId(stockIdentifierId);
					transactionRecordRepo.deleteByStockIdentifierIdAndOperator(stockIdentifierId, "1");
					inStockOrderRepo.deleteByStockIdentifierId(stockIdentifierId);
					stockIdentifierRepo.deleteById(stockIdentifierId);
					historyRepository.deleteByCurrentIdentifierId(stockIdentifierId);

					Product p = new Product(resIdentifier.get());

					p.setQuantity("-" + p.getQuantity());

					stockServiceUtilities.contentCollector(p, productResult);
				} else {
					throw new Exception("Data error! Some necessary data are not found");
				}
			}

			stockServiceUtilities.updateProductQuantityWithList(productResult);

			return true;
		} catch (Exception e) {
			e.printStackTrace();

			return false;
		}
	}

	/**
	 * Take in certain identifierId to roll-back shrink process
	 */
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

	/**
	 * Re-generate allocation/adjustment record files
	 */
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
