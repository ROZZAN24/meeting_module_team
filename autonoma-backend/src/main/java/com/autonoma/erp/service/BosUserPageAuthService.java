package com.autonoma.erp.service.admin;

import com.autonoma.erp.model.admin.BosPage;
import com.autonoma.erp.model.admin.BosUserPageAuth;
import com.autonoma.erp.repository.admin.BosPageRepository;
import com.autonoma.erp.repository.admin.BosUserPageAuthRepository;

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

    public List<BosUserPageAuth> getAuthByUserId(String userId) {
        List<BosPage> allPages = pageRepository.findAll();
        List<BosUserPageAuth> userAuths = authRepository.findByUserId(userId);

        Map<Integer, BosUserPageAuth> authMap = userAuths.stream()
                .collect(Collectors.toMap(BosUserPageAuth::getPageId, a -> a));

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
}
