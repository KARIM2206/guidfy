const { test, expect } = require('@playwright/test');

test.describe.serial('Admin Dashboard E2E Journey', () => {
  // Skip WebKit due to known localhost Cross-Origin ITP cookie blocking issues
  test.skip(({ browserName }) => browserName === 'webkit', 'WebKit has strict ITP policies that block localhost cross-port cookies');
  
  let page;

  test.beforeAll(async ({ browser }) => {
    // We create a single page context to share state across steps
    const context = await browser.newContext();
    page = await context.newPage();
  });

  test.afterAll(async () => {
    if (page) {
      await page.close();
    }
  });

  test('Step 1: Admin Login', async () => {
    await page.goto('http://localhost:5000/login');
    
    // Fill credentials
    await page.getByPlaceholder('you@example.com').fill('admin6@guidify.com');
    await page.getByPlaceholder('••••••••').fill('121212');
    
    await page.waitForTimeout(1000);
    // Press Enter to submit the form reliably across all browsers (especially WebKit)
    await page.getByPlaceholder('••••••••').press('Enter');
    
    // Wait for the login form to disappear, confirming the token was received
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeHidden({ timeout: 15000 });
    
    // Give the app a moment to write tokens to localStorage before checking the next page
    await page.waitForTimeout(2000);
    
    // Verify successful redirect to Dashboard
    await expect(page.getByRole('link', { name: /Dashboard/i })).toBeVisible({ timeout: 10000 });
    
    // Click it
    await page.getByRole('link', { name: /Dashboard/i }).click();
    
    // Wait for Admin sidebar/layout to load
    await expect(page.getByRole('heading', { name: /Admin Dashboard/i })).toBeVisible({ timeout: 15000 });
  });

  test('Step 2: Roadmap Management (Create Step and Lesson)', async () => {
    // Navigate to roadmaps
    await page.getByRole('button', { name: 'Roadmaps' }).click();
    await page.waitForTimeout(2000);
    
    // Pick the first roadmap's "Manage" or "View" button to enter details
    // In admin list, there's a button usually to view it.
    // Let's rely on standard link or button
    const viewRoadmapBtn = page.getByRole('button', { name: /View roadmap/i }).first();
    await viewRoadmapBtn.click();
    await page.waitForTimeout(2000);

    // Click Add Step
    await page.getByRole('button', { name: /Add Step/i }).click();
    
    // Fill Step Form Modal using placeholders
    await page.getByPlaceholder('e.g., Introduction to React').fill('E2E Test Step');
    await page.getByPlaceholder('Describe what this step covers...').fill('This is a test step created by Playwright');
    // Save Step
    await page.getByRole('button', { name: /Save Step/i, exact: false }).click();
    
    // Wait for Modal to close
    await expect(page.getByText('E2E Test Step').first()).toBeVisible({ timeout: 10000 });
    
    // Expand Step to add Lesson
    await page.getByText('E2E Test Step').first().click();
    await page.waitForTimeout(1000);
    
    // Click Add Lesson inside the expanded Step
    await page.getByRole('button', { name: /Add Lesson/i }).click();
    
    // Fill Lesson Form using placeholders
    await page.getByPlaceholder('e.g., Introduction to Algebra').fill('E2E Test Lesson');
    
    // Select External Video
    await page.getByRole('button', { name: /External/i }).click();
    await page.getByPlaceholder('https://example.com/video.mp4').fill('https://www.w3schools.com/html/mov_bbb.mp4');
    
    await page.getByRole('button', { name: /Save Lesson/i, exact: false }).click();
    
    // Verify Lesson is visible
    await expect(page.getByText('E2E Test Lesson').first()).toBeVisible({ timeout: 10000 });
  });

  test('Step 3: Community Control', async () => {
    // Navigate to Community
    await page.getByRole('button', { name: 'Community' }).click();
    await page.waitForTimeout(2000);
    
    // Click Manage on the first community
    const manageCommunityBtn = page.getByRole('button', { name: 'Manage' }).first();
    await manageCommunityBtn.click();
    
    // Verify we are inside community settings (wait for some heading)
    await expect(page.getByRole('heading', { name: /Community Members/i, exact: false }).first()).toBeVisible({ timeout: 10000 });
  });

  test('Step 4: Jobs Management (Search and Status Toggle)', async () => {
    // Navigate to Jobs
    await page.getByRole('button', { name: 'Jobs' }).click();
    await page.waitForTimeout(2000);
    
    // Ensure jobs are loaded
    await expect(page.getByPlaceholder('Search jobs...')).toBeVisible({ timeout: 10000 });
    
    // Search
    await page.getByPlaceholder('Search jobs...').fill('Developer');
    await page.waitForTimeout(1000); // Wait for debounce
    
    // Toggle Status on the first job
    const statusBtn = page.locator('button[title="Toggle Status"]').first();
    await statusBtn.click();
    
    // Wait for the toast message
    await expect(page.getByText(/Status updated/i)).toBeVisible({ timeout: 5000 });
  });

  test('Step 5: Chat with Super Admin', async () => {
    // Navigate to Chat
    await page.getByRole('button', { name: 'Chat' }).click();
    await page.waitForTimeout(2000);
    
    // Verify we are on the chat page
    await expect(page.getByRole('heading', { name: 'Messages' })).toBeVisible({ timeout: 10000 });
    
    // Find first contact in the list and wait for it to load
    const firstContact = page.locator('.flex-col:has(h2:has-text("Messages")) .overflow-y-auto button').first();
    await expect(firstContact).toBeVisible({ timeout: 15000 });
    
    // Repeatedly click the contact until the chat header appears
    await expect(async () => {
      await firstContact.click({ force: true });
      await expect(page.getByText(/Online/i)).toBeVisible({ timeout: 2000 });
    }).toPass({ timeout: 15000 });
    
    // Successfully verified chat opens with a user!
  });
});
