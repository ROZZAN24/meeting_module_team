package com.autonoma.erp.util;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class ChecklistStatusConverter implements AttributeConverter<String, Integer> {

    @Override
    public Integer convertToDatabaseColumn(String attribute) {
        if (attribute == null) {
            return 0;
        }
        String val = attribute.trim().toUpperCase();
        switch (val) {
            case "ACTIVE":
                return 1;
            case "EXPIRED":
                return 2;
            case "PENDING":
                return 3;
            case "CANCELLED":
            case "CANCELED":
                return 4;
            default:
                return 0;
        }
    }

    @Override
    public String convertToEntityAttribute(Integer dbData) {
        if (dbData == null) {
            return "In Active";
        }
        switch (dbData) {
            case 1:
                return "Active";
            case 2:
                return "Expired";
            case 3:
                return "Pending";
            case 4:
                return "Cancelled";
            default:
                return "In Active";
        }
    }
}
