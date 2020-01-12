package com.wmstool.wmstool.models;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class History {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private Long currentIdentifierId;

	private Long[] childrenIdentifierId = new Long[0];

	private Long rootIdentifierId;

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

}
