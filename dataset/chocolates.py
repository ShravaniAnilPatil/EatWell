import csv
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import traceback
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import os
from datetime import datetime
import time

load_dotenv()

chrome_options = Options()
chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36")
chrome_options.add_argument("--disable-blink-features=AutomationControlled")  

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

base_url = "https://world.openfoodfacts.org/cgi/search.pl?action=process&search_terms=chocolates&sort_by=unique_scans_n&page_size=50&page="
total_pages = 24

for page_num in range(21, total_pages + 1):

    url = f"{base_url}{page_num}"
    print(f"Scraping URL: {url}")
    link=[]
    allergen=""
    try:
        time.sleep(5)
        driver.get(url)
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CSS_SELECTOR, 'body')))
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        box = soup.find("ul", class_="search_results small-block-grid-1 medium-block-grid-4 large-block-grid-5 xlarge-block-grid-8 xxlarge-block-grid-10")
        links=box.find_all("a",class_="list_product_a")
        
        
        #Targeting the links of the providers
        for li in links:
            
            
            nutrient_grade=""

            url=li.get("href")
            driver.get(url)
            WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CSS_SELECTOR, 'body')))
            soup = BeautifulSoup(driver.page_source, 'html.parser')
            name=soup.find("h2",class_="title-1") or "Unavailable"
            

            ing_box = soup.find("div", id="panel_ingredients_content")
            if ing_box:
                allergens = ing_box.find_all("div", class_="panel_text")
                for alg in allergens:
                    strong_tag = alg.find("strong")  # Find the <strong> tag inside the div
                    if strong_tag and "Allergens" in strong_tag.get_text():
                        allergen = alg.get_text(strip=True, separator=" ")
                        print(allergen)  # Print or store the extracted text
                        break  # Stop after finding the first match

                
                
            

            for grade_class in ["grade_a_title", "grade_b_title", "grade_c_title", "grade_d_title", "grade_e_title"]:
                nutrient_grade = soup.find("h4", class_=grade_class)
                if nutrient_grade:
                    nutrient_grade = nutrient_grade.text.strip()
                    break  # Exit the loop as soon as a value is found

           
            table = soup.find("table", {"aria-label": "Nutrition facts"})
                
                # Dictionary to store nutrient values
            nutrients = {
                    "Protein": "Not available",
                    "Carbohydrates": "Not available",
                    "Sugar": "Not available",
                    "Fat": "Not available",
                    "Fiber": "Not available",
                    "Sodium": "Not available"
                }
                
            if table:
                rows = table.find_all("tr")
                for tr in rows:
                    cols = tr.find_all("td")
                    if len(cols) >= 2:  # Ensuring at least two columns (nutrient name & 100g value)
                        nutrient_name = cols[0].get_text(strip=True)
                        nutrient_value = cols[1].get_text(strip=True)  # Extracting 100g column
                        
                        # Matching known nutrients
                        if "protein" in nutrient_name.lower():
                            nutrients["Protein"] = nutrient_value
                        elif "carbohydrate" in nutrient_name.lower():
                            nutrients["Carbohydrates"] = nutrient_value
                        elif "sugars" in nutrient_name.lower():
                            nutrients["Sugar"] = nutrient_value
                        elif "fat" in nutrient_name.lower():
                            nutrients["Fat"] = nutrient_value
                        elif "fiber" in nutrient_name.lower():
                            nutrients["Fiber"] = nutrient_value
                        elif "salt" in nutrient_name.lower():
                            nutrients["Sodium"] = nutrient_value

            
            
            
            

            if "apple" in allergen:
             allergen.remove("apple")
            if "orange" in allergen:
             allergen.remove("orange")
            new_entry = {
        "name": name.text.strip() if name else "Not available",
        "nutrient_grade": nutrient_grade if nutrient_grade else "Not available",
        "Protein": nutrients["Protein"],
        "Carbohydrates": nutrients["Carbohydrates"],
        "Sugar": nutrients["Sugar"],
        "Fat": nutrients["Fat"],
        "Fiber": nutrients["Fiber"],
        "Sodium": nutrients["Sodium"],
        "allergen": allergen if allergen else "Not available",
        
        "category":"chocolates"
    }

            # Read existing data from CSV if it exists
            scraped_data = []
            if os.path.exists("worldchocolates.csv"):
                try:
                    with open("worldchocolates.csv", "r", encoding="utf-8") as csv_file:
                        reader = csv.DictReader(csv_file)
                        chocolates = list(reader)  # Convert CSV reader object to a list of dictionaries
                except Exception as e:
                    print(f"Error reading CSV file: {e}. Resetting data.")
                    chocolates = []  # Reset data if there's an issue

            # Append the new entry
            chocolates.append(new_entry)

            # Save back to CSV
            with open("worldchocolates.csv", "w", encoding="utf-8", newline="") as csv_file:
                fieldnames = ["name","category","Protein","Carbohydrates","Sugar","Fat","Fiber","Sodium","nutrient_grade", "allergen"]
                writer = csv.DictWriter(csv_file, fieldnames=fieldnames)

                writer.writeheader()  # Write column headers
                writer.writerows(chocolates)  # Write all data


    except Exception as e:
        print("An error occurred:", e)
        print(traceback.format_exc())

driver.quit()