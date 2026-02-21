from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets, status, views, permissions, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import UserProfile
from .serializers import UserSerializer, UserProfileSerializer, RegisterSerializer
from analytics.api_views import log_action

class AuthViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    @action(methods=['POST'], detail=False)
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Specify backend explicitly since we are logging in a newly created user without authenticate()
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            
            # Log Action
            log_action(user, 'REGISTER', f'New user registered: {user.username}', request)
            
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False, authentication_classes=[], permission_classes=[permissions.AllowAny])
    @csrf_exempt
    def login(self, request):
        print(f"DEBUG: Request Data: {request.data}", flush=True)
        username = request.data.get('username')
        password = request.data.get('password')
        
        print(f"Login attempt for: {username} / {password}")

        # Debug logging to file
        with open('login_debug.log', 'a') as f:
            f.write(f"\n--- Login Attempt: {username} ---\n")
        
        # Check if login is via email
        if '@' in username:
            try:
                user_obj = User.objects.get(email=username)
                username = user_obj.username
                with open('login_debug.log', 'a') as f:
                    f.write(f"Resolved email to username: {username}\n")
            except User.DoesNotExist:
                with open('login_debug.log', 'a') as f:
                    f.write("Email not found in database.\n")
                pass

        user = authenticate(request, username=username, password=password, backend='django.contrib.auth.backends.ModelBackend')
        
        if user:
            # Block login if user has no profile
            if not hasattr(user, 'profile'):
                with open('login_debug.log', 'a') as f:
                    f.write(f"Login rejected for {user.username}: No profile found.\n")
                return Response({'detail': 'Account incomplete. Please contact support.'}, status=status.HTTP_403_FORBIDDEN)

            with open('login_debug.log', 'a') as f:
                f.write("Authentication successful.\n")
            login(request, user)
            
            # Log Action
            log_action(user, 'LOGIN', 'User logged in successfully', request)
            
            return Response(UserSerializer(user, context={'request': request}).data)
        
        with open('login_debug.log', 'a') as f:
            f.write("Authentication failed (authenticate returned None).\n")
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    @action(methods=['POST'], detail=False)
    def logout(self, request):
        if request.user.is_authenticated:
            log_action(request.user, 'LOGOUT', 'User logged out', request)
        logout(request)
        return Response({'detail': 'Logged out successfully'})

    @action(methods=['GET'], detail=False, permission_classes=[permissions.AllowAny])
    def csrf_token(self, request):
        from django.middleware.csrf import get_token
        return Response({'csrfToken': get_token(request)})

    @action(methods=['GET'], detail=False, permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        return Response(UserSerializer(request.user, context={'request': request}).data)

    @action(methods=['POST'], detail=False, permission_classes=[permissions.AllowAny])
    def request_password_reset(self, request):
        from .serializers import ForgotPasswordRequestSerializer
        from django.contrib.auth.tokens import default_token_generator
        from django.utils.http import urlsafe_base64_encode
        from django.utils.encoding import force_bytes
        from django.core.mail import send_mail
        from django.conf import settings

        try:
            serializer = ForgotPasswordRequestSerializer(data=request.data)
            if serializer.is_valid():
                email = serializer.validated_data['email']
                user = User.objects.filter(email=email).first()
                
                if user:
                    token = default_token_generator.make_token(user)
                    uid = urlsafe_base64_encode(force_bytes(user.pk))
                    
                    # Construct reset link
                    reset_link = f"http://localhost:5173/reset-password/{uid}/{token}/"
                    
                    # Send email
                    subject = "Password Reset Request"
                    message = f"Click the link to reset your password: {reset_link}"
                    from_email = settings.EMAIL_HOST_USER or 'noreply@library.com'
                    recipient_list = [email]
                    
                    print(f"Attempting to send email to {email}...")
                    send_mail(subject, message, from_email, recipient_list)
                    print("Email sent successfully.")
                    
                    log_action(user, 'RESET_PASSWORD_REQUEST', 'Password reset email requested', request)
                
                return Response({'detail': 'Password reset email sent.'}, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=['POST'], detail=False, permission_classes=[permissions.AllowAny])
    def reset_password_confirm(self, request):
        from .serializers import ResetPasswordConfirmSerializer
        from django.contrib.auth.tokens import default_token_generator
        from django.utils.http import urlsafe_base64_decode
        from django.utils.encoding import force_str

        serializer = ResetPasswordConfirmSerializer(data=request.data)
        if serializer.is_valid():
            uid = serializer.validated_data['uid']
            token = serializer.validated_data['token']
            password = serializer.validated_data['password']
            
            try:
                uid = force_str(urlsafe_base64_decode(uid))
                user = User.objects.get(pk=uid)
            except (TypeError, ValueError, OverflowError, User.DoesNotExist):
                user = None
            
            if user is not None and default_token_generator.check_token(user, token):
                user.set_password(password)
                user.save()
                
                log_action(user, 'RESET_PASSWORD_CONFIRM', 'Password reset confirmed', request)
                
                return Response({'detail': 'Password has been reset successfully.'}, status=status.HTTP_200_OK)
            else:
                return Response({'detail': 'Invalid token or user.'}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from .serializers import UserSerializer, UserProfileSerializer, RegisterSerializer, UserProfileUpdateSerializer
from analytics.api_views import log_action

# ... existing code ...

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return UserProfileUpdateSerializer
        return UserProfileSerializer

    def perform_destroy(self, instance):
        # Delete the User object (which will cascade to Profile)
        user = instance.user
        username = user.username
        user.delete()
        
        # Log Action (using request user as actor)
        log_action(self.request.user, 'DELETE_USER', f'Deleted user: {username}', self.request)

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__username', 'user__email', 'roll_number']
    ordering_fields = ['user__username', 'roll_number', 'created_at']

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'profile'):
            return UserProfile.objects.none()
            
        user_profile = user.profile
        if user_profile.is_owner:
            return UserProfile.objects.all()
        elif user_profile.is_admin:
            # Admin can see only Students
            return UserProfile.objects.filter(role='STUDENT')
        # Standard user sees only themselves
        return UserProfile.objects.filter(user=self.request.user)

    @action(methods=['POST'], detail=True, permission_classes=[permissions.IsAuthenticated])
    def toggle_activation(self, request, pk=None):
        """
        Deactivate/Activate a user.
        Owner can manage Admin & Student.
        Admin can manage Student.
        """
        target_profile = self.get_object()
        requester_profile = request.user.profile

        # Permission Check
        if requester_profile.is_owner:
            pass  # Owner can do anything
        elif requester_profile.is_admin:
            if target_profile.role == 'ADMIN' or target_profile.role == 'OWNER':
                return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        else:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        # Toggle is_active on the User model
        target_user = target_profile.user
        target_user.is_active = not target_user.is_active
        target_user.save()

        status_text = "activated" if target_user.is_active else "deactivated"
        
        log_action(request.user, 'TOGGLE_ACTIVATION', f'User {target_user.username} {status_text}', request)
        
        return Response({'detail': f'User {status_text} successfully.', 'is_active': target_user.is_active})

    @action(methods=['POST'], detail=False, permission_classes=[permissions.IsAuthenticated])
    def change_password(self, request):
        """
        Change password for self or for another user (if Admin/Owner).
        """
        user = request.user
        data = request.data
        target_user_id = data.get('user_id')
        new_password = data.get('new_password')

        if not new_password:
             return Response({'detail': 'New password is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Case 1: Changing another user's password (Admin/Owner)
        if target_user_id and str(target_user_id) != str(user.id):
            requester_profile = user.profile
            try:
                target_user = User.objects.get(id=target_user_id)
                target_profile = target_user.profile
            except User.DoesNotExist:
                return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

            # Permission Check
            if requester_profile.is_owner:
                pass
            elif requester_profile.is_admin:
                if target_profile.role != 'STUDENT':
                     return Response({'detail': 'Permission denied. Admins can only change Student passwords.'}, status=status.HTTP_403_FORBIDDEN)
            else:
                return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
            
            target_user.set_password(new_password)
            target_user.save()
            
            log_action(request.user, 'CHANGE_PASSWORD', f'Changed password for {target_user.username}', request)
            
            return Response({'detail': f"Password for {target_user.username} changed successfully."})

        # Case 2: Changing own password
        else:
            # For self-change, require old password check? 
            # The prompt says "owner 3 role kum oru profile page... avunga venumna password change pannikalaam but current password podanum"
            # So yes, current password is needed for self-change.
            current_password = data.get('current_password')
            if not current_password:
                return Response({'detail': 'Current password is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
            if not user.check_password(current_password):
                 return Response({'detail': 'Incorrect current password.'}, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(new_password)
            user.save()
            
            log_action(request.user, 'CHANGE_PASSWORD', 'Changed own password', request)
            
            # Re-login execution might be needed on frontend side as token might not invalidate immediately but good practice
            return Response({'detail': 'Your password has been changed successfully.'})

    @action(methods=['POST'], detail=False, permission_classes=[permissions.IsAuthenticated])
    def register_admin(self, request):
        """
        Register a new Admin user. Restricted to Owners only.
        """
        if not request.user.profile.is_owner:
            return Response({'detail': 'Permission denied. Only Owners can register Admins.'}, status=status.HTTP_403_FORBIDDEN)

        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email', '')

        if not username or not password:
            return Response({'detail': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'detail': 'Username already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Create User
            user = User.objects.create_user(
                username=username,
                password=password,
                email=email
            )
            
            # Profile is created by signal, just update role
            user.profile.role = 'ADMIN'
            user.profile.save()

            log_action(request.user, 'REGISTER_ADMIN', f'Owner created new Admin: {username}', request)

            return Response({
                'detail': f'Admin {username} created successfully.',
                'user': UserSerializer(user, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"ERROR in register_admin: {str(e)}", flush=True)
            return Response({'detail': f"Registration failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
