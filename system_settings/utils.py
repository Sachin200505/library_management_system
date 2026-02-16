from functools import lru_cache

from .models import Setting


@lru_cache(maxsize=64)
def get_setting_value(key: str, default=None):
    try:
        setting = Setting.objects.get(key=key)
        return setting.value
    except Setting.DoesNotExist:
        return default


def set_setting_value(key: str, value: str, value_type: str = 'str'):
    Setting.objects.update_or_create(key=key, defaults={'value': value, 'value_type': value_type})
    get_setting_value.cache_clear()
