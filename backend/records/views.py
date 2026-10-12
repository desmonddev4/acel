import json
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

from django.conf import settings
from rest_framework import status, viewsets
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Certificate, CertificationRegistration, ContactMessage, Member, MembershipApplication
from .serializers import (
    CertificateSerializer,
    CertificationRegistrationSerializer,
    ContactMessageSerializer,
    MemberSerializer,
    MembershipApplicationSerializer,
)


class HealthView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        return Response({'ok': True})


class AdminTokenSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        if not self.user.is_staff:
            raise AuthenticationFailed('Admin access is required.')
        return data


class AdminTokenObtainPairView(TokenObtainPairView):
    serializer_class = AdminTokenSerializer


class PublicFormView(APIView):
    permission_classes = (AllowAny,)
    throttle_classes = (ScopedRateThrottle,)
    throttle_scope = 'public_forms'

    def post(self, request):
        payload = request.data
        if not isinstance(payload, dict):
            raise ValidationError({'form': 'A JSON object is required.'})
        form_name = payload.get('form', '')
        if not isinstance(form_name, str):
            raise ValidationError({'form': 'A form name is required.'})
        if payload.get('_gotcha'):
            return Response({'ok': True}, status=status.HTTP_201_CREATED)
        payload = dict(payload)
        payload.pop('_gotcha', None)

        if form_name == 'contact':
            self._required(payload, ('fullName', 'email', 'topic', 'message'))
            ContactMessage.objects.create(
                name=payload['fullName'], email=payload['email'], topic=payload['topic'],
                message=payload['message'], payload=payload,
            )
        elif form_name.startswith('membership-application-'):
            self._required(payload, ('email',))
            stream = 'organisation' if form_name.endswith('organisation') else 'individual'
            name = payload.get('organisationName') if stream == 'organisation' else payload.get('fullName')
            if not name:
                raise ValidationError({'name': 'Applicant name is required.'})
            MembershipApplication.objects.create(
                stream=stream, name=name, email=payload['email'], payload=payload,
            )
        elif form_name == 'certification-registration':
            return self._create_registration(payload)
        else:
            raise ValidationError({'form': 'Unsupported form.'})

        return Response({'ok': True}, status=status.HTTP_201_CREATED)

    @staticmethod
    def _required(payload, fields):
        missing = [field for field in fields if not payload.get(field)]
        if missing:
            raise ValidationError({field: 'This field is required.' for field in missing})

    def _create_registration(self, payload):
        self._required(payload, ('fullName', 'email', 'level', 'paymentReference'))
        level = payload['level']
        if level not in settings.CERTIFICATION_FEES:
            raise ValidationError({'level': 'Unknown certification level.'})
        payment_reference = payload['paymentReference']
        if CertificationRegistration.objects.filter(payment_reference=payment_reference).exists():
            raise ValidationError({'payment': 'This payment reference has already been used.'})
        payment_status = self._verify_payment(payload, level, payment_reference)
        CertificationRegistration.objects.create(
            name=payload['fullName'], email=payload['email'], level=level,
            payment_reference=payment_reference, payment_status=payment_status, payload=payload,
        )
        return Response({'ok': True, 'paymentStatus': payment_status}, status=status.HTTP_201_CREATED)

    @staticmethod
    def _verify_payment(payload, level, reference):
        if not settings.PAYSTACK_SECRET_KEY:
            if settings.DEBUG and settings.ALLOW_DEMO_PAYMENTS and payload.get('paymentDemo') is True:
                return CertificationRegistration.PaymentStatus.DEMO
            raise ValidationError({'payment': 'Payment verification is not configured.'})

        request = Request(
            f'https://api.paystack.co/transaction/verify/{quote(reference, safe="")}',
            headers={'Authorization': f'Bearer {settings.PAYSTACK_SECRET_KEY}'},
        )
        try:
            with urlopen(request, timeout=10) as response:
                result = json.loads(response.read().decode('utf-8'))
        except (HTTPError, URLError, TimeoutError, json.JSONDecodeError):
            raise ValidationError({'payment': 'We could not verify this payment. Please contact the Secretariat.'})

        data = result.get('data') or {}
        expected_amount = round(float(settings.CERTIFICATION_FEES[level]) * 100)
        if (
            result.get('status') is not True
            or data.get('status') != 'success'
            or data.get('reference') != reference
            or data.get('currency') != 'USD'
            or data.get('amount') != expected_amount
            or (data.get('customer') or {}).get('email', '').lower() != payload.get('email', '').lower()
        ):
            raise ValidationError({'payment': 'The payment could not be verified for this level and amount.'})
        return CertificationRegistration.PaymentStatus.VERIFIED


class PublicMemberListView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        queryset = Member.objects.filter(is_public=True)
        member_type = request.query_params.get('type')
        sector = request.query_params.get('sector')
        query = request.query_params.get('search')
        if member_type:
            queryset = queryset.filter(member_type=member_type)
        if sector:
            queryset = queryset.filter(sector=sector)
        if query:
            queryset = queryset.filter(name__icontains=query)
        return Response(MemberSerializer(queryset, many=True).data)


class PublicCertificateView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request, certificate_number):
        try:
            certificate = Certificate.objects.get(number__iexact=certificate_number.strip())
        except Certificate.DoesNotExist:
            return Response({'detail': 'Certificate not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(CertificateSerializer(certificate).data)


class AdminSummaryView(APIView):
    permission_classes = (IsAdminUser,)

    def get(self, request):
        return Response({
            'applications': MembershipApplication.objects.count(),
            'pendingApplications': MembershipApplication.objects.filter(status='pending').count(),
            'registrations': CertificationRegistration.objects.count(),
            'pendingRegistrations': CertificationRegistration.objects.filter(status='pending').count(),
            'messages': ContactMessage.objects.count(),
            'newMessages': ContactMessage.objects.filter(status='new').count(),
            'members': Member.objects.count(),
            'certificates': Certificate.objects.count(),
            'recentApplications': MembershipApplicationSerializer(MembershipApplication.objects.all()[:5], many=True).data,
        })


class StaffModelViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAdminUser,)


class MembershipApplicationViewSet(StaffModelViewSet):
    queryset = MembershipApplication.objects.all()
    serializer_class = MembershipApplicationSerializer
    filterset_fields = ('status', 'stream')
    search_fields = ('name', 'email')


class RegistrationViewSet(StaffModelViewSet):
    queryset = CertificationRegistration.objects.all()
    serializer_class = CertificationRegistrationSerializer
    filterset_fields = ('status', 'payment_status', 'level')
    search_fields = ('name', 'email', 'payment_reference')


class ContactMessageViewSet(StaffModelViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    filterset_fields = ('status', 'topic')
    search_fields = ('name', 'email', 'message')


class MemberViewSet(StaffModelViewSet):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    filterset_fields = ('member_type', 'is_public', 'country')
    search_fields = ('name', 'sector', 'country')


class CertificateViewSet(StaffModelViewSet):
    queryset = Certificate.objects.all()
    serializer_class = CertificateSerializer
    lookup_field = 'number'
    filterset_fields = ('status', 'level')
    search_fields = ('number', 'holder')