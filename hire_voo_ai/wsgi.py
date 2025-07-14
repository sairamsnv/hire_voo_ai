import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hire_voo_ai.settings')
application = get_wsgi_application()
