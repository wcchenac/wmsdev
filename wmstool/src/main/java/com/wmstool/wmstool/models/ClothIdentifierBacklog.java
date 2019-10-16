package com.wmstool.wmstool.models;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class ClothIdentifierBacklog {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	/*
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "productNoBacklog_id", updatable = false, nullable = false)
	@JsonIgnore
	private ProductNoBacklog productNoBacklog;
	 */

	@Column(nullable = false, updatable = false, length = 25)
	private String productNo;

	/*
	@Column(nullable = false, updatable = false)
	private int lotNo;
	*/

	@Column(nullable = false, updatable = false)
	private String lotNo;
	
	@Column(nullable = false, updatable = false, length = 10)
	private String type;

	@Column(nullable = false, length = 6)
	private String length;

	@Column(nullable = false, length = 10)
	private String unit;

	private int serialNo = 1;

	public ClothIdentifierBacklog() {
	}

	/*
	public ClothIdentifierBacklog(ProductNoBacklog productNoBacklog, String type, String length, String unit) {
		this.productNoBacklog = productNoBacklog;
		this.productNo = productNoBacklog.getProductNo();
		this.lotNo = productNoBacklog.getLotNo();
		this.type = type;
		this.length = length;
		this.unit = unit;
	}
	
	public ClothIdentifierBacklog(ProductNoBacklog productNoBacklog, String productNo, int lotNo, String type, String length, String unit) {
		this.productNoBacklog = productNoBacklog;
		this.productNo = productNo;
		this.lotNo =lotNo;
		this.type = type;
		this.length = length;
		this.unit = unit;
	}
	*/

	public ClothIdentifierBacklog(String productNo, String lotNo, String type, String length, String unit) {
		this.productNo = productNo;
		this.lotNo =lotNo;
		this.type = type;
		this.length = length;
		this.unit = unit;
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

	/*
	public int getLotNo() {
		return lotNo;
	}

	public void setLotNo(int lotNo) {
		this.lotNo = lotNo;
	}
	*/
	
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
