# app/routes.py

from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import User, DoctorAvailability, Appointment, Notification, Assessment
from app.services.ckd_logic import calculate_ckd_risk

main = Blueprint('main', __name__)

# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def cors_ok():
    return jsonify({"status": "ok"}), 200


def _notify(user_id: int, appt_id: int, message: str, ntype: str = "info"):
    n = Notification(user_id=user_id, appointment_id=appt_id, message=message, type=ntype)
    db.session.add(n)


def _notify_admins(appt_id: int, message: str, ntype: str = "info"):
    admins = User.query.filter_by(role='admin').all()
    for admin in admins:
        _notify(admin.id, appt_id, message, ntype)


# ─────────────────────────────────────────────────────────────────────────────
# AUTH
# ─────────────────────────────────────────────────────────────────────────────

@main.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return cors_ok()

    data     = request.json or {}
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"status": "error", "message": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or user.password != password:
        return jsonify({"status": "error", "message": "Invalid credentials"}), 401

    return jsonify({
        "status": "success",
        "id":     user.id,
        "name":   user.name,
        "email":  user.email,
        "role":   user.role,
    }), 200


@main.route('/api/signup', methods=['POST', 'OPTIONS'])
def signup():
    if request.method == 'OPTIONS':
        return cors_ok()

    data     = request.json or {}
    name     = data.get("name", "").strip()
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({"status": "error", "message": "All fields are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"status": "error", "message": "Email already registered"}), 409

    new_user = User(name=name, email=email, password=password, role='patient')
    db.session.add(new_user)
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": "Failed to create account", "detail": str(e)}), 500

    return jsonify({"status": "success", "message": "Account created", "user": new_user.to_dict()}), 201


# ─────────────────────────────────────────────────────────────────────────────
# USERS / STAFF
# ─────────────────────────────────────────────────────────────────────────────

@main.route('/api/users/create', methods=['POST', 'OPTIONS'])
def create_staff():
    if request.method == 'OPTIONS':
        return cors_ok()

    data      = request.json or {}
    name      = data.get("name", "").strip()
    email     = data.get("email", "").strip().lower()
    password  = data.get("password", "")
    role      = data.get("role", "")
    specialty = data.get("specialty", "").strip()

    if not name or not email or not password or not role:
        return jsonify({"status": "error", "message": "All fields are required"}), 400

    if role not in ("doctor", "admin"):
        return jsonify({"status": "error", "message": "Role must be 'doctor' or 'admin'"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"status": "error", "message": "Email already registered"}), 409

    new_user = User(name=name, email=email, password=password, role=role, specialty=specialty or None)
    db.session.add(new_user)
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": "Failed to create account", "detail": str(e)}), 500

    return jsonify({
        "status":  "success",
        "message": f"{role.capitalize()} account created",
        "user":    new_user.to_dict(),
    }), 201
    
    
@main.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify([u.to_dict() for u in users]), 200


@main.route('/api/users/<int:user_id>', methods=['DELETE', 'OPTIONS'])
def delete_user(user_id):
    if request.method == 'OPTIONS':
        return cors_ok()

    user = User.query.get(user_id)
    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({"status": "success", "message": "User deleted"}), 200


@main.route('/api/users/<int:user_id>/urgent', methods=['PATCH', 'OPTIONS'])
def set_user_urgent(user_id):
    if request.method == 'OPTIONS':
        return cors_ok()

    user = User.query.get(user_id)
    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404

    data = request.json or {}
    user.is_urgent    = bool(data.get("is_urgent", True))
    user.urgent_notes = data.get("notes", "") or ""
    user.flagged_by   = data.get("flagged_by", "") or ""
    db.session.commit()
    return jsonify({"status": "success", "user": user.to_dict()}), 200


# ─────────────────────────────────────────────────────────────────────────────
# DOCTORS & AVAILABILITY
# ─────────────────────────────────────────────────────────────────────────────

@main.route('/api/doctors', methods=['GET'])
def get_doctors():
    doctors = User.query.filter_by(role='doctor').all()
    result  = []
    for doc in doctors:
        slots = DoctorAvailability.query.filter_by(doctor_id=doc.id, is_booked=False).all()
        result.append({
            **doc.to_dict(),
            "availability": [s.to_dict() for s in slots],
        })
    return jsonify(result), 200


@main.route('/api/doctors/<int:doctor_id>/availability', methods=['GET', 'POST', 'OPTIONS'])
def doctor_availability(doctor_id):
    if request.method == 'OPTIONS':
        return cors_ok()

    if request.method == 'GET':
        slots = DoctorAvailability.query.filter_by(doctor_id=doctor_id).all()
        return jsonify([s.to_dict() for s in slots]), 200

    data  = request.json or {}
    date  = data.get("date", "")
    slots = data.get("time_slots", [])

    if not date or not slots:
        return jsonify({"status": "error", "message": "date and time_slots required"}), 400

    created = []
    for slot in slots:
        exists = DoctorAvailability.query.filter_by(
            doctor_id=doctor_id, date=date, time_slot=slot
        ).first()
        if not exists:
            db.session.add(DoctorAvailability(doctor_id=doctor_id, date=date, time_slot=slot))
            created.append(slot)

    db.session.commit()
    return jsonify({"status": "success", "added": created}), 201


@main.route('/api/doctors/availability/<int:slot_id>', methods=['DELETE', 'OPTIONS'])
def delete_availability(slot_id):
    if request.method == 'OPTIONS':
        return cors_ok()

    slot = DoctorAvailability.query.get(slot_id)
    if not slot:
        return jsonify({"status": "error", "message": "Slot not found"}), 404
    db.session.delete(slot)
    db.session.commit()
    return jsonify({"status": "success"}), 200


# ─────────────────────────────────────────────────────────────────────────────
# APPOINTMENTS
# ─────────────────────────────────────────────────────────────────────────────

@main.route('/api/appointments', methods=['POST', 'OPTIONS'])
def book_appointment():
    if request.method == 'OPTIONS':
        return cors_ok()

    data       = request.json or {}
    patient_id = data.get("patient_id")
    doctor_id  = data.get("doctor_id")
    date       = data.get("date")
    time_slot  = data.get("time_slot")
    notes      = data.get("notes", "")

    if not all([patient_id, doctor_id, date, time_slot]):
        return jsonify({"status": "error", "message": "Missing required fields"}), 400

    slot = DoctorAvailability.query.filter_by(
        doctor_id=doctor_id, date=date, time_slot=time_slot, is_booked=False
    ).first()
    if not slot:
        return jsonify({"status": "error", "message": "Slot no longer available"}), 409

    slot.is_booked = True

    appt = Appointment(
        patient_id=patient_id,
        doctor_id=doctor_id,
        date=date,
        time_slot=time_slot,
        notes=notes,
        status='pending'
    )
    db.session.add(appt)
    db.session.flush()

    _notify(patient_id, appt.id,
            f"Your appointment with {appt.doctor.name} on {date} at {time_slot} is pending confirmation.",
            "info")
    _notify(doctor_id, appt.id,
            f"New appointment request from {appt.patient.name} on {date} at {time_slot}.",
            "info")
    _notify_admins(appt.id,
            f"New appointment request from {appt.patient.name} with Dr. {appt.doctor.name} on {date} at {time_slot}.",
            "info")

    db.session.commit()
    return jsonify({"status": "success", "appointment": appt.to_dict()}), 201


@main.route('/api/appointments/patient/<int:patient_id>', methods=['GET'])
def get_patient_appointments(patient_id):
    appts = (
        Appointment.query.filter_by(patient_id=patient_id)
        .order_by(Appointment.created_at.desc())
        .all()
    )
    return jsonify([a.to_dict() for a in appts]), 200


@main.route('/api/appointments/doctor/<int:doctor_id>', methods=['GET'])
def get_doctor_appointments(doctor_id):
    appts = (
        Appointment.query.filter_by(doctor_id=doctor_id)
        .order_by(Appointment.created_at.desc())
        .all()
    )
    return jsonify([a.to_dict() for a in appts]), 200


@main.route('/api/appointments', methods=['GET'])
def get_all_appointments():
    appts = Appointment.query.order_by(Appointment.created_at.desc()).all()
    return jsonify([a.to_dict() for a in appts]), 200


@main.route('/api/appointments/<int:appt_id>/confirm', methods=['PATCH', 'OPTIONS'])
def confirm_appointment(appt_id):
    if request.method == 'OPTIONS':
        return cors_ok()

    appt = Appointment.query.get(appt_id)
    if not appt:
        return jsonify({"status": "error", "message": "Appointment not found"}), 404

    if appt.status == 'patient_proposed' and appt.new_date and appt.new_time:
        appt.date          = appt.new_date
        appt.time_slot     = appt.new_time
        appt.new_date      = None
        appt.new_time      = None
        appt.reject_reason = None
        appt.status        = 'confirmed'
        _notify(appt.patient_id, appt.id,
                f"✅ Dr. {appt.doctor.name} accepted your proposed appointment time: {appt.date} at {appt.time_slot}.",
                "success")
        _notify(appt.doctor_id, appt.id,
                f"✅ You accepted the proposed time for {appt.patient.name}: {appt.date} at {appt.time_slot}.",
                "success")
        _notify_admins(appt.id,
                f"Appointment between {appt.patient.name} and Dr. {appt.doctor.name} was confirmed at {appt.date} {appt.time_slot}.",
                "success")
    else:
        appt.status = 'confirmed'
        _notify(appt.patient_id, appt.id,
                f"✅ Your appointment with Dr. {appt.doctor.name} on {appt.date} at {appt.time_slot} has been CONFIRMED.",
                "success")
        _notify_admins(appt.id,
                f"Appointment confirmed by Dr. {appt.doctor.name} for {appt.patient.name} on {appt.date} at {appt.time_slot}.",
                "success")
    db.session.commit()
    return jsonify({"status": "success", "appointment": appt.to_dict()}), 200


@main.route('/api/appointments/<int:appt_id>/cancel', methods=['PATCH', 'OPTIONS'])
def cancel_appointment(appt_id):
    if request.method == 'OPTIONS':
        return cors_ok()

    data   = request.json or {}
    reason = data.get("reason", "No reason provided.")

    appt = Appointment.query.get(appt_id)
    if not appt:
        return jsonify({"status": "error", "message": "Appointment not found"}), 404

    appt.status        = 'cancelled'
    appt.reject_reason = reason

    slot = DoctorAvailability.query.filter_by(
        doctor_id=appt.doctor_id, date=appt.date, time_slot=appt.time_slot
    ).first()
    if slot:
        slot.is_booked = False

    _notify(appt.patient_id, appt.id,
            f"❌ Your appointment with Dr. {appt.doctor.name} on {appt.date} was cancelled. Reason: {reason}",
            "danger")
    db.session.commit()
    return jsonify({"status": "success", "appointment": appt.to_dict()}), 200


@main.route('/api/appointments/<int:appt_id>/reschedule', methods=['PATCH', 'OPTIONS'])
def reschedule_appointment(appt_id):
    if request.method == 'OPTIONS':
        return cors_ok()

    data     = request.json or {}
    new_date = data.get("new_date")
    new_time = data.get("new_time")
    reason   = data.get("reason", "")

    if not new_date or not new_time:
        return jsonify({"status": "error", "message": "new_date and new_time required"}), 400

    appt = Appointment.query.get(appt_id)
    if not appt:
        return jsonify({"status": "error", "message": "Appointment not found"}), 404

    appt.status        = 'rescheduled'
    appt.new_date      = new_date
    appt.new_time      = new_time
    appt.reject_reason = reason

    _notify(appt.patient_id, appt.id,
            f"🔄 Dr. {appt.doctor.name} proposed a new appointment time: {new_date} at {new_time}. {reason}",
            "warning")
    _notify_admins(appt.id,
            f"Dr. {appt.doctor.name} proposed a new time for {appt.patient.name}: {new_date} at {new_time}.",
            "warning")
    db.session.commit()
    return jsonify({"status": "success", "appointment": appt.to_dict()}), 200


@main.route('/api/appointments/<int:appt_id>/accept', methods=['PATCH', 'OPTIONS'])
def accept_appointment(appt_id):
    if request.method == 'OPTIONS':
        return cors_ok()

    appt = Appointment.query.get(appt_id)
    if not appt:
        return jsonify({"status": "error", "message": "Appointment not found"}), 404

    if appt.status not in ('rescheduled', 'patient_proposed'):
        return jsonify({"status": "error", "message": "Appointment is not awaiting acceptance"}), 400

    if not appt.new_date or not appt.new_time:
        return jsonify({"status": "error", "message": "No proposed time to accept"}), 400

    appt.date          = appt.new_date
    appt.time_slot     = appt.new_time
    appt.new_date      = None
    appt.new_time      = None
    appt.reject_reason = None
    appt.status        = 'confirmed'

    _notify(appt.doctor_id, appt.id,
            f"✅ {appt.patient.name} accepted the proposed time for your appointment: {appt.date} at {appt.time_slot}.",
            "success")
    _notify(appt.patient_id, appt.id,
            f"✅ You confirmed the appointment with Dr. {appt.doctor.name} on {appt.date} at {appt.time_slot}.",
            "success")
    _notify_admins(appt.id,
            f"Appointment between {appt.patient.name} and Dr. {appt.doctor.name} was confirmed at {appt.date} {appt.time_slot}.",
            "success")
    db.session.commit()
    return jsonify({"status": "success", "appointment": appt.to_dict()}), 200


@main.route('/api/appointments/<int:appt_id>/propose', methods=['PATCH', 'OPTIONS'])
def propose_appointment(appt_id):
    if request.method == 'OPTIONS':
        return cors_ok()

    data     = request.json or {}
    new_date = data.get("new_date")
    new_time = data.get("new_time")
    reason   = data.get("reason", "")

    if not new_date or not new_time:
        return jsonify({"status": "error", "message": "new_date and new_time required"}), 400

    appt = Appointment.query.get(appt_id)
    if not appt:
        return jsonify({"status": "error", "message": "Appointment not found"}), 404

    appt.status        = 'patient_proposed'
    appt.new_date      = new_date
    appt.new_time      = new_time
    appt.reject_reason = reason

    _notify(appt.doctor_id, appt.id,
            f"📝 {appt.patient.name} proposed a new appointment time: {new_date} at {new_time}. {reason}",
            "info")
    _notify(appt.patient_id, appt.id,
            f"📝 You proposed a new time for your appointment with Dr. {appt.doctor.name}: {new_date} at {new_time}.",
            "info")
    _notify_admins(appt.id,
            f"{appt.patient.name} proposed a change for appointment with Dr. {appt.doctor.name}: {new_date} at {new_time}.",
            "info")
    db.session.commit()
    return jsonify({"status": "success", "appointment": appt.to_dict()}), 200

@main.route('/api/appointments/request', methods=['POST', 'OPTIONS'])
def request_appointment():
    if request.method == 'OPTIONS':
        return cors_ok()

    data          = request.json or {}
    patient_id    = data.get("patient_id")
    requested_by  = data.get("requested_by", "A doctor")

    if not patient_id:
        return jsonify({"status": "error", "message": "patient_id is required"}), 400

    patient = User.query.get(patient_id)
    if not patient:
        return jsonify({"status": "error", "message": "Patient not found"}), 404

    # Notify all admins (appointment_id is null — this is a request, not a booking yet)
    _notify_admins(
        None,
        f"📋 {requested_by} requested an appointment be arranged for {patient.name}.",
        "info",
    )
    db.session.commit()

    return jsonify({"status": "success", "message": "Request sent to admin"}), 201

# ─────────────────────────────────────────────────────────────────────────────
# RISK SCREENING & NOTIFICATIONS
# ─────────────────────────────────────────────────────────────────────────────

@main.route('/api/predict-risk', methods=['POST', 'OPTIONS'])
def predict_risk():
    if request.method == 'OPTIONS':
        return cors_ok()

    payload = request.json or {}
    try:
        result = calculate_ckd_risk(payload)
    except ValueError as exc:
        return jsonify({"status": "error", "message": str(exc)}), 400
    except Exception:
        return jsonify({"status": "error", "message": "Unable to calculate CKD risk. Please check submitted values."}), 400

    return jsonify(result), 200


@main.route('/api/notifications/<int:user_id>', methods=['GET'])
def get_notifications(user_id):
    notes = (
        Notification.query.filter_by(user_id=user_id)
        .order_by(Notification.created_at.desc())
        .all()
    )
    return jsonify([n.to_dict() for n in notes]), 200


@main.route('/api/notifications/<int:notif_id>/read', methods=['PATCH', 'OPTIONS'])
def mark_read(notif_id):
    if request.method == 'OPTIONS':
        return cors_ok()
    n = Notification.query.get(notif_id)
    if n:
        n.is_read = True
        db.session.commit()
    return jsonify({"status": "ok"}), 200


@main.route('/api/notifications/read-all/<int:user_id>', methods=['PATCH', 'OPTIONS'])
def mark_all_read(user_id):
    if request.method == 'OPTIONS':
        return cors_ok()
    Notification.query.filter_by(user_id=user_id, is_read=False).update({"is_read": True})
    db.session.commit()
    return jsonify({"status": "ok"}), 200


# ─────────────────────────────────────────────────────────────────────────────
# ASSESSMENTS
# ─────────────────────────────────────────────────────────────────────────────

@main.route('/api/assessments', methods=['GET', 'POST', 'OPTIONS'])
def assessments():
    if request.method == 'OPTIONS':
        return cors_ok()

    if request.method == 'GET':
        records = Assessment.query.order_by(Assessment.created_at.desc()).all()
        return jsonify([r.to_dict() for r in records]), 200

    payload           = request.json or {}
    patient_id        = payload.get('patient_id')
    guest_name        = payload.get('guest_name')
    guest_email       = payload.get('guest_email')
    assessment_data   = payload.get('assessment_data')
    assessment_result = payload.get('assessment_result')

    if not assessment_data or not assessment_result:
        return jsonify({"status": "error", "message": "assessment_data and assessment_result are required"}), 400

    if patient_id is not None:
        patient = User.query.get(patient_id)
        if not patient:
            return jsonify({"status": "error", "message": "Patient not found"}), 404
        guest_name  = guest_name  or patient.name
        guest_email = guest_email or patient.email
    else:
        if not guest_name and not guest_email:
            guest_name = 'Guest User'

    record = Assessment(
        patient_id=patient_id,
        guest_name=guest_name,
        guest_email=guest_email,
        assessment_data=assessment_data,
        assessment_result=assessment_result,
    )

    db.session.add(record)
    db.session.commit()

    return jsonify({"status": "success", "assessment": record.to_dict()}), 201


@main.route('/api/assessments/patient/<int:patient_id>', methods=['GET'])
def get_patient_assessments(patient_id):
    records = (
        Assessment.query.filter_by(patient_id=patient_id)
        .order_by(Assessment.created_at.desc())
        .all()
    )
    return jsonify([r.to_dict() for r in records]), 200


# ─────────────────────────────────────────────────────────────────────────────
# PATIENTS WITH ASSESSMENTS (Admin Dashboard)
# ─────────────────────────────────────────────────────────────────────────────

@main.route('/api/patients-with-assessments', methods=['GET'])
def get_patients_with_assessments():
    """
    Returns all patients joined with their latest assessment.
    Includes full profile fields so the admin dashboard shows real contact info.
    """
    patients = User.query.filter_by(role='patient').order_by(User.created_at.desc()).all()

    result = []
    for patient in patients:
        latest_assessment = (
            Assessment.query
            .filter_by(patient_id=patient.id)
            .order_by(Assessment.created_at.desc())
            .first()
        )

        result.append({
            "user": {
                "id":               patient.id,
                "name":             patient.name              or "",
                "email":            patient.email             or "",
                "created_at":       patient.created_at.isoformat() if patient.created_at else "",
                "phone":            patient.phone             or "",
                "address":          patient.address           or "",
                "dateOfBirth":      patient.date_of_birth     or "",
                "emergencyContact": patient.emergency_contact or "",
                "is_urgent":        patient.is_urgent         or False,   # ← urgent flag
                "urgent_notes":     patient.urgent_notes      or "",      # ← urgent notes
                "flagged_by":       patient.flagged_by        or "",      # ← who flagged
            },
            "assessment": latest_assessment.to_dict() if latest_assessment else None,
        })

    return jsonify(result), 200


# ─────────────────────────────────────────────────────────────────────────────
# PATIENT PROFILE MANAGEMENT
# ─────────────────────────────────────────────────────────────────────────────

@main.route('/api/profile/<int:user_id>', methods=['GET', 'PUT', 'OPTIONS'])
def handle_patient_profile(user_id):
    if request.method == 'OPTIONS':
        return cors_ok()

    user = User.query.get(user_id)
    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404

    if request.method == 'GET':
        return jsonify({
            "status": "success",
            "profile": {
                "id":               user.id,
                "name":             user.name              or "",
                "email":            user.email             or "",
                "phone":            user.phone             or "",
                "address":          user.address           or "",
                "dateOfBirth":      user.date_of_birth     or "",
                "emergencyContact": user.emergency_contact or "",
            }
        }), 200

    data  = request.json or {}
    phone = data.get("phone", "").strip()

    if not phone:
        return jsonify({"status": "error", "message": "Phone number is required"}), 400

    user.name              = data.get("name",             user.name).strip()
    user.email             = data.get("email",            user.email).strip().lower()
    user.phone             = phone
    user.address           = data.get("address",          "").strip()
    user.date_of_birth     = data.get("dateOfBirth",      "")
    user.emergency_contact = data.get("emergencyContact", "").strip()

    try:
        db.session.commit()
        return jsonify({
            "status":  "success",
            "message": "Profile updated successfully",
            "user":    user.to_dict(),
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500