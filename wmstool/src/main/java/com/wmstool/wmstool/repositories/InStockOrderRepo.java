package com.wmstool.wmstool.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wmstool.wmstool.models.InStockOrderRecord;

@Repository
public interface InStockOrderRepo extends JpaRepository<InStockOrderRecord, Long>{

	List<InStockOrderRecord> findByInStockOrderNo(String inStockOrderNo);
	
}
