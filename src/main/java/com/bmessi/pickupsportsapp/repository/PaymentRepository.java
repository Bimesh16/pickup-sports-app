package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.Payment;
import com.bmessi.pickupsportsapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByUserOrderByCreatedAtDesc(User user);
    List<Payment> findByUserAndStatus(User user, Payment.PaymentStatus status);
}
