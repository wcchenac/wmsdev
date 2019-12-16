package com.wmstool.wmstool.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wmstool.wmstool.models.StockAdjustmentRecord;

@Repository
public interface StockAdjustmentRecordRepo extends JpaRepository<StockAdjustmentRecord, Long> {

}
