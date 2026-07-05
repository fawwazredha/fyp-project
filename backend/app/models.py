# app/models.py
from app.extensions import db
from datetime import datetime, timezone


class User(db.Model):
    __tablename__ = 'users'

    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(120), nullable=False)
    email      = db.Column(db.String(255), unique=True, nullable=False)
    password   = db.Column(db.String(255), nullable=False)
    role       = db.Column(db.String(20),  nullable=False, default='patient')
    specialty  = db.Column(db.String(120), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # ── Patient profile fields ────────────────────────────────────────────────
    phone             = db.Column(db.String(20),  nullable=True)
    address           = db.Column(db.String(255), nullable=True)
    date_of_birth     = db.Column(db.String(50),  nullable=True)
    emergency_contact = db.Column(db.String(20),  nullable=True)

    # ── Urgent flagging (set by doctor/admin) ─────────────────────────────────
    is_urgent    = db.Column(db.Boolean, default=False)
    urgent_notes = db.Column(db.Text,     nullable=True)
    flagged_by   = db.Column(db.String(120), nullable=True)

    def to_dict(self):
        return {
            "id":               self.id,
            "name":             self.name,
            "email":            self.email,
            "role":             self.role,
            "specialty":        self.specialty,
            "created_at":       self.created_at.isoformat() if self.created_at else None,
            "phone":            self.phone             or "",
            "address":          self.address           or "",
            "dateOfBirth":      self.date_of_birth     or "",
            "emergencyContact": self.emergency_contact or "",
            "is_urgent":        self.is_urgent         or False,
            "urgent_notes":     self.urgent_notes      or "",
            "flagged_by":       self.flagged_by        or "",
        }


class DoctorAvailability(db.Model):
    """Each row = one available time slot a doctor has opened."""
    __tablename__ = 'doctor_availability'

    id        = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date      = db.Column(db.String(20), nullable=False)   # 'YYYY-MM-DD'
    time_slot = db.Column(db.String(20), nullable=False)   # '09:00 AM'
    is_booked = db.Column(db.Boolean, default=False)

    doctor = db.relationship('User', backref='availability_slots')

    def to_dict(self):
        return {
            "id":        self.id,
            "doctor_id": self.doctor_id,
            "date":      self.date,
            "time_slot": self.time_slot,
            "is_booked": self.is_booked,
        }


class Appointment(db.Model):
    __tablename__ = 'appointments'

    id            = db.Column(db.Integer, primary_key=True)
    patient_id    = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    doctor_id     = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date          = db.Column(db.String(20), nullable=False)
    time_slot     = db.Column(db.String(20), nullable=False)
    notes         = db.Column(db.Text, nullable=True)
    # pending | confirmed | cancelled | rescheduled | patient_proposed
    status        = db.Column(db.String(20), default='pending')
    reject_reason = db.Column(db.Text,       nullable=True)
    new_date      = db.Column(db.String(20), nullable=True)
    new_time      = db.Column(db.String(20), nullable=True)
    created_at    = db.Column(db.DateTime,   default=lambda: datetime.now(timezone.utc))

    patient = db.relationship('User', foreign_keys=[patient_id], backref='patient_appointments')
    doctor  = db.relationship('User', foreign_keys=[doctor_id],  backref='doctor_appointments')

    def to_dict(self):
        return {
            "id":               self.id,
            "patient_id":       self.patient_id,
            "patient_name":     self.patient.name     if self.patient else '',
            "doctor_id":        self.doctor_id,
            "doctor_name":      self.doctor.name      if self.doctor  else '',
            "doctor_specialty": self.doctor.specialty if self.doctor  else '',
            "date":             self.date,
            "time_slot":        self.time_slot,
            "notes":            self.notes,
            "status":           self.status,
            "reject_reason":    self.reject_reason,
            "new_date":         self.new_date,
            "new_time":         self.new_time,
            "created_at":       self.created_at.isoformat(),
        }


class Notification(db.Model):
    __tablename__ = 'notifications'

    id             = db.Column(db.Integer, primary_key=True)
    user_id        = db.Column(db.Integer, db.ForeignKey('users.id'),       nullable=False)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.id'), nullable=True)
    message        = db.Column(db.Text,    nullable=False)
    type           = db.Column(db.String(30), default='info')  # info | success | warning | danger
    is_read        = db.Column(db.Boolean, default=False)
    created_at     = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id":             self.id,
            "user_id":        self.user_id,
            "appointment_id": self.appointment_id,
            "message":        self.message,
            "type":           self.type,
            "is_read":        self.is_read,
            "created_at":     self.created_at.isoformat(),
        }


class Assessment(db.Model):
    __tablename__ = 'assessments'

    id                = db.Column(db.Integer, primary_key=True)
    patient_id        = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    guest_name        = db.Column(db.String(255), nullable=True)
    guest_email       = db.Column(db.String(255), nullable=True)
    assessment_data   = db.Column(db.JSON, nullable=False)
    assessment_result = db.Column(db.JSON, nullable=False)
    created_at        = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at        = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    patient = db.relationship('User', backref='assessments')

    def to_dict(self):
        return {
            "id":                self.id,
            "patient_id":        self.patient_id,
            "guest_name":        self.guest_name,
            "guest_email":       self.guest_email,
            "assessment_data":   self.assessment_data,
            "assessment_result": self.assessment_result,
            "created_at":        self.created_at.isoformat(),
            "updated_at":        self.updated_at.isoformat(),
            "patient_name":      self.patient.name  if self.patient else None,
            "patient_email":     self.patient.email if self.patient else None,
        }