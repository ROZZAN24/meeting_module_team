package com.autonoma.erp.service.admin;

import com.autonoma.erp.model.admin.PrefixCredential;
import com.autonoma.erp.repository.admin.PrefixCredentialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class PrefixCredentialService {

    @Autowired
    private PrefixCredentialRepository repository;

    public List<PrefixCredential> getAllPrefixCredentials() {
        return repository.findAll();
    }

    public Optional<PrefixCredential> getPrefixCredentialById(String accountYear) {
        return repository.findById(accountYear);
    }

    public PrefixCredential createPrefixCredential(PrefixCredential credential) {
        credential.setCreatedDate(new Date());
        if (credential.getStatus() == null) {
            credential.setStatus(1);
        }
        return repository.save(credential);
    }

    public PrefixCredential updatePrefixCredential(String accountYear, PrefixCredential credentialDetails) {
        return repository.findById(accountYear).map(credential -> {
            credential.setStatus(credentialDetails.getStatus());
            
            credential.setSalesOrderPrefix(credentialDetails.getSalesOrderPrefix());
            credential.setSalesOrderSuffix(credentialDetails.getSalesOrderSuffix());
            credential.setSalesOrderDigit(credentialDetails.getSalesOrderDigit());
            
            credential.setMatPoPrefix(credentialDetails.getMatPoPrefix());
            credential.setMatPoSuffix(credentialDetails.getMatPoSuffix());
            credential.setMatPoDigit(credentialDetails.getMatPoDigit());
            
            credential.setGateEntryPrefix(credentialDetails.getGateEntryPrefix());
            credential.setGateEntrySuffix(credentialDetails.getGateEntrySuffix());
            credential.setGateEntryDigit(credentialDetails.getGateEntryDigit());
            
            credential.setGrnPrefix(credentialDetails.getGrnPrefix());
            credential.setGrnSuffix(credentialDetails.getGrnSuffix());
            credential.setGrnDigit(credentialDetails.getGrnDigit());
            
            credential.setInvoicePrefix(credentialDetails.getInvoicePrefix());
            credential.setInvoiceSuffix(credentialDetails.getInvoiceSuffix());
            credential.setInvoiceDigit(credentialDetails.getInvoiceDigit());
            
            credential.setUpdatedBy(credentialDetails.getUpdatedBy());
            credential.setUpdatedDate(new Date());
            return repository.save(credential);
        }).orElseThrow(() -> new RuntimeException("PrefixCredential not found for account year: " + accountYear));
    }

    public void deletePrefixCredential(String accountYear) {
        repository.deleteById(accountYear);
    }
}
