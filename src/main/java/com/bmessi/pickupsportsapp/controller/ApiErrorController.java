package com.bmessi.pickupsportsapp.controller;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Ensures /error returns a compact JSON response and does not render an HTML view.
 * This prevents recursive forwards and session lookups during error rendering.
 */
@RestController
public class ApiErrorController implements ErrorController {

    @RequestMapping(value = "/error", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> handleError(HttpServletRequest request) {
        Object sc = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        int status = (sc instanceof Integer) ? (Integer) sc : HttpStatus.INTERNAL_SERVER_ERROR.value();

        String message = String.valueOf(request.getAttribute(RequestDispatcher.ERROR_MESSAGE));
        String path = String.valueOf(request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI));

        Map<String, Object> body = new HashMap<>();
        body.put("error", HttpStatus.valueOf(status).getReasonPhrase());
        body.put("message", (message == null || "null".equals(message)) ? "Unexpected error" : message);
        body.put("path", path);
        body.put("status", status);
        body.put("timestamp", Instant.now().toEpochMilli());

        return ResponseEntity.status(status).body(body);
    }
}
