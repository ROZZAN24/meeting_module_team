package com.autonoma.erp.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;
import java.util.List;

public class ChatDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChannelResponse {
        private Long id;
        private String channelName;
        private String channelType; // DIRECT, DEPARTMENT, PROJECT, TEAM
        private Long departmentId;
        private String departmentName;
        private String lastMessage;
        private String lastMessageSender;
        private Date lastMessageTime;
        private int unreadCount;
        private List<MemberInfo> members;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MemberInfo {
        private String userId;
        private String employeeName;
        private String departmentName;
        private String designationName;
        private String imgName;
        private boolean isOnline;
        private Date lastSeen;
        private boolean isTyping;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SendMessageRequest {
        private Long channelId;
        private String messageType; // TEXT, FILE, VOICE, SYSTEM, ACTION
        private String messageContent;
        private String attachmentUrl;
        private String attachmentName;
        private String attachmentType; // PDF, EXCEL, IMAGE, DOC
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserPresenceResponse {
        private String userId;
        private boolean isOnline;
        private Date lastSeen;
        private Long isTypingChannelId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AiSummaryResponse {
        private Long channelId;
        private String summary;
        private Date generatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SmartRepliesResponse {
        private List<String> suggestions;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OcrResponse {
        private String vendorName;
        private String invoiceNumber;
        private Double amount;
        private String extractedText;
        private String erpActionSuggestion;
        private String erpActionPayload;
    }
}
