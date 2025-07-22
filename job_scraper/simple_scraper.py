import requests
import csv
from bs4 import BeautifulSoup
import time
import random
import pandas as pd
import re
from urllib.parse import quote_plus
from datetime import datetime, timedelta
from django.utils import timezone
from django.db import transaction
import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hire_voo_ai.settings')
django.setup()

from job_scraper.models import Job, Company


class SimpleJobScraper:
    """Simple job scraper using your existing code structure"""
    
    def __init__(self, keywords, locations, max_pages=10):
        self.keywords = keywords
        self.locations = locations
        self.max_pages = max_pages
        
        # Get proxies from DidSoft (your existing code)
        self.proxies = self.get_didsoft_proxies()
        self.current_proxy_index = 0
        
        # Create uploads directory
        self.uploads_dir = os.path.join(os.getcwd(), 'uploads')
        os.makedirs(self.uploads_dir, exist_ok=True)
    
    def get_didsoft_proxies(self):
        """Get proxies from DidSoft (your existing code)"""
        try:
            r = requests.get(r'http://list.didsoft.com/get?email=info@clintalenthub.com&pass=Sylabot2024&pid=http1000&showcountry=no')
            byte_content = r.content
            updated_proxy = byte_content.decode('utf-8')
            split_proxy = updated_proxy.split('\n')
            return [pro for pro in split_proxy if pro.strip()]
        except Exception as e:
            print(f"Error fetching proxies: {e}")
            return []
    
    def get_next_proxy(self):
        """Get next proxy in rotation"""
        if not self.proxies:
            return None
        
        proxy = self.proxies[self.current_proxy_index]
        self.current_proxy_index = (self.current_proxy_index + 1) % len(self.proxies)
        return proxy
    
    def convert_to_datetime(self, posted_time):
        """Convert posted time to datetime (your existing code)"""
        if not posted_time:
            return timezone.now()

        try:
            # Check if it's a relative time format
            if "hour" in posted_time or "minute" in posted_time or "day" in posted_time:
                time_parts = posted_time.split()
                num = int(time_parts[0])
                unit = time_parts[1].lower()

                if "hour" in unit:
                    return timezone.now() - timedelta(hours=num)
                elif "minute" in unit:
                    return timezone.now() - timedelta(minutes=num)
                elif "day" in unit:
                    return timezone.now() - timedelta(days=num)

            # Try to parse normal date formats
            from dateutil import parser
            return parser.parse(posted_time)

        except Exception:
            return timezone.now()
    
    def build_search_url(self, page=0):
        """Build LinkedIn search URL"""
        keywords_str = ' '.join(self.keywords)
        locations_str = ' '.join(self.locations)
        
        base_url = "https://www.linkedin.com/jobs/search/"
        params = {
            'keywords': keywords_str,
            'location': locations_str,
            'f_TPR': 'r86400',  # Last 24 hours
            'start': page * 25,
        }
        
        query_string = '&'.join([f"{k}={quote_plus(v)}" for k, v in params.items()])
        return f"{base_url}?{query_string}"
    
    def first_hit_scrapper(self, webpage, page_number):
        """First hit scraper (your existing code adapted)"""
        job_data_csv_path = os.path.join(self.uploads_dir, 'job.csv')
        
        try:
            with open(job_data_csv_path, 'a', newline='', encoding='utf-8-sig') as file:
                writer = csv.writer(file)
                if file.tell() == 0:
                    writer.writerow(['Title', 'Company', 'Location', 'Link'])

                next_page = webpage + str(page_number)
                proxy = self.get_next_proxy()
                proxies = {'http': proxy} if proxy else None
                
                response = requests.get(next_page, proxies=proxies, timeout=30)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, 'html.parser')
                jobs = soup.find_all('div', class_='base-card relative w-full hover:no-underline focus:no-underline base-card--link base-search-card base-search-card--link job-search-card')
                
                for job in jobs:
                    try:
                        job_title = job.find('h3', class_='base-search-card__title').text.strip()
                        job_company = job.find('h4', class_='base-search-card__subtitle').text.strip()
                        job_location = job.find('span', class_='job-search-card__location').text.strip()
                        job_link = job.find('a', class_='base-card__full-link')['href']

                        writer.writerow([job_title, job_company, job_location, job_link])
                    except Exception as e:
                        print(f"Error extracting job data: {e}")
                        continue
                
                print(f"Page {page_number} scraped successfully.")
                
        except Exception as e:
            print(f"Error in first_hit_scrapper: {e}")
    
    def second_hit_scrappers(self, dataframe):
        """Second hit scraper (your existing code adapted)"""
        print("Processing job details...")
        
        if 'Link' not in dataframe.columns:
            print("No 'Link' column found in DataFrame.")
            return dataframe

        dataframe = dataframe.drop_duplicates(subset=['Link']).reset_index(drop=True)
        final_data = []

        for job_link in dataframe['Link'].dropna():
            try:
                proxy = self.get_next_proxy()
                proxies = {'http': proxy} if proxy else None
                
                response = requests.get(job_link, proxies=proxies, timeout=30)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, 'html.parser')

                # Extract posted time
                posted_times = soup.find_all("span", class_=["posted-time-ago__text", "topcard__flavor--metadata", 
                                                             "posted-time-ago__text posted-time-ago__text--new"])
                posted_time = posted_times[0].get_text(strip=True) if posted_times else None

                # Extract salary
                salary_tag = soup.find('span', class_="main-job-card__salary-info")
                salary = salary_tag.get_text(strip=True) if salary_tag else None

                # Extract job criteria
                job_criteria = {}
                job_criteria_items = soup.find_all('li', class_="description__job-criteria-item")

                for li in job_criteria_items:
                    key_tag = li.find('h3')
                    value_tag = li.find('span')

                    if key_tag and value_tag:
                        key = key_tag.get_text(strip=True)
                        value = value_tag.get_text(strip=True)
                        job_criteria[key] = value

                # Extract job description
                description_elem = soup.find('div', class_='show-more-less-html__markup')
                description = description_elem.get_text(strip=True) if description_elem else ""

                final_data.append([
                    job_link,
                    posted_time,
                    salary,
                    job_criteria.get("Seniority level"),
                    job_criteria.get("Employment type"),
                    job_criteria.get("Job function"),
                    job_criteria.get("Industries"),
                    description
                ])

                # Delay between requests
                time.sleep(random.uniform(2, 5))
                
            except Exception as e:
                print(f"Error processing {job_link}: {e}")
                continue

        # Create final DataFrame
        final_df = pd.DataFrame(final_data, columns=['Job Link', 'Posted_Time', 'Salary', 'Seniority', 'Employment_Type', 'Job_Function', 'Industries', 'Description'])

        # Merge original and processed data
        return pd.concat([dataframe.reset_index(drop=True), final_df], axis=1)
    
    def save_to_database(self, dataframe):
        """Save jobs to database (write database)"""
        print("Saving jobs to database...")
        
        dataframe.columns = dataframe.columns.str.strip().str.lower()
        data = dataframe.to_dict('records')

        try:
            saved_count = 0
            
            for row in data:
                try:
                    # Check if job already exists
                    if Job.objects.filter(job_url=row.get('link')).exists():
                        continue

                    # Get or create company
                    company_name = row.get('company', '') or ''
                    company, _ = Company.objects.get_or_create(
                        name=company_name.strip(),
                        defaults={'industry': ''}
                    )

                    # Parse location
                    location = row.get('location', '')
                    location_parts = location.split(',') if location else []
                    city = location_parts[0].strip() if len(location_parts) > 0 else ''
                    state = location_parts[1].strip() if len(location_parts) > 1 else ''
                    country = location_parts[2].strip() if len(location_parts) > 2 else ''

                    # Create job
                    job = Job.objects.create(
                        title=row.get('title', '').strip() or '',
                        company=company,
                        city=city,
                        state=state,
                        country=country,
                        job_url=row.get('link'),
                        posted_date=self.convert_to_datetime(row.get('posted_time')),
                        salary_display=row.get('salary'),
                        employment_type=row.get('employment_type'),
                        seniority_level=row.get('seniority'),
                        job_function=row.get('job_function'),
                        description=row.get('description', ''),
                    )
                    
                    saved_count += 1
                    
                except Exception as e:
                    print(f"Error saving job {row.get('title', 'Unknown')}: {e}")
                    continue

            print(f"Successfully saved {saved_count} jobs to database.")
            return saved_count

        except Exception as e:
            print(f"Error in save_to_database: {e}")
            return 0
    
    def run_scraping(self):
        """Run the complete scraping process"""
        print(f"Starting scraping for keywords: {self.keywords}, locations: {self.locations}")
        
        # Step 1: First hit scraping (job listings)
        for page in range(self.max_pages):
            print(f"Scraping page {page + 1}/{self.max_pages}")
            self.first_hit_scrapper(self.build_search_url(), page)
            
            # Delay between pages
            if page < self.max_pages - 1:
                time.sleep(random.uniform(60, 120))  # 1-2 minutes delay
        
        # Step 2: Get data from CSV
        try:
            df = pd.read_csv(os.path.join(self.uploads_dir, 'job.csv'), encoding="utf-8-sig")
            df.columns = df.columns.str.strip()
        except Exception as e:
            print(f"Error reading CSV: {e}")
            return 0
        
        # Step 3: Second hit scraping (job details)
        detailed_df = self.second_hit_scrappers(df)
        
        # Step 4: Save to database
        saved_count = self.save_to_database(detailed_df)
        
        # Step 5: Clean up CSV file
        try:
            os.remove(os.path.join(self.uploads_dir, 'job.csv'))
        except:
            pass
        
        print(f"Scraping completed. Saved {saved_count} jobs to database.")
        return saved_count


def run_simple_scraping(keywords, locations, max_pages=10):
    """Simple function to run scraping"""
    scraper = SimpleJobScraper(keywords, locations, max_pages)
    return scraper.run_scraping() 