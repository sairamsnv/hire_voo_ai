# Generated by Django 5.2.4 on 2025-07-21 15:38

import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Company',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(db_index=True, max_length=255)),
                ('industry', models.CharField(blank=True, max_length=100)),
                ('website', models.URLField(blank=True)),
                ('linkedin_url', models.URLField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Companies',
                'db_table': 'companies',
            },
        ),
        migrations.CreateModel(
            name='Job',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(db_index=True, max_length=255)),
                ('city', models.CharField(blank=True, db_index=True, max_length=100)),
                ('state', models.CharField(blank=True, db_index=True, max_length=100)),
                ('country', models.CharField(blank=True, db_index=True, max_length=100)),
                ('employment_type', models.CharField(blank=True, choices=[('full_time', 'Full-time'), ('part_time', 'Part-time'), ('contract', 'Contract'), ('internship', 'Internship'), ('temporary', 'Temporary'), ('freelance', 'Freelance')], max_length=20)),
                ('seniority_level', models.CharField(blank=True, choices=[('entry', 'Entry Level'), ('associate', 'Associate'), ('mid_senior', 'Mid-Senior Level'), ('senior', 'Senior Level'), ('lead', 'Lead'), ('executive', 'Executive'), ('director', 'Director'), ('vp', 'VP'), ('c_level', 'C-Level')], max_length=20)),
                ('job_function', models.CharField(blank=True, db_index=True, max_length=100)),
                ('salary_display', models.CharField(blank=True, help_text='Original salary text', max_length=255)),
                ('posted_date', models.DateTimeField(blank=True, db_index=True, null=True)),
                ('job_url', models.URLField(db_index=True, unique=True)),
                ('source_job_id', models.CharField(blank=True, db_index=True, max_length=100)),
                ('description', models.TextField(blank=True)),
                ('is_active', models.BooleanField(db_index=True, default=True)),
                ('is_remote', models.BooleanField(db_index=True, default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='jobs', to='job_scraper.company')),
            ],
            options={
                'db_table': 'jobs',
                'ordering': ['-posted_date', '-created_at'],
                'indexes': [models.Index(fields=['title', 'company'], name='jobs_title_1eafdc_idx'), models.Index(fields=['city', 'state', 'country'], name='jobs_city_fb8b85_idx'), models.Index(fields=['employment_type', 'seniority_level'], name='jobs_employm_e67571_idx'), models.Index(fields=['job_function'], name='jobs_job_fun_9ffacc_idx'), models.Index(fields=['posted_date'], name='jobs_posted__bbd299_idx'), models.Index(fields=['is_active', 'is_remote'], name='jobs_is_acti_6a99e0_idx')],
            },
        ),
    ]
