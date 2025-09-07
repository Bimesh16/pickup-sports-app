package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.ExchangeRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExchangeRateRepository extends JpaRepository<ExchangeRate, Long> {
    List<ExchangeRate> findByFromCurrencyAndIsActive(String fromCurrency, boolean isActive);
    Optional<ExchangeRate> findByFromCurrencyAndToCurrencyAndIsActive(String fromCurrency, String toCurrency, boolean isActive);
}
