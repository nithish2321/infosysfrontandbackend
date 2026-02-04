package com.ompt.Ompt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class OmptApplication {

	public static void main(String[] args) {
		SpringApplication.run(OmptApplication.class, args);
	}

}
