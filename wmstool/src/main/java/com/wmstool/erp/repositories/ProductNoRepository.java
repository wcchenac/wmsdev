package com.wmstool.ERP.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wmstool.ERP.models.ProductNo;

@Repository
public interface ProductNoRepository extends JpaRepository<ProductNo, Long> {

	Optional<ProductNo> findByProductNo(String productNo);
}
