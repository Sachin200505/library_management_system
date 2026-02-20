from django.db import migrations

def seed_settings(apps, schema_editor):
    Setting = apps.get_model('system_settings', 'Setting')
    defaults = [
        {'key': 'fine_per_day', 'value': '5', 'value_type': 'float'},
        {'key': 'return_period_days', 'value': '14', 'value_type': 'int'},
        {'key': 'currency_symbol', 'value': '$', 'value_type': 'str'},
        {'key': 'library_name', 'value': 'Library System', 'value_type': 'str'},
    ]
    for data in defaults:
        Setting.objects.update_or_create(key=data['key'], defaults=data)

class Migration(migrations.Migration):

    dependencies = [
        ('system_settings', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_settings),
    ]
