from django.db import models


class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class MembershipApplication(TimestampedModel):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        DECLINED = 'declined', 'Declined'

    stream = models.CharField(max_length=20)
    name = models.CharField(max_length=200)
    email = models.EmailField(db_index=True)
    payload = models.JSONField(default=dict)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return f'{self.name} ({self.stream})'


class CertificationRegistration(TimestampedModel):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending review'
        APPROVED = 'approved', 'Approved'
        DECLINED = 'declined', 'Declined'

    class PaymentStatus(models.TextChoices):
        VERIFIED = 'verified', 'Verified'
        DEMO = 'demo', 'Demo'

    name = models.CharField(max_length=200)
    email = models.EmailField(db_index=True)
    level = models.CharField(max_length=80)
    payment_reference = models.CharField(max_length=120, unique=True)
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices)
    payload = models.JSONField(default=dict)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return f'{self.name} - {self.level}'


class ContactMessage(TimestampedModel):
    class Status(models.TextChoices):
        NEW = 'new', 'New'
        READ = 'read', 'Read'
        ARCHIVED = 'archived', 'Archived'

    name = models.CharField(max_length=200)
    email = models.EmailField(db_index=True)
    topic = models.CharField(max_length=100)
    message = models.TextField()
    payload = models.JSONField(default=dict)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW, db_index=True)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return f'{self.topic}: {self.name}'


class Member(TimestampedModel):
    class MemberType(models.TextChoices):
        ORGANISATION = 'Organisation', 'Organisation'
        INDIVIDUAL = 'Individual', 'Individual'

    name = models.CharField(max_length=200)
    member_type = models.CharField(max_length=20, choices=MemberType.choices)
    category = models.CharField(max_length=120)
    sector = models.CharField(max_length=160)
    country = models.CharField(max_length=100)
    since = models.PositiveSmallIntegerField()
    is_public = models.BooleanField(default=True, db_index=True)

    class Meta:
        ordering = ('name',)

    def __str__(self):
        return self.name


class Certificate(TimestampedModel):
    class Status(models.TextChoices):
        ACTIVE = 'Active', 'Active'
        EXPIRED = 'Expired', 'Expired'
        REVOKED = 'Revoked', 'Revoked'

    number = models.CharField(max_length=80, unique=True)
    holder = models.CharField(max_length=200)
    level = models.CharField(max_length=80)
    issued = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE, db_index=True)

    class Meta:
        ordering = ('-issued',)

    def __str__(self):
        return self.number