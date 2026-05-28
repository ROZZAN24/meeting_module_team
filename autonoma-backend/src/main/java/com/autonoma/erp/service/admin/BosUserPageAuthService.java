package com.autonoma.erp.service.admin;

import com.autonoma.erp.model.admin.BosPage;
import com.autonoma.erp.model.admin.BosUserPageAuth;
import com.autonoma.erp.repository.admin.BosPageRepository;
import com.autonoma.erp.repository.admin.BosUserPageAuthRepository;
import com.autonoma.erp.repository.admin.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BosUserPageAuthService {

    @Autowired
    private BosUserPageAuthRepository authRepository;

    @Autowired
    private BosPageRepository pageRepository;

    @Autowired
    private UserRepository userRepository;

    public List<BosUserPageAuth> getAuthByUserId(String userId) {
        List<BosPage> allPages = pageRepository.findAll();
        List<BosUserPageAuth> userAuths = authRepository.findByUserId(userId);

        Map<Integer, BosUserPageAuth> authMap = userAuths.stream()
                .collect(Collectors.toMap(BosUserPageAuth::getPageId, a -> a));

        boolean isBosAdmin = userRepository.findByUserId(userId)
                .map(u -> u.getIsBosAdmin() != null && u.getIsBosAdmin() == 1)
                .orElse(false);

        List<BosUserPageAuth> result = new ArrayList<>();
        for (BosPage page : allPages) {
            BosUserPageAuth auth = authMap.get(page.getPageId());
            if (auth == null) {
                auth = new BosUserPageAuth();
                auth.setUserId(userId);
                auth.setPageId(page.getPageId());
                auth.setModId(page.getModule() != null ? page.getModule().getModuleId() : null);
                auth.setSubModId(page.getSubModule() != null ? page.getSubModule().getSubModId() : null);
                auth.setEnable(0);
                auth.setReadAcs(0);
                auth.setWrite(0);
                auth.setDeleteAcs(0);
                auth.setExport(0);
                auth.setApproval(0);
                auth.setManager(0);
                auth.setAdditional1(0);
                auth.setAdditional2(0);

                // Default Close Checklist / Renewal (QM1120) to enabled & read/write for regular users
                if ("QM1120".equals(page.getPageCode())) {
                    auth.setEnable(1);
                    auth.setReadAcs(1);
                    auth.setWrite(1);
                }
            }
            if (isBosAdmin) {
                auth.setEnable(1);
                auth.setReadAcs(1);
                auth.setWrite(1);
                auth.setDeleteAcs(1);
                auth.setExport(1);
                auth.setApproval(1);
                auth.setManager(1);
                auth.setAdditional1(1);
                auth.setAdditional2(1);
            }
            auth.setPage(page);
            result.add(auth);
        }
        return result;
    }

    @Transactional
    public void saveAll(List<BosUserPageAuth> auths) {
        authRepository.saveAll(auths);
    }

    /**
     * Check if a user has a specific permission on a page.
     * Used by PagePermissionInterceptor for backend API security.
     *
     * @param userId   The user ID
     * @param pageCode The page code (e.g., "M3110")
     * @param action   The permission type: "write", "delete", "export", "approval"
     * @return true if the user has the requested permission
     */
    public boolean hasPermission(String userId, String pageCode, String action) {
        boolean isBosAdmin = userRepository.findByUserId(userId)
                .map(u -> u.getIsBosAdmin() != null && u.getIsBosAdmin() == 1)
                .orElse(false);
        if (isBosAdmin) {
            return true;
        }

        BosPage page = pageRepository.findByPageCode(pageCode).orElse(null);
        if (page == null) return false;

        BosUserPageAuth auth = authRepository.findByUserIdAndPageId(userId, page.getPageId());
        if (auth == null) {
            // For regular users without configured page auth record, only allow Close Checklist / Renewal page (QM1120) by default
            if ("QM1120".equals(page.getPageCode())) {
                return "read".equalsIgnoreCase(action) || "write".equalsIgnoreCase(action);
            }
            return false;
        }
        if (auth.getEnable() == 0) return false;

        return switch (action.toLowerCase()) {
            case "read" -> auth.getReadAcs() == 1;
            case "write" -> auth.getWrite() == 1;
            case "delete" -> auth.getDeleteAcs() == 1;
            case "export" -> auth.getExport() == 1;
            case "approval" -> auth.getApproval() == 1;
            case "manager" -> auth.getManager() == 1;
            default -> false;
        };
    }
}
