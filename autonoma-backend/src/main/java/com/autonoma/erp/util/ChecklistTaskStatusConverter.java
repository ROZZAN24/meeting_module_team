package com.autonoma.erp.util;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class ChecklistTaskStatusConverter implements AttributeConverter<String, Integer> {

    @Override
    public Integer convertToDatabaseColumn(String attribute) {
        if (attribute == null) {
            return 0;
        }
        String val = attribute.trim().toUpperCase();
        switch (val) {
            case "IN_PROGRESS":
            case "INPROGRESS":
            case "IN PROGRESS":
                return 1;
            case "COMPLETED":
            case "DONE":
                return 2;
            case "OVERDUE":
                return 3;
            case "CANCELLED":
            case "CANCELED":
                return 4;
            default:
                return 0; // PENDING
        }
    }

    @Override
    public String convertToEntityAttribute(Integer dbData) {
        if (dbData == null) {
            return "Pending";
        }
        switch (dbData) {
            case 1:
                return "In Progress";
            case 2:
                return "Completed";
            case 3:
                return "Overdue";
            case 4:
                return "Cancelled";
            default:
                return "Pending";
        }
    }
}
