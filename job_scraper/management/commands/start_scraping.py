from django.core.management.base import BaseCommand
from job_scraper.tasks import scrape_jobs_hourly, scrape_specific_keyword, get_scraping_status

class Command(BaseCommand):
    help = 'Start job scraping with Celery'

    def add_arguments(self, parser):
        parser.add_argument(
            '--keyword',
            type=str,
            help='Specific keyword to scrape',
        )
        parser.add_argument(
            '--status',
            action='store_true',
            help='Show scraping status',
        )
        parser.add_argument(
            '--hourly',
            action='store_true',
            help='Start hourly scraping task',
        )

    def handle(self, *args, **options):
        if options['status']:
            status = get_scraping_status()
            self.stdout.write(
                self.style.SUCCESS(f'Scraping Status: {status}')
            )
            return

        if options['keyword']:
            keyword = options['keyword']
            self.stdout.write(
                self.style.SUCCESS(f'Starting scraping for keyword: {keyword}')
            )
            result = scrape_specific_keyword.delay(keyword)
            self.stdout.write(
                self.style.SUCCESS(f'Task ID: {result.id}')
            )
            return

        if options['hourly']:
            self.stdout.write(
                self.style.SUCCESS('Starting hourly scraping task')
            )
            result = scrape_jobs_hourly.delay()
            self.stdout.write(
                self.style.SUCCESS(f'Task ID: {result.id}')
            )
            return

        # Default: start hourly scraping
        self.stdout.write(
            self.style.SUCCESS('Starting hourly scraping task')
        )
        result = scrape_jobs_hourly.delay()
        self.stdout.write(
            self.style.SUCCESS(f'Task ID: {result.id}')
        ) 