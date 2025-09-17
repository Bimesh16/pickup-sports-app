/**
 * Visual Regression Tests for Profile Page
 * 
 * These tests ensure that styling changes don't break visual consistency
 * and accessibility requirements.
 */

import { test, expect } from '@playwright/test';

test.describe('Profile Page Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to profile page
    await page.goto('/dashboard/profile');
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('Profile Header - Text Contrast and Styling', async ({ page }) => {
    // Test heading color in header
    const headerHeading = page.locator('[data-testid="profile-header"] h1');
    await expect(headerHeading).toHaveCSS('color', 'rgb(248, 250, 255)'); // text-dark-contrast
    
    // Test that no text-white/* is used on header text
    const headerText = page.locator('[data-testid="profile-header"] p');
    const textColor = await headerText.first().evaluate(el => getComputedStyle(el).color);
    expect(textColor).not.toMatch(/rgba\(255,\s*255,\s*255,\s*0\.(6|7|8)/); // Not text-white/60,70,80
    
    // Test XP tick labels are present and readable
    const xpLabels = page.locator('[data-testid="vertical-xp"] .tick-labels');
    await expect(xpLabels).toBeVisible();
    
    // Test XP labels have proper contrast
    const xpLabelText = page.locator('[data-testid="vertical-xp"] .tick-labels span');
    await expect(xpLabelText.first()).toHaveCSS('color', 'rgb(248, 250, 255)'); // text-dark-contrast
  });

  test('About Card - Text Contrast and Styling', async ({ page }) => {
    // Test heading color in About card
    const aboutHeading = page.locator('[data-testid="about-card"] h2');
    await expect(aboutHeading).toHaveCSS('color', 'rgb(11, 16, 33)'); // text-strong
    
    // Test that no text-white/* is used on card body text
    const cardBody = page.locator('[data-testid="about-card"] p');
    const bodyTextColor = await cardBody.first().evaluate(el => getComputedStyle(el).color);
    expect(bodyTextColor).not.toMatch(/rgba\(255,\s*255,\s*255,\s*0\.(6|7|8)/); // Not text-white/60,70,80
    
    // Test card background is clean white
    const cardBackground = page.locator('[data-testid="about-card"]');
    await expect(cardBackground).toHaveCSS('background-color', 'rgb(255, 255, 255)'); // surface-0
  });

  test('Focus Rings - Keyboard Navigation', async ({ page }) => {
    // Test Actions Dock focus ring
    const editButton = page.locator('[data-testid="dock-edit"]');
    await editButton.focus();
    await expect(editButton).toHaveCSS('outline', 'rgb(0, 56, 147) solid 2px'); // nepal-blue focus ring
    
    // Test tab focus ring
    const tabButton = page.locator('[role="tab"]').first();
    await tabButton.focus();
    await expect(tabButton).toHaveCSS('outline', 'rgb(0, 56, 147) solid 2px'); // nepal-blue focus ring
    
    // Test chip focus ring
    const chip = page.locator('[data-testid="gender-chip"]');
    if (await chip.isVisible()) {
      await chip.focus();
      await expect(chip).toHaveCSS('outline', 'rgb(0, 56, 147) solid 2px'); // nepal-blue focus ring
    }
  });

  test('Nepal Theme Elements', async ({ page }) => {
    // Test avatar ring gradient
    const avatarRing = page.locator('[data-testid="avatar-ring"]');
    await expect(avatarRing).toHaveCSS('background-image', /linear-gradient/);
    
    // Test chip colors use solid fills
    const genderChip = page.locator('[data-testid="gender-chip"]');
    if (await genderChip.isVisible()) {
      await expect(genderChip).toHaveCSS('background-color', 'rgb(254, 242, 242)'); // Solid pink fill
      await expect(genderChip).toHaveCSS('color', 'rgb(153, 27, 27)'); // Dark red text
    }
    
    const nationalityChip = page.locator('[data-testid="nationality-chip"]');
    if (await nationalityChip.isVisible()) {
      await expect(nationalityChip).toHaveCSS('background-color', 'rgb(238, 242, 255)'); // Solid blue fill
      await expect(nationalityChip).toHaveCSS('color', 'rgb(30, 64, 175)'); // Dark blue text
    }
  });

  test('Micro-ornaments Visibility', async ({ page }) => {
    // Test Everest diamond is present
    const everestDiamond = page.locator('[data-testid="everest-diamond"]');
    await expect(everestDiamond).toBeVisible();
    
    // Test dhwaja chevron is present but subtle
    const dhwajaChevron = page.locator('[data-testid="dhwaja-chevron"]');
    await expect(dhwajaChevron).toBeVisible();
    await expect(dhwajaChevron).toHaveCSS('opacity', '0.07');
  });

  test('Reduced Motion Support', async ({ page }) => {
    // Test that animations are disabled when reduced motion is preferred
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    // Check that hover animations are disabled
    const header = page.locator('[data-testid="profile-header"]');
    const transform = await header.evaluate(el => getComputedStyle(el).transform);
    expect(transform).toBe('none'); // No transform applied
    
    // Check that XP mountain doesn't animate
    const xpMountain = page.locator('[data-testid="xp-mountain"]');
    if (await xpMountain.isVisible()) {
      const animation = await xpMountain.evaluate(el => getComputedStyle(el).animation);
      expect(animation).toBe('none'); // No animation
    }
  });
});

test.describe('Quick Win Checklist', () => {
  test('Header has deep Nepal gradient with scrim', async ({ page }) => {
    await page.goto('/dashboard/profile');
    await page.waitForLoadState('networkidle');
    
    const header = page.locator('[data-testid="profile-header"]');
    await expect(header).toHaveCSS('background-image', /linear-gradient/);
    
    // Test scrim is present
    const scrim = page.locator('[data-testid="header-scrim"]');
    await expect(scrim).toBeVisible();
  });

  test('Cards are clean white with dark text', async ({ page }) => {
    await page.goto('/dashboard/profile');
    await page.waitForLoadState('networkidle');
    
    const aboutCard = page.locator('[data-testid="about-card"]');
    await expect(aboutCard).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    
    const cardText = page.locator('[data-testid="about-card"] p');
    const textColor = await cardText.first().evaluate(el => getComputedStyle(el).color);
    expect(textColor).toMatch(/rgb\(71,\s*85,\s*105\)/); // text-muted
  });

  test('Chips and rings use solid Nepal accents', async ({ page }) => {
    await page.goto('/dashboard/profile');
    await page.waitForLoadState('networkidle');
    
    // Test avatar ring is solid gradient
    const avatarRing = page.locator('[data-testid="avatar-ring"]');
    const bgImage = await avatarRing.evaluate(el => getComputedStyle(el).backgroundImage);
    expect(bgImage).toMatch(/linear-gradient/);
    
    // Test chips have solid fills
    const genderChip = page.locator('[data-testid="gender-chip"]');
    if (await genderChip.isVisible()) {
      const bgColor = await genderChip.evaluate(el => getComputedStyle(el).backgroundColor);
      expect(bgColor).toMatch(/rgb\(254,\s*242,\s*242\)/); // Solid pink
    }
  });

  test('XP bar is vivid with readable labels', async ({ page }) => {
    await page.goto('/dashboard/profile');
    await page.waitForLoadState('networkidle');
    
    const xpBar = page.locator('[data-testid="vertical-xp"]');
    await expect(xpBar).toBeVisible();
    
    const xpLabels = page.locator('[data-testid="vertical-xp"] .tick-labels');
    await expect(xpLabels).toBeVisible();
    
    // Test labels are readable
    const labelText = page.locator('[data-testid="vertical-xp"] .tick-labels span');
    await expect(labelText.first()).toHaveCSS('color', 'rgb(248, 250, 255)'); // High contrast
  });

  test('Overall page looks Nepal-themed and high-contrast', async ({ page }) => {
    await page.goto('/dashboard/profile');
    await page.waitForLoadState('networkidle');
    
    // Test main elements are visible and have proper contrast
    const header = page.locator('[data-testid="profile-header"]');
    await expect(header).toBeVisible();
    
    const aboutCard = page.locator('[data-testid="about-card"]');
    await expect(aboutCard).toBeVisible();
    
    // Test no dim/washed out text
    const allText = page.locator('p, span, div').filter({ hasText: /./ });
    const textElements = await allText.all();
    
    for (const element of textElements) {
      const color = await element.evaluate(el => getComputedStyle(el).color);
      const opacity = await element.evaluate(el => getComputedStyle(el).opacity);
      
      // Ensure text is not too dim
      expect(parseFloat(opacity)).toBeGreaterThan(0.7);
      
      // Ensure text has reasonable contrast (not pure white on white)
      if (color.includes('255, 255, 255')) {
        const bgColor = await element.evaluate(el => {
          const parent = el.closest('[data-testid="about-card"], [data-testid="profile-header"]');
          return parent ? getComputedStyle(parent).backgroundColor : 'transparent';
        });
        expect(bgColor).not.toBe('rgb(255, 255, 255)'); // Not white text on white background
      }
    }
  });
});
