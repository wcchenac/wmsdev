package com.wmstool.wmstool.utilities;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class DailyStockComparisonExcelHelper {

	@Value("${file.filePathForExcels}")
	private String folderPath;

	private static final String seperator = File.separator;
	private static final String filetype = ".xls";
	private static final String filenamePrefix = "DailyStockComparison-";
	private static final DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyyMMdd");

	/**
	 * Create a excel from template excel which is named by current date formated in
	 * "yyyyMMdd" pattern
	 */
	public String createNewFile(LocalDate now) throws IOException {
		String parentDir = folderPath + seperator + "DailyStockComparison";
		String templateFile = parentDir + seperator + "DailyStockComparisonTemplate" + filetype;

		// Read template file
		Workbook workbook = WorkbookFactory.create(new File(templateFile));

		// Define directory & filename and create files
		String fileNameNoDir = filenamePrefix + now.format(dtf) + filetype;
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
	 * Using given compareResult information to update the given filename excel
	 */
	public void outputComparisonResult(List<List<String>> compareResult, LocalDate now, String fileName)
			throws IOException {
		String parentDir = folderPath + seperator + "DailyStockComparison";

		// Read target file
		String fileFullName = parentDir + seperator + now.getYear() + seperator + now.getMonthValue() + seperator
				+ fileName;
		File f = new File(fileFullName);
		FileInputStream fis = new FileInputStream(f);
		Workbook workbook = WorkbookFactory.create(fis);

		// Style setting for font, alignment and cell border
		CellStyle rowStyle_Pass = workbook.createCellStyle();
		CellStyle rowStyle_Fail = workbook.createCellStyle();
		Font font_pass = workbook.createFont();
		Font font_fail = workbook.createFont();

		font_pass.setColor(Font.COLOR_NORMAL);
		rowStyle_Pass.setFont(font_pass);
		rowStyle_Pass.setAlignment(HorizontalAlignment.CENTER);
		rowStyle_Pass.setVerticalAlignment(VerticalAlignment.CENTER);
		rowStyle_Pass.setBorderBottom(BorderStyle.THIN);
		rowStyle_Pass.setBorderLeft(BorderStyle.THIN);
		rowStyle_Pass.setBorderRight(BorderStyle.THIN);
		rowStyle_Pass.setBorderTop(BorderStyle.THIN);

		font_fail.setColor(Font.COLOR_RED);
		rowStyle_Fail.setFont(font_fail);
		rowStyle_Fail.setAlignment(HorizontalAlignment.CENTER);
		rowStyle_Fail.setVerticalAlignment(VerticalAlignment.CENTER);
		rowStyle_Fail.setBorderBottom(BorderStyle.THIN);
		rowStyle_Fail.setBorderLeft(BorderStyle.THIN);
		rowStyle_Fail.setBorderRight(BorderStyle.THIN);
		rowStyle_Fail.setBorderTop(BorderStyle.THIN);

		for (List<String> stringList : compareResult) {
			// Pass = true, Fail = false
			boolean isPassed = stringList.get(5).equals("Pass");

			// Write to different sheet based on isPassed
			Sheet sheet = isPassed ? workbook.getSheetAt(1) : workbook.getSheetAt(0);

			// get last row in file, and set value & style into cells under last row
			int lastRow = sheet.getLastRowNum() + 1;
			Row row = sheet.createRow(lastRow);

			// iterate list and write in workbook
			for (int i = 0; i < stringList.size(); i += 1) {
				Cell cell = row.createCell(i);
				cell.setCellValue(stringList.get(i));
				cell.setCellStyle(isPassed ? rowStyle_Pass : rowStyle_Fail);
			}
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
