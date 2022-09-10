package com.wmstool.wmstool.models.enums;

public enum RoleName {
	ROLE_Normal("一般人員/門市"),
	ROLE_Sales("業務"),
	ROLE_Operator("庫存相關人員"),
	ROLE_Admin("管理員"),

	;

	String m_cname;

	RoleName(String cname) {
		m_cname = cname;
	}

	public String canme() {
		return m_cname;
	}
}
