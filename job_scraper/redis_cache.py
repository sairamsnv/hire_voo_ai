"""
Redis Caching Utilities for Job Scraper
"""
import json
import hashlib
from typing import Any, Optional, Dict, List
from django.core.cache import cache
from django.conf import settings
from django_redis import get_redis_connection

def cache_job_data(key: str, data: Any, timeout: int = 3600) -> bool:
    """
    Cache job data with a specific key
    
    Args:
        key: Cache key
        data: Data to cache
        timeout: Cache timeout in seconds (default: 1 hour)
    
    Returns:
        bool: True if cached successfully
    """
    try:
        cache.set(f"jobs:{key}", data, timeout=timeout)
        return True
    except Exception as e:
        print(f"Error caching job data: {e}")
        return False

def get_cached_job_data(key: str) -> Optional[Any]:
    """
    Get cached job data
    
    Args:
        key: Cache key
    
    Returns:
        Cached data or None if not found
    """
    try:
        return cache.get(f"jobs:{key}")
    except Exception as e:
        print(f"Error getting cached job data: {e}")
        return None

def cache_job_listings(keyword: str, jobs: List[Dict], timeout: int = 1800) -> bool:
    """
    Cache job listings for a specific keyword
    
    Args:
        keyword: Job search keyword
        jobs: List of job dictionaries
        timeout: Cache timeout in seconds (default: 30 minutes)
    
    Returns:
        bool: True if cached successfully
    """
    try:
        cache_key = f"job_listings:{keyword.lower().replace(' ', '_')}"
        cache.set(cache_key, jobs, timeout=timeout)
        return True
    except Exception as e:
        print(f"Error caching job listings: {e}")
        return False

def get_cached_job_listings(keyword: str) -> Optional[List[Dict]]:
    """
    Get cached job listings for a keyword
    
    Args:
        keyword: Job search keyword
    
    Returns:
        List of job dictionaries or None if not found
    """
    try:
        cache_key = f"job_listings:{keyword.lower().replace(' ', '_')}"
        return cache.get(cache_key)
    except Exception as e:
        print(f"Error getting cached job listings: {e}")
        return None

def cache_scraping_status(status: Dict, timeout: int = 300) -> bool:
    """
    Cache scraping status
    
    Args:
        status: Status dictionary
        timeout: Cache timeout in seconds (default: 5 minutes)
    
    Returns:
        bool: True if cached successfully
    """
    try:
        cache.set("scraping_status", status, timeout=timeout)
        return True
    except Exception as e:
        print(f"Error caching scraping status: {e}")
        return False

def get_cached_scraping_status() -> Optional[Dict]:
    """
    Get cached scraping status
    
    Returns:
        Status dictionary or None if not found
    """
    try:
        return cache.get("scraping_status")
    except Exception as e:
        print(f"Error getting cached scraping status: {e}")
        return None

def cache_proxy_list(proxies: List[str], timeout: int = 600) -> bool:
    """
    Cache proxy list
    
    Args:
        proxies: List of proxy URLs
        timeout: Cache timeout in seconds (default: 10 minutes)
    
    Returns:
        bool: True if cached successfully
    """
    try:
        cache.set("proxy_list", proxies, timeout=timeout)
        return True
    except Exception as e:
        print(f"Error caching proxy list: {e}")
        return False

def get_cached_proxy_list() -> Optional[List[str]]:
    """
    Get cached proxy list
    
    Returns:
        List of proxy URLs or None if not found
    """
    try:
        return cache.get("proxy_list")
    except Exception as e:
        print(f"Error getting cached proxy list: {e}")
        return None

def clear_job_cache() -> bool:
    """
    Clear all job-related cache
    
    Returns:
        bool: True if cleared successfully
    """
    try:
        # Get Redis connection
        redis_client = get_redis_connection("default")
        
        # Clear job-related keys
        keys = redis_client.keys("jobs:*")
        if keys:
            redis_client.delete(*keys)
        
        # Clear job listings
        keys = redis_client.keys("job_listings:*")
        if keys:
            redis_client.delete(*keys)
        
        return True
    except Exception as e:
        print(f"Error clearing job cache: {e}")
        return False

def get_cache_stats() -> Dict[str, Any]:
    """
    Get cache statistics
    
    Returns:
        Dictionary with cache statistics
    """
    try:
        redis_client = get_redis_connection("default")
        
        # Get Redis info
        info = redis_client.info()
        
        # Count keys by pattern
        job_keys = len(redis_client.keys("jobs:*"))
        listing_keys = len(redis_client.keys("job_listings:*"))
        session_keys = len(redis_client.keys("session:*"))
        
        return {
            "total_keys": info.get("db0", {}).get("keys", 0),
            "job_cache_keys": job_keys,
            "listing_cache_keys": listing_keys,
            "session_keys": session_keys,
            "memory_used": info.get("used_memory_human", "N/A"),
            "connected_clients": info.get("connected_clients", 0),
        }
    except Exception as e:
        print(f"Error getting cache stats: {e}")
        return {"error": str(e)}

def cache_key_exists(key: str) -> bool:
    """
    Check if a cache key exists
    
    Args:
        key: Cache key to check
    
    Returns:
        bool: True if key exists
    """
    try:
        return cache.get(key) is not None
    except Exception:
        return False 