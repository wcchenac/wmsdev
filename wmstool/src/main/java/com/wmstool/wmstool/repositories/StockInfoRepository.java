package com.wmstool.wmstool.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wmstool.wmstool.models.StockInfo;

@Repository
public interface StockInfoRepository extends JpaRepository<StockInfo, Long> {

	Optional<StockInfo> findByStockIdentifierId(Long stockIdentifierId);

	void deleteByStockIdentifierId(Long stockIdentifierId);

}
