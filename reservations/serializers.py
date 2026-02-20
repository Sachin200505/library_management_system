from rest_framework import serializers
from .models import Reservation
from books.serializers import BookSerializer

class ReservationSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)
    book_id = serializers.PrimaryKeyRelatedField(
        queryset=Reservation._meta.get_field('book').related_model.objects.all(), source='book', write_only=True
    )
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Reservation
        fields = [
            'id', 'book', 'book_id', 'user', 'user_username', 'status', 
            'position', 'expires_at', 'approved_at', 'created_at'
        ]
        read_only_fields = ['status', 'user', 'position', 'expires_at', 'approved_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
