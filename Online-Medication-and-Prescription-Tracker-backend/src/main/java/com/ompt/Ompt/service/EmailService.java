package com.ompt.Ompt.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private final JavaMailSender mailSender;
    private final String resetBaseUrl;


    public EmailService(JavaMailSender mailSender, @Value("${app.frontend.url}") String resetBaseUrl) {
        this.mailSender = mailSender;
        this.resetBaseUrl = resetBaseUrl;
    }

    public void sendResetPasswordEmail(String toEmail, String code) {
        SimpleMailMessage message=new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Reset Your Password");
        message.setText("""
        Use the verification code below to reset your password:

        %s

        Code valid for 15 minutes.
        """.formatted(code));
        mailSender.send(message);
    }

    public void sendDoctorWelcomeMail(String email, String hospital, String token) {
        String link = resetBaseUrl + "/set-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Doctor Account Created");
        message.setText("""
        Your doctor account has been created for %s.

        Please set your password using the link below:
        %s

        Link valid for 24 hours.
        """.formatted(hospital, link));

        mailSender.send(message);
    }

}
