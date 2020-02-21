package com.wmstool.wmstool.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wmstool.wmstool.models.TransactionRecord;

@Repository
public interface TransactionRecordRepo extends JpaRepository<TransactionRecord, Long> {

	Optional<TransactionRecord> findByStockIdentifierIdAndTransactionType(Long stockIdentifierId,
			String transactionType);

	void deleteByStockIdentifierIdAndTransactionType(Long stockIdentifierId, String transactionType);

	List<TransactionRecord> findTop5ByProductNoAndTransactionTypeOrderByCreatedAtDesc(String productNo,
			String transactionType);

}
