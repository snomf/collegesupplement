from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Go to the dashboard
        page.goto("http://localhost:5173")
        expect(page.get_by_text("Welcome to Questrack!")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/01_dashboard_initial.png")

        # 2. Go to My Schools and add Amherst College
        page.get_by_role("link", name="My Schools").click()
        page.get_by_role("button", name="Add School").click()
        page.get_by_text("Amherst College").click()
        page.get_by_role("button", name="Add", exact=True).click()
        expect(page.get_by_text("Amherst College")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/02_my_schools_with_school.png")

        # 3. Go to the school detail page
        page.get_by_role("link", name="Amherst College").click()

        # 4. Update the first checklist item and verify 50% progress
        page.locator('select').first.select_option('Completed')
        expect(page.get_by_text("50% Complete")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/03_school_detail_50_percent.png")

        # 5. Update the second checklist item and verify 100% progress
        page.locator('select').nth(1).select_option('Completed')
        expect(page.get_by_text("100% Complete")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/04_school_detail_100_percent.png")

        # 6. Reload the page and verify persistence
        page.reload()
        expect(page.get_by_text("100% Complete")).to_be_visible()

        # 7. Go back to the dashboard and check the progress
        page.get_by_role("link", name="Questrack").click()
        expect(page.locator("text=100%")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/05_dashboard_progress_100.png")

        browser.close()

run()
