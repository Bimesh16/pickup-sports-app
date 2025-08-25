package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.MfaRecoveryCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MfaRecoveryCodeRepository extends JpaRepository<MfaRecoveryCode, Long> {
    List<MfaRecoveryCode> findByUser_IdAndConsumedAtIsNull(Long userId);
    Optional<MfaRecoveryCode> findByCodeHashAndConsumedAtIsNull(String codeHash);
    void deleteByUser_Id(Long userId);
}
