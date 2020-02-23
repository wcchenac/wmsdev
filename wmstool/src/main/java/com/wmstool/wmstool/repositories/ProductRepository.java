package com.wmstool.wmstool.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.wmstool.wmstool.models.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

	Optional<Product> findByProductNoAndType(String productNo, String type);

	List<Product> findByProductNo(String productNo);

	@Query(nativeQuery = true, value = "Select Distinct productNo From product Order By productNo Asc;")
	List<String> getAllProducts();

}
