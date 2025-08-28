package com.bmessi.pickupsportsapp.service.ai.ml;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class AdvancedMLModelTrainingServiceSimpleTest {

    private AdvancedMLModelTrainingService mlTrainingService = new AdvancedMLModelTrainingService();

    @Test
    void testRegisterModel() {
        // Given
        String modelName = "test_model";
        String modelType = "test_type";
        String version = "1.0";
        Map<String, Object> hyperparameters = new HashMap<>();
        hyperparameters.put("learningRate", 0.01);
        hyperparameters.put("epochs", 100);

        // When
        var model = mlTrainingService.registerModel(modelName, modelType, version, hyperparameters);

        // Then
        assertNotNull(model);
        assertEquals(modelName, model.getName());
        assertEquals(modelType, model.getType());
        assertEquals(version, model.getVersion());
        assertEquals(hyperparameters, model.getHyperparameters());
    }

    @Test
    void testStartTrainingJob() {
        // Given
        String modelName = "collaborative_filtering"; // Pre-registered model
        String trainingDataVersion = "latest";
        Map<String, Object> trainingParams = new HashMap<>();
        trainingParams.put("learningRate", 0.01);
        trainingParams.put("epochs", 100);

        // When
        var job = mlTrainingService.startTrainingJob(modelName, trainingDataVersion, trainingParams);

        // Then
        assertNotNull(job);
        assertEquals(modelName, job.getModelName());
        assertEquals(trainingDataVersion, job.getTrainingDataVersion());
        assertEquals(trainingParams, job.getTrainingParams());
        assertEquals(AdvancedMLModelTrainingService.TrainingStatus.RUNNING, job.getStatus());
    }

    @Test
    void testStartTrainingJobWithInvalidModel() {
        // Given
        String invalidModelName = "invalid_model";
        String trainingDataVersion = "latest";
        Map<String, Object> trainingParams = new HashMap<>();

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            mlTrainingService.startTrainingJob(invalidModelName, trainingDataVersion, trainingParams);
        });
    }

    @Test
    void testGetModelPerformance() {
        // Given
        String modelName = "collaborative_filtering";

        // When
        var metrics = mlTrainingService.getModelPerformance(modelName);

        // Then
        assertNotNull(metrics);
        assertEquals(modelName, metrics.getModelName());
        assertEquals(0.0, metrics.getAccuracy());
        assertEquals(0.0, metrics.getPrecision());
        assertEquals(0.0, metrics.getRecall());
        assertEquals(0.0, metrics.getF1Score());
        assertEquals(0L, metrics.getResponseTime());
        assertEquals(0, metrics.getTotalPredictions());
    }

    @Test
    void testStartABTest() {
        // Given
        String testName = "test_ab";
        String modelA = "collaborative_filtering";
        String modelB = "content_based";
        int testDurationDays = 7;
        double trafficSplit = 0.5;

        // When
        var abTest = mlTrainingService.startABTest(testName, modelA, modelB, testDurationDays, trafficSplit);

        // Then
        assertNotNull(abTest);
        assertEquals(testName, abTest.getTestName());
        assertEquals(modelA, abTest.getModelA());
        assertEquals(modelB, abTest.getModelB());
        assertEquals(testDurationDays, abTest.getTestDurationDays());
        assertEquals(trafficSplit, abTest.getTrafficSplit());
        assertEquals(AdvancedMLModelTrainingService.ABTestStatus.ACTIVE, abTest.getStatus());
    }

    @Test
    void testStartABTestWithInvalidModels() {
        // Given
        String testName = "test_ab";
        String invalidModelA = "invalid_model";
        String modelB = "content_based";
        int testDurationDays = 7;
        double trafficSplit = 0.5;

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            mlTrainingService.startABTest(testName, invalidModelA, modelB, testDurationDays, trafficSplit);
        });
    }

    @Test
    void testRecordABTestResult() {
        // Given
        String testName = "test_ab";
        String modelName = "collaborative_filtering";
        String userId = "user123";
        double performanceScore = 0.85;
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("accuracy", 0.85);
        metrics.put("responseTime", 50);

        // Start AB test first
        mlTrainingService.startABTest(testName, "collaborative_filtering", "content_based", 7, 0.5);

        // When
        mlTrainingService.recordABTestResult(testName, modelName, userId, performanceScore, metrics);

        // Then - No exception should be thrown
        assertDoesNotThrow(() -> {
            mlTrainingService.recordABTestResult(testName, modelName, userId, performanceScore, metrics);
        });
    }

    @Test
    void testOptimizeHyperparameters() {
        // Given
        String modelName = "collaborative_filtering";
        Map<String, Object> currentParams = new HashMap<>();
        currentParams.put("regularization", 0.1);
        currentParams.put("maxDepth", 10);

        // When
        var optimizedParams = mlTrainingService.optimizeHyperparameters(modelName, currentParams);

        // Then
        assertNotNull(optimizedParams);
        assertEquals(currentParams, optimizedParams); // Should return same params initially (no data)
    }

    @Test
    void testGetTrainingServiceMetrics() {
        // When
        var metrics = mlTrainingService.getTrainingServiceMetrics();

        // Then
        assertNotNull(metrics);
        assertTrue(metrics.getTotalTrainingJobs() >= 0);
        assertTrue(metrics.getSuccessfulTrainingJobs() >= 0);
        assertTrue(metrics.getTotalTrainingTime() >= 0);
        assertTrue(metrics.getRegisteredModels() >= 3); // Should have at least 3 default models
        assertTrue(metrics.getActiveABTests() >= 0);
        assertTrue(metrics.getTotalABTestResults() >= 0);
    }

    @Test
    void testDefaultModelsRegistration() {
        // When
        var metrics = mlTrainingService.getTrainingServiceMetrics();

        // Then
        assertTrue(metrics.getRegisteredModels() >= 3);
        
        // Check that default models are registered
        var cfModel = mlTrainingService.getModelPerformance("collaborative_filtering");
        var cbModel = mlTrainingService.getModelPerformance("content_based");
        var hybridModel = mlTrainingService.getModelPerformance("hybrid");
        
        assertNotNull(cfModel);
        assertNotNull(cbModel);
        assertNotNull(hybridModel);
    }

    @Test
    void testTrainingConfigurations() {
        // When
        var metrics = mlTrainingService.getTrainingServiceMetrics();

        // Then
        assertTrue(metrics.getRegisteredModels() >= 3);
        
        // Verify that we can start training jobs for default models
        Map<String, Object> trainingParams = new HashMap<>();
        trainingParams.put("learningRate", 0.01);
        trainingParams.put("epochs", 100);
        
        assertDoesNotThrow(() -> {
            mlTrainingService.startTrainingJob("collaborative_filtering", "latest", trainingParams);
        });
    }
}
