package com.wmstool.wmstool.services;

import java.io.File;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
	private static final DateTimeFormatter dtf_yyyyMMdd = DateTimeFormatter.ofPattern("yyyyMMdd");

	private static final String File_Category_Adjustment = "adjustment";
	private static final String File_Category_Allocation = "allocation";
	private static final String File_Category_DailyCompare = "dailyComparison";

	/**
	 * Find files at current date
	 */
	public String findTodayFile(String fileCategory, String parentDir, String filenamePrefix) {
		LocalDate now = LocalDate.now();
		String fileNameNoDir = "";
		String fileFullName = "";

		switch (fileCategory) {
		case File_Category_Adjustment:
		case File_Category_Allocation:
			fileNameNoDir = filenamePrefix + now.format(dtf_yyyyMMdd) + filetype;
			fileFullName = parentDir + seperator + now.getYear() + seperator + now.getMonthValue() + seperator
					+ fileNameNoDir;
		case File_Category_DailyCompare:
			now.minusDays(1);
			fileNameNoDir = filenamePrefix + now.format(dtf_yyyyMMdd) + filetype;
			fileFullName = parentDir + seperator + now.getYear() + seperator + now.getMonthValue() + seperator
					+ fileNameNoDir;
		default:
			break;
		}

		File f = new File(fileFullName);

		if (!f.exists()) {
			return "File Not Found";
		}

		return fileNameNoDir;
	}

	/**
	 * Find files at given date range
	 */
	public List<String> findPeriodFiles(String fileCategory, String parentDir, String filenamePrefix, String start,
			String end) {
		List<String> resultList = new ArrayList<>();
		LocalDateTime startDateTime = LocalDateTime.parse(start, DateTimeFormatter.ISO_LOCAL_DATE_TIME).plusHours(8);
		LocalDateTime endDateTime = LocalDateTime.parse(end, DateTimeFormatter.ISO_LOCAL_DATE_TIME).plusHours(8);
		Period period = Period.between(startDateTime.toLocalDate(), endDateTime.toLocalDate());

		switch (fileCategory) {
		case File_Category_Adjustment:
		case File_Category_Allocation:
		case File_Category_DailyCompare:
			int dayInterval = period.getDays();

			for (int i = 0; i <= dayInterval; i += 1) {
				LocalDate d = startDateTime.plusDays(i).toLocalDate();
				String fileNameNoDir = filenamePrefix + d.format(dtf_yyyyMMdd) + filetype;
				String fileFullName = parentDir + seperator + d.getYear() + seperator + d.getMonthValue() + seperator
						+ fileNameNoDir;
				File f = new File(fileFullName);

				if (f.exists()) {
					resultList.add(fileNameNoDir);
				}
			}

			break;
		default:
			break;
		}

		if (resultList.isEmpty()) {
			resultList.add("File Not Found");
		}

		return resultList;
	}

	/**
	 * Return already existed category
	 */
	public List<Map<String, String>> findExistedCategory(String parentDir) {
		List<Map<String, String>> resultList = new ArrayList<>();
		File f = new File(parentDir);

		for (String x : f.list()) {
			String category = x.substring(x.indexOf("-") + 1, x.indexOf(filetype));

			Map<String, String> temp = new HashMap<>();

			temp.put("label", category);
			temp.put("value", category);

			resultList.add(temp);
		}

		if (resultList.isEmpty()) {
			Map<String, String> temp = new HashMap<>();

			temp.put("label", "File Not Found");
			temp.put("value", "File Not Found");

			resultList.add(temp);
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

			// template file start at row 1
			for (int i = 1; i <= sheet.getLastRowNum(); i += 1) {
				Row row = sheet.getRow(i);
				InStockRequest inStockRequest = new InStockRequest();

				inStockRequest.setProductNo(row.getCell(0).toString());
				inStockRequest.setLotNo(row.getCell(1) != null ? row.getCell(1).toString() : "");
				inStockRequest.setType(row.getCell(2).toString());
				inStockRequest.setQuantity(row.getCell(3).toString());
				inStockRequest.setUnit(row.getCell(4).toString());
				inStockRequest.setColor((int) Double.parseDouble(row.getCell(5).toString()));
				inStockRequest.setDefect(row.getCell(6) != null ? row.getCell(6).toString() : "");
				inStockRequest.setRemark(row.getCell(7) != null ? row.getCell(7).toString() : "");
				inStockRequest.setRecord(row.getCell(8) != null ? row.getCell(8).toString() : "");
				inStockRequest.setInStockType(row.getCell(9).toString());
				inStockRequest.setOrderNo(row.getCell(10) != null ? row.getCell(10).toString() : "");

				requestList.add(inStockRequest);
			}

			stockService.createStockInfoes(requestList);

			inp.close();
		} catch (Exception ex) {
			ex.printStackTrace();
		}
	}
}
