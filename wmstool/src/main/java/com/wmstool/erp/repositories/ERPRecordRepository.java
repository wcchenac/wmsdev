package com.wmstool.ERP.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wmstool.ERP.models.ERPRecord;

@Repository
public interface ERPRecordRepository extends JpaRepository<ERPRecord, Long> {

	Optional<ERPRecord> findByInStockRequestNo(String inStockRequestNo);

}
