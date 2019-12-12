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

	private boolean isShip = false;

	private String shipReason;

	private boolean isOutStock = false;

	private String firstInStockAt;

//	@OneToOne(fetch = FetchType.EAGER, mappedBy = "clothIdentifier")
//	@JsonIgnore
//	private ClothInfo clothInfo;

	@JsonIgnore
	private LocalDateTime outStockAt;

	@Column(updatable = false)
	@JsonIgnore
	private LocalDateTime createdAt;

	@JsonIgnore
	private LocalDateTime updatedAt;

	public StockIdentifier() {
	}

	public StockIdentifier(StockIdentifierBacklog stockIdentifierBacklog) {
		this.productNo = stockIdentifierBacklog.getProductNo();
		this.lotNo = stockIdentifierBacklog.getLotNo();
		this.type = stockIdentifierBacklog.getType();
		this.quantity = stockIdentifierBacklog.getQuantity();
		this.unit = stockIdentifierBacklog.getUnit();
		this.serialNo = stockIdentifierBacklog.getSerialNo();
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

	public boolean isShip() {
		return isShip;
	}

	public void setShip(boolean isShip) {
		this.isShip = isShip;
	}

	public String getShipReason() {
		return shipReason;
	}

	public void setShipReason(String shipReason) {
		this.shipReason = shipReason;
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

//	public ClothInfo getClothInfo() {
//		return clothInfo;
//	}
//
//	public void setClothInfo(ClothInfo clothInfo) {
//		this.clothInfo = clothInfo;
//	}

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

	@PrePersist
	protected void onCreated() {
		this.createdAt = LocalDateTime.now();
	}

	@PreUpdate
	protected void onUpdate() {
		this.updatedAt = LocalDateTime.now();
	}

}
