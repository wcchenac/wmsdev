package com.wmstool.wmstool.models.payloads;

import java.util.Map;

public class QueryOrderResponse {

	private Map<String, Map<String, Map<String, String>>> currentStatus;

	private Map<String, Map<String, Map<String, String>>> prevStatus;

	private Map<String, Map<String, Map<String, String>>> waitHandleStatus;

	public QueryOrderResponse() {
	}

	public QueryOrderResponse(Map<String, Map<String, Map<String, String>>> currentStatus,
			Map<String, Map<String, Map<String, String>>> prevStatus,
			Map<String, Map<String, Map<String, String>>> waitHandleStatus) {
		this.currentStatus = currentStatus;
		this.prevStatus = prevStatus;
		this.waitHandleStatus = waitHandleStatus;
	}

	public Map<String, Map<String, Map<String, String>>> getCurrentStatus() {
		return currentStatus;
	}

	public void setCurrentStatus(Map<String, Map<String, Map<String, String>>> currentStatus) {
		this.currentStatus = currentStatus;
	}

	public Map<String, Map<String, Map<String, String>>> getPrevStatus() {
		return prevStatus;
	}

	public void setPrevStatus(Map<String, Map<String, Map<String, String>>> prevStatus) {
		this.prevStatus = prevStatus;
	}

	public Map<String, Map<String, Map<String, String>>> getWaitHandleStatus() {
		return waitHandleStatus;
	}

	public void setWaitHandleStatus(Map<String, Map<String, Map<String, String>>> waitHandleStatus) {
		this.waitHandleStatus = waitHandleStatus;
	}

}
