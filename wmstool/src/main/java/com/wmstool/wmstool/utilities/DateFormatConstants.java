package com.wmstool.wmstool.utilities;

import java.time.format.DateTimeFormatter;

/**
 * Centralized date formatting constants to reduce code duplication
 * and ensure consistent date formatting across the application.
 */
public final class DateFormatConstants {

    private DateFormatConstants() {
        // Utility class - prevent instantiation
    }

    /**
     * Format: yyyyMMdd (e.g., 20250104)
     * Used for file naming and date-only formatting
     */
    public static final DateTimeFormatter YYYYMMDD = DateTimeFormatter.ofPattern("yyyyMMdd");

    /**
     * Format: yyyyMMddHHmmss (e.g., 20250104153045)
     * Used for timestamp-based file naming
     */
    public static final DateTimeFormatter YYYYMMDDHHMMSS = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    /**
     * Format: yyyy-MM-dd (e.g., 2025-01-04)
     * Used for display purposes
     */
    public static final DateTimeFormatter YYYY_MM_DD = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * Format: yyyy-MM-dd HH:mm:ss (e.g., 2025-01-04 15:30:45)
     * Used for detailed timestamp display
     */
    public static final DateTimeFormatter YYYY_MM_DD_HH_MM_SS = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
}
