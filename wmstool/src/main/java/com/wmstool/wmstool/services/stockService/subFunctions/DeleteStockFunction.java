package com.wmstool.wmstool.services.stockService.subFunctions;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.wmstool.wmstool.models.InStockOrderRecord;
import com.wmstool.wmstool.models.Product;
import com.wmstool.wmstool.models.StockIdentifier;
import com.wmstool.wmstool.models.StockInfo;
import com.wmstool.wmstool.models.TransactionRecord;
import com.wmstool.wmstool.repositories.InStockOrderRepo;
import com.wmstool.wmstool.repositories.StockIdentifierRepo;
import com.wmstool.wmstool.repositories.StockInfoRepository;
import com.wmstool.wmstool.repositories.TransactionRecordRepo;

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
	private StockServiceUtilities stockServiceUtilities;

	public boolean rollbackInStock(long stockIdentifierId) {
		Optional<StockInfo> resInfo = stockInfoRepository.findByStockIdentifierId(stockIdentifierId);
		Optional<TransactionRecord> resTrans = transactionRecordRepo.findByStockIdentifierId(stockIdentifierId);
		Optional<InStockOrderRecord> resInStockOrder = inStockOrderRepo.findByStockIdentifierId(stockIdentifierId);
		Optional<StockIdentifier> resIdentifier = stockIdentifierRepo.findById(stockIdentifierId);

		if (resInfo.isPresent() && resTrans.isPresent() && resInStockOrder.isPresent() && resIdentifier.isPresent()) {
			stockInfoRepository.deleteByStockIdentifierId(stockIdentifierId);
			transactionRecordRepo.deleteByStockIdentifierId(stockIdentifierId);
			inStockOrderRepo.deleteByStockIdentifierId(stockIdentifierId);
			stockIdentifierRepo.deleteById(stockIdentifierId);

			// TODO: history rollback

			Product p = new Product(resIdentifier.get());

			p.setQuantity("-" + p.getQuantity());

			stockServiceUtilities.updateProductQuantity(p.getProductNo(), p);

			return true;
		} else {
			return false;
		}
	}

	// TODO: rollback shrink
	public boolean rollbackShrink() {
		return false;
	}
}
