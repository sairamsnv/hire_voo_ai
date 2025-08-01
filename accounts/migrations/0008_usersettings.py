# Generated by Django 5.2.4 on 2025-07-21 03:37

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0007_twofactorauth_twofactorbackupcode'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('dark_mode', models.BooleanField(default=False)),
                ('font_size', models.CharField(choices=[('small', 'Small'), ('medium', 'Medium'), ('large', 'Large')], default='medium', max_length=10)),
                ('email_notifications', models.BooleanField(default=True)),
                ('push_notifications', models.BooleanField(default=True)),
                ('job_alerts', models.BooleanField(default=True)),
                ('marketing_emails', models.BooleanField(default=False)),
                ('sound_enabled', models.BooleanField(default=True)),
                ('auto_save', models.BooleanField(default=True)),
                ('language', models.CharField(choices=[('english', 'English'), ('spanish', 'Spanish'), ('french', 'French'), ('german', 'German')], default='english', max_length=20)),
                ('currency', models.CharField(choices=[('usd', 'USD ($)'), ('eur', 'EUR (€)'), ('gbp', 'GBP (£)'), ('cad', 'CAD (C$)')], default='usd', max_length=10)),
                ('timezone', models.CharField(choices=[('pst', 'Pacific Time (PST)'), ('est', 'Eastern Time (EST)'), ('utc', 'UTC'), ('cet', 'Central European Time')], default='pst', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='user_settings', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name_plural': 'User settings',
            },
        ),
    ]
