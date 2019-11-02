package com.wmstool.wmstool.models;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class InStockOrderRecord {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String inStockOrderNo;

	private String productNo;

	private String length;

	private String unit;

	private String type;

	private Long clothIdentifierId;

	public InStockOrderRecord() {
	}

	public InStockOrderRecord(ClothIdentifier clothIdentifier, String orderNo) {
		this.inStockOrderNo = orderNo;
		this.productNo = clothIdentifier.getProductNo();
		this.length = clothIdentifier.getLength();
		this.unit = clothIdentifier.getUnit();
		this.type = clothIdentifier.getType();
		this.clothIdentifierId = clothIdentifier.getId();
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
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

	public Long getClothIdentifierId() {
		return clothIdentifierId;
	}

	public void setClothIdentifierId(Long clothIdentifierId) {
		this.clothIdentifierId = clothIdentifierId;
	}

}
