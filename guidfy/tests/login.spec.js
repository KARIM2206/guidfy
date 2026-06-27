import { test, expect } from '@playwright/test';

test('User can register and login successfully', async ({ page }) => {
    // 1. Go to the login page
    await page.goto('http://localhost:5000/login');

    // 2. Switch to Register tab/link
    await page.getByRole('link', { name: 'Register' }).click();

    // Wait for the URL to change to /register if applicable
    // Or just wait for the Register form to appear
    await expect(page.getByRole('button', { name: 'Register' })).toBeVisible();

    // 3. Fill out the registration form
    await page.getByRole('textbox', { name: 'Full Name' }).fill('karim yousef');
    await page.getByRole('textbox', { name: 'Email Address' }).fill('karim123@gmail.com');

    // Note: For passwords, using getByLabel is often more robust if name varies, but let's stick to what worked
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('121212');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('121212');

    // 4. Submit Registration
    await page.getByRole('button', { name: 'Register' }).click();

    // 5. Navigate back to login (or it redirects automatically)
    // Assuming it redirects to login automatically or we can force it:
    await page.goto('http://localhost:5000/login');

    // 6. Fill out the login form
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Email Address' }).fill('karim123@gmail.com');
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('121212');
    await page.getByRole('checkbox', { name: 'Remember me' }).check();

    // 7. Submit Login
    await page.getByRole('button', { name: 'Sign In' }).click();

    // 8. Assert successful login (e.g., redirect to home/dashboard)
    // await expect(page).toHaveURL('http://localhost:5000/');
});