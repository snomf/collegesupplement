from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Go to the dashboard
        page.goto("http://localhost:5173")
        expect(page.get_by_text("Welcome to Questrack!")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/01_dashboard_final.png")

        # 2. Go to My Schools and add Amherst College
        page.get_by_role("link", name="My Schools").click()
        page.get_by_role("button", name="Add School").click()
        page.get_by_text("Amherst College").click()
        page.get_by_role("button", name="Add", exact=True).click()

        # 3. Verify the new school card details
        expect(page.locator('h2:has-text("Amherst College")')).to_be_visible()
        expect(page.get_by_text("Amherst, MA", exact=True)).to_be_visible()
        expect(page.get_by_text("Amherst College is a premier liberal arts college")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/02_my_schools_detailed.png")

        # 4. Go to the school detail page
        page.get_by_role("link", name="Amherst College").click()

        # 5. Verify the detailed description and new checklist
        expect(page.get_by_text("Founded in 1821, Amherst College is widely considered")).to_be_visible()
        expect(page.get_by_text("Supplemental Essay (Option A)").first).to_be_visible()
        expect(page.locator('p:has-text("Option A, Prompt 1")')).to_be_visible()

        # 6. Update a checklist item and check progress
        page.locator('select').first.select_option('Completed')
        # Note: Amherst has 5 optional supplements, so 1 of 5 is 20%
        expect(page.get_by_text("20% Complete")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/03_school_detail_final_progress.png")

        # 7. Reload and verify persistence
        page.reload()
        expect(page.get_by_text("20% Complete")).to_be_visible()

        # 8. Go back to the dashboard and check overall progress
        page.get_by_role("link", name="Questrack").click()
        expect(page.locator("text=20%")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/04_dashboard_final_progress.png")

        browser.close()

run()
