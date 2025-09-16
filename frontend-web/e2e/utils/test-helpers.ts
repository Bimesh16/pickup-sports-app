import { Page, expect } from '@playwright/test';

export class TestHelpers {
  constructor(private page: Page) {}

  // Authentication helpers
  async login(email: string = 'test@example.com', password: string = 'password123') {
    await this.page.goto('/login');
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    await this.page.click('[data-testid="login-button"]');
    
    // Wait for redirect to dashboard
    await this.page.waitForURL('/dashboard');
    await expect(this.page.locator('[data-testid="dashboard-header"]')).toBeVisible();
  }

  async logout() {
    await this.page.click('[data-testid="user-menu"]');
    await this.page.click('[data-testid="logout-button"]');
    await this.page.waitForURL('/login');
  }

  // Navigation helpers
  async navigateToTab(tabName: string) {
    await this.page.click(`[data-testid="nav-${tabName}"]`);
    await this.page.waitForLoadState('networkidle');
  }

  // Form helpers
  async fillForm(formData: Record<string, string>) {
    for (const [field, value] of Object.entries(formData)) {
      await this.page.fill(`[data-testid="${field}"]`, value);
    }
  }

  async selectDropdown(selector: string, value: string) {
    await this.page.click(selector);
    await this.page.click(`text=${value}`);
  }

  // Wait helpers
  async waitForApiCall(endpoint: string) {
    await this.page.waitForResponse(response => 
      response.url().includes(endpoint) && response.status() === 200
    );
  }

  async waitForWebSocketMessage(messageType: string) {
    await this.page.waitForFunction(
      (type) => {
        return window.lastWebSocketMessage?.type === type;
      },
      messageType
    );
  }

  // Mock helpers
  async mockApiResponse(endpoint: string, response: any) {
    await this.page.route(`**/api${endpoint}`, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  }

  async mockWebSocketMessage(message: any) {
    await this.page.evaluate((msg) => {
      if (window.mockWebSocket) {
        window.mockWebSocket.onmessage({ data: JSON.stringify(msg) });
      }
    }, message);
  }

  // Performance helpers
  async measurePerformance(metric: string) {
    return await this.page.evaluate((m) => {
      return performance.getEntriesByName(m)[0]?.startTime || 0;
    }, metric);
  }

  async getCoreWebVitals() {
    return await this.page.evaluate(() => {
      return {
        lcp: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime || 0,
        fid: performance.getEntriesByType('first-input')[0]?.processingStart || 0,
        cls: performance.getEntriesByType('layout-shift').reduce((acc, entry) => acc + entry.value, 0)
      };
    });
  }

  // Assertion helpers
  async expectElementVisible(selector: string) {
    await expect(this.page.locator(selector)).toBeVisible();
  }

  async expectElementHidden(selector: string) {
    await expect(this.page.locator(selector)).toBeHidden();
  }

  async expectTextContent(selector: string, text: string) {
    await expect(this.page.locator(selector)).toContainText(text);
  }

  async expectApiCall(endpoint: string, method: string = 'GET') {
    const response = await this.page.waitForResponse(response => 
      response.url().includes(endpoint) && response.request().method() === method
    );
    expect(response.status()).toBe(200);
    return response;
  }

  // Screenshot helpers
  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}.png`,
      fullPage: true 
    });
  }

  // Cleanup helpers
  async clearStorage() {
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }
}

// Mock data generators
export const mockData = {
  user: {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    xp: 150,
    rank: 'Competent'
  },
  
  games: [
    {
      id: 'game-1',
      sport: 'Football',
      venue: 'Kathmandu Sports Complex',
      time: '2024-01-15T10:00:00Z',
      price: 500,
      currentPlayers: 8,
      maxPlayers: 12,
      location: { lat: 27.7172, lng: 85.324 }
    },
    {
      id: 'game-2',
      sport: 'Basketball',
      venue: 'Basketball Court',
      time: '2024-01-15T14:00:00Z',
      price: 300,
      currentPlayers: 4,
      maxPlayers: 10,
      location: { lat: 27.7200, lng: 85.3300 }
    }
  ],

  venues: [
    {
      id: 'venue-1',
      name: 'Kathmandu Sports Complex',
      address: 'Kathmandu, Nepal',
      capacity: 50,
      hourlyRate: 2000,
      amenities: ['parking', 'wifi', 'shower']
    }
  ],

  notifications: [
    {
      id: 'notif-1',
      type: 'game_invite',
      title: 'Game Invitation',
      message: 'You have been invited to a football game',
      isRead: false,
      timestamp: new Date().toISOString()
    }
  ],

  trendingSports: [
    { sport: 'Football', playerCount: 45 },
    { sport: 'Basketball', playerCount: 32 },
    { sport: 'Cricket', playerCount: 28 }
  ]
};
