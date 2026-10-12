from django.contrib import admin

from .models import Certificate, CertificationRegistration, ContactMessage, Member, MembershipApplication


@admin.register(MembershipApplication)
class MembershipApplicationAdmin(admin.ModelAdmin):
    list_display = ('name', 'stream', 'email', 'status', 'created_at')
    list_filter = ('status', 'stream', 'created_at')
    search_fields = ('name', 'email')


@admin.register(CertificationRegistration)
class CertificationRegistrationAdmin(admin.ModelAdmin):
    list_display = ('name', 'level', 'email', 'payment_status', 'status', 'created_at')
    list_filter = ('status', 'payment_status', 'level')
    search_fields = ('name', 'email', 'payment_reference')


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'topic', 'email', 'status', 'created_at')
    list_filter = ('status', 'topic')
    search_fields = ('name', 'email', 'message')


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ('name', 'member_type', 'category', 'country', 'is_public')
    list_filter = ('member_type', 'category', 'country', 'is_public')
    search_fields = ('name', 'sector', 'country')


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ('number', 'holder', 'level', 'issued', 'status')
    list_filter = ('status', 'level')
    search_fields = ('number', 'holder')