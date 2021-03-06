package com.wmstool.wmstool.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.wmstool.wmstool.models.InStockOrderRecord;

@Repository
public interface InStockOrderRepo
		extends JpaRepository<InStockOrderRecord, Long>, JpaSpecificationExecutor<InStockOrderRecord> {

	List<InStockOrderRecord> findByInStockTypeAndInStockOrderNo(String inStockType, String inStockOrderNo);

	Optional<InStockOrderRecord> findByStockIdentifierId(Long stockIdentifierId);

	void deleteByStockIdentifierId(Long stockIdentifierId);

}
