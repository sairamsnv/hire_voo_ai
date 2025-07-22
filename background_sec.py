import requests
import csv
from bs4 import BeautifulSoup
import time
import random
import pandas as pd
import numpy as np
import re
import os
from urllib.parse import quote_plus
from datetime import datetime, timedelta
from django.utils import timezone
import dateutil.parser
import backoff
from typing import List, Dict, Optional, Any

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hire_voo_ai.settings')
import django
django.setup()

from job_scraper.models import Job, Company
from django.db import transaction

def send_websocket_notification(message: str) -> None:
    """Send notification message"""
    print(f"NOTIFICATION: {message}")

# Create uploads directory
uploads_dir = os.path.join(os.getcwd(), 'uploads')
os.makedirs(uploads_dir, exist_ok=True)

# Get proxy list
def get_proxy_list() -> List[str]:
    """Fetch fresh proxy list"""
    try:
        r = requests.get(r'http://list.didsoft.com/get?email=info@clintalenthub.com&pass=Sylabot2024&pid=http1000&showcountry=no')
        byte_content = r.content
        updated_proxy = byte_content.decode('utf-8')
        split_proxy = updated_proxy.split('\n')
        return [pro for pro in split_proxy if pro.strip()]
    except Exception as e:
        print(f"Error fetching proxy list: {e}")
        return []

def convert_to_datetime(posted_time: Optional[str]) -> datetime:
    """Convert posted time string to datetime object"""
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
        return dateutil.parser.parse(posted_time)

    except Exception:
        return timezone.now()

def get_dataframe() -> pd.DataFrame:
    """Read CSV file and return DataFrame"""
    try:
        df = pd.read_csv("uploads/job.csv", encoding="utf-8-sig")
        df.columns = df.columns.str.strip()
        return df
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        return pd.DataFrame()






class ETL_Datframe:
    def __init__(self, dataframe: pd.DataFrame):
        self.dataframe = dataframe
        
    def Updated_link_column(self) -> pd.DataFrame:
        """Update link column with job IDs"""
        updated_link = []
        try:
            if 'Link' in self.dataframe.columns:
                for i in self.dataframe['Link'].map(lambda x: re.findall(r'\d+', x)):
                    res = list(filter(lambda x: len(x) > 8, i))
                    if res:
                        result = 'https://www.linkedin.com/jobs/view/' + res[0]
                        updated_link.append(result)
                    else:
                        updated_link.append(' ')
            
            # Create DataFrame with proper column handling
            updated_link_data = pd.DataFrame({'Job ID': updated_link})
            
        except Exception as e:
            print("Error occurred in Updated_link_column:", e)
            updated_link_data = pd.DataFrame({'Job ID': []})
            
        return self.dataframe.assign(Job_ID=updated_link_data['Job ID'])
    
    def Transform_Dataframe(self) -> pd.DataFrame:
        """Transform the dataframe"""
        try:
            if self.dataframe is not None:
                # Split location into city and state
                location_split = self.dataframe['Location'].str.split(",", expand=True)
                self.dataframe.loc[:, 'City'] = location_split[0] if len(location_split.columns) > 0 else ''
                self.dataframe.loc[:, 'State'] = location_split[1] if len(location_split.columns) > 1 else ''
                
                # Remove first row (header)
                self.dataframe = self.dataframe.iloc[1:]
                
        except Exception as e:
            print("Error occurred in Transform_Dataframe:", e)
            
        return self.dataframe





# def First_Hit_Scrapper(webpage, page_number, proxy, max_retries=5):
#     job_data_csv_path = os.path.join(uploads_dir, 'job.csv')

#     try:
#         with open(job_data_csv_path, 'a', newline='', encoding='utf-8-sig') as file: 
#             writer = csv.writer(file)
#             if file.tell() == 0:
#                 writer.writerow(['Title', 'Company', 'Location', 'Link'])

#             next_page = webpage + str(page_number)
#             proxies = {'http': random.choice(proxy)}
#             response = requests.get(next_page, proxies=proxies)
#             response.raise_for_status()
#             soup = BeautifulSoup(response.content, 'html.parser')
#             jobs = soup.find_all('div', class_='base-card relative w-full hover:no-underline focus:no-underline base-card--link base-search-card base-search-card--link job-search-card')

#             for job in jobs:
#                 job_title = job.find('h3', class_='base-search-card__title').text.strip()
#                 job_company = job.find('h4', class_='base-search-card__subtitle').text.strip()
#                 job_location = job.find('span', class_='job-search-card__location').text.strip()
#                 job_link = job.find('a', class_='base-card__full-link')['href']

