package com.wmstool.wmstool.services.stockService.subFunctions;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.wmstool.wmstool.models.History;
import com.wmstool.wmstool.models.InStockOrderRecord;
import com.wmstool.wmstool.models.Product;
import com.wmstool.wmstool.models.StockIdentifier;
import com.wmstool.wmstool.models.StockIdentifierBacklog;
import com.wmstool.wmstool.models.StockInfo;
import com.wmstool.wmstool.models.TransactionRecord;
import com.wmstool.wmstool.models.payloads.InStockRequest;
import com.wmstool.wmstool.repositories.HistoryRepository;
import com.wmstool.wmstool.repositories.InStockOrderRepo;
import com.wmstool.wmstool.repositories.StockIdentifierBacklogRepo;
import com.wmstool.wmstool.repositories.StockIdentifierRepo;
import com.wmstool.wmstool.repositories.StockInfoRepository;
import com.wmstool.wmstool.repositories.TransactionRecordRepo;
import com.wmstool.wmstool.security.UserPrincipal;

@Component
public class CreateStockFunction {

	@Autowired
	private StockIdentifierBacklogRepo stockIdentifierBacklogRepo;

	@Autowired
	private StockIdentifierRepo stockIdentifierRepo;

	@Autowired
	private StockInfoRepository stockInfoRepository;

	@Autowired
	private InStockOrderRepo inStockOrderRepo;

	@Autowired
	private TransactionRecordRepo transactionRecordRepo;

	@Autowired
	private HistoryRepository historyRepository;

	@Autowired
	private StockServiceUtilities stockServiceUtilities;

	private final String InStockType_Normal = "normal";
	private final String InStockType_Assemble = "assemble";
	private final String InStockType_Shrink = "shrink";
	private final String InStockType_CustomerReturn = "customerReturn";
	private final String InStockType_StoreReturn = "storeReturn";
	private final String InStockType_FileImport = "fileImport";

