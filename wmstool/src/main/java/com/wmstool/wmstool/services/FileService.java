package com.wmstool.wmstool.services;

import java.io.File;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import javax.transaction.Transactional;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbookFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.wmstool.wmstool.models.payloads.InStockRequest;
import com.wmstool.wmstool.services.stockService.StockService;

@Service
@Transactional
public class FileService {

	@Autowired
	private StockService stockService;

	private static final String seperator = File.separator;
	private static final String filetype = ".xls";
	private static final DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyyMMdd");

	/**
	 * Find files at current date
	 */
	public String findTodayFile(String parentDir, String filenamePrefix) {
		LocalDate now = LocalDate.now();
		String fileNameNoDir = filenamePrefix + now.format(dtf) + filetype;
		String fileFullName = parentDir + seperator + now.getYear() + seperator + now.getMonthValue() + seperator
				+ fileNameNoDir;
		File f = new File(fileFullName);

		if (!f.exists()) {
			return "File Not Found";
		}

		return fileNameNoDir;

	}

	/**
	 * Find files at given date range
	 */
	public List<String> findPeriodFiles(String parentDir, String filenamePrefix, String start, String end) {
		List<String> resultList = new ArrayList<>();
		LocalDateTime startDateTime = LocalDateTime.parse(start, DateTimeFormatter.ISO_LOCAL_DATE_TIME).plusHours(8);
		LocalDateTime endDateTime = LocalDateTime.parse(end, DateTimeFormatter.ISO_LOCAL_DATE_TIME).plusHours(8);
		Period period = Period.between(startDateTime.toLocalDate(), endDateTime.toLocalDate());
		int dayInterval = period.getDays();

		for (int i = 0; i <= dayInterval; i += 1) {
			LocalDate d = startDateTime.plusDays(i).toLocalDate();
			String fileNameNoDir = filenamePrefix + d.format(dtf) + filetype;
			String fileFullName = parentDir + seperator + d.getYear() + seperator + d.getMonthValue() + seperator
					+ fileNameNoDir;
			File f = new File(fileFullName);

			if (f.exists()) {
				resultList.add(fileNameNoDir);
			}
		}

		return resultList;
	}

	/**
	 * Execute inStock process based on the file imported by user
	 */
	public void importStockRecord(MultipartFile multipartFile) {
		try {
			List<InStockRequest> requestList = new ArrayList<>();
			InputStream inp = multipartFile.getInputStream();

			Workbook workbook = XSSFWorkbookFactory.createWorkbook(inp);
			Sheet sheet = workbook.getSheetAt(0);

			// template file start row
			for (int i = 1; i <= sheet.getLastRowNum(); i += 1) {
				Row row = sheet.getRow(i);
				InStockRequest inStockRequest = new InStockRequest();

				inStockRequest.setProductNo(row.getCell(0).toString());
				if (row.getCell(1) != null) {
					inStockRequest.setLotNo(row.getCell(1).toString());
				}
				inStockRequest.setType(row.getCell(2).toString());
				inStockRequest.setQuantity(row.getCell(3).toString());
				inStockRequest.setUnit(row.getCell(4).toString());
				inStockRequest.setColor((int) Double.parseDouble(row.getCell(5).toString()));
				inStockRequest.setDefect(row.getCell(6).toString());
				if (row.getCell(7) != null) {
					inStockRequest.setRemark(row.getCell(7).toString());
				}
				inStockRequest.setInStockType("fileImport");

				requestList.add(inStockRequest);
			}

			stockService.createStockInfoes(requestList);

			inp.close();
		} catch (Exception ex) {
			ex.printStackTrace();
		}
	}
}
