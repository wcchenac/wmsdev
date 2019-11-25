package com.wmstool.wmstool.models;

import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;

@Entity
public class History {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private Long currentIdentifierId;

	private Long[] childrenIdentifierId = new Long[0];

	private Long rootIdentifierId;

	private boolean isRoot = false;

	private boolean isEnd = false;

	@Column(updatable = false)
	private LocalDateTime createdAt;

	private LocalDateTime shrinkedAt;

	public History() {
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getCurrentIdentifierId() {
		return currentIdentifierId;
	}

	public void setCurrentIdentifierId(Long currentIdentifierId) {
		this.currentIdentifierId = currentIdentifierId;
	}

	public Long[] getChildrenIdentifierId() {
		return childrenIdentifierId;
	}

	public void setChildrenIdentifierId(Long[] childrenIdentifierId) {
		this.childrenIdentifierId = childrenIdentifierId;
	}

	public Long getRootIdentifierId() {
		return rootIdentifierId;
	}

	public void setRootIdentifierId(Long rootIdentifierId) {
		this.rootIdentifierId = rootIdentifierId;
	}

	public boolean isRoot() {
		return isRoot;
	}

	public void setRoot(boolean isRoot) {
		this.isRoot = isRoot;
	}

	public boolean isEnd() {
		return isEnd;
	}

	public void setEnd(boolean isEnd) {
		this.isEnd = isEnd;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getShrinkedAt() {
		return shrinkedAt;
	}

	public void setShrinkedAt(LocalDateTime shrinkedAt) {
		this.shrinkedAt = shrinkedAt;
	}

	@PrePersist
	protected void onCreated() {
		this.createdAt = LocalDateTime.now();
	}

	@PreUpdate
	protected void onUpdate() {
		this.shrinkedAt = LocalDateTime.now();
	}

}
