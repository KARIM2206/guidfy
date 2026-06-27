import { test, expect } from '@playwright/test';

test.describe('End-to-End User Journey', () => {
  test('User can register, take AI questionnaire, and get learning path', async ({ page }) => {
    test.setTimeout(90000); // Allow up to 90 seconds for the entire flow

    // Stagger parallel browser executions to avoid backend Database Locks on Registration
    await page.waitForTimeout(Math.random() * 3000);

    // Generate a truly unique email for each worker/browser
    const uniqueEmail = `testuser_${Date.now()}_${Math.random().toString(36).substring(7)}@example.com`;

    // 1. Navigate to Login & Switch to Register
    await page.goto('http://localhost:5000/login');
    await page.getByRole('link', { name: 'Register' }).click();
    await expect(page.getByRole('button', { name: 'Register' })).toBeVisible();

    // 2. Register a new user
    await page.getByRole('textbox', { name: 'Full Name' }).fill('E2E Test User');
    await page.getByRole('textbox', { name: 'Email Address' }).fill(uniqueEmail);
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('password123');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('password123');
    
    // Submit registration
    await page.getByRole('button', { name: 'Register' }).click();

    // Wait for the app to automatically redirect to login or show the sign in button again
    // (If it doesn't auto-redirect, we manually navigate after a safe timeout)
    try {
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible({ timeout: 10000 });
    } catch {
      await page.goto('http://localhost:5000/login');
    }

    // 3. Login Flow
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Email Address' }).fill(uniqueEmail);
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for login to complete by waiting for the Sign In button to disappear
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeHidden({ timeout: 20000 });
    
    // Give the app a moment to write tokens to localStorage and complete the redirect
    await page.waitForTimeout(2000);

    // 4. Navigate to Learning Paths page
    await page.goto('http://localhost:5000/learning-paths');
    await expect(page.getByRole('heading', { name: 'Learning Paths', exact: true })).toBeVisible({ timeout: 15000 });

    // 5. Open AI Questionnaire Modal
    // Note: A new user will definitely see "Find My Path" instead of "Redo"
    await page.getByRole('button', { name: /Find My Path/i }).click();
    
    // Ensure Modal is visible (Step 0: Experience)
    await expect(page.getByText("What's your coding experience?")).toBeVisible();

    // Step 0: Select Experience
    await page.getByRole('button', { name: /Intermediate/i }).click({ force: true });
    await page.getByRole('button', { name: /Continue/i }).click({ force: true });

    // Step 1: Select Skills
    await expect(page.getByText('What technologies do you know?')).toBeVisible();
    await page.getByRole('button', { name: /JavaScript/i }).click({ force: true });
    await page.getByRole('button', { name: /React/i }).click({ force: true });
    await page.getByRole('button', { name: /Continue/i }).click({ force: true });

    // Step 2: Select Interest
    await expect(page.getByText('Where do you want to go?')).toBeVisible();
    await page.getByRole('button', { name: /Frontend/i }).click({ force: true });
    await page.getByRole('button', { name: /Continue/i }).click({ force: true });

    // Step 3: Select Daily Commitment
    await expect(page.getByText('How many hours per day?')).toBeVisible();
    await page.getByRole('button', { name: /2 hrs/i }).click({ force: true });
    
    // Submit Questionnaire
    await page.getByRole('button', { name: /Get My Path/i }).click({ force: true });

    // 6. Await AI Result (Give it up to 30s to hit the backend & LLM)
    await expect(page.getByRole('heading', { name: 'Your Recommended Path', exact: true })).toBeVisible({ timeout: 30000 });
    
    // 7. Click View My Path
    await page.getByRole('button', { name: /View My Path/i }).click({ force: true });

    // 8. Verify the Main Page AI Banner Updated
    await expect(page.getByText('AI Recommended Path', { exact: false })).toBeVisible({ timeout: 15000 });
  });
});
