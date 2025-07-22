# Dashboard Apps Guide

## Overview

We've created **4 dashboard apps** that work with the **read database** to provide different functionalities:

1. **`jobs_dashboard`** - Job tracking and applications
2. **`people_dashboard`** - Candidate and people management  
3. **`analytics_dashboard`** - Analytics and metrics
4. **`user_dashboard`** - User profiles and management

## Database Architecture

```
background_sec.py (WRITE) → job_scraper models → Write Database
                                    ↓
                            Read Database (for dashboard apps)
                                    ↓
                    jobs_dashboard, people_dashboard, 
                    analytics_dashboard, user_dashboard (READ)
```

## 1. Jobs Dashboard (`jobs_dashboard`)

**Purpose**: Track job views, applications, bookmarks, and searches

### Models:
- **`JobView`** - Track when users view jobs
- **`JobApplication`** - Track job applications with status
- **`JobBookmark`** - Track bookmarked jobs
- **`JobSearch`** - Track search history

### Use Cases:
- Track which jobs are most viewed
- Monitor application status
- Analyze search patterns
- User engagement metrics

## 2. People Dashboard (`people_dashboard`)

**Purpose**: Manage candidates and applications

### Models:
- **`Candidate`** - Candidate information and profiles
- **`Application`** - Job applications from candidates
- **`CandidateSkill`** - Skills with proficiency levels

### Use Cases:
- Candidate profile management
- Application tracking
- Skill matching
- Recruitment analytics

## 3. Analytics Dashboard (`analytics_dashboard`)

**Purpose**: Comprehensive analytics and metrics

### Models:
- **`AnalyticsEvent`** - Track all user events
- **`DailyMetrics`** - Daily aggregated metrics
- **`UserActivity`** - User activity tracking
- **`SearchAnalytics`** - Search behavior analytics

### Use Cases:
- User behavior analysis
- Performance metrics
- Search optimization
- Business intelligence

## 4. User Dashboard (`user_dashboard`)

**Purpose**: User profile and account management

### Models:
- **`UserProfile`** - Extended user profiles
- **`UserSkill`** - User skills and expertise
- **`UserExperience`** - Work experience
- **`UserEducation`** - Education history
- **`UserNotification`** - User notifications

### Use Cases:
- Profile management
- Skill tracking
- Experience management
- Notification system

## Setup Instructions

### 1. Create Databases
```sql
-- Create write database
CREATE DATABASE hire_voo_ai_write;

-- Create read database  
CREATE DATABASE hire_voo_ai_read;
```

### 2. Run Migrations
```bash
# Run migrations for write database
python3 manage.py migrate --database=default

# Run migrations for read database
python3 manage.py migrate --database=read
```

### 3. Test Your Scraping
```bash
# Run your existing scraper
python background_sec.py
```

### 4. Check Admin Interface
```bash
python3 manage.py runserver
# Go to /admin to see all dashboard models
```

## Data Flow

1. **Your `background_sec.py`** scrapes jobs and saves to **write database**
2. **Dashboard apps** read from **read database** (you'll need to set up replication)
3. **Users interact** with dashboard apps for different functionalities

## Next Steps

1. **Set up database replication** from write to read database
2. **Create API endpoints** for each dashboard app
3. **Build frontend interfaces** for each dashboard
4. **Add authentication** and permissions
5. **Implement data sync** between databases

## Benefits

- **Separation of concerns**: Write operations don't affect read performance
- **Scalability**: Can scale read and write databases independently  
- **Performance**: Read queries are faster on dedicated read database
- **Reliability**: Write operations are isolated
- **Modularity**: Each dashboard app has specific functionality

## File Structure

```
hire_voo_ai-4/
├── jobs_dashboard/
│   ├── models.py          # Job tracking models
│   ├── admin.py           # Admin interface
│   └── migrations/        # Database migrations
├── people_dashboard/
│   ├── models.py          # Candidate models
│   ├── admin.py           # Admin interface
│   └── migrations/        # Database migrations
├── analytics_dashboard/
│   ├── models.py          # Analytics models
│   ├── admin.py           # Admin interface
│   └── migrations/        # Database migrations
├── user_dashboard/
│   ├── models.py          # User models
│   ├── admin.py           # Admin interface
│   └── migrations/        # Database migrations
└── background_sec.py      # Your existing scraper (WRITE)
```

Your existing `background_sec.py` will continue to work and populate the write database, and these dashboard apps are ready to read and display that data! 🎉 