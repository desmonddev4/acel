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