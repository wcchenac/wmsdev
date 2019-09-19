package com.wmstool.wmstool.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wmstool.wmstool.models.history.History;

@Repository
public interface HistoryRepository extends JpaRepository<History, Long> {

	Optional<History> findByCurrentId(long id);

}
