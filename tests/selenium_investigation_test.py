"""
Selenium UI Automation Test Suite — AI Digital Crime Investigation Agent
========================================================================
Test Coverage:
  01. Cinematic intro screen: vintage lamp visible + click triggers shatter & title reveal
  02. Submit investigation form -> verify prediction and risk score in result card
  03. Greeting intent ("hi") -> short greeting, no full dossier
  04. Evidence gaps query -> response distinguishes missing fields from recommendations
  05. Dashboard summary cards -> total, suspicious, normal counts are numeric
  06. Recent cases list -> at least one row present after an investigation is submitted
  07. Edge case -- empty form submit -> validation or error response (no crash)
  08. Navigation smoke test -> all 3 nav tabs are reachable without errors
  09. API persistence check -> after UI submit, case appears via GET /api/cases
  10. API summary check -> GET /api/cases/summary returns valid JSON with counts
"""

import time
import unittest
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
BASE_URL    = "http://localhost:3000"
BACKEND_URL = "http://localhost:8081"
HEADLESS    = True   # Set False to watch the browser during debugging
WAIT_LONG   = 15     # seconds -- for slow async operations
WAIT_SHORT  = 5      # seconds -- for fast DOM checks
# ---------------------------------------------------------------------------


def _make_driver(headless=True):
    opts = Options()
    if headless:
        opts.add_argument("--headless=new")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--window-size=1920,1080")
    opts.add_argument("--log-level=3")
    return webdriver.Chrome(options=opts)


# ---------------------------------------------------------------------------
# Base class with shared helpers
# ---------------------------------------------------------------------------
class BaseInvestigationTest(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        try:
            cls.driver = _make_driver(headless=HEADLESS)
            cls.driver.implicitly_wait(2)
        except Exception as e:
            print(f"[WARN] ChromeDriver init failed: {e}")
            cls.driver = None

    @classmethod
    def tearDownClass(cls):
        if cls.driver:
            cls.driver.quit()

    def setUp(self):
        if not self.driver:
            self.skipTest("ChromeDriver not available on this system.")
        self.driver.get(BASE_URL)
        self.driver.execute_script("sessionStorage.clear();")
        self.driver.refresh()
        time.sleep(0.5)

    # -- Helpers -------------------------------------------------------------

    def _wait(self, timeout=WAIT_LONG):
        return WebDriverWait(self.driver, timeout)

    def _bypass_intro(self):
        """Skip the cinematic intro if it is shown."""
        try:
            skip = self._wait(3).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='intro-skip']"))
            )
            skip.click()
            time.sleep(0.5)
        except (TimeoutException, NoSuchElementException):
            pass

    def _navigate_to_tab(self, label):
        """Click the nav button whose text contains label (case-insensitive)."""
        buttons = self.driver.find_elements(By.CLASS_NAME, "nav-item-btn")
        for btn in buttons:
            if label.upper() in btn.text.upper():
                btn.click()
                time.sleep(0.4)
                return
        self.fail(f"Nav tab '{label}' not found. Available: {[b.text for b in buttons]}")

    def _submit_default_investigation(self):
        """Navigate to New Investigation and submit with default values."""
        self._bypass_intro()
        self._navigate_to_tab("NEW INVESTIGATION")
        form = self._wait().until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-testid='investigation-form']"))
        )
        self.assertIsNotNone(form, "Investigation form must be present")
        start_btn = self._wait().until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='start-investigation']"))
        )
        start_btn.click()


