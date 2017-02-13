package com.sample.maven.exception;

public class ServiceException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public ServiceException(final String message) {
        super(message);
    }

    public ServiceException(final Throwable root) {
        super(root);
    }

    public ServiceException(final String message, final Throwable root) {
        super(message, root);
    }
}
