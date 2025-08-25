package com.bmessi.pickupsportsapp.service.push;

public interface WebPushClient {

    final class Result {
        public enum Code { OK, GONE, NOT_FOUND, TRANSIENT_ERROR }
        private final Code code;
        private final String message;

        public Result(Code code, String message) {
            this.code = code; this.message = message;
        }
        public Code code() { return code; }
        public String message() { return message; }
        public static Result ok() { return new Result(Code.OK, null); }
        public static Result gone(String m) { return new Result(Code.GONE, m); }
        public static Result notFound(String m) { return new Result(Code.NOT_FOUND, m); }
        public static Result transientError(String m) { return new Result(Code.TRANSIENT_ERROR, m); }
    }

    Result send(String endpoint, String payloadJson, String vapidPublic, String vapidPrivate, String subject);
}
