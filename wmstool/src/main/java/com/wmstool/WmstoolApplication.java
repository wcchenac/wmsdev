package com.wmstool;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport;

@SpringBootApplication
public class WmstoolApplication extends WebMvcConfigurationSupport {

	public static void main(String[] args) {
		SpringApplication.run(WmstoolApplication.class, args);
	}

}
