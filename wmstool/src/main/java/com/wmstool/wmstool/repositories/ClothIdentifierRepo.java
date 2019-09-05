package com.wmstool.wmstool.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.wmstool.wmstool.models.ClothIdentifier;

public interface ClothIdentifierRepo extends JpaRepository<ClothIdentifier, Long> {

	Optional<List<ClothIdentifier>> findByProductNoAndIsExist(String productNo, boolean isExist);
}
