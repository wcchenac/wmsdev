package com.wmstool.wmstool.controllers;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import javax.servlet.ServletContext;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.wmstool.wmstool.services.FileService;

@RestController
@RequestMapping("/api/file")
public class FileController {

	private static final String seperator = File.separator;
	private static final String ParentFolderDir = "/Users/weichihchen/Desktop/Temp";

	private static final String SubFolder_OutStockList = "OutStockList";
	private static final String SubFolder_STKADST = "STKADST";
	private static final String SubFolder_STKALLT = "STKALLT";

	private static final String File_Category_OutStockList = "outStockList";
	private static final String File_Category_Adjustment = "adjustment";
	private static final String File_Category_Allocation = "allocation";

	private static final String FilenamePrefix_Allocation = "StockAllocateRecord-";
	private static final String FilenamePrefix_Adjustment = "StockAdjustRecord-";

	@Autowired
	private ServletContext servletContext;

	@Autowired
	private FileService fileService;

	@GetMapping("/download/{fileCategory}/{fileName}")
	public ResponseEntity<?> downloadCategoryFile(@PathVariable String fileCategory, @PathVariable String fileName) {
		String subFolderName = "";

		if (fileCategory.equals(File_Category_Allocation)) {
			subFolderName = SubFolder_STKALLT;
		} else if (fileCategory.equals(File_Category_Adjustment)) {
			subFolderName = SubFolder_STKADST;
		} else if (fileCategory.equals(File_Category_OutStockList)) {
			subFolderName = SubFolder_OutStockList;
		} else {
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}

		try {
			MediaType mediaType = getMediaTypeByFilename(this.servletContext, fileName);
			Path path = Paths.get(ParentFolderDir + seperator + subFolderName + seperator + pathResolver(fileName));
			byte[] data = Files.readAllBytes(path);
			ByteArrayResource resource = new ByteArrayResource(data);

			return ResponseEntity.ok()
					.header(HttpHeaders.CONTENT_DISPOSITION,
							String.format("attachment; filename=\"%s\"", path.getFileName().toString()))
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
			return new ResponseEntity<String>(fileService.findTodayFile(ParentFolderDir + seperator + SubFolder_STKALLT,
					FilenamePrefix_Allocation), HttpStatus.OK);
		case File_Category_Adjustment:
			return new ResponseEntity<String>(fileService.findTodayFile(ParentFolderDir + seperator + SubFolder_STKADST,
					FilenamePrefix_Adjustment), HttpStatus.OK);
		default:
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	@GetMapping("/query/{fileCategory}/interval")
	public ResponseEntity<?> queryCategoryIntervalFiles(@PathVariable String fileCategory,
			@RequestParam(value = "startDate") String start, @RequestParam(value = "endDate") String end) {
		switch (fileCategory) {
		case File_Category_Allocation:
			return new ResponseEntity<List<String>>(
					fileService.findPeriodFiles(ParentFolderDir + seperator + SubFolder_STKALLT,
							FilenamePrefix_Allocation, start, end),
					HttpStatus.OK);
		case File_Category_Adjustment:
			return new ResponseEntity<List<String>>(
					fileService.findPeriodFiles(ParentFolderDir + seperator + SubFolder_STKADST,
							FilenamePrefix_Adjustment, start, end),
					HttpStatus.OK);
		default:
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Helper method to specify media type
	 */
	private MediaType getMediaTypeByFilename(ServletContext servletContext, String filename) {
		String mimeType = servletContext.getMimeType(filename);
		try {
			MediaType mediaType = MediaType.parseMediaType(mimeType);
			return mediaType;
		} catch (Exception e) {
			return MediaType.APPLICATION_OCTET_STREAM;
		}
	}

	/**
	 * Helper method to create target file directory
	 */
	private String pathResolver(String fileName) {
		int index = fileName.indexOf("-");
		String seperator = File.separator;

		return fileName.substring(index + 1, index + 5) + seperator + fileName.substring(index + 5, index + 7)
				+ seperator + fileName;
	}
}