#                 writer.writerow([job_title, job_company, job_location, job_link])

#             print(f"Page {page_number} scraped successfully.")

#         if page_number < 2:
#             page_number += 1
#             time.sleep(60)
#             First_Hit_Scrapper(webpage, page_number, proxy, max_retries)
#         else:
#             print('Scraping completed.')

#     except (requests.RequestException, ValueError) as e:
#         print(f"Error occurred during HTTP request: {e}")
#         if max_retries > 0:
#             print("Retrying...")
#             time.sleep(10)  # Add a delay before retrying
#             First_Hit_Scrapper(webpage, page_number, proxy, max_retries - 1)
#         else:
#             print("Maximum retries exceeded. Exiting...")
#     except Exception as e:
#         print("Error occurred in First_Hit_Scrapper:", e)



def First_Hit_Scrapper(webpage: str, page_number: int, proxy: List[str], max_retries: int = 5) -> None:
    """Scrape job listings from LinkedIn"""
    job_data_csv_path = os.path.join(uploads_dir, 'job.csv')
    
    try:
        with open(job_data_csv_path, 'a', newline='', encoding='utf-8-sig') as file:
            writer = csv.writer(file)
            if file.tell() == 0:
                writer.writerow(['Title', 'Company', 'Location', 'Link'])

            next_page = webpage + str(page_number)
            proxies = {'http': random.choice(proxy)}
            response = requests.get(next_page, proxies=proxies)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            jobs = soup.find_all('div', class_='base-card relative w-full hover:no-underline focus:no-underline base-card--link base-search-card base-search-card--link job-search-card')
            
            for job in jobs:
                # Extract job title
                title_elem = job.find('h3', class_='base-search-card__title')  # type: ignore
                job_title = title_elem.get_text(strip=True) if title_elem else ''
                
                # Extract company name
                company_elem = job.find('h4', class_='base-search-card__subtitle')  # type: ignore
                job_company = company_elem.get_text(strip=True) if company_elem else ''
                
                # Extract location
                location_elem = job.find('span', class_='job-search-card__location')  # type: ignore
                job_location = location_elem.get_text(strip=True) if location_elem else ''
                
                # Extract job link
                link_elem = job.find('a', class_='base-card__full-link')  # type: ignore
                job_link = link_elem.get('href', '') if link_elem else ''

                writer.writerow([job_title, job_company, job_location, job_link])
            
            print(f"Page {page_number} scraped successfully.")

        if page_number < 2:
            page_number += 1
            time.sleep(60)
            First_Hit_Scrapper(webpage, page_number, proxy, max_retries)
        else:
            print('Scraping completed.')
            
    except (requests.RequestException, ValueError) as e:
        print(f"Error occurred during HTTP request: {e}")
        if max_retries > 0:
            print("Retrying...")
            time.sleep(10)
            First_Hit_Scrapper(webpage, page_number, proxy, max_retries - 1)
        else:
            print("Maximum retries exceeded. Exiting...")
    except Exception as e:
        print("Error occurred in First_Hit_Scrapper:", e)



