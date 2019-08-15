package com.wmstool.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.wmstool.models.ClothRecord;

public interface ClothRecordRepository extends JpaRepository<ClothRecord, Long> {

}
