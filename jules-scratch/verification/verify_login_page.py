from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    # Capture console logs
    page.on('console', lambda msg: print(f"CONSOLE: {msg.text}"))

    page.goto("http://localhost:5175/")

    # Check for login page content
    expect(page.locator('text=Log in to your account')).to_be_visible()

    page.screenshot(path="jules-scratch/verification/verification.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
