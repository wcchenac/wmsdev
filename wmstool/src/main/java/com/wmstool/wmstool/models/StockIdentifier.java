package com.wmstool.wmstool.models;

import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.validation.constraints.NotEmpty;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
public class StockIdentifier {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, updatable = false, length = 25)
	private String productNo;

	@Column(updatable = false)
	private String lotNo;

	@Column(nullable = false, updatable = false, length = 10)
	private String type;

	@NotEmpty
	@Column(nullable = false, updatable = false, length = 10)
	private String quantity;

	@Column(nullable = false, length = 10)
	private String unit;

	private int serialNo;

	private boolean isExist = true;

	private boolean waitToShrink = false;

	private String eliminateType; // 0: ship, 1: shrink

	private String eliminateDate;

	private String eliminateReason;

	private String adjustment;

	private boolean isOutStock = false;

	private String firstInStockAt;

	@JsonIgnore
	private LocalDateTime outStockAt;

	@Column(updatable = false)
	@JsonIgnore
	private LocalDateTime createdAt;

	@JsonIgnore
	private LocalDateTime updatedAt;

	@JsonIgnore
	private String createdBy;

	@JsonIgnore
	private String updatedBy;

	public StockIdentifier() {
	}

	public StockIdentifier(StockIdentifierBacklog stockIdentifierBacklog, String editor) {
		this.productNo = stockIdentifierBacklog.getProductNo();
		this.lotNo = stockIdentifierBacklog.getLotNo();
		this.type = stockIdentifierBacklog.getType();
		this.quantity = stockIdentifierBacklog.getQuantity();
		this.unit = stockIdentifierBacklog.getUnit();
		this.serialNo = stockIdentifierBacklog.getSerialNo();
		this.createdBy = editor;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getProductNo() {
		return productNo;
	}

	public void setProductNo(String productNo) {
		this.productNo = productNo;
	}

	public String getLotNo() {
		return lotNo;
	}

	public void setLotNo(String lotNo) {
		this.lotNo = lotNo;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getQuantity() {
		return quantity;
	}

	public void setQuantity(String quantity) {
		this.quantity = quantity;
	}

	public String getUnit() {
		return unit;
	}

	public void setUnit(String unit) {
		this.unit = unit;
	}

	public int getSerialNo() {
		return serialNo;
	}

	public void setSerialNo(int serialNo) {
		this.serialNo = serialNo;
	}

	public boolean isExist() {
		return isExist;
	}

	public void setExist(boolean isExist) {
		this.isExist = isExist;
	}

	public boolean isWaitToShrink() {
		return waitToShrink;
	}

	public void setWaitToShrink(boolean waitToShrink) {
		this.waitToShrink = waitToShrink;
	}

	public String getEliminateType() {
		return eliminateType;
	}

	public void setEliminateType(String eliminateType) {
		this.eliminateType = eliminateType;
	}

	public String getEliminateDate() {
		return eliminateDate;
	}

	public void setEliminateDate(String eliminateDate) {
		this.eliminateDate = eliminateDate;
	}

	public String getEliminateReason() {
		return eliminateReason;
	}

	public void setEliminateReason(String eliminateReason) {
		this.eliminateReason = eliminateReason;
	}

	public String getAdjustment() {
		return adjustment;
	}

	public void setAdjustment(String adjustment) {
		this.adjustment = adjustment;
	}

	public boolean isOutStock() {
		return isOutStock;
	}

	public void setOutStock(boolean isOutStock) {
		this.isOutStock = isOutStock;
	}

	public String getFirstInStockAt() {
		return firstInStockAt;
	}

	public void setFirstInStockAt(String firstInStockAt) {
		this.firstInStockAt = firstInStockAt;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getOutStockAt() {
		return outStockAt;
	}

	public void setOutStockAt(LocalDateTime outStockAt) {
		this.outStockAt = outStockAt;
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
