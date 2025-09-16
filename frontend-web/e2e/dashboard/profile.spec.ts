import { test, expect } from '@playwright/test';
import { TestHelpers, mockData } from '../utils/test-helpers';

test.describe('Profile Management', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    
    // Mock API responses
    await helpers.mockApiResponse('/auth/login', {
      success: true,
      token: 'mock-jwt-token',
      user: mockData.user
    });
    
    await helpers.mockApiResponse('/api/v1/profiles/me', mockData.user);
    await helpers.mockApiResponse('/api/v1/profiles/me', { success: true });
    await helpers.mockApiResponse('/api/v1/ai/recommendations/comprehensive', {
      recommendations: [
        { type: 'next_match', data: { gameId: 'game-1', sport: 'Football' } },
        { type: 'highlight', data: { achievement: 'First Goal', date: '2024-01-10' } }
      ]
    });

    await helpers.login();
    await helpers.navigateToTab('profile');
  });

  test('should load profile page with all sections', async ({ page }) => {
    // Verify profile header
    await expect(page.locator('[data-testid="profile-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-name"]')).toContainText('John Doe');
    await expect(page.locator('[data-testid="user-username"]')).toContainText('@johndoe');
    await expect(page.locator('[data-testid="user-rank"]')).toContainText('Competent');
    
    // Verify XP progress
    await expect(page.locator('[data-testid="xp-progress-bar"]')).toBeVisible();
    await expect(page.locator('[data-testid="xp-value"]')).toContainText('150');
    
    // Verify tab navigation
    await expect(page.locator('[data-testid="tab-overview"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-activity"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-stats"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-badges"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-teams"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-sports"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-security"]')).toBeVisible();
  });

  test('should edit bio inline', async ({ page }) => {
    // Click on bio to edit
    await page.click('[data-testid="bio-edit-button"]');
    
    // Verify edit mode
    await expect(page.locator('[data-testid="bio-textarea"]')).toBeVisible();
    
    // Edit bio
    await page.fill('[data-testid="bio-textarea"]', 'Passionate football player from Kathmandu');
    
    // Save changes
    await page.click('[data-testid="bio-save-button"]');
    
    // Wait for API call
    await helpers.waitForApiCall('/api/v1/profiles/me');
    
    // Verify bio is updated
    await expect(page.locator('[data-testid="bio-display"]')).toContainText('Passionate football player from Kathmandu');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });

  test('should add a sport preference', async ({ page }) => {
    // Navigate to sports tab
    await page.click('[data-testid="tab-sports"]');
    
    // Click add sport button
    await page.click('[data-testid="add-sport-button"]');
    
    // Select sport
    await page.selectOption('[data-testid="sport-select"]', 'Football');
    
    // Set skill level
    await page.selectOption('[data-testid="skill-level-select"]', '4');
    
    // Set positions
    await page.check('[data-testid="position-forward"]');
    await page.check('[data-testid="position-midfielder"]');
    
    // Set style tags
    await page.check('[data-testid="style-aggressive"]');
    await page.check('[data-testid="style-technical"]');
    
    // Set dominant foot
    await page.check('[data-testid="foot-right"]');
    
    // Set intensity
    await page.selectOption('[data-testid="intensity-select"]', 'moderate');
    
    // Add notes
    await page.fill('[data-testid="sport-notes"]', 'Prefer playing as attacking midfielder');
    
    // Save sport
    await page.click('[data-testid="save-sport-button"]');
    
    // Wait for API call
    await helpers.waitForApiCall('/api/v1/profiles/me');
    
    // Verify sport is added
    await expect(page.locator('[data-testid="sport-item"]')).toContainText('Football');
    await expect(page.locator('[data-testid="skill-level"]')).toContainText('4');
    await expect(page.locator('[data-testid="positions"]')).toContainText('Forward, Midfielder');
  });

  test('should update availability grid', async ({ page }) => {
    // Navigate to sports tab
    await page.click('[data-testid="tab-sports"]');
    
    // Click on availability tab
    await page.click('[data-testid="availability-tab"]');
    
    // Set Monday morning availability
    await page.check('[data-testid="monday-09-00"]');
    await page.check('[data-testid="monday-10-00"]');
    
    // Set Tuesday evening availability
    await page.check('[data-testid="tuesday-18-00"]');
    await page.check('[data-testid="tuesday-19-00"]');
    
    // Save availability
    await page.click('[data-testid="save-availability-button"]');
    
    // Wait for API call
    await helpers.waitForApiCall('/api/v1/profiles/me');
    
    // Verify availability is saved
    await expect(page.locator('[data-testid="monday-09-00"]')).toBeChecked();
    await expect(page.locator('[data-testid="monday-10-00"]')).toBeChecked();
    await expect(page.locator('[data-testid="tuesday-18-00"]')).toBeChecked();
    await expect(page.locator('[data-testid="tuesday-19-00"]')).toBeChecked();
    
    // Verify success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });

  test('should show profile completion progress', async ({ page }) => {
    // Verify completion meter
    await expect(page.locator('[data-testid="completion-meter"]')).toBeVisible();
    await expect(page.locator('[data-testid="completion-percentage"]')).toContainText('60%');
    
    // Verify completion tasks
    await expect(page.locator('[data-testid="task-add-photo"]')).toBeVisible();
    await expect(page.locator('[data-testid="task-verify-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="task-write-bio"]')).toBeVisible();
    await expect(page.locator('[data-testid="task-pick-sport"]')).toBeVisible();
  });

  test('should complete profile tasks', async ({ page }) => {
    // Complete add photo task
    await page.click('[data-testid="task-add-photo"]');
    
    // Upload photo
    await page.setInputFiles('[data-testid="photo-upload"]', 'test-files/avatar.jpg');
    
    // Wait for upload
    await helpers.waitForApiCall('/api/v1/profiles/me');
    
    // Verify task is completed
    await expect(page.locator('[data-testid="task-add-photo"]')).toHaveClass(/completed/);
    
    // Verify XP increase
    await expect(page.locator('[data-testid="xp-value"]')).toContainText('200');
  });

  test('should show privacy preview', async ({ page }) => {
    // Verify privacy preview section
    await expect(page.locator('[data-testid="privacy-preview"]')).toBeVisible();
    
    // Verify public fields
    await expect(page.locator('[data-testid="public-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="public-username"]')).toBeVisible();
    await expect(page.locator('[data-testid="public-rank"]')).toBeVisible();
    
    // Verify private fields
    await expect(page.locator('[data-testid="private-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="private-phone"]')).toBeVisible();
  });

  test('should toggle privacy settings', async ({ page }) => {
    // Toggle name visibility
    await page.click('[data-testid="toggle-name-visibility"]');
    
    // Wait for API call
    await helpers.waitForApiCall('/api/v1/profiles/me');
    
    // Verify toggle state
    await expect(page.locator('[data-testid="toggle-name-visibility"]')).toBeChecked();
    
    // Verify success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });

  test('should display activity timeline', async ({ page }) => {
    // Navigate to activity tab
    await page.click('[data-testid="tab-activity"]');
    
    // Verify activity items
    await expect(page.locator('[data-testid="activity-item"]')).toHaveCount(3);
    
    // Verify activity types
    await expect(page.locator('[data-testid="activity-join"]')).toBeVisible();
    await expect(page.locator('[data-testid="activity-rsvp"]')).toBeVisible();
    await expect(page.locator('[data-testid="activity-rating"]')).toBeVisible();
  });

  test('should display stats charts', async ({ page }) => {
    // Navigate to stats tab
    await page.click('[data-testid="tab-stats"]');
    
    // Verify charts are visible
    await expect(page.locator('[data-testid="sport-appearances-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="attendance-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="heatmap-chart"]')).toBeVisible();
    
    // Verify chart data
    await expect(page.locator('[data-testid="chart-legend"]')).toBeVisible();
  });

  test('should display badges', async ({ page }) => {
    // Navigate to badges tab
    await page.click('[data-testid="tab-badges"]');
    
    // Verify badges are visible
    await expect(page.locator('[data-testid="badge-item"]')).toHaveCount(5);
    
    // Verify earned badges
    await expect(page.locator('[data-testid="badge-earned"]')).toHaveCount(3);
    
    // Verify locked badges
    await expect(page.locator('[data-testid="badge-locked"]')).toHaveCount(2);
  });

  test('should display teams', async ({ page }) => {
    // Navigate to teams tab
    await page.click('[data-testid="tab-teams"]');
    
    // Verify teams are visible
    await expect(page.locator('[data-testid="team-item"]')).toHaveCount(2);
    
    // Verify team details
    await expect(page.locator('[data-testid="team-name"]').first()).toContainText('Kathmandu FC');
    await expect(page.locator('[data-testid="team-role"]').first()).toContainText('Captain');
  });

  test('should handle profile update errors', async ({ page }) => {
    // Mock profile update error
    await page.route('**/api/v1/profiles/me', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid data' })
      });
    });

    // Try to edit bio
    await page.click('[data-testid="bio-edit-button"]');
    await page.fill('[data-testid="bio-textarea"]', 'New bio');
    await page.click('[data-testid="bio-save-button"]');
    
    // Wait for API call
    await helpers.waitForApiCall('/api/v1/profiles/me');
    
    // Verify error message
    await expect(page.locator('[data-testid="error-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-toast"]')).toContainText('Invalid data');
  });

  test('should show loading states during updates', async ({ page }) => {
    // Mock slow profile update
    await page.route('**/api/v1/profiles/me', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    // Edit bio
    await page.click('[data-testid="bio-edit-button"]');
    await page.fill('[data-testid="bio-textarea"]', 'New bio');
    await page.click('[data-testid="bio-save-button"]');
    
    // Verify loading state
    await expect(page.locator('[data-testid="bio-loading"]')).toBeVisible();
    
    // Wait for completion
    await helpers.waitForApiCall('/api/v1/profiles/me');
    
    // Verify loading state is gone
    await expect(page.locator('[data-testid="bio-loading"]')).toBeHidden();
  });

  test('should persist data across page refreshes', async ({ page }) => {
    // Edit bio
    await page.click('[data-testid="bio-edit-button"]');
    await page.fill('[data-testid="bio-textarea"]', 'Persistent bio');
    await page.click('[data-testid="bio-save-button"]');
    
    // Wait for API call
    await helpers.waitForApiCall('/api/v1/profiles/me');
    
    // Refresh page
    await page.reload();
    
    // Verify bio is still there
    await expect(page.locator('[data-testid="bio-display"]')).toContainText('Persistent bio');
  });
});
