package com.wmstool.wmstool.models.enums;

public enum EInstockType {
    Normal("normal"),
    Assemble("assemble"),
    CustomerReturn("customerReturn"),
    StoreReturn("storeReturn"),

    ;

    String m_type;

    EInstockType(String type) {
        m_type = type;
    }

    public String type() {
        return m_type;
    }
}
