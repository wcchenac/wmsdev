package com.wmstool.wmstool.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wmstool.wmstool.models.StockAllocationRecord;

@Repository
public interface StockAllocationRecordRepo extends JpaRepository<StockAllocationRecord, Long> {

}
