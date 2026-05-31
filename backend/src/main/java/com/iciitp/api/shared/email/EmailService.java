package com.iciitp.api.shared.email;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String from;

    @Value("${app.email.recovery:}")
    private String recoveryEmail;

    @Value("${app.email.notify:}")
    private String notifyEmail;

    public boolean isConfigured() {
        return from != null && !from.isBlank();
    }

    public void sendOtp(String otp) {
        if (!isConfigured() || recoveryEmail == null || recoveryEmail.isBlank()) {
            log.warn("SMTP not configured — OTP {} not sent", otp);
            return;
        }
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(from);
        msg.setTo(recoveryEmail);
        msg.setSubject("IC IITP Admin — Password Reset OTP");
        msg.setText("""
            Your password reset OTP is: %s

            This code expires in 15 minutes. Do not share it with anyone.

            If you did not request a password reset, ignore this email.

            — IC IITP System
            """.formatted(otp));
        try {
            mailSender.send(msg);
            log.info("OTP sent to recovery email");
        } catch (Exception e) {
            log.error("Failed to send OTP email: {}", e.getMessage());
        }
    }

    @Async
    public void sendSubmissionNotification(String type, Map<String, Object> data) {
        if (!isConfigured() || notifyEmail == null || notifyEmail.isBlank()) {
            log.debug("SMTP not configured — submission notification skipped");
            return;
        }

        String label = switch (type) {
            case "apply"    -> "New Application";
            case "contact"  -> "New Contact Message";
            case "feedback" -> "New Feedback";
            default         -> "New Submission (" + type + ")";
        };

        StringBuilder body = new StringBuilder();
        body.append(label).append(" received on IC IITP website.\n\n");
        body.append("Details:\n");
        data.forEach((k, v) -> body.append("  ").append(k).append(": ").append(v).append("\n"));
        body.append("\nView in dashboard: /admin/applications");

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(from);
        msg.setTo(notifyEmail);
        msg.setSubject("IC IITP — " + label);
        msg.setText(body.toString());

        try {
            mailSender.send(msg);
        } catch (MailException e) {
            log.error("Failed to send submission notification: {}", e.getMessage());
        }
    }

    public String getRecoveryEmail() {
        return recoveryEmail;
    }
}
