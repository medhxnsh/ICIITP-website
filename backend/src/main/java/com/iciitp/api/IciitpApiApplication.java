package com.iciitp.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling
@EnableAsync
@ComponentScan(basePackages = {
        "com.iciitp.api.features",
        "com.iciitp.api.shared"
})
@EnableJpaRepositories(basePackages = {
        "com.iciitp.api.features",
        "com.iciitp.api.shared"
})
public class IciitpApiApplication {
    public static void main(String[] args) {
        SpringApplication.run(IciitpApiApplication.class, args);
    }
}
