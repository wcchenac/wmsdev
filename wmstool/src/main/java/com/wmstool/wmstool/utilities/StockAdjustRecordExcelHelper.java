package com.wmstool.wmstool.utilities;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.wmstool.wmstool.models.StockAdjustmentRecord;

@Component
public class StockAdjustRecordExcelHelper {

	@Value("${file.filePathForExcels}")
	private String folderPath;

	private static final String seperator = File.separator;
	private static final String filetype = ".xls";
	private static final String filenamePrefix = "StockAdjustRecord-";
	private static final DateTimeFormatter dtf_yyyyMMdd = DateTimeFormatter.ofPattern("yyyyMMdd");

	/**
	 * Create a excel from template excel which is named by current date formated in
	 * "yyyyMMdd" pattern
	 */
	public String createNewFile(LocalDate now) throws IOException {
		String parentDir = folderPath + seperator + "STKADST";
		String templateFile = parentDir + seperator + "StockAdjustRecordTemplate" + filetype;

		// Read template file
		Workbook workbook = WorkbookFactory.create(new File(templateFile));

		// Define directory & filename and create files
		String fileNameNoDir = filenamePrefix + now.format(dtf_yyyyMMdd) + filetype;
		String fileFullName = parentDir + seperator + now.getYear() + seperator + now.getMonthValue() + seperator
				+ fileNameNoDir;
		File f = new File(fileFullName);

		if (!f.exists()) {
			f.getParentFile().mkdirs();
			try {
				f.createNewFile();
			} catch (IOException e) {
				e.printStackTrace();
			}

			// Output template content to certain file
			FileOutputStream fos = new FileOutputStream(f);
			workbook.write(fos);

			workbook.close();
			fos.close();
		}

		return fileNameNoDir;
	}

	/**
	 * For shrink roll-back process, re-create a excel from template excel which is
	 * named by current date formated in "yyyyMMdd" pattern
	 */
	public String deleteAndCreateNewFile(LocalDate now) throws IOException {
		String parentDir = folderPath + seperator + "STKADST";
		String templateFile = parentDir + seperator + "StockAdjustRecordTemplate" + filetype;

		// Read template file
		Workbook workbook = WorkbookFactory.create(new File(templateFile));

		// Define directory & filename and create files
		String fileNameNoDir = filenamePrefix + now.format(dtf_yyyyMMdd) + filetype;
		String fileFullName = parentDir + seperator + now.getYear() + seperator + now.getMonthValue() + seperator
				+ fileNameNoDir;
		File f = new File(fileFullName);

		if (f.exists()) {
			f.delete();
		}

		f.getParentFile().mkdirs();

		try {
			f.createNewFile();
		} catch (IOException e) {
			e.printStackTrace();
		}

		// Output template content to certain file
		FileOutputStream fos = new FileOutputStream(f);
		workbook.write(fos);

		workbook.close();
		fos.close();

		return fileNameNoDir;
	}

	/**
	 * Using given stockAdjustmentRecord information to update the given filename
	 * excel
	 */
//	public void modifyExisting(StockAdjustmentRecord stockAdjustmentRecord, LocalDate now, String fileName)
//			throws IOException {
//		String parentDir = folderPath + seperator + "STKADST";
//
//		// Read target file
//		String fileFullName = parentDir + seperator + now.getYear() + seperator + now.getMonthValue() + seperator
//				+ fileName;
//		File f = new File(fileFullName);
//		FileInputStream fis = new FileInputStream(f);
//		Workbook workbook = WorkbookFactory.create(fis);
//
//		// Select first sheet of excel file
//		Sheet sheet = workbook.getSheetAt(0);
//
//		// Style setting for font
//		CellStyle rowStyle = workbook.createCellStyle();
//		Font font = workbook.createFont();
//		font.setColor(Font.COLOR_NORMAL);
//		rowStyle.setFont(font);
//
//		// get last row in file, and set value & style into cells under last row
//		int lastRow = sheet.getLastRowNum() + 1;
//		Row row = sheet.createRow(lastRow);
//
//		row.setRowStyle(rowStyle);
//
//		// PROD
//		Cell cell = row.createCell(1);
//		cell.setCellValue(stockAdjustmentRecord.getProductNo());
//
//		// SERIAL
//		cell = row.createCell(4);
//		cell.setCellValue(lastRow - 1);
//
//		// QTY
//		cell = row.createCell(6);
//		cell.setCellValue(stockAdjustmentRecord.getQuantity());
//
//		// UNIT
//		cell = row.createCell(7);
//		cell.setCellValue("02");
//
//		// REALQTY
//		cell = row.createCell(10);
//		cell.setCellValue(stockAdjustmentRecord.getRealQuantity());
//
//		// GWN
//		cell = row.createCell(13);
//		cell.setCellValue(stockAdjustmentRecord.getGWN());
//
//		// close input stream
//		fis.close();
//
//		// create out stream
//		FileOutputStream fos = new FileOutputStream(f);
//
//		// save file through output stream
//		workbook.write(fos);
//
//		// close workbook
//		workbook.close();
//
//		// close output stream
//		fos.flush();
//		fos.close();
//	}

	public void modifyExisting(List<StockAdjustmentRecord> stockAdjustmentRecords, LocalDate now, String fileName)
			throws IOException {
		String parentDir = folderPath + seperator + "STKADST";

		// Read target file
		String fileFullName = parentDir + seperator + now.getYear() + seperator + now.getMonthValue() + seperator
				+ fileName;
		File f = new File(fileFullName);
		FileInputStream fis = new FileInputStream(f);
		Workbook workbook = WorkbookFactory.create(fis);

		// Select first sheet of excel file
		Sheet sheet = workbook.getSheetAt(0);

		// Style setting for font
		CellStyle rowStyle = workbook.createCellStyle();
		Font font = workbook.createFont();
		font.setColor(Font.COLOR_NORMAL);
		rowStyle.setFont(font);

		// get last row in file, and set value & style into cells under last row
		int lastRow = sheet.getLastRowNum() + 1;

		for (StockAdjustmentRecord stockAdjustmentRecord : stockAdjustmentRecords) {
			Row row = sheet.createRow(lastRow);

			row.setRowStyle(rowStyle);

			// PROD
			Cell cell = row.createCell(1);
			cell.setCellValue(stockAdjustmentRecord.getProductNo());

			// SERIAL
			cell = row.createCell(4);
			cell.setCellValue(lastRow - 1);

			// QTY
			cell = row.createCell(6);
			cell.setCellValue(stockAdjustmentRecord.getQuantity());

			// UNIT
			cell = row.createCell(7);
			cell.setCellValue("02");

			// REALQTY
			cell = row.createCell(10);
			cell.setCellValue(stockAdjustmentRecord.getRealQuantity());

			// GWN
			cell = row.createCell(13);
			cell.setCellValue(stockAdjustmentRecord.getGWN());

			lastRow += 1;
		}

		// close input stream
		fis.close();

		// create out stream
		FileOutputStream fos = new FileOutputStream(f);

		// save file through output stream
		workbook.write(fos);

		// close workbook
		workbook.close();

		// close output stream
		fos.flush();
		fos.close();
	}

}
