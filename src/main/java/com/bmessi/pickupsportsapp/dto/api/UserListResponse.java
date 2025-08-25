package com.bmessi.pickupsportsapp.dto.api;

import java.util.List;

public record UserListResponse(int count, List<String> users) {}
