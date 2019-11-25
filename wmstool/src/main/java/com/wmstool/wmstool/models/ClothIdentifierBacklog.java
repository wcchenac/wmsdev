package com.wmstool.wmstool.models;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

import com.wmstool.wmstool.models.payloads.InStockRequest;

@Entity
public class ClothIdentifierBacklog {

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
	private String length;

	@Column(nullable = false, length = 10)
	private String unit;

	private int serialNo = 1;

	public ClothIdentifierBacklog() {
	}

	public ClothIdentifierBacklog(InStockRequest inStockRequest) {
		this.productNo = inStockRequest.getProductNo();
		this.lotNo = inStockRequest.getLotNo();
		this.type = inStockRequest.getType();
		this.length = inStockRequest.getLength();
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

}
