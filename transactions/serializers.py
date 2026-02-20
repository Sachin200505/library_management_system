from rest_framework import serializers
from .models import BookIssue, Fine
from books.serializers import BookSerializer
from accounts.serializers import UserSerializer

class BookIssueSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)
    book_id = serializers.PrimaryKeyRelatedField(
        queryset=BookIssue._meta.get_field('book').related_model.objects.all(), source='book', write_only=True
    )
    user = UserSerializer(read_only=True)
    
    is_overdue = serializers.BooleanField(read_only=True)
    fine_amount = serializers.DecimalField(source='compute_fine', max_digits=8, decimal_places=2, read_only=True)

    class Meta:
        model = BookIssue
        fields = [
            'id', 'user', 'book', 'book_id', 'status', 'issue_date', 'due_date',
            'return_date', 'created_at', 'updated_at', 'is_overdue', 'fine_amount'
        ]
        read_only_fields = ['status', 'issue_date', 'due_date', 'return_date']

class FineSerializer(serializers.ModelSerializer):
    issue = BookIssueSerializer(read_only=True)
    
    class Meta:
        model = Fine
        fields = '__all__'
