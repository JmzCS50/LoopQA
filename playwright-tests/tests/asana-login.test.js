const { chromium } = require('playwright');
const testData = require('../test-data.json');

describe('Asana Login Automation', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: false }); // Set headless: true to run in the background
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  test('Login to Asana', async () => {
    await page.goto('https://app.asana.com/-/login');

    // Enter login credentials
    await page.fill('input[name="email"]', 'ben+pose@workwithloop.com');
    await page.fill('input[name="password"]', 'Password123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();

    // Verify that the login was successful (e.g., check for an element unique to the dashboard)
    const dashboardTitle = await page.textContent('h1');
    expect(dashboardTitle).toBe('My Tasks'); // Adjust the expected title based on your Asana page
  });

  test.each(testData)('Verify task %s in the correct column and tags', async ({ task, column, tags }) => {
    await page.goto('https://app.asana.com/0/');

    // Navigate to the specific project (Adjust the project name and URL structure as needed)
    await page.click(`text="Cross-functional project plan, Project"`);

    // Verify the task is in the correct column
    const taskElement = await page.locator(`text=${task}`);
    const columnElement = await taskElement.locator(`xpath=..//ancestor::div[contains(@class, 'column')]`);
    const columnName = await columnElement.innerText();
    expect(columnName).toBe(column);

    // Verify the tags
    for (const tag of tags) {
      const tagElement = await page.locator(`text=${tag}`);
      expect(await tagElement.isVisible()).toBe(true);
    }
  });
});
