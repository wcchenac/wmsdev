package com.wmstool.wmstool.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wmstool.wmstool.models.ProductNoBacklog;

@Repository
public interface ProductNoBacklogRepo extends JpaRepository<ProductNoBacklog, Long> {

	Optional<ProductNoBacklog> findByProductNo(String productNo);

}
