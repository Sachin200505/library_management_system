from rest_framework import serializers
from .models import Review
from books.serializers import BookSerializer

class ReviewSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_id = serializers.PrimaryKeyRelatedField(
        queryset=Review._meta.get_field('book').related_model.objects.all(), source='book', write_only=True
    )

    class Meta:
        model = Review
        fields = [
            'id', 'book', 'book_id', 'book_title', 'user', 'user_username', 
            'rating', 'text', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['status', 'user']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class ReviewAdminSerializer(ReviewSerializer):
    class Meta(ReviewSerializer.Meta):
        read_only_fields = ['user']
