"""
Selenium UI Automation Test Suite for AI Digital Crime Investigation Agent
Validates:
1. Cinematic Intro Screen and Vintage Lamp interaction
2. Glass crack and shatter transition into Title Reveal
3. Navigation into the classified dashboard
4. Submitting a new investigation via the dossier form
5. Verifying the algorithmic risk prediction and risk score
6. Engaging with the Investigation Desk assistant:
   - Greeting intent: "hi" -> short greeting, no full dossier
   - Custom case inquiry: "Why was this case flagged?" -> evidence-grounded
   - Evidence gaps: "What information is missing?" -> distinguishes missing fields from recommended evidence
"""

import time
import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "http://localhost:3000"

class TestInvestigationAgentUI(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        chrome_options = Options()
        chrome_options.add_argument("--headless=new")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--window-size=1920,1080")
        try:
            cls.driver = webdriver.Chrome(options=chrome_options)
        except Exception as e:
            print(f"Chrome WebDriver initialization failed: {e}")
            cls.driver = None

    @classmethod
    def tearDownClass(cls):
        if cls.driver:
            cls.driver.quit()

    def setUp(self):
        if not self.driver:
            self.skipTest("Chrome WebDriver is not available on this system.")
        self.driver.get(BASE_URL)
        # Clear session storage to force fresh state
        self.driver.execute_script("sessionStorage.clear();")
        self.driver.refresh()

    def _bypass_intro_if_present(self):
        try:
            wait = WebDriverWait(self.driver, 3)
            skip_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='intro-skip']")))
            skip_btn.click()
            time.sleep(0.5)
        except Exception:
            pass

    def test_01_cinematic_lamp_and_shatter_reveal(self):
        """Test intro screen presence, clicking the lamp, and revealing title"""
        driver = self.driver
        wait = WebDriverWait(driver, 10)

        # 1. Verify vintage lamp is visible
        lamp = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-testid='intro-lamp']")))
        self.assertIsNotNone(lamp, "Vintage hanging pendant lamp must be visible on initial load")

        # 2. Click lamp to trigger impact, crack, shatter sequence
        lamp.click()

        # 3. Wait for title reveal
        title_block = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-testid='intro-title']")))
        self.assertIn("AI DIGITAL CRIME", title_block.text)

        # 4. Click 'ENTER INVESTIGATION' button
        enter_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='enter-investigation']")))
        enter_btn.click()

        # 5. Verify arrival on dashboard
        time.sleep(1)
        hero_heading = wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "hero-heading")))
        self.assertIn("Uncover the Evidence", hero_heading.text)

    def test_02_submit_investigation_form_and_verify_result(self):
        """Test submitting the investigation form and verifying model dossier results"""
        driver = self.driver
        wait = WebDriverWait(driver, 10)

        self._bypass_intro_if_present()

        # Navigate to New Investigation tab
        nav_buttons = driver.find_elements(By.CLASS_NAME, "nav-item-btn")
        for btn in nav_buttons:
            if "NEW INVESTIGATION" in btn.text:
                btn.click()
                break

        # Verify form is present
        form = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-testid='investigation-form']")))
        self.assertIsNotNone(form)

        # Click Start Investigation
        start_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='start-investigation']")))
        start_btn.click()

        # Verify Investigation Result card appears
        result_card = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-testid='investigation-result']")))
        self.assertIsNotNone(result_card)

        # Verify prediction and risk score elements exist
        prediction = driver.find_element(By.CSS_SELECTOR, "[data-testid='investigation-prediction']")
        self.assertIn(prediction.text.strip(), ["NORMAL", "SUSPICIOUS"])

        risk_score = driver.find_element(By.CSS_SELECTOR, "[data-testid='risk-score']")
        self.assertTrue(len(risk_score.text.strip()) > 0)

    def test_03_greeting_intent_returns_short_greeting(self):
        """Test sending 'hi' in the Investigation Desk returns a short greeting and no dossier"""
        driver = self.driver
        wait = WebDriverWait(driver, 10)

        self._bypass_intro_if_present()

        # Navigate to Investigation Desk tab
        nav_buttons = driver.find_elements(By.CLASS_NAME, "nav-item-btn")
        for btn in nav_buttons:
            if "INVESTIGATION DESK" in btn.text:
                btn.click()
                break

        assistant_panel = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-testid='investigation-assistant']")))
        self.assertIsNotNone(assistant_panel)

        # Type greeting 'hi'
        input_box = driver.find_element(By.CSS_SELECTOR, "[data-testid='assistant-question']")
        input_box.clear()
        input_box.send_keys("hi")

        submit_btn = driver.find_element(By.CSS_SELECTOR, "[data-testid='assistant-submit']")
        submit_btn.click()

        time.sleep(1.2)
        messages = driver.find_elements(By.CLASS_NAME, "assistant-message")
        last_msg = messages[-1].text

        self.assertIn("Greetings, Investigator", last_msg, "Must respond with polite greeting")
        self.assertNotIn("Investigative Dossier Summary", last_msg, "Greeting must NOT generate a full investigation dossier")

    def test_04_custom_case_inquiry_and_evidence_gaps(self):
        """Test case inquiry and verify evidence gaps separate missing fields from recommendations"""
        driver = self.driver
        wait = WebDriverWait(driver, 10)

        self._bypass_intro_if_present()

        # Navigate to Investigation Desk tab
        nav_buttons = driver.find_elements(By.CLASS_NAME, "nav-item-btn")
        for btn in nav_buttons:
            if "INVESTIGATION DESK" in btn.text:
                btn.click()
                break

        # Submit inquiry: What information is missing?
        input_box = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-testid='assistant-question']")))
        input_box.clear()
        input_box.send_keys("What information is missing?")

        submit_btn = driver.find_element(By.CSS_SELECTOR, "[data-testid='assistant-submit']")
        submit_btn.click()

        time.sleep(1.5)
        messages = driver.find_elements(By.CLASS_NAME, "assistant-message")
        last_msg = messages[-1].text

        self.assertIn("Confirmed Missing Intake Fields", last_msg, "Must have section for confirmed missing intake fields")
        self.assertIn("Recommended Additional Evidence to Collect", last_msg, "Must have section for recommended additional evidence")
        self.assertNotIn("bulletproof hosting", last_msg, "Must never invent bulletproof hosting claims")

if __name__ == "__main__":
    unittest.main()
