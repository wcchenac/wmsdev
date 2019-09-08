package com.wmstool.ERP.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wmstool.ERP.models.ERPRecord;
import com.wmstool.ERP.models.ProductNo;
import com.wmstool.ERP.repositories.ERPRecordRepository;
import com.wmstool.ERP.repositories.ProductNoRepository;

@Service
public class ERPService {

	@Autowired
	private ERPRecordRepository erpRecordRepository;

	@Autowired
	private ProductNoRepository productNoRepository;

	public ERPRecord findInStockRequestNo(String inStockRequestNo) {
		ERPRecord res = erpRecordRepository.findByInStockRequestNo(inStockRequestNo).orElse(null);
		return res;
	}

	public ERPRecord createERPRecord(ERPRecord erpRecord) {
		List<ProductNo> newList = new ArrayList<>();
		List<ProductNo> oldList = erpRecord.getProductNoList();
		oldList.forEach(p -> {
			newList.add(productNoRepository.findByProductNo(p.getProductNo()).orElse(null));
		});
		erpRecord.setProductNoList(newList);
		return erpRecordRepository.save(erpRecord);
	}

	public ProductNo createProductNo(ProductNo productNo) {
		return productNoRepository.save(productNo);
	}

}
