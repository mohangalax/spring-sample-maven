package com.sample.maven.controller;

import org.springframework.stereotype.Controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import springfox.documentation.annotations.ApiIgnore;


@Controller
@ApiIgnore
public class SampleController {
    @RequestMapping("/")
    public ModelAndView init() {
        final ModelAndView model = new ModelAndView();
        model.setViewName("index");

        return model;
    }
}
