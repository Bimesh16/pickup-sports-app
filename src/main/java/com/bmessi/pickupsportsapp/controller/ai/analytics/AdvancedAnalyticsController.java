package com.bmessi.pickupsportsapp.controller.ai.analytics;

import com.bmessi.pickupsportsapp.service.ai.analytics.PredictiveAnalyticsEngine;
import com.bmessi.pickupsportsapp.service.ai.ml.AdvancedMLModelTrainingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai/analytics")
@CrossOrigin(origins = "*")
public class AdvancedAnalyticsController {
    
    @Autowired
    private PredictiveAnalyticsEngine analyticsEngine;
    
    @Autowired
    private AdvancedMLModelTrainingService mlTrainingService;
    
    // ===== PREDICTIVE ANALYTICS ENDPOINTS =====
    
    /**
     * Predict user behavior patterns
     */
    @GetMapping("/users/{userId}/behavior")
    public ResponseEntity<?> predictUserBehavior(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "7") int predictionDays) {
        try {
            var prediction = analyticsEngine.predictUserBehavior(userId, predictionDays);
            return ResponseEntity.ok(prediction);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Forecast demand for games, venues, and time slots
     */
    @GetMapping("/demand/forecast")
    public ResponseEntity<?> forecastDemand(
            @RequestParam String forecastType,
            @RequestParam(defaultValue = "30") int daysAhead) {
        try {
            var forecast = analyticsEngine.forecastDemand(forecastType, daysAhead);
            return ResponseEntity.ok(forecast);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Analyze trends and patterns
     */
    @GetMapping("/trends")
    public ResponseEntity<?> analyzeTrends(
            @RequestParam String trendType,
            @RequestParam(defaultValue = "90") int analysisDays) {
        try {
            var analysis = analyticsEngine.analyzeTrends(trendType, analysisDays);
            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Predict optimal game scheduling
     */
    @GetMapping("/scheduling/prediction")
    public ResponseEntity<?> predictOptimalGameScheduling(
            @RequestParam(defaultValue = "14") int daysAhead) {
        try {
            var prediction = analyticsEngine.predictOptimalGameScheduling(daysAhead);
            return ResponseEntity.ok(prediction);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get analytics performance metrics
     */
    @GetMapping("/performance")
    public ResponseEntity<?> getAnalyticsPerformance() {
        try {
            var metrics = analyticsEngine.getPerformanceMetrics();
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Clear analytics cache
     */
    @PostMapping("/cache/clear")
    public ResponseEntity<?> clearAnalyticsCache() {
        try {
            analyticsEngine.clearCache();
            return ResponseEntity.ok(Map.of("message", "Analytics cache cleared successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // ===== ML MODEL TRAINING ENDPOINTS =====
    
    /**
     * Register a new ML model
     */
    @PostMapping("/models/register")
    public ResponseEntity<?> registerModel(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            String modelName = (String) request.get("modelName");
            String modelType = (String) request.get("modelType");
            String version = (String) request.get("version");
            @SuppressWarnings("unchecked")
            Map<String, Object> hyperparameters = (Map<String, Object>) request.get("hyperparameters");
            
            var model = mlTrainingService.registerModel(modelName, modelType, version, hyperparameters);
            return ResponseEntity.ok(model);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Start a model training job
     */
    @PostMapping("/models/train")
    public ResponseEntity<?> startTrainingJob(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            String modelName = (String) request.get("modelName");
            String trainingDataVersion = (String) request.get("trainingDataVersion");
            @SuppressWarnings("unchecked")
            Map<String, Object> trainingParams = (Map<String, Object>) request.get("trainingParams");
            
            var job = mlTrainingService.startTrainingJob(modelName, trainingDataVersion, trainingParams);
            return ResponseEntity.ok(job);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get model performance metrics
     */
    @GetMapping("/models/{modelName}/performance")
    public ResponseEntity<?> getModelPerformance(@PathVariable String modelName) {
        try {
            var metrics = mlTrainingService.getModelPerformance(modelName);
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Optimize model hyperparameters
     */
    @PostMapping("/models/{modelName}/optimize")
    public ResponseEntity<?> optimizeHyperparameters(
            @PathVariable String modelName,
            @RequestBody Map<String, Object> currentParams) {
        try {
            var optimizedParams = mlTrainingService.optimizeHyperparameters(modelName, currentParams);
            return ResponseEntity.ok(optimizedParams);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get training service metrics
     */
    @GetMapping("/models/training/metrics")
    public ResponseEntity<?> getTrainingServiceMetrics() {
        try {
            var metrics = mlTrainingService.getTrainingServiceMetrics();
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // ===== A/B TESTING ENDPOINTS =====
    
    /**
     * Start an A/B test between two models
     */
    @PostMapping("/ab-test/start")
    public ResponseEntity<?> startABTest(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            String testName = (String) request.get("testName");
            String modelA = (String) request.get("modelA");
            String modelB = (String) request.get("modelB");
            Integer testDurationDays = (Integer) request.get("testDurationDays");
            Double trafficSplit = (Double) request.get("trafficSplit");
            
            var abTest = mlTrainingService.startABTest(testName, modelA, modelB, 
                                                      testDurationDays, trafficSplit);
            return ResponseEntity.ok(abTest);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Record A/B test result
     */
    @PostMapping("/ab-test/record")
    public ResponseEntity<?> recordABTestResult(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            String testName = (String) request.get("testName");
            String modelName = (String) request.get("modelName");
            String userId = (String) request.get("userId");
            Double performanceScore = (Double) request.get("performanceScore");
            @SuppressWarnings("unchecked")
            Map<String, Object> metrics = (Map<String, Object>) request.get("metrics");
            
            mlTrainingService.recordABTestResult(testName, modelName, userId, 
                                               performanceScore, metrics);
            return ResponseEntity.ok(Map.of("message", "A/B test result recorded successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get A/B test winner
     */
    @GetMapping("/ab-test/{testName}/winner")
    public ResponseEntity<?> getABTestWinner(@PathVariable String testName) {
        try {
            var winner = mlTrainingService.getABTestWinner(testName);
            return ResponseEntity.ok(winner);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // ===== COMPREHENSIVE ANALYTICS DASHBOARD =====
    
    /**
     * Get comprehensive analytics dashboard
     */
    @GetMapping("/dashboard")
    public ResponseEntity<?> getAnalyticsDashboard() {
        try {
            Map<String, Object> dashboard = new HashMap<>();
            
            // Analytics performance
            dashboard.put("analyticsPerformance", analyticsEngine.getPerformanceMetrics());
            
            // ML training metrics
            dashboard.put("mlTrainingMetrics", mlTrainingService.getTrainingServiceMetrics());
            
            // Sample predictions
            dashboard.put("sampleDemandForecast", 
                analyticsEngine.forecastDemand("games", 7));
            dashboard.put("sampleTrendAnalysis", 
                analyticsEngine.analyzeTrends("user_engagement", 30));
            
            // Model registry overview
            dashboard.put("modelRegistry", Map.of(
                "totalModels", mlTrainingService.getTrainingServiceMetrics().getRegisteredModels(),
                "activeTests", mlTrainingService.getTrainingServiceMetrics().getActiveABTests()
            ));
            
            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get system health and status
     */
    @GetMapping("/health")
    public ResponseEntity<?> getSystemHealth() {
        try {
            Map<String, Object> health = new HashMap<>();
            
            // Analytics engine health
            var analyticsMetrics = analyticsEngine.getPerformanceMetrics();
            health.put("analyticsEngine", Map.of(
                "status", "healthy",
                "cacheHitRate", analyticsMetrics.getCacheHitRate(),
                "cacheSize", analyticsMetrics.getAnalyticsCacheSize()
            ));
            
            // ML training service health
            var trainingMetrics = mlTrainingService.getTrainingServiceMetrics();
            health.put("mlTrainingService", Map.of(
                "status", "healthy",
                "successRate", trainingMetrics.getSuccessRate(),
                "registeredModels", trainingMetrics.getRegisteredModels()
            ));
            
            // Overall system status
            health.put("system", Map.of(
                "status", "healthy",
                "timestamp", System.currentTimeMillis(),
                "version", "1.0.0"
            ));
            
            return ResponseEntity.ok(health);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
