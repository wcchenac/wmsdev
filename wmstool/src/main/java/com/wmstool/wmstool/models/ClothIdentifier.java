package com.wmstool.wmstool.models;

import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.persistence.Transient;
import javax.validation.constraints.NotEmpty;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
public class ClothIdentifier {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

//	@ManyToOne(fetch = FetchType.LAZY)
//	@JoinColumn(name = "clothIdentifierBacklog_id", updatable = false, nullable = false)
//	@JsonIgnore
//	@Transient
//	private ClothIdentifierBacklog clothIdentifierBacklog;

	@Column(nullable = false, updatable = false, length = 25)
	private String productNo;

	@Column(updatable = false)
	private String lotNo;

	@Column(nullable = false, updatable = false, length = 10)
	private String type;
	
	@NotEmpty
	@Column(nullable = false, updatable = false, length = 10)
	private String length;

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

	@Column(updatable = false)
	@JsonIgnore
	private LocalDateTime createdAt;

	@JsonIgnore
	private LocalDateTime outStockAt;

	@JsonIgnore
	private LocalDateTime updatedAt;

	public ClothIdentifier() {
	}

	public ClothIdentifier(ClothIdentifierBacklog clothIdentifierBacklog) {
//		this.clothIdentifierBacklog = clothIdentifierBacklog;
		this.productNo = clothIdentifierBacklog.getProductNo();
		this.lotNo = clothIdentifierBacklog.getLotNo();
		this.type = clothIdentifierBacklog.getType();
		this.length = clothIdentifierBacklog.getLength();
		this.unit = clothIdentifierBacklog.getUnit();
		this.serialNo = clothIdentifierBacklog.getSerialNo();
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

//	public ClothIdentifierBacklog getClothIdentifierBacklog() {
//		return clothIdentifierBacklog;
//	}
//
//	public void setClothIdentifierBacklog(ClothIdentifierBacklog clothIdentifierBacklog) {
//		this.clothIdentifierBacklog = clothIdentifierBacklog;
//	}

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
		this.createdAt =LocalDateTime.now();
	}

	@PreUpdate
	protected void onUpdate() {
		this.updatedAt = LocalDateTime.now();
	}

}
