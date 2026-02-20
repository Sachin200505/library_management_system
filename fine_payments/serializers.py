from rest_framework import serializers
from .models import FinePayment

class FinePaymentSerializer(serializers.ModelSerializer):
    fine_amount = serializers.DecimalField(source='fine.amount', max_digits=8, decimal_places=2, read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = FinePayment
        fields = [
            'id', 'fine', 'fine_amount', 'user', 'user_username',
            'amount', 'mode', 'reference', 'status', 'created_at'
        ]
        read_only_fields = ['user', 'status', 'created_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        # In a real app, this would be pending until payment gateway callback
        validated_data['status'] = FinePayment.STATUS_PAID 
        return super().create(validated_data)
