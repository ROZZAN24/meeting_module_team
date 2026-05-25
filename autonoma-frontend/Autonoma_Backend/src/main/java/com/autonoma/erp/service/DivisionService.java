package com.autonoma.erp.service;

import com.autonoma.erp.model.Division;
import com.autonoma.erp.model.admin.CompanyCredential;
import com.autonoma.erp.repository.DivisionRepository;
import com.autonoma.erp.repository.admin.CompanyCredentialRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DivisionService {

    @Autowired
    private DivisionRepository divisionRepository;

    @Autowired
    private CompanyCredentialRepository companyCredentialRepository;

    // ── Helper to retrieve the currently logged-in user identifier (userId) ────
    private String getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return auth.getName(); // Maps to ad_user_credential.user_id
        }
        return "admin"; // Fallback for tests/initialization flows
    }

    // ── Build a companyId → companyName lookup map from Company Master ─────────
    private Map<Long, String> buildCompanyNameMap() {
        String originalTenant = com.autonoma.erp.config.TenantContextHolder.getTenantId();
        try {
            com.autonoma.erp.config.TenantContextHolder.setTenantId("AUTONOMA");
            return companyCredentialRepository.findAll().stream()
                    .collect(Collectors.toMap(
                            c -> c.getId(),
                            CompanyCredential::getCompanyName,
                            (a, b) -> a // keep first on duplicate key
                    ));
        } finally {
            com.autonoma.erp.config.TenantContextHolder.setTenantId(originalTenant);
        }
    }

    // ── Enrich a single division with company name from Company Master ─────────
    private void enrichCompanyName(Division division, Map<Long, String> nameMap) {
        if (division.getCompanyId() != null) {
            division.setCompanyName(nameMap.getOrDefault(division.getCompanyId(), ""));
        }
    }

    // ── Next sequence number ──────────────────────────────────────────────────
    public int getNextSequenceNo() {
        String originalTenant = com.autonoma.erp.config.TenantContextHolder.getTenantId();
        try {
            com.autonoma.erp.config.TenantContextHolder.setTenantId("AUTONOMA");
            return divisionRepository.findMaxSequenceNo().orElse(0) + 1;
        } finally {
            com.autonoma.erp.config.TenantContextHolder.setTenantId(originalTenant);
        }
    }

    // ── Fetch all divisions — company name joined from Company Master ──────────
    public List<Division> getAllDivisions() {
        String originalTenant = com.autonoma.erp.config.TenantContextHolder.getTenantId();
        try {
            com.autonoma.erp.config.TenantContextHolder.setTenantId("AUTONOMA");
            Map<Long, String> nameMap = buildCompanyNameMap();
            List<Division> divisions = divisionRepository.findAll();
            divisions.forEach(d -> enrichCompanyName(d, nameMap));
            return divisions;
        } finally {
            com.autonoma.erp.config.TenantContextHolder.setTenantId(originalTenant);
        }
    }

    // ── Fetch divisions scoped to a company ───────────────────────────────────
    public List<Division> getDivisionsByCompany(Long companyId) {
        String originalTenant = com.autonoma.erp.config.TenantContextHolder.getTenantId();
        try {
            com.autonoma.erp.config.TenantContextHolder.setTenantId("AUTONOMA");
            Map<Long, String> nameMap = buildCompanyNameMap();
            List<Division> divisions = divisionRepository.findByCompanyId(companyId);
            divisions.forEach(d -> enrichCompanyName(d, nameMap));
            return divisions;
        } finally {
            com.autonoma.erp.config.TenantContextHolder.setTenantId(originalTenant);
        }
    }

    // ── Fetch active divisions for a company (login / selection screens) ──────
    public List<Division> getActiveDivisionsByCompany(Long companyId) {
        String originalTenant = com.autonoma.erp.config.TenantContextHolder.getTenantId();
        try {
            com.autonoma.erp.config.TenantContextHolder.setTenantId("AUTONOMA");
            Map<Long, String> nameMap = buildCompanyNameMap();
            List<Division> divisions = divisionRepository.findByCompanyIdAndStatus(companyId, Boolean.TRUE);
            divisions.forEach(d -> enrichCompanyName(d, nameMap));
            return divisions;
        } finally {
            com.autonoma.erp.config.TenantContextHolder.setTenantId(originalTenant);
        }
    }

    // ── Create ────────────────────────────────────────────────────────────────
    public Division createDivision(Division division) {
        String originalTenant = com.autonoma.erp.config.TenantContextHolder.getTenantId();
        try {
            com.autonoma.erp.config.TenantContextHolder.setTenantId("AUTONOMA");
            // Default status to active if not set
            if (division.getStatus() == null) {
                division.setStatus(Boolean.TRUE);
            }

            // Stamp audit fields automatically using the currently authenticated user
            String loggedInUser = getCurrentUser();
            if (division.getCreatedBy() == null || division.getCreatedBy().isBlank()) {
                division.setCreatedBy(loggedInUser);
            }
            division.setUpdatedBy(loggedInUser);
            division.setCreatedDate(new Date());
            division.setUpdatedDate(new Date());

            Division saved = divisionRepository.save(division);

            // Enrich with company name before returning
            Map<Long, String> nameMap = buildCompanyNameMap();
            enrichCompanyName(saved, nameMap);
            return saved;
        } finally {
            com.autonoma.erp.config.TenantContextHolder.setTenantId(originalTenant);
        }
    }

    // ── Update ────────────────────────────────────────────────────────────────
    public Optional<Division> updateDivision(Long id, Division details) {
        String originalTenant = com.autonoma.erp.config.TenantContextHolder.getTenantId();
        try {
            com.autonoma.erp.config.TenantContextHolder.setTenantId("AUTONOMA");
            return divisionRepository.findById(id).map(existing -> {
                existing.setDivisionName(details.getDivisionName());
                existing.setDescription(details.getDescription());
                existing.setAddress(details.getAddress());
                existing.setCity(details.getCity());
                existing.setState(details.getState());
                existing.setCountry(details.getCountry());
                existing.setPincode(details.getPincode());
                existing.setGstIn(details.getGstIn());
                existing.setStateCode(details.getStateCode());
                existing.setSequenceNo(details.getSequenceNo());
                if (details.getStatus() != null)
                    existing.setStatus(details.getStatus());

                // Stamp updated user and timestamp automatically
                existing.setUpdatedBy(getCurrentUser());
                existing.setUpdatedDate(new Date());

                if (details.getCompanyId() != null) {
                    existing.setCompanyId(details.getCompanyId());
                }

                Division saved = divisionRepository.save(existing);

                // Enrich with company name before returning
                Map<Long, String> nameMap = buildCompanyNameMap();
                enrichCompanyName(saved, nameMap);
                return saved;
            });
        } finally {
            com.autonoma.erp.config.TenantContextHolder.setTenantId(originalTenant);
        }
    }

    // ── Delete ────────────────────────────────────────────────────────────────
    public void deleteDivision(Long id) {
        String originalTenant = com.autonoma.erp.config.TenantContextHolder.getTenantId();
        try {
            com.autonoma.erp.config.TenantContextHolder.setTenantId("AUTONOMA");
            divisionRepository.deleteById(id);
        } finally {
            com.autonoma.erp.config.TenantContextHolder.setTenantId(originalTenant);
        }
    }

    // ── Find by ID ────────────────────────────────────────────────────────────
    public Optional<Division> findById(Long id) {
        String originalTenant = com.autonoma.erp.config.TenantContextHolder.getTenantId();
        try {
            com.autonoma.erp.config.TenantContextHolder.setTenantId("AUTONOMA");
            return divisionRepository.findById(id);
        } finally {
            com.autonoma.erp.config.TenantContextHolder.setTenantId(originalTenant);
        }
    }
}
