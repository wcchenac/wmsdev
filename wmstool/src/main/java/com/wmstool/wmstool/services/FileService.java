package com.wmstool.wmstool.services;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wmstool.wmstool.models.payloads.CreateFileRequest;
import com.wmstool.wmstool.utilities.ExcelHelper;

@Service
public class FileService {

	@Autowired
	private ExcelHelper excelHelper;

	public String createFile(CreateFileRequest request) throws IOException {
		return excelHelper.modifyExisting(request.getProductNo(), request.getDecrement());
	}

}
