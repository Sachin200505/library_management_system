from rest_framework import serializers
from .models import Setting

class SettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Setting
        fields = ['id', 'key', 'value', 'value_type', 'updated_at']
        read_only_fields = ['key', 'updated_at'] # Assuming keys are fixed
