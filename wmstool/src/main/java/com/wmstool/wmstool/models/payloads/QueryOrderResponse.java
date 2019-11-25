package com.wmstool.wmstool.models.payloads;

import java.util.Map;

public class QueryOrderResponse {

	private Map<String, Map<String, Map<String, String>>> currentStatus;

	private Map<String, Map<String, Map<String, String>>> waitHandleStatus;

	public QueryOrderResponse() {
	}

	public QueryOrderResponse(Map<String, Map<String, Map<String, String>>> currentStatus) {
		this.currentStatus = currentStatus;
	}

	public QueryOrderResponse(Map<String, Map<String, Map<String, String>>> currentStatus,
			Map<String, Map<String, Map<String, String>>> waitHandleStatus) {
		this.currentStatus = currentStatus;
		this.waitHandleStatus = waitHandleStatus;
	}

	public Map<String, Map<String, Map<String, String>>> getCurrentStatus() {
		return currentStatus;
	}

	public void setCurrentStatus(Map<String, Map<String, Map<String, String>>> currentStatus) {
		this.currentStatus = currentStatus;
	}

	public Map<String, Map<String, Map<String, String>>> getWaitHandleStatus() {
		return waitHandleStatus;
	}

	public void setWaitHandleStatus(Map<String, Map<String, Map<String, String>>> waitHandleStatus) {
		this.waitHandleStatus = waitHandleStatus;
	}

}
