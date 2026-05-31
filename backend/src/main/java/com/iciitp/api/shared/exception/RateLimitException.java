package com.iciitp.api.shared.exception;

public class RateLimitException extends RuntimeException {
    public RateLimitException() {
        super("Too many login attempts. Please wait 15 minutes and try again.");
    }
}
