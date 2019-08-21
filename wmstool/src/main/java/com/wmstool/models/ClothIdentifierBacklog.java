package com.wmstool.models;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.validation.constraints.NotBlank;

@Entity
public class ClothIdentifierBacklog {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	@NotBlank(message = "貨號不可空白")
	@Column(nullable = false, updatable = false, length = 25)
	private String productNo;

	@NotBlank(message = "批號不可空白")
	@Column(nullable = false, updatable = false, length = 10)
	private String lotNo;

	@NotBlank(message = "型態不可空白")
	@Column(nullable = false, updatable = false, length = 6)
	private String type;

	@NotBlank(message = "長度不可空白")
	@Column(nullable = false, updatable = false, length = 5)
	private String length;

	private short serialNo = 1;

	public ClothIdentifierBacklog() {
	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public String getProductNo() {
		return productNo;
	}

	public void setProductNo(String productNo) {
		this.productNo = productNo.toUpperCase();
	}

	public String getLotNo() {
		return lotNo;
	}

	public void setLotNo(String lotNo) {
		this.lotNo = lotNo.toUpperCase();
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

	public short getSerialNo() {
		return serialNo;
	}

	public void setSerialNo(short serialNo) {
		this.serialNo = serialNo;
	}

}
