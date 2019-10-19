package com.wmstool.wmstool.models.payloads;

import java.util.List;
import java.util.Map;

import com.wmstool.wmstool.models.OutStockRequest;

public class HandleListResponse {

	private List<String> userList;

	private Map<String, List<OutStockRequest>> queryResult;

	public HandleListResponse() {
	}

	public HandleListResponse(List<String> userList, Map<String, List<OutStockRequest>> queryResult) {
		this.userList = userList;
		this.queryResult = queryResult;
	}

	public List<String> getUserList() {
		return userList;
	}

	public void setUserList(List<String> userList) {
		this.userList = userList;
	}

	public Map<String, List<OutStockRequest>> getQueryResult() {
		return queryResult;
	}

	public void setQueryResult(Map<String, List<OutStockRequest>> queryResult) {
		this.queryResult = queryResult;
	}

}
