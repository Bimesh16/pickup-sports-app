package com.bmessi.pickupsportsapp.web;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

public final class ApiResponseUtils {

    private ApiResponseUtils() {}

    public static HttpHeaders noStore() {
        HttpHeaders h = new HttpHeaders();
        h.add(HttpHeaders.CACHE_CONTROL, "no-store");
        h.add(HttpHeaders.PRAGMA, "no-cache");
        return h;
    }

    public static HttpHeaders cachePrivate(int maxAgeSeconds) {
        HttpHeaders h = new HttpHeaders();
        h.add(HttpHeaders.CACHE_CONTROL, "private, max-age=" + Math.max(0, maxAgeSeconds));
        h.add(HttpHeaders.LAST_MODIFIED, httpDate(System.currentTimeMillis()));
        return h;
    }

    public static String httpDate(long epochMillis) {
        return DateTimeFormatter.RFC_1123_DATE_TIME
                .withZone(ZoneOffset.UTC)
                .format(Instant.ofEpochMilli(epochMillis));
    }

    public static void addPaginationLinks(HttpServletRequest request, HttpHeaders headers, Page<?> page) {
        if (request == null || headers == null || page == null) return;

        var base = org.springframework.web.servlet.support.ServletUriComponentsBuilder.fromRequest(request);

        int number = page.getNumber();
        int size = page.getSize();
        int totalPages = page.getTotalPages();

        List<String> links = new ArrayList<>();
        links.add(buildLink(base, number, size, "self"));
        if (number > 0) {
            links.add(buildLink(base, 0, size, "first"));
            links.add(buildLink(base, number - 1, size, "prev"));
        }
        if (number + 1 < totalPages) {
            links.add(buildLink(base, number + 1, size, "next"));
            links.add(buildLink(base, totalPages - 1, size, "last"));
        }
        if (!links.isEmpty()) {
            headers.add(HttpHeaders.LINK, String.join(", ", links));
        }
    }

    private static String buildLink(org.springframework.web.util.UriComponentsBuilder base, int page, int size, String rel) {
        String url = base.replaceQueryParam("page", page)
                .replaceQueryParam("size", size)
                .build(true)
                .toUriString();
        return "<" + url + ">; rel=\"" + rel + "\"";
    }
}
