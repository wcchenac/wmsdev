package com.wmstool.wmstool.models.enums;

/**
 * Enum representing stock operation types for updating/rolling back StockIdentifier status
 */
public enum StockOperationType {
	SHIP("ship"),
	WAIT_TO_SHRINK("waitToShrink"),
	SHRINK("shrink");

	private final String value;

	StockOperationType(String value) {
		this.value = value;
	}

	public String getValue() {
		return value;
	}
}
