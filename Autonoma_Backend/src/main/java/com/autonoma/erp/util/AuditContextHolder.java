package com.autonoma.erp.util;

public class AuditContextHolder {
    private static final ThreadLocal<String> currentPage = new ThreadLocal<>();
    private static final ThreadLocal<String> currentUserId = new ThreadLocal<>();

    public static void setPageName(String pageName) {
        currentPage.set(pageName);
    }

    public static String getPageName() {
        return currentPage.get();
    }

    public static void setUserId(String userId) {
        currentUserId.set(userId);
    }

    public static String getUserId() {
        return currentUserId.get();
    }

    public static void clear() {
        currentPage.remove();
        currentUserId.remove();
    }
}
