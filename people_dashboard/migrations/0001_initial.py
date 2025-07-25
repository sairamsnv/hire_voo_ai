# Generated by Django 5.2.4 on 2025-07-21 15:32

import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Candidate',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('user_id', models.CharField(db_index=True, max_length=100, unique=True)),
                ('first_name', models.CharField(max_length=100)),
                ('last_name', models.CharField(max_length=100)),
                ('email', models.EmailField(db_index=True, max_length=254, unique=True)),
                ('phone', models.CharField(blank=True, max_length=20)),
                ('current_title', models.CharField(blank=True, max_length=100)),
                ('current_company', models.CharField(blank=True, max_length=100)),
                ('years_experience', models.IntegerField(blank=True, null=True)),
                ('city', models.CharField(blank=True, max_length=100)),
                ('state', models.CharField(blank=True, max_length=100)),
                ('country', models.CharField(blank=True, max_length=100)),
                ('skills', models.JSONField(default=list)),
                ('preferred_locations', models.JSONField(default=list)),
                ('preferred_roles', models.JSONField(default=list)),
                ('salary_expectation', models.CharField(blank=True, max_length=100)),
                ('is_active', models.BooleanField(db_index=True, default=True)),
                ('is_available', models.BooleanField(db_index=True, default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'candidates',
                'indexes': [models.Index(fields=['current_title'], name='candidates_current_60d048_idx'), models.Index(fields=['current_company'], name='candidates_current_a80584_idx'), models.Index(fields=['city', 'state', 'country'], name='candidates_city_6399b8_idx'), models.Index(fields=['is_active', 'is_available'], name='candidates_is_acti_f17ee2_idx')],
            },
        ),
        migrations.CreateModel(
            name='Application',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('job_id', models.CharField(db_index=True, max_length=100)),
                ('job_title', models.CharField(max_length=255)),
                ('company_name', models.CharField(max_length=255)),
                ('status', models.CharField(choices=[('applied', 'Applied'), ('reviewing', 'Reviewing'), ('shortlisted', 'Shortlisted'), ('interviewed', 'Interviewed'), ('offered', 'Offered'), ('hired', 'Hired'), ('rejected', 'Rejected'), ('withdrawn', 'Withdrawn')], db_index=True, default='applied', max_length=20)),
                ('applied_date', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('updated_date', models.DateTimeField(auto_now=True)),
                ('cover_letter', models.TextField(blank=True)),
                ('resume_url', models.URLField(blank=True)),
                ('notes', models.TextField(blank=True)),
                ('candidate', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='applications', to='people_dashboard.candidate')),
            ],
            options={
                'db_table': 'applications',
                'indexes': [models.Index(fields=['job_id', 'status'], name='application_job_id_606b4d_idx'), models.Index(fields=['applied_date'], name='application_applied_6cf098_idx'), models.Index(fields=['candidate', 'status'], name='application_candida_84e04d_idx')],
                'unique_together': {('candidate', 'job_id')},
            },
        ),
        migrations.CreateModel(
            name='CandidateSkill',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('skill_name', models.CharField(db_index=True, max_length=100)),
                ('proficiency', models.CharField(choices=[('beginner', 'Beginner'), ('intermediate', 'Intermediate'), ('advanced', 'Advanced'), ('expert', 'Expert')], default='intermediate', max_length=20)),
                ('years_experience', models.IntegerField(blank=True, null=True)),
                ('added_at', models.DateTimeField(auto_now_add=True)),
                ('candidate', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='candidate_skills', to='people_dashboard.candidate')),
            ],
            options={
                'db_table': 'candidate_skills',
                'indexes': [models.Index(fields=['skill_name', 'proficiency'], name='candidate_s_skill_n_08173a_idx')],
                'unique_together': {('candidate', 'skill_name')},
            },
        ),
    ]
