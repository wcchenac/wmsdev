package com.wmstool.wmstool.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.wmstool.wmstool.models.StockIdentifier;

@Repository
public interface StockIdentifierRepo
		extends JpaRepository<StockIdentifier, Long>, JpaSpecificationExecutor<StockIdentifier> {

	Optional<List<StockIdentifier>> findByProductNoAndIsExist(String productNo, boolean isExist);

	Optional<List<StockIdentifier>> findByWaitToShrinkAndIsExist(boolean waitToShrink, boolean isExist);

}
