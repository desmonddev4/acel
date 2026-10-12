from django.contrib.auth import get_user_model
from django.test import override_settings
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Certificate, CertificationRegistration, ContactMessage, Member, MembershipApplication


class PublicApiTests(APITestCase):
    def test_contact_form_is_saved_for_admin_review(self):
        response = self.client.post('/api/public/forms/', {
            'form': 'contact',
            'fullName': 'Taylor Example',
            'email': 'taylor@example.com',
            'topic': 'Membership',
            'message': 'Please tell me about membership.',
            'consent': True,
        }, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(ContactMessage.objects.get().email, 'taylor@example.com')

    def test_membership_application_is_saved(self):
        response = self.client.post('/api/public/forms/', {
            'form': 'membership-application-organisation',
            'organisationName': 'Example Org',
            'email': 'admin@example.com',
            'orgTier': 'Enterprise',
        }, format='json')

        self.assertEqual(response.status_code, 201)
        application = MembershipApplication.objects.get()
        self.assertEqual(application.name, 'Example Org')
        self.assertEqual(application.stream, 'organisation')

    def test_public_directory_only_lists_public_members(self):
        Member.objects.create(name='Listed Org', member_type='Organisation', category='Enterprise', sector='Energy', country='Ghana', since=2026)
        Member.objects.create(name='Private Org', member_type='Organisation', category='Enterprise', sector='Energy', country='Ghana', since=2026, is_public=False)

        response = self.client.get('/api/public/members/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual([member['name'] for member in response.data], ['Listed Org'])

    def test_public_certificate_lookup(self):
        Certificate.objects.create(number='ACEL-TEST-0001', holder='Test Member', level='Foundation', issued='2026-01-01')

        response = self.client.get('/api/public/certificates/acel-test-0001/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['id'], 'ACEL-TEST-0001')

    @override_settings(DEBUG=True, ALLOW_DEMO_PAYMENTS=True, CERTIFICATION_FEES={'Foundation': 100})
    def test_certification_demo_payment_is_recorded_only_as_demo(self):
        response = self.client.post('/api/public/forms/', {
            'form': 'certification-registration',
            'fullName': 'Test Applicant',
            'email': 'applicant@example.com',
            'level': 'Foundation',
            'paymentReference': 'ACEL-CERT-TEST-1',
            'paymentDemo': True,
        }, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['paymentStatus'], 'demo')
        self.assertEqual(CertificationRegistration.objects.get().payment_status, 'demo')

    @override_settings(DEBUG=False, ALLOW_DEMO_PAYMENTS=False, PAYSTACK_SECRET_KEY='')
    def test_demo_payment_is_rejected_when_demo_mode_is_disabled(self):
        response = self.client.post('/api/public/forms/', {
            'form': 'certification-registration',
            'fullName': 'Test Applicant',
            'email': 'applicant@example.com',
            'level': 'Foundation',
            'paymentReference': 'ACEL-CERT-TEST-2',
            'paymentDemo': True,
        }, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertFalse(CertificationRegistration.objects.exists())


class AdminApiTests(APITestCase):
    def test_admin_api_requires_staff_access(self):
        response = self.client.get('/api/admin/summary/')
        self.assertEqual(response.status_code, 401)

    def test_non_staff_user_cannot_get_admin_token(self):
        User = get_user_model()
        User.objects.create_user(username='member', password='long-test-password')

        response = self.client.post('/api/auth/token/', {
            'username': 'member',
            'password': 'long-test-password',
        }, format='json')

        self.assertEqual(response.status_code, 401)

    def test_staff_user_can_get_admin_token(self):
        User = get_user_model()
        User.objects.create_user(username='staff', password='long-test-password', is_staff=True)

        response = self.client.post('/api/auth/token/', {
            'username': 'staff',
            'password': 'long-test-password',
        }, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)

    def test_staff_can_add_a_public_member(self):
        User = get_user_model()
        staff = User.objects.create_user(username='manager', password='long-test-password', is_staff=True)
        token = RefreshToken.for_user(staff).access_token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.post('/api/admin/members/', {
            'name': 'New Member Org',
            'type': 'Organisation',
            'category': 'Enterprise',
            'sector': 'Energy',
            'country': 'Ghana',
            'since': 2026,
            'is_public': True,
        }, format='json')

        self.assertEqual(response.status_code, 201)
        public_response = self.client.get('/api/public/members/')
        self.assertEqual(public_response.data[0]['name'], 'New Member Org')

class AdminUserManagementTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.staff = User.objects.create_user(username='boss', password='long-test-password', is_staff=True)
        token = RefreshToken.for_user(self.staff).access_token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_staff_can_create_admin_who_can_sign_in(self):
        response = self.client.post('/api/admin/users/', {
            'username': 'newadmin', 'email': 'n@example.com', 'password': 'Str0ng-pass-phrase!',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertNotIn('password', response.data)
        self.assertTrue(get_user_model().objects.get(username='newadmin').is_staff)
        self.client.credentials()
        login = self.client.post('/api/auth/token/', {'username': 'newadmin', 'password': 'Str0ng-pass-phrase!'}, format='json')
        self.assertEqual(login.status_code, 200)

    def test_password_required_and_validated_on_create(self):
        self.assertEqual(self.client.post('/api/admin/users/', {'username': 'x'}, format='json').status_code, 400)
        self.assertEqual(self.client.post('/api/admin/users/', {'username': 'x', 'password': '123'}, format='json').status_code, 400)

    def test_cannot_delete_or_deactivate_self(self):
        self.assertEqual(self.client.delete(f'/api/admin/users/{self.staff.pk}/').status_code, 400)
        r = self.client.patch(f'/api/admin/users/{self.staff.pk}/', {'is_active': False}, format='json')
        self.assertEqual(r.status_code, 400)

    def test_blank_password_on_edit_keeps_password(self):
        r = self.client.patch(f'/api/admin/users/{self.staff.pk}/', {'email': 'a@b.co', 'password': ''}, format='json')
        self.assertEqual(r.status_code, 200)
        self.staff.refresh_from_db()
        self.assertTrue(self.staff.check_password('long-test-password'))

    def test_anonymous_denied(self):
        self.client.credentials()
        self.assertEqual(self.client.get('/api/admin/users/').status_code, 401)
