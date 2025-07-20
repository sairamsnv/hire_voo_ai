# hire_voo_ai/urls.py (Main project URLs)
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from accounts.views import FrontendAppView
from django.shortcuts import render
import os
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('accounts.urls')),  # Your API endpoints
    
        ]



if settings.DEBUG:
    urlpatterns += [
        re_path(r'^(?!api/).*$', TemplateView.as_view(template_name="index.html")),
    ]
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
