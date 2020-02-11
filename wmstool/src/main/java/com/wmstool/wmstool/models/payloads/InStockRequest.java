package com.wmstool.wmstool.models.payloads;

import javax.validation.constraints.NotBlank;

public class InStockRequest {

	@NotBlank(message = "貨號不可空白")
	private String productNo;

	private String lotNo;

	@NotBlank(message = "型態不可空白")
	private String type;

	@NotBlank(message = "長度不可空白")
	private String quantity;

	private String unit;

	private int color;

	private String defect;

	private String record;

	private String remark;

	private String inStockType;

	private String orderNo;

	private boolean directShip;

	private String outStockReason;

	private long parentId; // for history use

	public InStockRequest() {
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

	public int getColor() {
		return color;
	}

	public void setColor(int color) {
		this.color = color;
	}

	public String getDefect() {
		return defect;
	}

	public void setDefect(String defect) {
		this.defect = defect;
	}

	public String getRecord() {
		return record;
	}

	public void setRecord(String record) {
		this.record = record;
	}

	public String getRemark() {
		return remark;
	}

	public void setRemark(String remark) {
		this.remark = remark;
	}

	public String getInStockType() {
		return inStockType;
	}

	public void setInStockType(String inStockType) {
		this.inStockType = inStockType;
	}

	public String getOrderNo() {
		return orderNo;
	}

	public void setOrderNo(String orderNo) {
		this.orderNo = orderNo;
	}

	public boolean isDirectShip() {
		return directShip;
	}

	public void setDirectShip(boolean directShip) {
		this.directShip = directShip;
	}

	public String getOutStockReason() {
		return outStockReason;
	}

	public void setOutStockReason(String outStockReason) {
		this.outStockReason = outStockReason;
	}

	public long getParentId() {
		return parentId;
	}

	public void setParentId(long parentId) {
		this.parentId = parentId;
	}

}