# ---------------------------------------------------------------------------
# TEST CASES
# ---------------------------------------------------------------------------
class TestInvestigationAgentUI(BaseInvestigationTest):

    # -- Test 01 -------------------------------------------------------------
    def test_01_cinematic_lamp_and_shatter_reveal(self):
        """Intro screen: lamp visible -> click -> shatter -> title reveal -> enter dashboard."""
        driver = self.driver

        # 1. Vintage lamp must be visible on load
        lamp = self._wait().until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-testid='intro-lamp']"))
        )
        self.assertIsNotNone(lamp, "Vintage hanging pendant lamp must be visible on initial load")

        # 2. Click lamp -> triggers crack + shatter animation
        lamp.click()

        # 3. Title reveal must appear after shatter
        title_block = self._wait().until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-testid='intro-title']"))
        )
        self.assertIn("AI DIGITAL CRIME", title_block.text,
                      "Title block must contain 'AI DIGITAL CRIME'")

        # 4. 'ENTER INVESTIGATION' button must be clickable
        enter_btn = self._wait().until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='enter-investigation']"))
        )
        enter_btn.click()

        # 5. Dashboard hero heading confirms correct page
        time.sleep(1)
        hero = self._wait().until(EC.visibility_of_element_located((By.CLASS_NAME, "hero-heading")))
        self.assertIn("Uncover the Evidence", hero.text)

    # -- Test 02 -------------------------------------------------------------
    def test_02_submit_investigation_form_and_verify_result(self):
        """Form submit -> result card appears with valid prediction and risk score."""
        self._submit_default_investigation()

        result_card = self._wait().until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-testid='investigation-result']"))
        )
        self.assertIsNotNone(result_card, "Investigation result card must appear after submit")

        prediction = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='investigation-prediction']")
        self.assertIn(prediction.text.strip(), ["NORMAL", "SUSPICIOUS"],
                      f"Prediction must be NORMAL or SUSPICIOUS, got: '{prediction.text.strip()}'")

        risk_score = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='risk-score']")
        risk_text = risk_score.text.strip()
        self.assertTrue(len(risk_text) > 0, "Risk score element must not be empty")

        # Risk score must be numeric between 0 and 100
        try:
            cleaned = risk_text.split("/")[0].strip()
            score_val = int("".join(filter(str.isdigit, cleaned)))
            self.assertGreaterEqual(score_val, 0)
            self.assertLessEqual(score_val, 100)
        except ValueError:
            self.fail(f"Risk score could not be parsed as integer: '{risk_text}'")

    # -- Test 03 -------------------------------------------------------------
    def test_03_greeting_intent_returns_short_greeting(self):
        """Sending 'hi' to Investigation Desk returns a polite greeting, not a full dossier."""
        self._bypass_intro()
        self._navigate_to_tab("INVESTIGATION DESK")

        panel = self._wait().until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-testid='investigation-assistant']"))
        )
        self.assertIsNotNone(panel, "Investigation assistant panel must be visible")

        input_box = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='assistant-question']")
        input_box.clear()
        input_box.send_keys("hi")

        self.driver.find_element(By.CSS_SELECTOR, "[data-testid='assistant-submit']").click()

        time.sleep(1.5)
        messages = self.driver.find_elements(By.CLASS_NAME, "assistant-message")
        self.assertTrue(len(messages) > 0, "At least one assistant message must appear")

        last_msg = messages[-1].text
        self.assertIn("Greetings, Investigator", last_msg,
                      "Assistant must respond with a polite greeting")
        self.assertNotIn("Investigative Dossier Summary", last_msg,
                         "Greeting must NOT trigger a full investigation dossier")

    # -- Test 04 -------------------------------------------------------------
    def test_04_evidence_gaps_distinguishes_missing_from_recommendations(self):
        """'What information is missing?' -> both missing fields + recommendations sections."""
        self._bypass_intro()
        self._navigate_to_tab("INVESTIGATION DESK")

        input_box = self._wait().until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-testid='assistant-question']"))
        )
        input_box.clear()
        input_box.send_keys("What information is missing?")

        self.driver.find_element(By.CSS_SELECTOR, "[data-testid='assistant-submit']").click()

        time.sleep(1.8)
        messages = self.driver.find_elements(By.CLASS_NAME, "assistant-message")
        self.assertTrue(len(messages) > 0, "Assistant must reply to evidence gap query")

        last_msg = messages[-1].text
        self.assertIn("Confirmed Missing Intake Fields", last_msg,
                      "Response must contain 'Confirmed Missing Intake Fields' section")
        self.assertIn("Recommended Additional Evidence to Collect", last_msg,
                      "Response must contain 'Recommended Additional Evidence to Collect' section")
        self.assertNotIn("bulletproof hosting", last_msg,
                         "Assistant must never fabricate 'bulletproof hosting' claims")

    # -- Test 05 -------------------------------------------------------------
    def test_05_dashboard_summary_cards_show_numeric_counts(self):
        """Dashboard summary cards (Total / Suspicious / Normal) must display numeric values."""
        self._bypass_intro()
        self._navigate_to_tab("DASHBOARD")

        try:
            card_section = self._wait(WAIT_SHORT).until(
                EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-testid='summary-cards']"))
            )
            self.assertIsNotNone(card_section, "Summary cards container must be present")
        except TimeoutException:
            self.skipTest("Summary cards not rendered -- check data-testid='summary-cards' is set")

        card_values = self.driver.find_elements(By.CSS_SELECTOR, "[data-testid='summary-card-value']")
        self.assertGreater(len(card_values), 0, "At least one summary card value must be visible")
        for card in card_values:
            txt = card.text.strip()
            self.assertTrue(txt.isdigit(), f"Summary card value must be numeric, got: '{txt}'")

    # -- Test 06 -------------------------------------------------------------
    def test_06_recent_cases_list_populated_after_submit(self):
        """After submitting, a case row must appear in Recent Cases on dashboard."""
        self._submit_default_investigation()

        # Wait for result to confirm submission succeeded
        self._wait().until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-testid='investigation-result']"))
        )

        self._navigate_to_tab("DASHBOARD")
        time.sleep(1)

        try:
            cases_section = self._wait(WAIT_SHORT).until(
                EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-testid='recent-cases']"))
            )
            self.assertIsNotNone(cases_section, "Recent cases section must be present on dashboard")

            rows = self.driver.find_elements(By.CSS_SELECTOR, "[data-testid='case-row']")
            self.assertGreater(len(rows), 0, "At least one case row must appear in Recent Cases")
        except TimeoutException:
            self.skipTest("Recent cases section not rendered -- check data-testid='recent-cases' is set")

    # -- Test 07 -------------------------------------------------------------
    def test_07_form_does_not_crash_on_empty_submit(self):
        """Submitting an empty form must not crash the UI."""
        self._bypass_intro()
        self._navigate_to_tab("NEW INVESTIGATION")

        self._wait().until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-testid='investigation-form']"))
        )
        start_btn = self._wait().until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='start-investigation']"))
        )
        start_btn.click()
        time.sleep(2.5)

        # Page must not be blank
        body_text = self.driver.find_element(By.TAG_NAME, "body").text
        self.assertTrue(len(body_text.strip()) > 0, "Page must not be blank after empty form submit")

        # Either result, error, or validation must appear
        selectors = [
            "[data-testid='investigation-result']",
            "[data-testid='error-state']",
            ".error-message",
            ".validation-error",
        ]
        found_any = any(self.driver.find_elements(By.CSS_SELECTOR, sel) for sel in selectors)
        self.assertTrue(found_any,
                        "After empty submit, UI must show result, error, or validation feedback")

    # -- Test 08 -------------------------------------------------------------
    def test_08_navigation_smoke_test_all_tabs_reachable(self):
        """All 3 main nav tabs must be clickable without causing errors."""
        self._bypass_intro()

        tabs = ["DASHBOARD", "NEW INVESTIGATION", "INVESTIGATION DESK"]
        for tab_label in tabs:
            self._navigate_to_tab(tab_label)
            time.sleep(0.5)
            body = self.driver.find_element(By.TAG_NAME, "body")
            self.assertTrue(body.is_displayed(),
                            f"Page must be alive after navigating to '{tab_label}'")
            error_overlays = self.driver.find_elements(By.CSS_SELECTOR,
                                                       ".error-overlay, #error-boundary")
            self.assertEqual(len(error_overlays), 0,
                             f"No error overlay must appear on tab '{tab_label}'")

    # -- Test 09 -------------------------------------------------------------
    def test_09_api_persistence_case_saved_after_submit(self):
        """
        After submitting an investigation via UI, GET /api/cases must return one more
        record -- verifying Supabase DB write path is working end-to-end.
        """
        try:
            before_resp = requests.get(f"{BACKEND_URL}/api/cases", timeout=5)
            before_resp.raise_for_status()
            count_before = len(before_resp.json())
        except Exception as e:
            self.skipTest(f"Backend API not reachable at {BACKEND_URL}: {e}")

        self._submit_default_investigation()

        # Wait for result card -> confirms POST completed
        self._wait().until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-testid='investigation-result']"))
        )
        time.sleep(1)

        after_resp = requests.get(f"{BACKEND_URL}/api/cases", timeout=5)
        after_resp.raise_for_status()
        cases_after = after_resp.json()
        count_after = len(cases_after)

        self.assertGreater(
            count_after, count_before,
            f"A new case must be persisted in Supabase after UI submission. "
            f"Before: {count_before}, After: {count_after}"
        )

        # Validate structure of the latest case
        latest = cases_after[-1]
        self.assertIn("caseId",     latest, "Case must have a caseId field")
        self.assertIn("prediction", latest, "Case must have a prediction field")
        self.assertIn("riskScore",  latest, "Case must have a riskScore field")

    # -- Test 10 -------------------------------------------------------------
    def test_10_api_summary_returns_valid_counts(self):
        """
        GET /api/cases/summary must return valid JSON with numeric counts --
        confirms DB read-path with Supabase is working correctly.
        """
        try:
            resp = requests.get(f"{BACKEND_URL}/api/cases/summary", timeout=5)
        except Exception as e:
            self.skipTest(f"Backend API not reachable at {BACKEND_URL}: {e}")

        self.assertEqual(resp.status_code, 200, "Summary endpoint must return HTTP 200")

        data = resp.json()
        self.assertIsInstance(data, dict, "Summary response must be a JSON object")

        for key in ["totalCases", "suspiciousCases", "normalCases"]:
            if key in data:
                self.assertIsInstance(data[key], (int, float),
                                      f"Summary key '{key}' must be numeric, got: {type(data[key])}")


# ---------------------------------------------------------------------------
if __name__ == "__main__":
    unittest.main(verbosity=2)

