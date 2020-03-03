package com.wmstool.wmstool.utilities;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.ClientAnchor;
import org.apache.poi.ss.usermodel.CreationHelper;
import org.apache.poi.ss.usermodel.Drawing;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.wmstool.wmstool.models.Product;

@Component
public class CategoryDetailExcelHelper {

	@Value("${file.filePathForExcels}")
	private String folderPathForExcel;

	@Value("${file.filePathForPictures}")
	private String folderPathForPicture;

	private static final String seperator = File.separator;
	private static final String filetype_picture = ".jpg";
	private static final String filetype_excel = ".xls";
	private static final String filenamePrefix = "CategoryDetail-";
	private static final DateTimeFormatter dtf_yyyyMMdd = DateTimeFormatter.ofPattern("yyyyMMdd");

	public String outputCategoryResult(String category, List<?> resultList) throws IOException, FileNotFoundException {
		String filename = filenamePrefix + LocalDate.now().format(dtf_yyyyMMdd) + "-" + category + filetype_excel;
		File f = new File(
				folderPathForExcel + seperator + "CategoryDetails" + seperator + category + seperator + filename);

		// if filename already exist, delete it; otherwise, create folders
		if (f.exists()) {
			f.delete();
		}

		f.getParentFile().mkdirs();
		f.createNewFile();

		Workbook workbook = new HSSFWorkbook();
		FileOutputStream fos = new FileOutputStream(f);

		Sheet sheet = workbook.createSheet(category);
		Product p = new Product();

		// Style setting for font, alignment and cell border
		CellStyle rowStyle = workbook.createCellStyle();
		Font font = workbook.createFont();

		font.setColor(Font.COLOR_NORMAL);
		rowStyle.setFont(font);
		rowStyle.setAlignment(HorizontalAlignment.CENTER);
		rowStyle.setVerticalAlignment(VerticalAlignment.CENTER);
		rowStyle.setBorderBottom(BorderStyle.THIN);
		rowStyle.setBorderLeft(BorderStyle.THIN);
		rowStyle.setBorderRight(BorderStyle.THIN);
		rowStyle.setBorderTop(BorderStyle.THIN);

		try {
			// The format of resultList is as below:
			// Row n : [productNo, lotNo, type, quantity, unit, color, defect, remark,
			// record, inStockType, firstStockAt, shrinkAt, category]
			for (Object row : resultList) {
				Object[] cells = (Object[]) row;

				if (p.getProductNo() == null || !p.getProductNo().equals(cells[0].toString())) {
					contentFirstPart(workbook, sheet, rowStyle, cells);
				}

				contentSecondPart(workbook, sheet, rowStyle, cells, p);
			}

			workbook.write(fos);
			workbook.close();
			fos.close();

			return filename;
		} catch (Exception e) {
			e.printStackTrace();

			workbook.close();
			fos.close();

			return "Fail";
		}

	}

	// Insert productNo picture and table header
	private void contentFirstPart(Workbook workbook, Sheet sheet, CellStyle rowStyle, Object[] cells)
			throws IOException {
		// Object that handles instantiating concrete classes
		CreationHelper helper = workbook.getCreationHelper();

		// Creates the top-level drawing patriarch
		Drawing<?> drawing = sheet.createDrawingPatriarch();

		// Creates an anchor that is attached to the sheet
		ClientAnchor anchor = helper.createClientAnchor();

		String productNo = cells[0].toString();
		String picturePath = folderPathForPicture + seperator + productNo + filetype_picture;
		int lastRow = sheet.getLastRowNum();
		File f = new File(picturePath);

		if (f.exists()) {
			// Add picture
			Path picture_path = Paths.get(picturePath);
			byte[] picture_bytes = Files.readAllBytes(picture_path);
			int pictureIdx = workbook.addPicture(picture_bytes, Workbook.PICTURE_TYPE_JPEG);

			anchor.setCol1(0);
			anchor.setCol2(4);
			anchor.setRow1(lastRow += 2);
			anchor.setRow2(lastRow += 16);

			drawing.createPicture(anchor, pictureIdx);
		} else {
			lastRow += 2;
		}

		// Table header
		String[] tableHeader = { "貨號", "批號", "型態", "數量", "單位", "色號", "瑕疵", "備註", "記錄", "進貨方式", "母批進貨日期", "減肥日期", "分類" };
		Row row = sheet.createRow(lastRow);
		Cell cell;

		for (int i = 0; i < tableHeader.length; i += 1) {
			cell = row.createCell(i);

			cell.setCellValue(tableHeader[i]);
			cell.setCellStyle(rowStyle);
		}

	}

	// Insert content details
	private void contentSecondPart(Workbook workbook, Sheet sheet, CellStyle rowStyle, Object[] cells, Product p) {
		int lastRow = sheet.getLastRowNum();
		Row row = sheet.createRow(lastRow + 1);
		Cell cell;

		for (int i = 0; i < cells.length; i += 1) {
			cell = row.createCell(i);

			if (cells[i] != null) {
				cell.setCellValue(cells[i].toString());
			}

			cell.setCellStyle(rowStyle);
		}

		p.setProductNo(cells[0].toString());
	}

}
