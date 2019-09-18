package com.wmstool.wmstool.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wmstool.wmstool.models.ClothInfo;

@Repository
public interface ClothInfoRepository extends JpaRepository<ClothInfo, Long> {

	ClothInfo findByClothIdentifierId(long id);
}
