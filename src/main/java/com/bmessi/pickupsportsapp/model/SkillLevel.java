package com.bmessi.pickupsportsapp.model;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum SkillLevel {
    BEGINNER,
    INTERMEDIATE,
    ADVANCED,
    PRO;

    @JsonCreator
    public static SkillLevel from(String value) {
        if (value == null) return null;
        return SkillLevel.valueOf(value.trim().toUpperCase());
    }
}