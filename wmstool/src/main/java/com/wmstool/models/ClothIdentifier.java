package com.wmstool.models;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
public class ClothIdentifier {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "clothIdentifierBacklog_id", updatable = false, nullable = false)
	@JsonIgnore
	private ClothIdentifierBacklog clothIdentifierBacklog;

	@Column(nullable = false, updatable = false, length = 25)
	private String productNo;

	@Column(nullable = false, updatable = false, length = 10)
	private String lotNo;

	@Column(nullable = false, updatable = false, length = 6)
	private String type;

	@Column(nullable = false, updatable = false, length = 5)
	private String length;

	private short serialNo;

	public ClothIdentifier(ClothIdentifierBacklog clothIdentifierBacklog) {
		this.clothIdentifierBacklog = clothIdentifierBacklog;
		this.productNo = clothIdentifierBacklog.getProductNo();
		this.lotNo = clothIdentifierBacklog.getLotNo();
		this.type = clothIdentifierBacklog.getType();
		this.length = clothIdentifierBacklog.getLength();
		this.serialNo = clothIdentifierBacklog.getSerialNo();
	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public ClothIdentifierBacklog getBacklog() {
		return clothIdentifierBacklog;
	}

	public void setBacklog(ClothIdentifierBacklog backlog) {
		this.clothIdentifierBacklog = backlog;
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
