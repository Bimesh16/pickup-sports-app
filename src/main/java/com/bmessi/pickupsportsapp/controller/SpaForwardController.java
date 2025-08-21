package com.bmessi.pickupsportsapp.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaForwardController {
    // Forward SPA routes only under /app to index.html (avoid intercepting static, docs, WS, etc.)
    @GetMapping("/app/**")
    public String forwardToIndex() {
        return "forward:/index.html";
    }
}