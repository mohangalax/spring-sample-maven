package com.sample.maven.config.swagger;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

@Configuration
@EnableSwagger2
public class SampleSwaggerConfig {
	
	@Bean
    public Docket api(){
        return new Docket(DocumentationType.SWAGGER_2)
            .select()
            .apis(RequestHandlerSelectors.any())
            .paths(PathSelectors.any())
            .build()
            .pathMapping("/")
            .apiInfo(apiInfo());
    }

    private ApiInfo apiInfo() {
    	final String title = "Sample Maven";
    	final String description = "This API is used for Sample Maven to provide extra option";
    	final String version = "V1.0";
    	final String termsOfServiceUrl = "";
    	final String contact = "mohangalax@gmail.com";
    	final String license = "";
    	final String licenseUrl = "";
        ApiInfo apiInfo = new ApiInfo(title, description, version, termsOfServiceUrl, contact, license, licenseUrl);
        return apiInfo;
    }

}
