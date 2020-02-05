package com.wmstool.erp.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wmstool.erp.models.ProductNo;

@Repository
public interface ProductNoRepository extends JpaRepository<ProductNo, Long> {

	Optional<ProductNo> findByProductNo(String productNo);
}
