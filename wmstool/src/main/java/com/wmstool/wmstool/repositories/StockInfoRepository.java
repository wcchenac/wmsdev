package com.wmstool.wmstool.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.wmstool.wmstool.models.StockInfo;

@Repository
public interface StockInfoRepository extends JpaRepository<StockInfo, Long>, JpaSpecificationExecutor<StockInfo> {

	Optional<StockInfo> findByStockIdentifierId(Long stockIdentifierId);

	List<StockInfo> findByStockIdentifierProductNo(String productNo);

	void deleteByStockIdentifierId(Long stockIdentifierId);

}
