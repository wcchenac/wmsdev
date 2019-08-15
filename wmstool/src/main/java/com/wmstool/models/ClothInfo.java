package com.wmstool.models;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;

@Entity
public class ClothInfo {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	@OneToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "clothIdentifier_id", nullable = false)
	private ClothIdentifier clothIdentifier;

	private short color;

	@Column(length = 50)
	private String defect;

	@OneToMany(cascade = CascadeType.REFRESH, fetch = FetchType.EAGER, mappedBy = "clothInfo")
	private List<ClothRecord> clothRecords = new ArrayList<>();

	public ClothInfo() {
	}

	public ClothInfo(ClothIdentifier clothIdentifier, ClothInfo clothInfo) {
		this.clothIdentifier = clothIdentifier;
		this.color = clothInfo.getColor();
		this.defect = clothInfo.getDefect();
	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public ClothIdentifier getClothIdentifier() {
		return clothIdentifier;
	}

	public void setClothIdentifier(ClothIdentifier clothIdentifier) {
		this.clothIdentifier = clothIdentifier;
	}

	public short getColor() {
		return color;
	}

	public void setColor(short color) {
		this.color = color;
	}

	public String getDefect() {
		return defect;
	}

	public void setDefect(String defect) {
		this.defect = defect;
	}

	public List<ClothRecord> getClothRecords() {
		return clothRecords;
	}

	public void setClothRecords(List<ClothRecord> clothRecords) {
		this.clothRecords = clothRecords;
	}

}
