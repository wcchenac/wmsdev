package com.wmstool.wmstool.services;

import java.io.File;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

@Service
public class FileService {

	private static final String seperator = File.separator;
	private static final String filetype = ".xls";
	private static final DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyyMMdd");

	public String findTodayFile(String parentDir, String filenamePrefix) {
		LocalDate now = LocalDate.now();
		String fileNameNoDir = filenamePrefix + now.format(dtf) + filetype;
		String fileFullName = parentDir + seperator + now.getYear() + seperator + now.getMonthValue() + seperator
				+ fileNameNoDir;
		File f = new File(fileFullName);

		if (!f.exists()) {
			return "File Not Found";
		}

		return fileNameNoDir;

	}

	public List<String> findPeriodFiles(String parentDir, String filenamePrefix, String start, String end) {
		List<String> resultList = new ArrayList<>();
		LocalDateTime startDateTime = LocalDateTime.parse(start, DateTimeFormatter.ISO_LOCAL_DATE_TIME).plusHours(8);
		LocalDateTime endDateTime = LocalDateTime.parse(end, DateTimeFormatter.ISO_LOCAL_DATE_TIME).plusHours(8);
		Period period = Period.between(startDateTime.toLocalDate(), endDateTime.toLocalDate());
		int dayInterval = period.getDays();

		for (int i = 0; i <= dayInterval; i += 1) {
			LocalDate d = startDateTime.plusDays(i).toLocalDate();
			String fileNameNoDir = filenamePrefix + d.format(dtf) + filetype;
			String fileFullName = parentDir + seperator + d.getYear() + seperator + d.getMonthValue() + seperator
					+ fileNameNoDir;
			File f = new File(fileFullName);

			if (f.exists()) {
				resultList.add(fileNameNoDir);
			}
		}

		return resultList;
	}
}
