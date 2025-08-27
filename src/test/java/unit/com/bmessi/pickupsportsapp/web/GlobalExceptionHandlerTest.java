package com.bmessi.pickupsportsapp.web;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = GlobalExceptionHandlerTest.TestErrorController.class)
@Import(com.bmessi.pickupsportsapp.advice.GlobalExceptionHandler.class)
class GlobalExceptionHandlerTest {

    @Autowired
    MockMvc mvc;

    @RestController
    static class TestErrorController {
        @GetMapping("/err/illegal")
        public void illegal() {
            throw new IllegalArgumentException("Invalid request");
        }
    }

    @Test
    void illegalArgument_returnsStandardErrorBody() throws Exception {
        mvc.perform(get("/err/illegal").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(header().string("Cache-Control", containsString("no-store")))
                .andExpect(jsonPath("$.error", is("invalid_request")))
                .andExpect(jsonPath("$.message", is("Invalid request")))
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.timestamp", notNullValue()))
                .andExpect(jsonPath("$.path", is("/err/illegal")));
    }
}
