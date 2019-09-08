package com.wmstool.ERP.models;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;

@Entity
public class ERPRecord {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String inStockRequestNo;

	@OneToMany(cascade = CascadeType.REFRESH, fetch = FetchType.EAGER)
	private List<ProductNo> productNoList = new ArrayList<>();

	public ERPRecord() {
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getInStockRequestNo() {
		return inStockRequestNo;
	}

	public void setInStockRequestNo(String inStockRequestNo) {
		this.inStockRequestNo = inStockRequestNo;
	}

	public List<ProductNo> getProductNoList() {
		return productNoList;
	}

	public void setProductNoList(List<ProductNo> productNoList) {
		this.productNoList = productNoList;
	}

}
