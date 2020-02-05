package com.wmstool.wmstool.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.wmstool.wmstool.models.OutStockRequest;

@Repository
public interface OutStockRequestRepo
		extends JpaRepository<OutStockRequest, Long>, JpaSpecificationExecutor<OutStockRequest> {

	Optional<OutStockRequest> findByStockIdentifierIdAndIsDeleted(Long stockIdentifierId, boolean deleted);

}
