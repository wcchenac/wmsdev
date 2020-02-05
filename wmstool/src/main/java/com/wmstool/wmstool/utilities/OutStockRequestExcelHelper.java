package com.wmstool.wmstool.utilities;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
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

import com.wmstool.wmstool.models.OutStockRequest;

@Component
public class OutStockRequestExcelHelper {

	@Value("${file.filePathForExcels}")
	private String folderPath;

	private static final String seperator = File.separator;
	private static final String filetype = ".xls";
	private static final String filenamePrefix = "OutStockList-";
	private static final DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

	/**
	 * Create a excel from template excel which is named by current date/time
	 * formated in "yyyyMMddHHmmss" pattern
	 */
	public String createNewFile(LocalDateTime now) throws IOException {
		String parentDir = folderPath + seperator + "OutStockList";
		String templateFile = parentDir + seperator + "OutStockListTemplate" + filetype;

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
		}

		// Output template content to certain file
		FileOutputStream fos = new FileOutputStream(f);
		workbook.write(fos);

		workbook.close();

		return fileNameNoDir;
	}

	/**
	 * Using given outStockRequest information to update the given filename excel
	 */
	public void modifyExisting(List<OutStockRequest> outStockRequestList, LocalDateTime now, String fileName)
			throws IOException {
		String parentDir = folderPath + seperator + "OutStockList";

		// Read target file
		String fileFullName = parentDir + seperator + now.getYear() + seperator + now.getMonthValue() + seperator
				+ fileName;
		File f = new File(fileFullName);
		FileInputStream fis = new FileInputStream(f);
		Workbook workbook = WorkbookFactory.create(fis);

		// Select first sheet of excel file
		Sheet sheet = workbook.getSheetAt(0);

		// Style setting for font, alignment and cell border
		CellStyle rowStyle = workbook.createCellStyle();
		Font font = workbook.createFont();
		font.setColor(Font.COLOR_NORMAL);
		rowStyle.setFont(font);
		rowStyle.setAlignment(HorizontalAlignment.CENTER);
		rowStyle.setVerticalAlignment(VerticalAlignment.CENTER);
		rowStyle.setWrapText(true);
		rowStyle.setBorderBottom(BorderStyle.THIN);
		rowStyle.setBorderLeft(BorderStyle.THIN);
		rowStyle.setBorderRight(BorderStyle.THIN);
		rowStyle.setBorderTop(BorderStyle.THIN);

		// get last row in file, and set value & style into cells under last row
		for (int i = 0, lastRow = sheet.getLastRowNum() + 1; i < outStockRequestList.size(); i += 1, lastRow += 1) {
			OutStockRequest outStockRequest = outStockRequestList.get(i);

			Row row = sheet.createRow(lastRow);
			Cell cell = row.createCell(0);
			cell.setCellValue(outStockRequestList.get(i).getProductNo());
			cell.setCellStyle(rowStyle);

			cell = row.createCell(1);
			cell.setCellValue(outStockRequest.getLotNo());
			cell.setCellStyle(rowStyle);

			cell = row.createCell(2);
			cell.setCellValue(outStockRequest.getColor());
			cell.setCellStyle(rowStyle);

			cell = row.createCell(3);
			cell.setCellValue(outStockRequest.getDefect());
			cell.setCellStyle(rowStyle);

			cell = row.createCell(4);
			cell.setCellValue(outStockRequest.getQuantity());
			cell.setCellStyle(rowStyle);

			cell = row.createCell(6);
			cell.setCellValue(outStockRequest.getReason());
			cell.setCellStyle(rowStyle);

			cell = row.createCell(8);
			cell.setCellValue(outStockRequest.getRequestFrom());
			cell.setCellStyle(rowStyle);
		}

		// close input stream
		fis.close();

		// create out stream
		FileOutputStream fos = new FileOutputStream(f);

		// save modify contents to target file through output stream
		workbook.write(fos);

		// close workbook
		workbook.close();

		// close output stream
		fos.flush();
		fos.close();
	}

}
