package com.autonoma.erp.util;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class ChecklistVerifyStatusConverter implements AttributeConverter<String, Integer> {

    @Override
    public Integer convertToDatabaseColumn(String attribute) {
        if (attribute == null) {
            return 0;
        }
        String val = attribute.trim().toUpperCase();
        switch (val) {
            case "APPROVED":
            case "APPROVE":
            case "VERIFIED":
                return 1;
            case "REJECTED":
            case "REJECT":
                return 2;
            case "HOLD":
                return 3;
            default:
                return 0; // PENDING FOR VERIFY
        }
    }

    @Override
    public String convertToEntityAttribute(Integer dbData) {
        if (dbData == null) {
            return "Pending for Verify";
        }
        switch (dbData) {
            case 1:
                return "Verified";
            case 2:
                return "Rejected";
            case 3:
                return "Hold";
            default:
                return "Pending for Verify";
        }
    }
}
