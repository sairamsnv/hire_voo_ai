from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from accounts.services import SessionManagementService
from accounts.models import SessionActivity, UserSession


class Command(BaseCommand):
    help = 'Clean up expired sessions and old session data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=30,
            help='Delete session activities older than this many days (default: 30)'
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
        
        self.stdout.write(f"Cleaning up sessions older than {days} days...")
        
        # Clean up expired sessions
        expired_sessions = UserSession.objects.filter(
            is_active=True,
            expires_at__lt=timezone.now()
        )
        
        expired_count = expired_sessions.count()
        self.stdout.write(f"Found {expired_count} expired sessions")
        
        if not dry_run:
            for session in expired_sessions:
                SessionManagementService.terminate_session(session, 'cleanup_command')
            self.stdout.write(f"Terminated {expired_count} expired sessions")
        else:
            self.stdout.write(f"Would terminate {expired_count} expired sessions")
        
        # Clean up old session activities
        old_activities = SessionActivity.objects.filter(
            created_at__lt=cutoff_date
        )
        
        activity_count = old_activities.count()
        self.stdout.write(f"Found {activity_count} old session activities")
        
        if not dry_run:
            deleted_count = old_activities.delete()[0]
            self.stdout.write(f"Deleted {deleted_count} old session activities")
        else:
            self.stdout.write(f"Would delete {activity_count} old session activities")
        
        # Clean up inactive sessions older than 90 days
        old_inactive_sessions = UserSession.objects.filter(
            is_active=False,
            last_activity__lt=timezone.now() - timedelta(days=90)
        )
        
        inactive_count = old_inactive_sessions.count()
        self.stdout.write(f"Found {inactive_count} old inactive sessions")
        
        if not dry_run:
            deleted_count = old_inactive_sessions.delete()[0]
            self.stdout.write(f"Deleted {deleted_count} old inactive sessions")
        else:
            self.stdout.write(f"Would delete {inactive_count} old inactive sessions")
        
        self.stdout.write(
            self.style.SUCCESS(
                f"Cleanup completed successfully! "
                f"Expired: {expired_count}, "
                f"Old activities: {activity_count}, "
                f"Old inactive: {inactive_count}"
            )
        ) 