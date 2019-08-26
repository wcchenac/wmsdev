package com.wmstool.models;

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
public class ClothRecord {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@JsonIgnore
	private long id;

	@OneToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "clothInfo_id", nullable = false, updatable = false)
	@JsonIgnore
	private ClothInfo clothInfo;

	private String record;

	private String remark;

	@Column(updatable = false)
	@JsonIgnore
	private Date createdAt;

	@JsonIgnore
	private Date updatedAt;

	public ClothRecord() {
	}

	public ClothRecord(String record, String remark) {
		this.record = record;
		this.remark = remark;
	}

	public ClothRecord(ClothRecord clothRecord, ClothInfo clothInfo) {
		this.clothInfo = clothInfo;
		this.record = clothRecord.getRecord();
		this.remark = clothRecord.getRemark();
	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public ClothInfo getClothInfo() {
		return clothInfo;
	}

	public void setClothInfo(ClothInfo clothInfo) {
		this.clothInfo = clothInfo;
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
