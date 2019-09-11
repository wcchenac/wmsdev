package com.wmstool.wmstool.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wmstool.wmstool.models.ClothIdentifierBacklog;

@Repository
public interface ClothIdentifierBacklogRepo extends JpaRepository<ClothIdentifierBacklog, Long> {

	Optional<ClothIdentifierBacklog> findByProductNoAndLotNoAndTypeAndLengthAndUnit(String productNo, int lotNo,
			String type, String length, String unit);
}
