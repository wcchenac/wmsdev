package com.wmstool.wmstool.models;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
public class ClothInfo {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@OneToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "clothIdentifier_id", nullable = false)
	private ClothIdentifier clothIdentifier;

	private int color;

	@Column(length = 10)
	private String defect;

	private String record;

	private String remark;
	
	private String storedAt;

	@Column(updatable = false)
	@JsonIgnore
	private Date createdAt;

	@JsonIgnore
	private Date updatedAt;

	public ClothInfo() {
	}

	public ClothInfo(ClothIdentifier clothIdentifier, int color, String defect, String record) {
		this.clothIdentifier = clothIdentifier;
		this.color = color;
		this.defect = defect;
		this.record = record;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public ClothIdentifier getClothIdentifier() {
		return clothIdentifier;
	}

	public void setClothIdentifier(ClothIdentifier clothIdentifier) {
		this.clothIdentifier = clothIdentifier;
	}

	public int getColor() {
		return color;
	}

	public void setColor(int color) {
		this.color = color;
	}

	public String getDefect() {
		return defect;
	}

	public void setDefect(String defect) {
		this.defect = defect;
	}

	public String getRecord() {
		return record;
	}

	public void setRecord(String record) {
		this.record = record;
	}

	public String getRemark() {
		return remark;
	}

	public void setRemark(String remark) {
		this.remark = remark;
	}
	
	public String getStoredAt() {
		return storedAt;
	}

	public void setStoredAt(String storedAt) {
		this.storedAt = storedAt;
	}

	public Date getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(Date createdAt) {
		this.createdAt = createdAt;
	}

	public Date getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(Date updatedAt) {
		this.updatedAt = updatedAt;
	}

	@PrePersist
	protected void onCreated() {
		this.createdAt = new Date();
	}

	@PreUpdate
	protected void onUpdate() {
		this.updatedAt = new Date();
	}

}
