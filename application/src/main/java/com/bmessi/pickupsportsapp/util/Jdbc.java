package com.bmessi.pickupsportsapp.util;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class Jdbc {

    private static JdbcTemplate template;

    public Jdbc(JdbcTemplate jdbcTemplate) {
        template = jdbcTemplate;
    }

    public static int exec(String sql, Object... args) {
        if (template == null) return 0;
        return template.update(sql, args);
    }
}
