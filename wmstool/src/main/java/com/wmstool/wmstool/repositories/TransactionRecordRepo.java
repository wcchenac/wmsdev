package com.wmstool.wmstool.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.wmstool.wmstool.models.TransactionRecord;

@Repository
public interface TransactionRecordRepo
		extends JpaRepository<TransactionRecord, Long>, JpaSpecificationExecutor<TransactionRecord> {

	Optional<TransactionRecord> findByStockIdentifierIdAndTransactionType(Long stockIdentifierId,
			String transactionType);

}
