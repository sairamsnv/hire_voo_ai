from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q, Count
from django.core.paginator import Paginator
from job_scraper.models import Job, Company


@api_view(['GET'])
@permission_classes([AllowAny])
def get_jobs_api(request):
    """Get jobs from read database"""
    try:
        # Get query parameters
        page = request.GET.get('page', 1)
        page_size = request.GET.get('page_size', 20)
        search = request.GET.get('search', '')
        location = request.GET.get('location', '')
        company = request.GET.get('company', '')
        employment_type = request.GET.get('employment_type', '')
        seniority = request.GET.get('seniority', '')
        
        # Query jobs from read database
        jobs = Job.objects.using('read').filter(is_active=True)
        
        # Apply filters
        if search:
            jobs = jobs.filter(
                Q(title__icontains=search) |
                Q(company__name__icontains=search) |
                Q(description__icontains=search)
            )
        
        if location:
            jobs = jobs.filter(
                Q(city__icontains=location) |
                Q(state__icontains=location) |
                Q(country__icontains=location)
            )
        
        if company:
            jobs = jobs.filter(company__name__icontains=company)
        
        if employment_type:
            jobs = jobs.filter(employment_type=employment_type)
        
        if seniority:
            jobs = jobs.filter(seniority_level=seniority)
        
        # Paginate results
        paginator = Paginator(jobs, page_size)
        page_obj = paginator.get_page(page)
        
        # Serialize data
        jobs_data = []
        for job in page_obj:
            jobs_data.append({
                'id': str(job.id),
                'title': job.title,
                'company': job.company.name,
                'location': job.location_display,
                'employment_type': job.employment_type,
                'seniority_level': job.seniority_level,
                'salary': job.salary_range,
                'posted_date': job.posted_date.isoformat() if job.posted_date else None,
                'job_url': job.job_url,
                'is_remote': job.is_remote,
                'created_at': job.created_at.isoformat(),
            })
        
        return Response({
            'jobs': jobs_data,
            'total_count': paginator.count,
            'total_pages': paginator.num_pages,
            'current_page': page_obj.number,
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous(),
        })
        
    except Exception as e:
        return Response(
            {'error': f'Error fetching jobs: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def get_job_details_api(request, job_id):
    """Get specific job details from read database"""
    try:
        job = Job.objects.using('read').get(id=job_id, is_active=True)
        
        job_data = {
            'id': str(job.id),
            'title': job.title,
            'company': {
                'name': job.company.name,
                'industry': job.company.industry,
                'website': job.company.website,
                'linkedin_url': job.company.linkedin_url,
            },
            'location': {
                'city': job.city,
                'state': job.state,
                'country': job.country,
                'display': job.location_display,
            },
            'employment_type': job.employment_type,
            'seniority_level': job.seniority_level,
            'job_function': job.job_function,
            'salary': job.salary_range,
            'posted_date': job.posted_date.isoformat() if job.posted_date else None,
            'job_url': job.job_url,
            'description': job.description,
            'is_remote': job.is_remote,
            'created_at': job.created_at.isoformat(),
            'updated_at': job.updated_at.isoformat(),
        }
        
        return Response(job_data)
        
    except Job.DoesNotExist:
        return Response(
            {'error': 'Job not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Error fetching job details: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def get_job_stats_api(request):
    """Get job statistics from read database"""
    try:
        # Get stats from read database
        total_jobs = Job.objects.using('read').filter(is_active=True).count()
        
        # Employment type stats
        employment_stats = Job.objects.using('read').filter(is_active=True)\
            .values('employment_type')\
            .exclude(employment_type='')\
            .annotate(count=Count('id'))\
            .order_by('-count')
        
        # Seniority level stats
        seniority_stats = Job.objects.using('read').filter(is_active=True)\
            .values('seniority_level')\
            .exclude(seniority_level='')\
            .annotate(count=Count('id'))\
            .order_by('-count')
        
        # Top companies
        top_companies = Job.objects.using('read').filter(is_active=True)\
            .values('company__name')\
            .annotate(count=Count('id'))\
            .order_by('-count')[:10]
        
        # Remote jobs count
        remote_jobs = Job.objects.using('read').filter(is_active=True, is_remote=True).count()
        
        return Response({
            'total_jobs': total_jobs,
            'remote_jobs': remote_jobs,
            'employment_types': list(employment_stats),
            'seniority_levels': list(seniority_stats),
            'top_companies': list(top_companies),
        })
        
    except Exception as e:
        return Response(
            {'error': f'Error fetching stats: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def search_jobs_api(request):
    """Advanced search jobs from read database"""
    try:
        # Get query parameters
        page = request.GET.get('page', 1)
        page_size = request.GET.get('page_size', 20)
        q = request.GET.get('q', '')  # Main search query
        
        if not q:
            return Response(
                {'error': 'Search query is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Query jobs from read database
        jobs = Job.objects.using('read').filter(is_active=True)
        
        # Apply search
        jobs = jobs.filter(
            Q(title__icontains=q) |
            Q(company__name__icontains=q) |
            Q(description__icontains=q) |
            Q(city__icontains=q) |
            Q(state__icontains=q) |
            Q(country__icontains=q) |
            Q(job_function__icontains=q)
        )
        
        # Paginate results
        paginator = Paginator(jobs, page_size)
        page_obj = paginator.get_page(page)
        
        # Serialize data
        jobs_data = []
        for job in page_obj:
            jobs_data.append({
                'id': str(job.id),
                'title': job.title,
                'company': job.company.name,
                'location': job.location_display,
                'employment_type': job.employment_type,
                'seniority_level': job.seniority_level,
                'salary': job.salary_range,
                'posted_date': job.posted_date.isoformat() if job.posted_date else None,
                'job_url': job.job_url,
                'is_remote': job.is_remote,
            })
        
        return Response({
            'jobs': jobs_data,
            'total_count': paginator.count,
            'total_pages': paginator.num_pages,
            'current_page': page_obj.number,
            'query': q,
        })
        
    except Exception as e:
        return Response(
            {'error': f'Error searching jobs: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        ) 