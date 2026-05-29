package com.autonoma.erp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;

@Controller
public class SignalingController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/signaling")
    public void processSignalingMessage(@Payload Map<String, Object> message, Principal principal) {
        if (principal == null) {
            return; // Only authenticated users can send signaling messages
        }

        String targetUser = (String) message.get("targetUser");
        if (targetUser != null && !targetUser.isEmpty()) {
            // Append sender information
            message.put("sender", principal != null ? principal.getName() : "unknown");
            
            // Forward the message to the target user via topic
            messagingTemplate.convertAndSend("/topic/signaling." + targetUser, message);
        }
    }
}
