package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.TrustedDevice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface TrustedDeviceRepository extends JpaRepository<TrustedDevice, Long> {
    Optional<TrustedDevice> findByUser_IdAndDeviceId(Long userId, String deviceId);
    int deleteByUser_IdAndDeviceId(Long userId, String deviceId);
    int deleteByTrustedUntilBefore(Instant cutoff);
    List<TrustedDevice> findByUser_Id(Long userId);
    int deleteByUser_Id(Long userId);
}
