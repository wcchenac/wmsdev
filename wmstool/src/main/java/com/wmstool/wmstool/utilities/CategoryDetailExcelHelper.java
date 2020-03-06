package com.wmstool.wmstool.utilities;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
import org.apache.poi.ss.util.CellRangeAddress;
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

	public String outputCategoryResult(String category, List<?> stockResultList, Map<String, String[]> productInfoMap,
			Map<String, Map<String, Map<String, String>>> saleRecords) throws IOException, FileNotFoundException {
		String filename = filenamePrefix + category + filetype_excel;
		File f = new File(folderPathForExcel + seperator + "CategoryDetail" + seperator + filename);

		// if filename already exist, delete it; otherwise, create folders
		if (f.exists()) {
			f.delete();
		} else {
			f.getParentFile().mkdirs();
		}

		f.createNewFile();

		Workbook workbook = new HSSFWorkbook();
		Sheet sheet = workbook.createSheet(category);
		FileOutputStream fos = new FileOutputStream(f);
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
			// record, inStockType, firstStockAt, category]
			boolean diff = true;

			for (int i = 0; i < stockResultList.size(); i += 1) {
				Object[] cells = (Object[]) stockResultList.get(i);

				if (diff) {
					contentFirstPart(workbook, sheet, rowStyle, cells, productInfoMap);
				}

				contentSecondPart(workbook, sheet, rowStyle, cells, p);

				// if there is no next row or next row productNo not equal to this row
				// productNo, do contentThirdPart
				if (i + 1 == stockResultList.size()) {
					contentThirdPart(workbook, sheet, rowStyle, saleRecords.get(cells[0].toString()));
				}

				if (i + 1 < stockResultList.size()) {
					Object[] temp = (Object[]) stockResultList.get(i + 1);
					if (!p.getProductNo().equals(temp[0].toString())) {
						diff = true;

						contentThirdPart(workbook, sheet, rowStyle, saleRecords.get(cells[0].toString()));
					} else {
						diff = false;
					}
				}

			}

			workbook.write(fos);
			workbook.close();
			fos.close();

			return filename;
		} catch (IOException e) {
			e.printStackTrace();

			workbook.close();
			fos.close();

			return "Fail";
		}

	}

	// Insert productNo picture and table header
	private void contentFirstPart(Workbook workbook, Sheet sheet, CellStyle rowStyle, Object[] stockCells,
			Map<String, String[]> productInfoMap) throws IOException {
		// Object that handles instantiating concrete classes
		CreationHelper helper = workbook.getCreationHelper();

		// Creates the top-level drawing patriarch
		Drawing<?> drawing = sheet.createDrawingPatriarch();

		// Creates an anchor that is attached to the sheet
		ClientAnchor anchor = helper.createClientAnchor();

		String productNo = stockCells[0].toString();
		String picturePath = folderPathForPicture + seperator + productNo + filetype_picture;
		int lastRow = sheet.getLastRowNum();
		File f = new File(picturePath);
		String[] productInfo = productInfoMap.get(productNo);
		final String[] productTable = { "廠商代碼", "廠商名稱", "品名", "成本", "價格異動" };
		final String[] tableHeader = { "貨號", "批號", "型態", "數量", "單位", "色號", "瑕疵", "備註", "記錄", "進貨方式", "母批進貨日期", "分類" };
		Row row;
		Cell cell;

		// Add product information
		for (int i = 0; i < productInfo.length; i += 1) {
			row = sheet.createRow(lastRow + 4 + i);

			// product info header
			cell = row.createCell(6);
			cell.setCellValue(productTable[i]);
			cell.setCellStyle(rowStyle);

			// content
			cell = row.createCell(7);
			cell.setCellValue(productInfo[i]);
			cell.setCellStyle(rowStyle);
			cell = row.createCell(8);
			cell.setCellStyle(rowStyle);

			// merge cell
			sheet.addMergedRegion(new CellRangeAddress(lastRow + 4 + i, lastRow + 4 + i, 7, 8));
		}

		// Add picture
		if (f.exists()) {
			Path picture_path = Paths.get(picturePath);
			byte[] picture_bytes = Files.readAllBytes(picture_path);
			int pictureIdx = workbook.addPicture(picture_bytes, Workbook.PICTURE_TYPE_JPEG);

			anchor.setCol1(0);
			anchor.setCol2(4);
			anchor.setRow1(lastRow + 2);
			anchor.setRow2(lastRow + 16);

			drawing.createPicture(anchor, pictureIdx);

			lastRow += 16;
		} else {
			lastRow += 10;
		}

		// stock table header
		row = sheet.createRow(lastRow);

		for (int i = 0; i < tableHeader.length; i += 1) {
			cell = row.createCell(i);

			cell.setCellValue(tableHeader[i]);
			cell.setCellStyle(rowStyle);
		}

	}

	// Insert stock table details
	private void contentSecondPart(Workbook workbook, Sheet sheet, CellStyle rowStyle, Object[] stockCells, Product p) {
		int lastRow = sheet.getLastRowNum();
		Row row = sheet.createRow(lastRow + 1);
		Cell cell;

		for (int i = 0; i < stockCells.length; i += 1) {
			cell = row.createCell(i);

			if (stockCells[i] != null) {
				cell.setCellValue(stockCells[i].toString());
			}

			cell.setCellStyle(rowStyle);
		}

		p.setProductNo(stockCells[0].toString());
	}

	// Insert ship summary
	private void contentThirdPart(Workbook workbook, Sheet sheet, CellStyle rowStyle,
			Map<String, Map<String, String>> saleRecords) {
		int lastRow = sheet.getLastRowNum();
		Row row = sheet.createRow(lastRow += 2);

		// Sale record table header
		Cell cell = row.createCell(0);
		cell.setCellValue("銷售紀錄");
		cell.setCellStyle(rowStyle);

		row = sheet.createRow(lastRow += 1);
		for (int i = 0; i < 4; i += 1) {
			cell = row.createCell(2 * i);
			cell.setCellValue("出貨對象");
			cell.setCellStyle(rowStyle);

			cell = row.createCell(2 * i + 1);
			cell.setCellValue("數量");
			cell.setCellStyle(rowStyle);
		}

		// Sale record table content
		if (saleRecords != null) {
			List<String> reasons = saleRecords.keySet().stream().sorted().collect(Collectors.toList());

			for (int i = 0; i < reasons.size(); i += 1) {
				int j = i % 4;

				if (j == 0) {
					row = sheet.createRow(lastRow += 1);
				}

				cell = row.createCell(2 * j);
				cell.setCellValue(reasons.get(i));
				cell.setCellStyle(rowStyle);

				cell = row.createCell(2 * j + 1);
				cell.setCellValue(
						saleRecords.get(reasons.get(i)).get("quantity") + saleRecords.get(reasons.get(i)).get("unit"));
				cell.setCellStyle(rowStyle);

			}
		}
	}

}
