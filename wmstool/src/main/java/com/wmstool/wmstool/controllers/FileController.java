package com.wmstool.wmstool.controllers;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;

import javax.servlet.ServletContext;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.wmstool.wmstool.services.FileService;

@RestController
@RequestMapping("/api/file")
@CrossOrigin
@PreAuthorize("hasAnyRole('ROLE_Operator','ROLE_Admin')")
public class FileController {

	@Value("${file.filePathForExcels}")
	private String folderPath;

	private static final String seperator = File.separator;
	private static final String filetype = ".xls";

	private static final String SubFolder_OutStockList = "OutStockList";
	private static final String SubFolder_STKADST = "STKADST";
	private static final String SubFolder_STKALLT = "STKALLT";
	private static final String SubFolder_DailyCompare = "DailyStockComparison";
	private static final String SubFolder_WeeklyCompare = "WeeklyStockComparison";

	private static final String File_Category_OutStockList = "outStockList";
	private static final String File_Category_Adjustment = "adjustment";
	private static final String File_Category_Allocation = "allocation";
	private static final String File_Category_DailyCompare = "dailyComparison";
	private static final String File_Category_WeeklyCompare = "weeklyComparison";

	private static final String FilenamePrefix_Allocation = "StockAllocateRecord-";
	private static final String FilenamePrefix_Adjustment = "StockAdjustRecord-";
	private static final String FilenamePrefix_DailyCompare = "DailyStockComparison-";
	private static final String FilenamePrefix_WeekylyCompare = "WeeklyStockComparison-";

	@Autowired
	private ServletContext servletContext;

	@Autowired
	private FileService fileService;

	@GetMapping("/download/{fileCategory}/{fileName}")
	public ResponseEntity<?> downloadCategoryFile(@PathVariable String fileCategory, @PathVariable String fileName) {
		String subFolderName = "";

		switch (fileCategory) {
		case File_Category_Allocation:
			subFolderName = SubFolder_STKALLT;
			break;
		case File_Category_Adjustment:
			subFolderName = SubFolder_STKADST;
			break;
		case File_Category_OutStockList:
			subFolderName = SubFolder_OutStockList;
			break;
		case File_Category_DailyCompare:
			subFolderName = SubFolder_DailyCompare;
			break;
		case File_Category_WeeklyCompare:
			subFolderName = SubFolder_WeeklyCompare;
			break;
		default:
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}

		try {
			MediaType mediaType = getMediaTypeByFilename(this.servletContext, fileName + filetype);
			Path path = Paths.get(folderPath + seperator + subFolderName + seperator
					+ pathResolver(fileCategory, fileName) + filetype);
			byte[] data = Files.readAllBytes(path);
			ByteArrayResource resource = new ByteArrayResource(data);

			return ResponseEntity.ok()
					.header(HttpHeaders.CONTENT_DISPOSITION,
							String.format("attachment; filename=%s", path.getFileName()))
					.contentType(mediaType).contentLength(data.length).body(resource);
		} catch (Exception e) {
			e.printStackTrace();

			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	@GetMapping("/query/{fileCategory}/today")
	public ResponseEntity<?> queryCategoryTodayFile(@PathVariable String fileCategory) {
		switch (fileCategory) {
		case File_Category_Allocation:
			return new ResponseEntity<String>(fileService.findTodayFile(fileCategory,
					folderPath + seperator + SubFolder_STKALLT, FilenamePrefix_Allocation), HttpStatus.OK);
		case File_Category_Adjustment:
			return new ResponseEntity<String>(fileService.findTodayFile(fileCategory,
					folderPath + seperator + SubFolder_STKADST, FilenamePrefix_Adjustment), HttpStatus.OK);
		case File_Category_DailyCompare:
			return new ResponseEntity<String>(fileService.findTodayFile(fileCategory,
					folderPath + seperator + SubFolder_DailyCompare, FilenamePrefix_DailyCompare), HttpStatus.OK);
		case File_Category_WeeklyCompare:
			return new ResponseEntity<String>(fileService.findTodayFile(fileCategory,
					folderPath + seperator + SubFolder_WeeklyCompare, FilenamePrefix_WeekylyCompare), HttpStatus.OK);
		default:
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	@GetMapping("/query/{fileCategory}/interval")
	public ResponseEntity<?> queryCategoryIntervalFiles(@PathVariable String fileCategory,
			@RequestParam(value = "startDate") String start, @RequestParam(value = "endDate") String end) {
		switch (fileCategory) {
		case File_Category_Allocation:
			return new ResponseEntity<List<String>>(fileService.findPeriodFiles(fileCategory,
					folderPath + seperator + SubFolder_STKALLT, FilenamePrefix_Allocation, start, end), HttpStatus.OK);
		case File_Category_Adjustment:
			return new ResponseEntity<List<String>>(fileService.findPeriodFiles(fileCategory,
					folderPath + seperator + SubFolder_STKADST, FilenamePrefix_Adjustment, start, end), HttpStatus.OK);
		case File_Category_DailyCompare:
			return new ResponseEntity<List<String>>(fileService.findPeriodFiles(fileCategory,
					folderPath + seperator + SubFolder_DailyCompare, FilenamePrefix_DailyCompare, start, end),
					HttpStatus.OK);
		case File_Category_WeeklyCompare:
			return new ResponseEntity<List<String>>(fileService.findPeriodFiles(fileCategory,
					folderPath + seperator + SubFolder_DailyCompare, FilenamePrefix_DailyCompare, start, end),
					HttpStatus.OK);
		default:
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	@PostMapping("/import/inStockFile")
	public ResponseEntity<?> importStockRecord(@RequestParam(name = "files") MultipartFile[] multipartFiles) {
		try {
			Arrays.asList(multipartFiles).stream()
					.forEach(multipartFile -> fileService.importStockRecord(multipartFile));

			return new ResponseEntity<>(HttpStatus.OK);
		} catch (Exception ex) {
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Helper method to specify media type
	 */
	private MediaType getMediaTypeByFilename(ServletContext servletContext, String filename) {
		try {
			String mimeType = servletContext.getMimeType(filename);
			
			return MediaType.parseMediaType(mimeType);
		} catch (Exception e) {
			return MediaType.APPLICATION_OCTET_STREAM;
		}
	}

	/**
	 * Helper method to create target file directory
	 */
	private String pathResolver(String fileCategory, String fileName) {
		int index = fileName.indexOf("-");

		switch (fileCategory) {
		case File_Category_Allocation:
		case File_Category_Adjustment:
		case File_Category_OutStockList:
		case File_Category_DailyCompare:
			return fileName.substring(index + 1, index + 5) + seperator
					+ String.valueOf(Integer.parseInt(fileName.substring(index + 5, index + 7))) + seperator + fileName;
		case File_Category_WeeklyCompare:
			return fileName.substring(index + 1, index + 5) + seperator + fileName;
		default:
			return null;
		}

	}
}
