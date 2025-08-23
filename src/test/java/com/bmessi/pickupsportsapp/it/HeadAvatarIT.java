package com.bmessi.pickupsportsapp.it;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.head;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class HeadAvatarIT {

    @Autowired
    MockMvc mvc;

    @Test
    void returnsNotFoundWhenNoAvatar() throws Exception {
        mvc.perform(head("/profiles/999999/avatar"))
                .andExpect(status().is4xxClientError());
    }
}