	/**
	 * Save inStockRequest in List as StockInfo/InStockOrderRecord to first db
	 */
	public List<StockInfo> createStockInfoes(List<InStockRequest> inStockRequests) {
		List<StockInfo> resultList = new ArrayList<>();
		Map<String, Map<String, Map<String, String>>> productResult = new HashMap<>();

		for (InStockRequest isr : inStockRequests) {
			History oldHistory = new History();
			History newHistory = new History();

			// Unit conversion
			InStockRequest inStockRequest = quantityConvertor(isr);
			String condition = inStockRequest.getInStockType();

			// find stockIdentifierBacklog is exist or not; if not exist, create new
			StockIdentifierBacklog resStockIdentifierBacklog = stockIdentifierBacklogRepo
					.findByProductNoAndLotNoAndTypeAndQuantityAndUnit(inStockRequest.getProductNo(),
							inStockRequest.getLotNo(), inStockRequest.getType(), inStockRequest.getQuantity(),
							inStockRequest.getUnit())
					.orElseGet(() -> stockIdentifierBacklogRepo.save(new StockIdentifierBacklog(inStockRequest)));

			// use stockIdentifierBacklog to create stockIdentifier
			String Editor = ((UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
					.getFullName();
			StockIdentifier stockIdentifier = new StockIdentifier(resStockIdentifierBacklog, Editor);

			// increase serialotNo in stockIdentifierBacklog
			int newSerialNo = resStockIdentifierBacklog.getSerialNo() + 1;
			resStockIdentifierBacklog.setSerialNo(newSerialNo);

			// identify condition to set firstInStockAt/inStockType
			switch (condition) {
			case InStockType_Normal:
				stockIdentifier.setFirstInStockAt(LocalDate.now().toString());
				stockIdentifier.setInStockType("進貨單");
				break;
			case InStockType_Assemble:
				stockIdentifier.setFirstInStockAt(LocalDate.now().toString());
				stockIdentifier.setInStockType("組裝單");
				break;
			case InStockType_CustomerReturn:
				stockIdentifier.setFirstInStockAt(LocalDate.now().toString());
				stockIdentifier.setInStockType("退貨單");
				break;
			case InStockType_StoreReturn:
				stockIdentifier.setFirstInStockAt(LocalDate.now().toString());
				stockIdentifier.setInStockType("調撥單");
				break;
			case InStockType_FileImport:
				stockIdentifier.setFirstInStockAt(LocalDate.now().toString());
				stockIdentifier.setInStockType("檔案匯入");
				break;
			case InStockType_Shrink:
				// use the data "parentId" from inStockRequest as key to find the parent
				// TODO: data not found exception
				oldHistory = historyRepository.findByCurrentIdentifierId(inStockRequest.getParentId()).get();
				stockIdentifier.setFirstInStockAt(
						stockIdentifierRepo.findById(oldHistory.getRootIdentifierId()).get().getFirstInStockAt());
				stockIdentifier.setInStockType("減肥");
				break;
			default:
				break;
			}

			// save stockIdentifier
			StockIdentifier resIdentifier = stockIdentifierRepo.save(stockIdentifier);

			// history function code start
			long resIdentifierId = resIdentifier.getId();

			// define newHistory or update oldHistory
			newHistory.setCurrentIdentifierId(resIdentifierId);

			switch (condition) {
			case InStockType_Normal:
			case InStockType_Assemble:
			case InStockType_CustomerReturn:
			case InStockType_StoreReturn:
			case InStockType_FileImport:
				newHistory.setRootIdentifierId(resIdentifierId);
				break;
			case InStockType_Shrink:
				// type exchange: array to list
				List<Long> oldChildrenList = Arrays.stream(oldHistory.getChildrenIdentifierId())
						.collect(Collectors.toList());
				oldChildrenList.add(resIdentifierId);

				// type exchange: list to array
				Long[] oldHistoryArr = oldChildrenList.toArray(oldHistory.getChildrenIdentifierId());
				oldHistory.setChildrenIdentifierId(oldHistoryArr);

				// update oldHistory
				historyRepository.save(oldHistory);

				newHistory.setRootIdentifierId(oldHistory.getRootIdentifierId());
				break;
			default:
				break;
			}

			// save newHistory
			historyRepository.save(newHistory);
			// history function code end

			// use stockIdentifier & inStockRequest to create stockInfo, then add into list
			StockInfo result = new StockInfo(resIdentifier, inStockRequest, Editor);
			resultList.add(result);

			// new stock not from InStockType_Shrink should be saved in InStockOrderRepo
			if (!condition.equals(InStockType_Shrink)) {
				inStockOrderRepo.save(new InStockOrderRecord(resIdentifier, inStockRequest, Editor));
			}

			// Create TransactionRecord and save it
			TransactionRecord transactionRecord = new TransactionRecord(resIdentifier, Editor);
			transactionRecord.setOperator("1");

			switch (condition) {
			case InStockType_Normal:
				transactionRecord.setTransactionType("NI");
				break;
			case InStockType_Assemble:
				transactionRecord.setTransactionType("AI");
				break;
			case InStockType_Shrink:
				transactionRecord.setTransactionType("SKI");
				break;
			case InStockType_CustomerReturn:
				transactionRecord.setTransactionType("CRI");
				break;
			case InStockType_StoreReturn:
				transactionRecord.setTransactionType("SRI");
				break;
			case InStockType_FileImport:
				transactionRecord.setTransactionType("FI");
			default:
				break;
			}

			transactionRecordRepo.save(transactionRecord);

			// Create Individual Product object, then add to list
			Product p = new Product(resIdentifier);

			stockServiceUtilities.contentCollector(p, productResult);
		}

		// Accumulate quantity in productList, then create or update Product
		stockServiceUtilities.updateProductQuantityWithList(productResult);

		return stockInfoRepository.saveAll(resultList);
	}

	/**
	 * Unit conversion for InStockRequest(There are some unit having the conversion)
	 */
	private InStockRequest quantityConvertor(InStockRequest inStockRequest) {
		String quantity = inStockRequest.getQuantity();
		String unit = inStockRequest.getUnit();

		switch (unit) {
		case "尺":
			quantity = String.format("%.1f", Double.parseDouble(quantity) / 3.0);
			unit = "碼";
			inStockRequest.setQuantity(quantity);
			inStockRequest.setUnit(unit);

			return inStockRequest;
		case "打":
			quantity = String.format("%d", Integer.parseInt(quantity) * 12);
			unit = "個";
			inStockRequest.setQuantity(quantity);
			inStockRequest.setUnit(unit);

			return inStockRequest;
		default:
			return inStockRequest;
		}
	}

}
