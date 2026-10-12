from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Certificate, CertificationRegistration, ContactMessage, Member, MembershipApplication


class MembershipApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipApplication
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


class CertificationRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CertificationRegistration
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'payment_reference', 'payment_status', 'payload')


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'payload')


class MemberSerializer(serializers.ModelSerializer):
    type = serializers.CharField(source='member_type')

    class Meta:
        model = Member
        fields = ('id', 'name', 'type', 'category', 'sector', 'country', 'since', 'is_public', 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')


class CertificateSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='number')

    class Meta:
        model = Certificate
        fields = ('id', 'holder', 'level', 'issued', 'status', 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')


class AdminUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True, style={'input_type': 'password'})

    class Meta:
        model = get_user_model()
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'password', 'date_joined', 'last_login')
        read_only_fields = ('date_joined', 'last_login')

    def validate(self, attrs):
        password = attrs.get('password')
        if not self.instance and not password:
            raise serializers.ValidationError({'password': 'A password is required.'})
        if password:
            validate_password(password, self.instance or get_user_model()(username=attrs.get('username', ''), email=attrs.get('email', '')))
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        return get_user_model().objects.create_user(password=password, is_staff=True, **validated_data)

    def update(self, instance, validated_data):
        password = validated_data.pop('password', '')
        request = self.context.get('request')
        if request and instance.pk == request.user.pk and validated_data.get('is_active') is False:
            raise serializers.ValidationError({'is_active': 'You cannot deactivate your own account.'})
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save(update_fields=['password'])
        return user