@backoff.on_exception(
    backoff.expo,
    requests.RequestException,
    max_tries=5,
    jitter=backoff.full_jitter,
)
def fetch_with_retries(url: str, proxy: str) -> Optional[bytes]:
    """Fetch webpage with retries and backoff."""
    proxies = {'http': proxy}
    try:
        response = requests.get(url, proxies=proxies, timeout=10)
        response.raise_for_status()
        return response.content
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def Second_Hit_Scrappers(dataframe: pd.DataFrame, proxy: List[str], batch_size: int = 100, sleep_time: int = 120) -> pd.DataFrame:
    """Process job data in batches, retry failed URLs, and remove duplicates."""
    
    print("Columns in DataFrame:", dataframe.columns)
    
    # Ensure 'Job_ID' column exists
    if 'Job_ID' not in dataframe.columns:
        print("No 'Job_ID' column found in DataFrame.")
        return dataframe

    dataframe = dataframe.drop_duplicates(subset=['Job_ID']).reset_index(drop=True)

    failed_jobs = []
    final_data = []

    batches = [dataframe.iloc[i:i + batch_size] for i in range(0, len(dataframe), batch_size)]

    for batch_num, batch in enumerate(batches, start=1):
        print(f"\nProcessing Batch {batch_num}/{len(batches)} with {len(batch)} records...")

        for job_link in batch['Job_ID'].dropna():
            content = fetch_with_retries(job_link, random.choice(proxy))
            if not content:
                failed_jobs.append(job_link)
                continue

            soup = BeautifulSoup(content, 'html.parser')

            # Extract posted time
            posted_times = soup.find_all("span", class_=["posted-time-ago__text", "topcard__flavor--metadata", 
                                                         "posted-time-ago__text posted-time-ago__text--new"])  # type: ignore
            posted_time = posted_times[0].get_text(strip=True) if posted_times else None

            # Extract salary
            salary_tag = soup.find('span', class_="main-job-card__salary-info")  # type: ignore
            salary = salary_tag.get_text(strip=True) if salary_tag else None

            # Extract job criteria
            job_criteria = {}
            job_criteria_items = soup.find_all('li', class_="description__job-criteria-item")  # type: ignore

            for li in job_criteria_items:
                key_tag = li.find('h3')  # type: ignore
                value_tag = li.find('span')  # type: ignore

                if key_tag and value_tag:
                    key = key_tag.get_text(strip=True)  # type: ignore
                    value = value_tag.get_text(strip=True)  # type: ignore
                    job_criteria[key] = value

            final_data.append([
                job_link,
                posted_time,
                salary,
                job_criteria.get("Seniority level"),
                job_criteria.get("Employment type"),
                job_criteria.get("Job function"),
                job_criteria.get("Industries")
            ])

        print(f"Batch {batch_num} processed successfully. Sleeping for {sleep_time} seconds...\n")
        time.sleep(sleep_time)

    # Retry failed records
    if failed_jobs:
        print(f"\nRetrying {len(failed_jobs)} failed jobs...")
        for job_link in failed_jobs:
            content = fetch_with_retries(job_link, random.choice(proxy))
            if not content:
                print(f"Final attempt failed for {job_link}. Skipping permanently.")
                continue

            soup = BeautifulSoup(content, 'html.parser')

            posted_times = soup.find_all("span", class_=["posted-time-ago__text", "topcard__flavor--metadata", 
                                                         "posted-time-ago__text posted-time-ago__text--new"])
            posted_time = posted_times[0].get_text(strip=True) if posted_times else None

            salary_tag = soup.find('span', class_="main-job-card__salary-info")
            salary = salary_tag.get_text(strip=True) if salary_tag else None

            job_criteria = {}
            job_criteria_items = soup.find_all('li', class_="description__job-criteria-item")

            for li in job_criteria_items:
                key_tag = li.find('h3')
                value_tag = li.find('span')

                if key_tag and value_tag:
                    key = key_tag.get_text(strip=True)
                    value = value_tag.get_text(strip=True)
                    job_criteria[key] = value

            final_data.append([
                job_link,
                posted_time,
                salary,
                job_criteria.get("Seniority level"),
                job_criteria.get("Employment type"),
                job_criteria.get("Job function"),
                job_criteria.get("Industries")
            ])

    # Create final DataFrame
    final_df = pd.DataFrame(final_data, columns=['Job Link', 'Posted_Time', 'Salary', 'Seniority', 'Employment_Type', 'Job_Function', 'Industries'])

    # Remove duplicates
    final_df = final_df.drop_duplicates(subset=['Job Link']).reset_index(drop=True)

    # Merge original and processed data
    return pd.concat([dataframe.reset_index(drop=True), final_df], axis=1)


# def updated_Database(dataframe):
#     username = "sayypureddysairam"
#     password = "R@ms@i7799656833"
#     encoded_username = quote_plus(username)
#     encoded_password = quote_plus(password)
#     database_instance =f"mongodb+srv://{encoded_username}:{encoded_password}@jobs.9w8r72h.mongodb.net/"
    
#     client=pymongo.MongoClient(database_instance)
#     try:
#         db = client['mydatabase']
#         collection = db['testjobscrapperdata']

#         data = dataframe.to_dict('records')
#         collection.delete_many({})
#         collection.insert_many(data)
#         # d = list(collection.find())  # make hashable for st.cache
#         # dataframe = pd.DataFrame(d)
#     except Exception as e:
#         print('Error', e)
#     finally:
#         client.close()
#     return "Saved in DataBase"





