from flask import Flask, request, jsonify
import json
import time
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from datetime import datetime, timedelta
from selenium.webdriver.support import expected_conditions as EC
import time
import hashlib

def script(state, commodity, district):
    initial_url = "https://agmarknet.gov.in/SearchCmmMkt.aspx"

    from selenium.webdriver.chrome.options import Options
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--disable-images")
    chrome_options.page_load_strategy = 'eager'
    
    driver = webdriver.Chrome(options=chrome_options)
    driver.set_page_load_timeout(15)
    
    try:
        driver.get(initial_url)
        print("Page loaded successfully")

        print("Selecting Commodity")
        WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, 'ddlCommodity'))
        )
        commodity_dropdown = Select(driver.find_element("id", 'ddlCommodity'))
        commodity_dropdown.select_by_visible_text(commodity)
        print(f"Commodity '{commodity}' selected")

        print("Selecting State")
        state_dropdown = Select(driver.find_element("id", 'ddlState'))
        state_dropdown.select_by_visible_text(state)
        print(f"State '{state}' selected")

        print("Setting Date")
        today = datetime.now()
        desired_date = today - timedelta(days=7)
        date_input = driver.find_element(By.ID, "txtDate")
        date_input.clear()
        date_input.send_keys(desired_date.strftime('%d-%b-%Y'))
        print(f"Date set to: {desired_date.strftime('%d-%b-%Y')}")

        print("Clicking Go button")
        button = driver.find_element("id", 'btnGo')
        driver.execute_script("arguments[0].click();", button)  # Use JavaScript click
        print("Go button clicked")

        # Wait for district dropdown to be populated - with multiple fallbacks
        print("Waiting for district dropdown to populate...")
        
        try:
            # First, wait for the district dropdown element to be present
            WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.ID, 'ddlDistrict'))
            )
            print("District dropdown element found")
            
            # Then wait for it to have options (try multiple approaches)
            district_populated = False
            for attempt in range(3):
                try:
                    WebDriverWait(driver, 10).until(
                        lambda driver: len(Select(driver.find_element("id", 'ddlDistrict')).options) > 1
                    )
                    district_populated = True
                    break
                except:
                    print(f"Attempt {attempt + 1}: District dropdown not populated yet, retrying...")
                    time.sleep(2)
            
            if not district_populated:
                print("District dropdown still not populated, checking manually...")
                district_dropdown = Select(driver.find_element("id", 'ddlDistrict'))
                options = district_dropdown.options
                print(f"District dropdown has {len(options)} options")
                
                # If we have at least one option, proceed
                if len(options) >= 1:
                    district_populated = True
                    print("Proceeding with available options")
            
            if not district_populated:
                raise Exception("District dropdown never populated properly")
                
        except Exception as e:
            print(f"Error waiting for district dropdown: {e}")
            # Try to continue anyway - maybe we can still get state-level data
            print("Attempting to continue without district selection...")

        print("District dropdown populated")

        print("Processing District selection")
        district_dropdown = Select(driver.find_element("id", 'ddlDistrict'))
        
        # Get all available options
        available_options = [option.text.strip() for option in district_dropdown.options if option.text.strip()]
        print(f"Available districts: {available_options}")
        
        # Try to find the specific district first
        district_found = False
        if available_options:  # Only try if we have options
            for option in district_dropdown.options:
                if option.text.strip().lower() == district.lower():
                    district_dropdown.select_by_visible_text(option.text.strip())
                    district_found = True
                    print(f"Found and selected specific district: {district}")
                    break
            
            # If district not found, select "All" or first option
            if not district_found:
                print(f"District '{district}' not found. Selecting fallback option...")
                # Try to select "All" option first
                selected = False
                for option in district_dropdown.options:
                    option_text = option.text.strip().lower()
                    option_value = option.get_attribute('value') or ""
                    
                    if (option_text in ['all', 'all districts', '--select--'] or 
                        option_value == '0' or option_value == ''):
                        district_dropdown.select_by_visible_text(option.text.strip())
                        print(f"Selected fallback option: {option.text.strip()}")
                        selected = True
                        break
                
                # If still no selection, select first non-empty option
                if not selected:
                    for option in district_dropdown.options:
                        if option.text.strip():
                            district_dropdown.select_by_visible_text(option.text.strip())
                            print(f"Selected first available option: {option.text.strip()}")
                            break

            print("Clicking final Go button")
            button = driver.find_element("id", 'btnGo')
            driver.execute_script("arguments[0].click();", button)  # Use JavaScript click
            print("Final Go button clicked")

        # Wait for the table to be present with better error handling
        print("Waiting for data table...")
        try:
            table = WebDriverWait(driver, 20).until(
                EC.presence_of_element_located((By.ID, 'cphBody_GridPriceData'))
            )
            print("Data table found")
        except:
            print("Primary table not found, checking for alternative table structures...")
            # Try to find any table with price data
            tables = driver.find_elements(By.TAG_NAME, "table")
            print(f"Found {len(tables)} tables on page")
            if not tables:
                raise Exception("No data tables found on page")

        soup = BeautifulSoup(driver.page_source, 'html.parser')

        data_list = []
        for row in soup.find_all("tr"):
            row_data = row.text.replace("\n", "_").replace("  ", "").split("__")
            if len(row_data) > 5:  # Only include rows with substantial data
                data_list.append(row_data)

        print(f"Found {len(data_list)} rows of data")

        jsonList = []
        for i in data_list[2:]:  # Start from row 2 to avoid headers
            if len(i) >= 8:  # Ensure we have enough data
                try:
                    d = {}
                    d["S.No"] = i[1] if len(i) > 1 else ""
                    d["City"] = i[2] if len(i) > 2 else ""
                    d["Commodity"] = i[4] if len(i) > 4 else commodity
                    d["Min Prize"] = i[7] if len(i) > 7 else ""
                    d["Max Prize"] = i[8] if len(i) > 8 else ""
                    d["Model Prize"] = i[9] if len(i) > 9 else ""
                    d["Date"] = i[10] if len(i) > 10 else desired_date.strftime('%d-%b-%Y')
                    d["District_Found"] = district_found
                    d["Requested_District"] = district
                    
                    # Only add if we have meaningful data
                    if d["City"] and (d["Min Prize"] or d["Max Prize"] or d["Model Prize"]):
                        jsonList.append(d)
                except Exception as e:
                    print(f"Error processing row: {e}")
                    continue

        print(f"Processed {len(jsonList)} data entries")

        # Calculate averages if district wasn't found and we have multiple entries
        if not district_found and len(jsonList) > 1:
            try:
                min_prices = []
                max_prices = []
                model_prices = []
                
                for item in jsonList:
                    try:
                        # Better price parsing
                        min_price_str = item["Min Prize"].replace(',', '').replace(' ', '').replace('Rs.', '')
                        max_price_str = item["Max Prize"].replace(',', '').replace(' ', '').replace('Rs.', '')
                        model_price_str = item["Model Prize"].replace(',', '').replace(' ', '').replace('Rs.', '')
                        
                        if min_price_str.replace('.', '').isdigit():
                            min_prices.append(float(min_price_str))
                        if max_price_str.replace('.', '').isdigit():
                            max_prices.append(float(max_price_str))
                        if model_price_str.replace('.', '').isdigit():
                            model_prices.append(float(model_price_str))
                    except (ValueError, AttributeError) as e:
                        print(f"Error parsing price for item: {e}")
                        continue
                
                # Add summary statistics
                if min_prices or max_prices or model_prices:
                    summary = {
                        "S.No": "SUMMARY",
                        "City": f"Average for {state}",
                        "Commodity": commodity,
                        "Min Prize": f"{sum(min_prices)/len(min_prices):.2f}" if min_prices else "N/A",
                        "Max Prize": f"{sum(max_prices)/len(max_prices):.2f}" if max_prices else "N/A",
                        "Model Prize": f"{sum(model_prices)/len(model_prices):.2f}" if model_prices else "N/A",
                        "Date": desired_date.strftime('%d-%b-%Y'),
                        "District_Found": False,
                        "Requested_District": district,
                        "Type": "STATE_AVERAGE"
                    }
                    jsonList.insert(0, summary)
                    print("Added summary with averages")
                
            except Exception as e:
                print(f"Error calculating averages: {e}")

        driver.quit()
        print(f"Returning {len(jsonList)} results")
        return jsonList

    except Exception as e:
        print(f"Error in script: {str(e)}")
        try:
            driver.quit()
        except:
            pass
        raise e

app = Flask(__name__)

# Simple in-memory cache
cache = {}
CACHE_DURATION = 300  # 5 minutes

@app.route('/', methods=['GET'])
def homePage():
    dataSet = {"Page": "Home Page navigate to request page", "Time Stamp": time.time()}
    return jsonify(dataSet)

@app.route('/request', methods=['GET'])
def requestPage():
    commodityQuery = request.args.get('commodity')
    stateQuery = request.args.get('state')
    districtQuery = request.args.get('district')

    if not commodityQuery or not stateQuery or not districtQuery:
        return jsonify({"error": "Missing query parameters"})

    # Create cache key
    cache_key = hashlib.md5(f"{commodityQuery}_{stateQuery}_{districtQuery}".encode()).hexdigest()
    
    # Check cache
    if cache_key in cache:
        cached_data, timestamp = cache[cache_key]
        if time.time() - timestamp < CACHE_DURATION:
            return cached_data

    try:
        result = script(stateQuery, commodityQuery, districtQuery)
        json_data = json.dumps(result, indent=4)
        
        # Store in cache
        cache[cache_key] = (json_data, time.time())
        
        return json_data
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)