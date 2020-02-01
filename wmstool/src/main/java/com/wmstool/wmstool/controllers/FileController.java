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
//@PreAuthorize("hasAnyRole('ROLE_Operator','ROLE_Admin')")
public class FileController {

	@Value("${file.filePathForExcels}")
	private String folderPath;

	private static final String seperator = File.separator;
	private static final String filetype = ".xls";

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
			MediaType mediaType = getMediaTypeByFilename(this.servletContext, fileName + filetype);
			Path path = Paths
					.get(folderPath + seperator + subFolderName + seperator + pathResolver(fileName) + filetype);
			byte[] data = Files.readAllBytes(path);
			ByteArrayResource resource = new ByteArrayResource(data);

			return ResponseEntity.ok()
					.header(HttpHeaders.CONTENT_DISPOSITION,
							String.format("attachment; filename=%s", path.getFileName().toString()))
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
			return new ResponseEntity<String>(
					fileService.findTodayFile(folderPath + seperator + SubFolder_STKALLT, FilenamePrefix_Allocation),
					HttpStatus.OK);
		case File_Category_Adjustment:
			return new ResponseEntity<String>(
					fileService.findTodayFile(folderPath + seperator + SubFolder_STKADST, FilenamePrefix_Adjustment),
					HttpStatus.OK);
		default:
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	@GetMapping("/query/{fileCategory}/interval")
	public ResponseEntity<?> queryCategoryIntervalFiles(@PathVariable String fileCategory,
			@RequestParam(value = "startDate") String start, @RequestParam(value = "endDate") String end) {
		switch (fileCategory) {
		case File_Category_Allocation:
			return new ResponseEntity<List<String>>(fileService.findPeriodFiles(
					folderPath + seperator + SubFolder_STKALLT, FilenamePrefix_Allocation, start, end), HttpStatus.OK);
		case File_Category_Adjustment:
			return new ResponseEntity<List<String>>(fileService.findPeriodFiles(
					folderPath + seperator + SubFolder_STKADST, FilenamePrefix_Adjustment, start, end), HttpStatus.OK);
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

		return fileName.substring(index + 1, index + 5) + seperator
				+ String.valueOf(Integer.parseInt(fileName.substring(index + 5, index + 7))) + seperator + fileName;
	}
}
