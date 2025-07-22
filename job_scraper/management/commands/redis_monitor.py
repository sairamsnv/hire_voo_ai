from django.core.management.base import BaseCommand
from job_scraper.redis_cache import get_cache_stats, clear_job_cache
from django_redis import get_redis_connection

class Command(BaseCommand):
    help = 'Monitor Redis cache usage and statistics'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear all job-related cache',
        )
        parser.add_argument(
            '--info',
            action='store_true',
            help='Show detailed Redis information',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write("🗑️ Clearing job cache...")
            success = clear_job_cache()
            if success:
                self.stdout.write(
                    self.style.SUCCESS("✅ Job cache cleared successfully!")
                )
            else:
                self.stdout.write(
                    self.style.ERROR("❌ Failed to clear job cache")
                )
            return

        if options['info']:
            self.show_detailed_info()
            return

        # Show basic stats
        self.show_basic_stats()

    def show_basic_stats(self):
        """Show basic cache statistics"""
        self.stdout.write("📊 Redis Cache Statistics")
        self.stdout.write("=" * 40)
        
        try:
            stats = get_cache_stats()
            
            if 'error' in stats:
                self.stdout.write(
                    self.style.ERROR(f"❌ Error: {stats['error']}")
                )
                return
            
            self.stdout.write(f"🔑 Total Keys: {stats.get('total_keys', 0)}")
            self.stdout.write(f"💼 Job Cache Keys: {stats.get('job_cache_keys', 0)}")
            self.stdout.write(f"📋 Listing Cache Keys: {stats.get('listing_cache_keys', 0)}")
            self.stdout.write(f"👤 Session Keys: {stats.get('session_keys', 0)}")
            self.stdout.write(f"💾 Memory Used: {stats.get('memory_used', 'N/A')}")
            self.stdout.write(f"🔌 Connected Clients: {stats.get('connected_clients', 0)}")
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Error getting stats: {e}")
            )

    def show_detailed_info(self):
        """Show detailed Redis information"""
        self.stdout.write("🔍 Detailed Redis Information")
        self.stdout.write("=" * 50)
        
        try:
            redis_client = get_redis_connection("default")
            info = redis_client.info()
            
            # Server info
            self.stdout.write("🖥️ Server Information:")
            self.stdout.write(f"   Redis Version: {info.get('redis_version', 'N/A')}")
            self.stdout.write(f"   OS: {info.get('os', 'N/A')}")
            self.stdout.write(f"   Process ID: {info.get('process_id', 'N/A')}")
            self.stdout.write(f"   Uptime: {info.get('uptime_in_seconds', 0)} seconds")
            
            # Memory info
            self.stdout.write("\n💾 Memory Information:")
            self.stdout.write(f"   Used Memory: {info.get('used_memory_human', 'N/A')}")
            self.stdout.write(f"   Peak Memory: {info.get('used_memory_peak_human', 'N/A')}")
            self.stdout.write(f"   Memory Fragmentation: {info.get('mem_fragmentation_ratio', 'N/A')}")
            
            # Stats info
            self.stdout.write("\n📈 Statistics:")
            self.stdout.write(f"   Total Connections: {info.get('total_connections_received', 0)}")
            self.stdout.write(f"   Total Commands: {info.get('total_commands_processed', 0)}")
            self.stdout.write(f"   Keyspace Hits: {info.get('keyspace_hits', 0)}")
            self.stdout.write(f"   Keyspace Misses: {info.get('keyspace_misses', 0)}")
            
            # Database info
            self.stdout.write("\n🗄️ Database Information:")
            for db_key, db_info in info.items():
                if db_key.startswith('db'):
                    self.stdout.write(f"   {db_key}: {db_info.get('keys', 0)} keys")
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Error getting detailed info: {e}")
            ) 