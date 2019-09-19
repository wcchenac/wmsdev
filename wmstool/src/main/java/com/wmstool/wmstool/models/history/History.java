package com.wmstool.wmstool.models.history;

import java.util.Date;

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

	private Long currentId;

	private Long[] childrenId = new Long[0];

	private Long rootId;

	private boolean isRoot = false;

	private boolean isEnd = false;

	@Column(updatable = false)
	private Date createdAt;

	private Date shrinkedAt;

	public History() {
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getCurrentId() {
		return currentId;
	}

	public void setCurrentId(Long currentId) {
		this.currentId = currentId;
	}

	public Long[] getChildrenId() {
		return childrenId;
	}

	public void setChildrenId(Long[] childrenId) {
		this.childrenId = childrenId;
	}

	public Long getRootId() {
		return rootId;
	}

	public void setRootId(Long rootId) {
		this.rootId = rootId;
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

	public Date getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(Date createdAt) {
		this.createdAt = createdAt;
	}

	public Date getShrinkedAt() {
		return shrinkedAt;
	}

	public void setShrinkedAt(Date shrinkedAt) {
		this.shrinkedAt = shrinkedAt;
	}

	@PrePersist
	protected void onCreated() {
		this.createdAt = new Date();
	}

	@PreUpdate
	protected void onUpdate() {
		this.shrinkedAt = new Date();
	}

}
