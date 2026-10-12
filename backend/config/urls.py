from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from records.views import (
    AdminUserViewSet,
    AdminTokenObtainPairView,
    AdminSummaryView,
    CertificateViewSet,
    ContactMessageViewSet,
    HealthView,
    MemberViewSet,
    MembershipApplicationViewSet,
    PublicCertificateView,
    PublicFormView,
    PublicMemberListView,
    RegistrationViewSet,
)

router = DefaultRouter()
router.register('admin/applications', MembershipApplicationViewSet)
router.register('admin/registrations', RegistrationViewSet)
router.register('admin/messages', ContactMessageViewSet)
router.register('admin/members', MemberViewSet)
router.register('admin/certificates', CertificateViewSet)
router.register('admin/users', AdminUserViewSet, basename='admin-user')

urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('api/health/', HealthView.as_view(), name='health'),
    path('api/auth/token/', AdminTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/public/forms/', PublicFormView.as_view(), name='public_forms'),
    path('api/public/members/', PublicMemberListView.as_view(), name='public_members'),
    path('api/public/certificates/<str:certificate_number>/', PublicCertificateView.as_view(), name='public_certificate'),
    path('api/admin/summary/', AdminSummaryView.as_view(), name='admin_summary'),
    path('api/', include(router.urls)),
]