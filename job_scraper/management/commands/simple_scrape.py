from django.core.management.base import BaseCommand, CommandError
from job_scraper.simple_scraper import run_simple_scraping
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Simple job scraping - scrape and store in write database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--keywords',
            type=str,
            required=True,
            help='Comma-separated list of keywords'
        )
        parser.add_argument(
            '--locations',
            type=str,
            required=True,
            help='Comma-separated list of locations'
        )
        parser.add_argument(
            '--max-pages',
            type=int,
            default=10,
            help='Maximum number of pages to scrape'
        )

    def handle(self, *args, **options):
        try:
            # Parse keywords and locations
            keywords = [k.strip() for k in options['keywords'].split(',')]
            locations = [l.strip() for l in options['locations'].split(',')]
            
            self.stdout.write(f"Starting simple scraping...")
            self.stdout.write(f"Keywords: {keywords}")
            self.stdout.write(f"Locations: {locations}")
            self.stdout.write(f"Max Pages: {options['max_pages']}")
            
            # Run scraping
            saved_count = run_simple_scraping(
                keywords=keywords,
                locations=locations,
                max_pages=options['max_pages']
            )
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Scraping completed! Saved {saved_count} jobs to write database.'
                )
            )
            
        except Exception as e:
            raise CommandError(f'Error during scraping: {str(e)}') 