# Generated by Django 5.2.4 on 2025-07-21 15:32

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0008_usersettings'),
    ]

    operations = [
        migrations.AlterField(
            model_name='apikey',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='api_keys', to='accounts.user'),
        ),
        migrations.AlterField(
            model_name='apirequestlog',
            name='user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='api_requests', to='accounts.user'),
        ),
        migrations.AlterField(
            model_name='securityevent',
            name='resolved_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='resolved_events', to='accounts.user'),
        ),
        migrations.AlterField(
            model_name='securityevent',
            name='user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='security_events', to='accounts.user'),
        ),
        migrations.AlterField(
            model_name='sessionsettings',
            name='user',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='session_settings', to='accounts.user'),
        ),
        migrations.AlterField(
            model_name='twofactorauth',
            name='user',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='two_factor_auth', to='accounts.user'),
        ),
        migrations.AlterField(
            model_name='twofactorbackupcode',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='backup_codes', to='accounts.user'),
        ),
        migrations.AlterField(
            model_name='userphoto',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='photos', to='accounts.user'),
        ),
        migrations.AlterField(
            model_name='usersession',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sessions', to='accounts.user'),
        ),
        migrations.AlterField(
            model_name='usersettings',
            name='user',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='user_settings', to='accounts.user'),
        ),
    ]
