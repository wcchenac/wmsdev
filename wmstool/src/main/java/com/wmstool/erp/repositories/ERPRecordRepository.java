package com.wmstool.erp.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wmstool.erp.models.ERPRecord;

@Repository
public interface ERPRecordRepository extends JpaRepository<ERPRecord, Long> {

	Optional<ERPRecord> findByInStockRequestNo(String inStockRequestNo);

}
