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
            name='UserProfile',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('user_id', models.CharField(db_index=True, max_length=100, unique=True)),
                ('first_name', models.CharField(max_length=100)),
                ('last_name', models.CharField(max_length=100)),
                ('email', models.EmailField(db_index=True, max_length=254, unique=True)),
                ('phone', models.CharField(blank=True, max_length=20)),
                ('profile_picture', models.URLField(blank=True)),
                ('current_title', models.CharField(blank=True, max_length=100)),
                ('current_company', models.CharField(blank=True, max_length=100)),
                ('years_experience', models.IntegerField(blank=True, null=True)),
                ('city', models.CharField(blank=True, max_length=100)),
                ('state', models.CharField(blank=True, max_length=100)),
                ('country', models.CharField(blank=True, max_length=100)),
                ('job_preferences', models.JSONField(default=dict)),
                ('notification_settings', models.JSONField(default=dict)),
                ('privacy_settings', models.JSONField(default=dict)),
                ('is_active', models.BooleanField(db_index=True, default=True)),
                ('is_verified', models.BooleanField(db_index=True, default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('last_login', models.DateTimeField(blank=True, null=True)),
            ],
            options={
                'db_table': 'user_profiles',
                'indexes': [models.Index(fields=['current_title'], name='user_profil_current_d0fe1e_idx'), models.Index(fields=['current_company'], name='user_profil_current_5cc313_idx'), models.Index(fields=['city', 'state', 'country'], name='user_profil_city_527965_idx'), models.Index(fields=['is_active', 'is_verified'], name='user_profil_is_acti_6ad703_idx')],
            },
        ),
        migrations.CreateModel(
            name='UserNotification',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('notification_type', models.CharField(choices=[('job_match', 'Job Match'), ('application_update', 'Application Update'), ('new_job', 'New Job'), ('system', 'System'), ('marketing', 'Marketing')], db_index=True, max_length=20)),
                ('title', models.CharField(max_length=255)),
                ('message', models.TextField()),
                ('data', models.JSONField(default=dict)),
                ('action_url', models.URLField(blank=True)),
                ('is_read', models.BooleanField(db_index=True, default=False)),
                ('is_sent', models.BooleanField(db_index=True, default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('read_at', models.DateTimeField(blank=True, null=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to='user_dashboard.userprofile')),
            ],
            options={
                'db_table': 'user_notifications',
                'indexes': [models.Index(fields=['notification_type', 'created_at'], name='user_notifi_notific_645560_idx'), models.Index(fields=['is_read', 'created_at'], name='user_notifi_is_read_790ac5_idx')],
            },
        ),
        migrations.CreateModel(
            name='UserExperience',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('company_name', models.CharField(max_length=255)),
                ('job_title', models.CharField(max_length=255)),
                ('location', models.CharField(blank=True, max_length=255)),
                ('start_date', models.DateField()),
                ('end_date', models.DateField(blank=True, null=True)),
                ('is_current', models.BooleanField(default=False)),
                ('description', models.TextField(blank=True)),
                ('achievements', models.JSONField(default=list)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='experiences', to='user_dashboard.userprofile')),
            ],
            options={
                'db_table': 'user_experiences',
                'indexes': [models.Index(fields=['company_name'], name='user_experi_company_6505ca_idx'), models.Index(fields=['job_title'], name='user_experi_job_tit_ad4d95_idx'), models.Index(fields=['start_date', 'end_date'], name='user_experi_start_d_99f740_idx')],
            },
        ),
        migrations.CreateModel(
            name='UserEducation',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('institution_name', models.CharField(max_length=255)),
                ('degree', models.CharField(max_length=255)),
                ('field_of_study', models.CharField(max_length=255)),
                ('location', models.CharField(blank=True, max_length=255)),
                ('start_date', models.DateField()),
                ('end_date', models.DateField(blank=True, null=True)),
                ('is_current', models.BooleanField(default=False)),
                ('gpa', models.DecimalField(blank=True, decimal_places=2, max_digits=3, null=True)),
                ('description', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='education', to='user_dashboard.userprofile')),
            ],
            options={
                'db_table': 'user_education',
                'indexes': [models.Index(fields=['institution_name'], name='user_educat_institu_58f9f3_idx'), models.Index(fields=['degree', 'field_of_study'], name='user_educat_degree_d72f98_idx')],
            },
        ),
        migrations.CreateModel(
            name='UserSkill',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('skill_name', models.CharField(db_index=True, max_length=100)),
                ('proficiency', models.CharField(choices=[('beginner', 'Beginner'), ('intermediate', 'Intermediate'), ('advanced', 'Advanced'), ('expert', 'Expert')], default='intermediate', max_length=20)),
                ('years_experience', models.IntegerField(blank=True, null=True)),
                ('is_verified', models.BooleanField(default=False)),
                ('added_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='skills', to='user_dashboard.userprofile')),
            ],
            options={
                'db_table': 'user_skills',
                'indexes': [models.Index(fields=['skill_name', 'proficiency'], name='user_skills_skill_n_378ac1_idx')],
                'unique_together': {('user', 'skill_name')},
            },
        ),
    ]
