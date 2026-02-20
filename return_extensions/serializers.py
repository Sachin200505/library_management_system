from rest_framework import serializers
from .models import ReturnExtensionRequest

class ReturnExtensionRequestSerializer(serializers.ModelSerializer):
    issue_book_title = serializers.CharField(source='issue.book.title', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    processed_by_username = serializers.CharField(source='processed_by.username', read_only=True)

    class Meta:
        model = ReturnExtensionRequest
        fields = [
            'id', 'issue', 'issue_book_title', 'user', 'user_username', 
            'days_requested', 'reason', 'status', 
            'processed_by', 'processed_by_username', 'processed_at', 'created_at'
        ]
        read_only_fields = ['user', 'status', 'processed_by', 'processed_at', 'created_at']

    def create(self, validated_data):
        user = self.context['request'].user
        issue_id = validated_data.get('issue')
        # Validate that issue belongs to user
        if issue_id.user != user:
             raise serializers.ValidationError("You can only request extension for your own issues.")
        validated_data['user'] = user
        return super().create(validated_data)
