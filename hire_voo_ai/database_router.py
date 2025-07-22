class DatabaseRouter:
    """
    Database router to separate read and write operations.
    
    - Write operations (CREATE, UPDATE, DELETE) go to 'default' database
    - Read operations (SELECT) go to 'read' database
    - Accounts app uses 'default' database for both read and write
    - Dashboard apps use 'read' database for reading
    - Sessions always use 'default' database
    """
    
    # Apps that should always use the default (write) database
    WRITE_APPS = ['accounts', 'auth', 'admin', 'sessions', 'contenttypes', 'job_scraper', 'credits_dashboard', 'notifications_dashboard', 'pricing_dashboard']
    
    # Apps that should use read database for reading
    READ_APPS = ['jobs_dashboard', 'people_dashboard', 'analytics_dashboard', 'user_dashboard']
    
    def db_for_read(self, model, **hints):
        """
        Point read operations to appropriate database.
        - Write apps use 'default' database
        - Read apps use 'read' database
        - Sessions always use 'default' database
        """
        app_label = model._meta.app_label
        
        # Sessions always use default database
        if app_label == 'sessions':
            return 'default'
            
        if app_label in self.WRITE_APPS:
            return 'default'
        elif app_label in self.READ_APPS:
            return 'read'
        else:
            # Default to read database for unknown apps
            return 'read'
    
    def db_for_write(self, model, **hints):
        """
        Point all write operations to the 'default' database.
        """
        return 'default'
    
    def allow_relation(self, obj1, obj2, **hints):
        """
        Allow relations if both objects are in the same database.
        """
        db_set = {'default', 'read'}
        if obj1._state.db in db_set and obj2._state.db in db_set:
            return True
        return None
    
    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        Make sure the write apps get created on the 'default' database.
        """
        if app_label in self.WRITE_APPS:
            return db == 'default'
        elif app_label in self.READ_APPS:
            return db == 'read'
        return None 