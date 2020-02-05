package com.wmstool.wmstool.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wmstool.wmstool.models.StockIdentifierBacklog;

@Repository
public interface StockIdentifierBacklogRepo extends JpaRepository<StockIdentifierBacklog, Long> {

	Optional<StockIdentifierBacklog> findByProductNoAndLotNoAndTypeAndQuantityAndUnit(String productNo, String lotNo,
			String type, String quantity, String unit);

}
