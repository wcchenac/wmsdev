package com.wmstool.wmstool.controllers;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

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
import org.springframework.web.bind.annotation.RestController;

import com.wmstool.wmstool.services.FileService;

@RestController
@RequestMapping("/api/download")
public class FileDownloadController {

	private static final String EXTERNAL_FILE_PATH = "/Users/weichihchen/Desktop/Temp/";

	private static final String SubFolder_OutStockList = "OutStockList/";

	@Autowired
	private ServletContext servletContext;

	@Autowired
	private FileService fileService;

	// TODO: Wait modify for shortage
//	@PostMapping("/createFile")
//	public ResponseEntity<String> createFile(@RequestBody CreateFileRequest request) throws IOException {
//		return new ResponseEntity<String>(fileService.createFile(request), HttpStatus.CREATED);
//	}

	
	@GetMapping("/outStockList/{fileName}")
	public ResponseEntity<?> downloadOutStockList(@PathVariable String fileName) {
		try {
			MediaType mediaType = getMediaTypeByFilename(this.servletContext, fileName);
			Path path = Paths.get(EXTERNAL_FILE_PATH + SubFolder_OutStockList + fileName);
			byte[] data = Files.readAllBytes(path);
			ByteArrayResource resource = new ByteArrayResource(data);

			return ResponseEntity.ok()
					.header(HttpHeaders.CONTENT_DISPOSITION,
							String.format("attachment; filename=\"%s\"", path.getFileName().toString()))
					.contentType(mediaType).contentLength(data.length).body(resource);
		} catch (Exception e) {
			System.out.println(e.getMessage());
			e.printStackTrace();
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Helper method to specify media type
	 */
	private static MediaType getMediaTypeByFilename(ServletContext servletContext, String filename) {
		String mimeType = servletContext.getMimeType(filename);
		try {
			MediaType mediaType = MediaType.parseMediaType(mimeType);
			return mediaType;
		} catch (Exception e) {
			return MediaType.APPLICATION_OCTET_STREAM;
		}
	}
}
