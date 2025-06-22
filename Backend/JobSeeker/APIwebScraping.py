from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import time
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import hashlib

def script(location, experience):
    initial_url = "https://www.ncs.gov.in/pages/default.aspx#searcharea"

    from selenium.webdriver.chrome.options import Options
    chrome_options = Options()
    # chrome_options.add_argument("--headless")
    # chrome_options.add_argument("--no-sandbox")
    # chrome_options.add_argument("--disable-dev-shm-usage")
    # chrome_options.add_argument("--disable-gpu")
    # chrome_options.add_argument("--disable-extensions")
    # chrome_options.add_argument("--disable-images")
    chrome_options.page_load_strategy = 'eager'
    
    driver = webdriver.Chrome(options=chrome_options)
    driver.set_page_load_timeout(15)
    
    try:
        driver.get(initial_url)
        print("Page loaded successfully")
        try:
            WebDriverWait(driver, 5).until(
            EC.element_to_be_clickable((By.ID, "btnClosePopup")))

            close_btn = driver.find_element("id", "btnClosePopup")
            close_btn.click()
            print("Popup closed")
        except Exception:
            print("No popup appeared")

        print("Selecting Location")
        location_input = driver.find_element("id", "ctl00_SPWebPartManager1_g_de4e63a9_db8a_4b11_b989_4b13991e94ee_ctl00_ucSALocations_txtLocation")
        location_input.clear()
        location_input.send_keys(location[:3])  # Type first few letters to trigger suggestions

        # Wait for the suggestion list to appear and select the desired option
        # suggestion_xpath = f"//li[contains(text(), '{location}')]"
        # WebDriverWait(driver, 10).until(
        #     EC.visibility_of_element_located((By.XPATH, suggestion_xpath))
        # )
        # suggestion = driver.find_element(By.XPATH, suggestion_xpath)
        # suggestion.click()
        # print(f"Location '{location}' selected")
        first_suggestion_xpath = "/html/body/ul[4]/li[1]"
        WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, first_suggestion_xpath))
        )
        first_suggestion = driver.find_element(By.XPATH, first_suggestion_xpath)
        first_suggestion.click()
        print("First location suggestion selected")

        print("Selecting Experience")
        experience_dropdown = Select(driver.find_element("id", "ctl00_SPWebPartManager1_g_de4e63a9_db8a_4b11_b989_4b13991e94ee_ctl00_ddlJSExperience"))
        experience_dropdown.select_by_visible_text(str(experience))
        print(f"Experience '{experience}' selected")

        print("Clicking Full Stack")
        full_stack = driver.find_element("id", "ctl00_SPWebPartManager1_g_de4e63a9_db8a_4b11_b989_4b13991e94ee_ctl00_rdbJobNature_1")
        driver.execute_script("arguments[0].click();", full_stack)
        print("Full Stack radio clicked")

        print("Clicking Search button")
        search_button = driver.find_element("id", "ctl00_SPWebPartManager1_g_de4e63a9_db8a_4b11_b989_4b13991e94ee_ctl00_btnSearch")
        driver.execute_script("arguments[0].click();", search_button)

        # Wait for job results to load
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "div.col-xs-6.col-sm-6.paddingLeft0"))
        )

        # Parse the page source with BeautifulSoup
        soup = BeautifulSoup(driver.page_source, 'html.parser')

        jobs = []
        for i in range(10):
            idx = str(i).zfill(2)
            job_id = f"ctl00_SPWebPartManager1_g_30b9fe7b_bf4d_46f4_a746_0091ffc9e482_ctl00_rptSearchJobs_ctl{idx}_lblJobTitle"
            org_id = f"ctl00_SPWebPartManager1_g_30b9fe7b_bf4d_46f4_a746_0091ffc9e482_ctl00_rptSearchJobs_ctl{idx}_lblOrganization"
            loc_id = f"ctl00_SPWebPartManager1_g_30b9fe7b_bf4d_46f4_a746_0091ffc9e482_ctl00_rptSearchJobs_ctl{idx}_lblStateName"
            salary_id = f"ctl00_SPWebPartManager1_g_30b9fe7b_bf4d_46f4_a746_0091ffc9e482_ctl00_rptSearchJobs_ctl{idx}_Label1"
            skill_id = f"ctl00_SPWebPartManager1_g_30b9fe7b_bf4d_46f4_a746_0091ffc9e482_ctl00_rptSearchJobs_ctl{idx}_lblKeywords"

            job_span = soup.find("span", id=job_id)
            org_span = soup.find("span", id=org_id)
            loc_span = soup.find("span", id=loc_id)
            salary_span = soup.find("span", id=salary_id)
            skill_span = soup.find("span", id=skill_id)

            if job_span and org_span:
                jobs.append({
                    "JobTitle": job_span.get_text(strip=True),
                    "Organization": org_span.get_text(strip=True),
                    "Location": loc_span.get_text(strip=True) if loc_span else "",
                    "SalaryRange": salary_span.get_text(strip=True) if salary_span else "",
                    "SkillRequired": skill_span.get_text(strip=True) if skill_span else ""
                })

        print("Extracted jobs:", jobs)

        # Wait for the popup close button to be clickable and click it
        try:
            WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.ID, "btnClosePopup"))
            )
            close_btn = driver.find_element("id", "btnClosePopup")
            close_btn.click()
            print("Popup closed")
        except Exception:
            print("No popup appeared")

        current_url = driver.current_url

        driver.quit()
        return current_url, jobs

    except Exception as e:
        print(f"Error in script: {str(e)}")
        try:
            driver.quit()
        except:
            pass
        raise e

app = Flask(__name__)

# Enable CORS for all domains on all routes
CORS(app, origins=['http://localhost:3000', 'http://127.0.0.1:3000'])

# Simple in-memory cache
cache = {}
CACHE_DURATION = 300  # 5 minutes

@app.route('/', methods=['GET'])
def homePage():
    dataSet = {"Page": "Home Page navigate to request page", "Time Stamp": time.time()}
    return jsonify(dataSet)

@app.route('/request', methods=['GET', 'OPTIONS'])
def requestPage():
    location = request.args.get('location')
    experience = request.args.get('experience')
    if not location or not experience:
        return jsonify({"error": "Missing query parameters"}), 400

    try:
        jobs = script(location, experience)
        return jsonify(jobs)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5003))
    app.run(host='0.0.0.0', port=port, debug=False)