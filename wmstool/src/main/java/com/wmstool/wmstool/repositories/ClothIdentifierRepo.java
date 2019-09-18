package com.wmstool.wmstool.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wmstool.wmstool.models.ClothIdentifier;

@Repository
public interface ClothIdentifierRepo extends JpaRepository<ClothIdentifier, Long> {

	Optional<List<ClothIdentifier>> findByProductNoAndIsExist(String productNo, boolean isExist);
	
}
