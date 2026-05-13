package com.autonoma.erp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AutonomaBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(AutonomaBackendApplication.class, args);
	}

}
