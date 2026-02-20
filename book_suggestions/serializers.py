from django.contrib.auth.models import User
from rest_framework import serializers
from .models import BookSuggestion

class UserRepresentationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class BookSuggestionSerializer(serializers.ModelSerializer):
    created_by = UserRepresentationSerializer(read_only=True)

    class Meta:
        model = BookSuggestion
        fields = [
            'id', 'title', 'author', 'category', 'reason', 'status', 
            'created_by', 'admin_note', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['status', 'created_by', 'admin_note']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class BookSuggestionAdminSerializer(serializers.ModelSerializer):
    created_by = UserRepresentationSerializer(read_only=True)

    class Meta:
        model = BookSuggestion
        fields = [
            'id', 'title', 'author', 'category', 'reason', 'status', 
            'created_by', 'admin_note', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'title', 'author', 'category', 'reason']
