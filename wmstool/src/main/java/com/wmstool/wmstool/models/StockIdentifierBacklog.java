package com.wmstool.wmstool.models;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

import com.wmstool.wmstool.models.payloads.InStockRequest;

@Entity
public class StockIdentifierBacklog {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, updatable = false, length = 25)
	private String productNo;

	@Column(updatable = false)
	private String lotNo;

	@Column(nullable = false, updatable = false, length = 10)
	private String type;

	@Column(nullable = false, length = 10)
	private String quantity;

	@Column(nullable = false, length = 10)
	private String unit;

	private int serialNo = 1;

	public StockIdentifierBacklog() {
	}

	public StockIdentifierBacklog(InStockRequest inStockRequest) {
		this.productNo = inStockRequest.getProductNo();
		this.lotNo = inStockRequest.getLotNo();
		this.type = inStockRequest.getType();
		this.quantity = inStockRequest.getQuantity();
		this.unit = inStockRequest.getUnit();
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

	public String getType() {
		return type;
	}

	public String getLotNo() {
		return lotNo;
	}

	public void setLotNo(String lotNo) {
		this.lotNo = lotNo;
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

}
