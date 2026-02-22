import os
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile

class UserSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'profile']

    def get_profile(self, obj):
        try:
            profile = obj.profile
            avatar_url = profile.avatar.url if profile.avatar else None
            
            # Handle RENDER env vars for absolute URLs
            render_host = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
            is_render = os.environ.get('RENDER') == 'true'
            
            # Fix for production media host issues
            if avatar_url and not avatar_url.startswith('http'):
                request = self.context.get('request')
                if request:
                    avatar_url = request.build_absolute_uri(avatar_url)
                elif is_render and render_host:
                    avatar_url = f"https://{render_host}{avatar_url}"
            
            # Ultimate robust fix for media URLs
            if avatar_url:
                # 1. Clean up existing avatar_url - extract just the path after /media/
                pure_path = avatar_url
                if '/media/' in avatar_url:
                    pure_path = '/media/' + avatar_url.split('/media/')[-1]
                
                # 2. Determine the correct host and protocol
                protocol = 'https' if is_render else 'http'
                host = render_host if is_render and render_host else None
                
                request = self.context.get('request')
                if not host and request:
                    host = request.get_host()
                    protocol = 'https' if request.is_secure() else 'http'
                
                # 3. Construct the absolute URL
                if host:
                    # Remove any existing protocol from host if present
                    host = host.replace('https://', '').replace('http://', '')
                    avatar_url = f"{protocol}://{host}{pure_path}"
                elif request:
                    avatar_url = request.build_absolute_uri(pure_path)

            return {
                'id': profile.id,
                'role': profile.role,
                'is_admin': profile.is_admin,
                'is_student': profile.is_student,
                'is_owner': profile.is_owner,
                'roll_number': profile.roll_number,
                'avatar': avatar_url
            }
        except UserProfile.DoesNotExist:
            return None

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'role', 'roll_number', 'created_at', 'is_admin', 'is_student', 'is_owner']
        read_only_fields = ['created_at']

class UserProfileUpdateSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    email = serializers.EmailField(source='user.email')
    username = serializers.CharField(source='user.username')

    class Meta:
        model = UserProfile
        fields = ['first_name', 'last_name', 'email', 'username', 'roll_number', 'avatar']

    def validate_username(self, value):
        user = self.instance.user
        if User.objects.exclude(pk=user.pk).filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_email(self, value):
        user = self.instance.user
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user

        user.first_name = user_data.get('first_name', user.first_name)
        user.last_name = user_data.get('last_name', user.last_name)
        user.email = user_data.get('email', user.email)
        user.username = user_data.get('username', user.username)
        user.save()

        instance.roll_number = validated_data.get('roll_number', instance.roll_number)
        instance.avatar = validated_data.get('avatar', instance.avatar)
        instance.save()

        return instance

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES, default=UserProfile.ROLE_STUDENT)
    roll_number = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirm_password', 'first_name', 'last_name', 'role', 'roll_number']

    def validate(self, data):
        if data.get('password') != data.get('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        # Remove confirm_password as it's not a field on the User model
        validated_data.pop('confirm_password')
        
        # Force role to STUDENT for public registration
        role = UserProfile.ROLE_STUDENT
        roll_number = validated_data.pop('roll_number', None)
        
        # Create User instance (signals will create the profile)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        # Update Profile instance created by signal
        if hasattr(user, 'profile'):
            user.profile.role = role
            user.profile.roll_number = roll_number
            user.profile.save()
        else:
            # Fallback if signal didn't run
            UserProfile.objects.create(
                user=user,
                role=role,
                roll_number=roll_number
            )
        
        return user

class ForgotPasswordRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        from django.contrib.auth.models import User
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email does not exist.")
        return value

class ResetPasswordConfirmSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)
    confirmation_password = serializers.CharField(write_only=True)
    token = serializers.CharField(write_only=True)
    uid = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['password'] != data['confirmation_password']:
            raise serializers.ValidationError("Passwords do not match.")
        return data
