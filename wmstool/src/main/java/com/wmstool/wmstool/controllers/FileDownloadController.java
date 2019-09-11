package com.wmstool.wmstool.controllers;

import java.io.IOException;
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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wmstool.wmstool.models.payloads.CreateFileRequest;
import com.wmstool.wmstool.services.FileService;

@RestController
@RequestMapping("/api/download")
public class FileDownloadController {

	private static final String EXTERNAL_FILE_PATH = "/Users/weichihchen/Desktop/Temp/";

	@Autowired
	private ServletContext servletContext;

	@Autowired
	private FileService fileService;

	@GetMapping("/downloadFile/{filename}")
	public ResponseEntity<ByteArrayResource> downloadFile(@PathVariable("filename") String filename)
			throws IOException {
		MediaType mediaType = getMediaTypeByFilename(this.servletContext, filename);

		Path path = Paths.get(EXTERNAL_FILE_PATH + filename);
		byte[] data = Files.readAllBytes(path);
		ByteArrayResource resource = new ByteArrayResource(data);

		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment;filename=" + path.getFileName().toString())
				.contentType(mediaType).contentLength(data.length).body(resource);
	}

	@PostMapping("/createFile")
	public ResponseEntity<String> createFile(@RequestBody CreateFileRequest request) throws IOException {
		return new ResponseEntity<String>(fileService.createFile(request), HttpStatus.CREATED);
	}

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
