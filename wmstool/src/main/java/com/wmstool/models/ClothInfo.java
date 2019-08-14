package com.wmstool.models;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

public class ClothInfo {

	private long id;
	
	private ClothIdentifier clothIdentifier;
	
	private short color;
	
	private String defect;
	
	private boolean isExist;
}
