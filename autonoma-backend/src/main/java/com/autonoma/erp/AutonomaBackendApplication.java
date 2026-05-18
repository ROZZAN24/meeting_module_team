package com.autonoma.erp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
<<<<<<< HEAD
@org.springframework.scheduling.annotation.EnableAsync
=======
>>>>>>> origin/chore/repo-cleanup
public class AutonomaBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(AutonomaBackendApplication.class, args);
	}

}
