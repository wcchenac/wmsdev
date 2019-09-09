package com.wmstool.wmstool.utilities;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.stereotype.Component;

@Component
public class ExcelHelper {

	private static final String dir = "/Users/weichihchen/Desktop/Temp/";
	private static final String filetype = ".xls";
	private static final String templateFile = dir + "temp" + filetype;

	public String modifyExisting(String productNo, float decrement) throws IOException {
		//Read template file
		Workbook workbook = WorkbookFactory.create(new File(templateFile));

		// Modify excel
		Sheet sheet = workbook.getSheetAt(0);
		Row row = sheet.createRow(4);
		Cell cell = row.createCell(0);
		cell.setCellValue(productNo);
		cell = row.createCell(1);
		cell.setCellValue(decrement); // TODO: precision issue 

		// Define filename
		// Need add serial no? If yes, how to load serial no?
		DateFormat format = new SimpleDateFormat("yyyyMMdd");
		String date = format.format(new Date());

		String fileNameNoDir = productNo + "-" + date + filetype;
		String fileFullName = dir + fileNameNoDir;

		// Output new file to certain directory
		FileOutputStream fos = new FileOutputStream(new File(fileFullName));
		workbook.write(fos);

		workbook.close();

		/*
		// List files in certain folder
		try {
			Stream<Path> walk = Files.walk(Paths.get(dir));
			List<String> result = walk.map(x -> x.toString()).filter(f -> f.startsWith(fileName))
					.collect(Collectors.toList());
			result.forEach(System.out::println);
			walk.close();
		} catch (IOException err) {
			err.printStackTrace();
		}
		*/
		
		return fileNameNoDir;
	}

	
}
