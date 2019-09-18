package com.wmstool.wmstool.controllers.history;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wmstool.wmstool.services.HistoryService;

@RestController
@RequestMapping("/api/cloth/history")
@CrossOrigin
public class HistoryController {

	@Autowired
	private HistoryService historyService;

	@GetMapping("/{id}")
	public ResponseEntity<?> getHistory(@PathVariable Long id) {
		return historyService.createHistoryTree(id);
	}
}
