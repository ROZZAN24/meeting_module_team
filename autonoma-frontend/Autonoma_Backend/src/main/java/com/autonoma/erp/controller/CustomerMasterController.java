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

    @GetMapping
    public List<CustomerMaster> getAllCustomers() {
        return service.getAllCustomers();
    }
    @GetMapping("/next-code")
    public String getNextCode() {
        return service.getNextCode();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerMaster> getCustomerById(@PathVariable Long id) {
        return service.getCustomerById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public CustomerMaster createCustomer(@RequestBody CustomerMaster customer) {
        return service.saveCustomer(customer);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerMaster> updateCustomer(@PathVariable Long id, @RequestBody CustomerMaster customerDetails) {
        return service.getCustomerById(id)
                .map(customer -> {
                    customer.setCustomerName(customerDetails.getCustomerName());
                    customer.setInvoiceName(customerDetails.getInvoiceName());
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
                    customer.setDistance(customerDetails.getDistance());
                    customer.setGstin(customerDetails.getGstin());
                    customer.setVendorCode(customerDetails.getVendorCode());
                    customer.setIsoNumber(customerDetails.getIsoNumber());
                    customer.setIsoExpiry(customerDetails.getIsoExpiry());
                    customer.setNdaRequired(customerDetails.getNdaRequired());
                    customer.setDispatchMode(customerDetails.getDispatchMode());
                    customer.setCurrency(customerDetails.getCurrency());
                    customer.setPaymentTerms(customerDetails.getPaymentTerms());
                    customer.setDeliveryTerms(customerDetails.getDeliveryTerms());
                    customer.setNegotiateCustomer(customerDetails.getNegotiateCustomer());
                    customer.setDailyDispatchMail(customerDetails.getDailyDispatchMail());
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
