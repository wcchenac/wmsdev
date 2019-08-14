package com.wmstool.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.wmstool.models.ClothIdentifier;

public interface ClothIdentifierRepo extends JpaRepository<ClothIdentifier, Long> {

}