# def updated_Database(dataframe):
    # dataframe.columns = dataframe.columns.str.strip().str.lower()
    # data = dataframe.to_dict('records')  

    # try:
    #     Job.objects.all().delete()
    #     print("All existing job records deleted.")

    #     data = [row for row in data if 'job_id' in row and row['job_id']]

    #     jobs_to_create = []
    #     for row in data:
    #         company_name = row.get('company', '') or ''
    #         location = row.get('location', '') or ''

    #         company, _ = Company.objects.get_or_create(
    #             name=company_name.strip(),
    #             defaults={'location': location.strip()}
    #         )

    #         job = Job(
    #             title=row.get('title', '').strip() or '',
    #             company=company,
    #             city=row.get('city', '').strip() or '',
    #             state=row.get('state', '').strip() or '',
    #             job_link=row['job_id'],
    #             posted_time=row.get('posted_time'),
    #             salary=row.get('salary'),
    #             seniority=row.get('seniority'),
    #             employment_type=row.get('employment_type'),
    #             job_function=row.get('job_function'),
    #             industry=row.get('industries')
    #         )
    #         jobs_to_create.append(job)

    #     if jobs_to_create:
    #         Job.objects.bulk_create(jobs_to_create)
    #         print(f"{len(jobs_to_create)} new jobs added to the database.")
    #         return f"{len(jobs_to_create)} new jobs added to the database."
    #     else:
    #         print("No new jobs to insert.")
    #         return "No new jobs to insert."

    # except Exception as e:
    #     error_message = f"Error occurred in updated_Database function: {e}"
    #     print(error_message)
    #     return error_message  # Return the error message instead of None



def updated_Database(dataframe: pd.DataFrame) -> None:
    """Update database with scraped job data"""
    dataframe.columns = dataframe.columns.str.strip().str.lower()
    data = dataframe.to_dict('records')

    try:
        data = [row for row in data if 'job_id' in row and row['job_id']]

        jobs_to_create = []
        existing_links = set(Job.objects.using('default').values_list('job_url', flat=True))

        for row in data:
            job_id = row.get('job_id')
            if job_id in existing_links:
                continue

            company_name = row.get('company', '')
            location = row.get('location', '')

            company, _ = Company.objects.using('default').get_or_create(
                name=company_name.strip() if company_name else '',
                defaults={'industry': ''}
            )

            # Parse location
            location_parts = location.split(',') if location else []
            city = location_parts[0].strip() if len(location_parts) > 0 else ''
            state = location_parts[1].strip() if len(location_parts) > 1 else ''
            country = location_parts[2].strip() if len(location_parts) > 2 else ''

            job = Job(
                title=row.get('title', '').strip() if row.get('title') else '',
                company=company,
                city=city,
                state=state,
                country=country,
                job_url=job_id,
                posted_date=convert_to_datetime(row.get('posted_time')),
                salary_display=row.get('salary', ''),
                seniority_level=row.get('seniority'),
                employment_type=row.get('employment_type'),
                job_function=row.get('job_function'),
                description=row.get('description', '')
            )
            jobs_to_create.append(job)

        if jobs_to_create:
            Job.objects.using('default').bulk_create(jobs_to_create)
            notification_message = f"{len(jobs_to_create)} new jobs have been added to write database."
            send_websocket_notification(notification_message)
            print(notification_message)
        else:
            print("No new jobs to insert.")

    except Exception as e:
        print("Error occurred in updated_Database function:", e)




























def remove_files_in_directory(directory: str) -> str:
    """Remove all files in the specified directory"""
    for file_name in os.listdir(directory):
        file_path = os.path.join(directory, file_name)
        try:
            if os.path.isfile(file_path):
                os.remove(file_path)
        except OSError as e:
            print(f"Error occurred while removing file {file_path}: {e}")
    return "Files deleted successfully"








def main_function() -> str:
    """Main function to execute the scraping pipeline"""
    try:
        proxy = get_proxy_list()
        if not proxy:
            print("No proxies available. Exiting.")
            return "No proxies available"
            
        First_Hit_Scrapper('https://www.linkedin.com/jobs/search/?currentJobId=3762628132&f_TPR=r86400&geoId=103644278&keywords=controller&location=United%20States&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true&start=', 0, proxy)
        time.sleep(120)
        
        df = get_dataframe()
        if df.empty:
            print("No data to process")
            return "No data to process"
            
        first_instance = ETL_Datframe(df)
        first_dataframe = first_instance.Updated_link_column()
        transform_data_instance = ETL_Datframe(first_dataframe)
        trans = transform_data_instance.Transform_Dataframe()
        second_hit_output = Second_Hit_Scrappers(trans, proxy)
        time.sleep(250)
        updated_Database(second_hit_output)
        remove_files_in_directory(uploads_dir)
        print("Function executed successfully", datetime.now())
        
    except Exception as e:
        print("Error occurred in main_function:", e)
        
    return "Scheduled task completed successfully"




# schedule.every().day.at("10:20").do(main_function)







if __name__ == "__main__":
    main_function()
    # while True:
    #     schedule.run_pending()
    #     time.sleep(60) 