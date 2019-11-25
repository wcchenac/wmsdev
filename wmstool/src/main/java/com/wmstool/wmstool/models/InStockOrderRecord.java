package com.wmstool.wmstool.models;

import java.time.LocalDateTime;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;

import com.wmstool.wmstool.models.payloads.InStockRequest;

@Entity
public class InStockOrderRecord {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String inStockType;

	private String inStockOrderNo;

	private String productNo;

	private String lotNo;

	private String length;

	private String unit;

	private String type;

	private int color;

	private String defect;

	private Long clothIdentifierId;

	private LocalDateTime createdAt;

	private LocalDateTime updatedAt;

	private String createdBy;

	private String updatedBy;

	public InStockOrderRecord() {
	}

	public InStockOrderRecord(ClothIdentifier clothIdentifier, InStockRequest inStockRequest) {
		this.inStockType = inStockRequest.getInStockType();
		this.inStockOrderNo = inStockRequest.getOrderNo();
		this.productNo = clothIdentifier.getProductNo();
		this.lotNo=clothIdentifier.getLotNo();
		this.length = clothIdentifier.getLength();
		this.unit = clothIdentifier.getUnit();
		this.type = clothIdentifier.getType();
		this.color = inStockRequest.getColor();
		this.defect = inStockRequest.getDefect();
		this.clothIdentifierId = clothIdentifier.getId();
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getInStockType() {
		return inStockType;
	}

	public void setInStockType(String inStockType) {
		this.inStockType = inStockType;
	}

	public String getInStockOrderNo() {
		return inStockOrderNo;
	}

	public void setInStockOrderNo(String inStockOrderNo) {
		this.inStockOrderNo = inStockOrderNo;
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

	public String getLength() {
		return length;
	}

	public void setLength(String length) {
		this.length = length;
	}

	public String getUnit() {
		return unit;
	}

	public void setUnit(String unit) {
		this.unit = unit;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
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

	public Long getClothIdentifierId() {
		return clothIdentifierId;
	}

	public void setClothIdentifierId(Long clothIdentifierId) {
		this.clothIdentifierId = clothIdentifierId;
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
