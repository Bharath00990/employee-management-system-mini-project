package com.ems.service;

import com.ems.entity.AuditLog;
import com.ems.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void log(String action, String username, String role, String entityName, Long entityId, String details, String ipAddress) {
        AuditLog auditLog = AuditLog.builder()
                .action(action)
                .username(username != null ? username : "SYSTEM")
                .userRole(role)
                .entityName(entityName)
                .entityId(entityId)
                .details(details)
                .ipAddress(ipAddress)
                .build();
        auditLogRepository.save(auditLog);
    }

    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc();
    }
}
