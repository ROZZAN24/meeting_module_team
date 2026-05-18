package com.autonoma.erp.controller;

import com.autonoma.erp.model.CustomerMaster;
import com.autonoma.erp.service.CustomerMasterService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sm/customers")
@RequiredArgsConstructor
@Tag(name = "Customer Master", description = "Customer Master Management APIs")
public class CustomerMasterController {

    private final CustomerMasterService service;

    @GetMapping("/{id}")
    public ResponseEntity<?> getCustomerById(@PathVariable String id) {
        if ("next-code".equals(id)) {
            return ResponseEntity.ok(service.getNextCustomerCode());
        }
        try {
            Long numericId = Long.parseLong(id);
            return service.getCustomerById(numericId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Invalid ID format");
        }
    }

    @GetMapping
    public List<CustomerMaster> getAllCustomers() {
        return service.getAllCustomers();
    }
    @GetMapping("/next-code")
    public String getNextCode() {
        return service.getNextCustomerCode();
    }

    @PostMapping
    public CustomerMaster createCustomer(@RequestBody CustomerMaster customer) {
        return service.saveCustomer(customer);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerMaster> updateCustomer(@PathVariable Long id, @RequestBody CustomerMaster customerDetails) {
        return service.getCustomerById(id)
                .map(customer -> {
                    customer.setCustomerCode(customerDetails.getCustomerCode());
                    customer.setCustomerName(customerDetails.getCustomerName());
                    customer.setCustomerPrintName(customerDetails.getCustomerPrintName());
                    customer.setAccountsLedger(customerDetails.getAccountsLedger());
                    customer.setGroupName(customerDetails.getGroupName());
                    customer.setShortName(customerDetails.getShortName());
                    customer.setSegment(customerDetails.getSegment());
                    customer.setSubSegment(customerDetails.getSubSegment());
                    customer.setDomainName(customerDetails.getDomainName());
                    customer.setAddress(customerDetails.getAddress());
                    customer.setPincode(customerDetails.getPincode());
                    customer.setCity(customerDetails.getCity());
                    customer.setState(customerDetails.getState());
                    customer.setStateCode(customerDetails.getStateCode());
                    customer.setCountry(customerDetails.getCountry());
                    customer.setPrimeCustomer(customerDetails.getPrimeCustomer());
                    customer.setPanNo(customerDetails.getPanNo());
                    customer.setWebsite(customerDetails.getWebsite());
                    customer.setRegisterNo(customerDetails.getRegisterNo());
                    customer.setCinNo(customerDetails.getCinNo());
                    customer.setIsoNumber(customerDetails.getIsoNumber());
                    customer.setIsoExpiry(customerDetails.getIsoExpiry());
                    customer.setNdaRequired(customerDetails.getNdaRequired());
                    customer.setCurrency(customerDetails.getCurrency());
                    customer.setPaymentTerms(customerDetails.getPaymentTerms());
                    customer.setDeliveryTerms(customerDetails.getDeliveryTerms());
                    customer.setFreight(customerDetails.getFreight());
                    customer.setDistance(customerDetails.getDistance());
                    customer.setLocation(customerDetails.getLocation());
                    customer.setLdApplicable(customerDetails.getLdApplicable());
                    customer.setNegotiateCustomer(customerDetails.getNegotiateCustomer());
                    customer.setFileUpload(customerDetails.getFileUpload());
                    customer.setStatus(customerDetails.getStatus());
                    customer.setUpdatedBy(customerDetails.getUpdatedBy());
                    return ResponseEntity.ok(service.saveCustomer(customer));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        service.deleteCustomer(id);
        return ResponseEntity.ok().build();
    }
}
