package com.wmstool.wmstool.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wmstool.wmstool.models.History;

@Repository
public interface HistoryRepository extends JpaRepository<History, Long> {

	Optional<History> findByCurrentIdentifierId(long id);

	List<History> findByRootIdentifierId(long id);

	void deleteByCurrentIdentifierId(long id);

}
