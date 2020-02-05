package com.wmstool.wmstool.models;

import java.time.LocalDateTime;

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
import com.wmstool.wmstool.models.payloads.InStockRequest;
import com.wmstool.wmstool.models.payloads.UpdateInfoRequest;

@Entity
public class StockInfo {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@OneToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "stockIdentifier_id", nullable = false, updatable = false)
	private StockIdentifier stockIdentifier;

	private int color;

	@Column(length = 10)
	private String defect;

	private String record;

	private String remark;

	private String storedAt;

	@Column(updatable = false)
	@JsonIgnore
	private LocalDateTime createdAt;

	@JsonIgnore
	private LocalDateTime updatedAt;

	@JsonIgnore
	private String createdBy;

	@JsonIgnore
	private String updatedBy;

	public StockInfo() {
	}

	public StockInfo(StockIdentifier stockIdentifier, InStockRequest inStockRequest, String editor) {
		this.stockIdentifier = stockIdentifier;
		this.color = inStockRequest.getColor();
		this.defect = inStockRequest.getDefect();
		this.record = inStockRequest.getRecord();
		this.remark = inStockRequest.getRemark();
		this.createdBy = editor;
	}

//	public StockInfo(UpdateInfoRequest updateInfoRequest, String editor) {
//		this.id = updateInfoRequest.getId();
//		this.color = updateInfoRequest.getColor();
//		this.defect = updateInfoRequest.getDefect();
//		this.record = updateInfoRequest.getRecord();
//		this.remark = updateInfoRequest.getRemark();
//		this.updatedBy = editor;
//	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public StockIdentifier getStockIdentifier() {
		return stockIdentifier;
	}

	public void setStockIdentifier(StockIdentifier stockIdentifier) {
		this.stockIdentifier = stockIdentifier;
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

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}

	public String getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(String createdBy) {
		this.createdBy = createdBy;
	}

	public String getUpdatedBy() {
		return updatedBy;
	}

	public void setUpdatedBy(String updatedBy) {
		this.updatedBy = updatedBy;
	}

	@PrePersist
	protected void onCreated() {
		this.createdAt = LocalDateTime.now();
	}

	@PreUpdate
	protected void onUpdate() {
		this.updatedAt = LocalDateTime.now();
	}

}
