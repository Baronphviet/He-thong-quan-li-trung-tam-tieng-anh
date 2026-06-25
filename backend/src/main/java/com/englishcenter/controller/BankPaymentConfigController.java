package com.englishcenter.controller;

import com.englishcenter.entity.BankPaymentConfig;
import com.englishcenter.exception.NotFoundException;
import com.englishcenter.repository.BankPaymentConfigRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bank-payment-config")
public class BankPaymentConfigController {
    private final BankPaymentConfigRepository repository;

    public BankPaymentConfigController(BankPaymentConfigRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public BankPaymentConfig getConfig() {
        return repository.findById(1L)
                .orElseThrow(() -> new NotFoundException("Bank payment configuration not found"));
    }

    @PutMapping
    public BankPaymentConfig updateConfig(@RequestBody BankPaymentConfig request) {
        BankPaymentConfig config = repository.findById(1L)
                .orElseThrow(() -> new NotFoundException("Bank payment configuration not found"));
        config.bankName = request.bankName;
        config.accountNumber = request.accountNumber;
        config.accountHolder = request.accountHolder;
        config.qrCodeImage = request.qrCodeImage;
        return repository.save(config);
    }
}
