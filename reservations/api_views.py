from rest_framework import viewsets, permissions
from .models import Reservation
from .serializers import ReservationSerializer

class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_profile = self.request.user.profile
        if user_profile.is_admin or user_profile.is_owner:
            return Reservation.objects.all()
        return Reservation.objects.filter(user=self.request.user)
