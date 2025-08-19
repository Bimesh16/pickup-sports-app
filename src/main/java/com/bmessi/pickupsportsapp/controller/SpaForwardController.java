package com.bmessi.pickupsportsapp.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaForwardController {
    // Forward non-API, non-media routes to index.html
    @GetMapping(value = {"/{path:^(?!api|media|actuator|docs).*$}/**"})
    public String forwardToIndex() {
        return "forward:/index.html";
    }
}