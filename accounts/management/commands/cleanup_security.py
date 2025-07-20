from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db.models import Q
from accounts.models import UserSession, APIKey, SecurityEvent, APIRequestLog
from datetime import timedelta


class Command(BaseCommand):
    help = 'Clean up expired sessions, API keys, and old security data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=30,
            help='Number of days to keep security events and logs (default: 30)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting'
        )

    def handle(self, *args, **options):
        days = options['days']
        dry_run = options['dry_run']
        cutoff_date = timezone.now() - timedelta(days=days)
        
        self.stdout.write(f"Cleaning up security data older than {days} days...")
        
        # Clean up expired sessions
        expired_sessions = UserSession.objects.filter(
            Q(expires_at__lt=timezone.now()) | Q(is_active=False)
        )
        expired_sessions_count = expired_sessions.count()
        
        if not dry_run:
            expired_sessions.delete()
        
        self.stdout.write(
            self.style.SUCCESS(f"{'Would delete' if dry_run else 'Deleted'} {expired_sessions_count} expired sessions")
        )
        
        # Clean up expired API keys
        expired_api_keys = APIKey.objects.filter(
            Q(expires_at__lt=timezone.now()) | Q(is_active=False)
        )
        expired_api_keys_count = expired_api_keys.count()
        
        if not dry_run:
            expired_api_keys.delete()
        
        self.stdout.write(
            self.style.SUCCESS(f"{'Would delete' if dry_run else 'Deleted'} {expired_api_keys_count} expired API keys")
        )
        
        # Clean up old security events
        old_security_events = SecurityEvent.objects.filter(
            created_at__lt=cutoff_date,
            resolved=True
        )
        old_security_events_count = old_security_events.count()
        
        if not dry_run:
            old_security_events.delete()
        
        self.stdout.write(
            self.style.SUCCESS(f"{'Would delete' if dry_run else 'Deleted'} {old_security_events_count} old resolved security events")
        )
        
        # Clean up old API request logs
        old_api_logs = APIRequestLog.objects.filter(
            created_at__lt=cutoff_date
        )
        old_api_logs_count = old_api_logs.count()
        
        if not dry_run:
            old_api_logs.delete()
        
        self.stdout.write(
            self.style.SUCCESS(f"{'Would delete' if dry_run else 'Deleted'} {old_api_logs_count} old API request logs")
        )
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING("This was a dry run. No data was actually deleted.")
            )
        else:
            self.stdout.write(
                self.style.SUCCESS("Security cleanup completed successfully!")
            ) 