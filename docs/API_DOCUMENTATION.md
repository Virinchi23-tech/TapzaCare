# Tapza Care — REST API Reference Specification

Base URL: `http://localhost:5000/api`

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a user account and profile.
- **Request Body**:
  ```json
  {
    "email": "ayesha@example.com",
    "password": "password123",
    "name": "Ayesha Khan",
    "phone": "+91 98765 66666",
    "role": "patient"
  }
  ```

### `POST /api/auth/login`
Authenticates a user and returns a JWT token.
- **Request Body**:
  ```json
  {
    "email": "ayesha.khan@tapzacare.com",
    "password": "patient123"
  }
  ```

### `GET /api/auth/me`
Header: `Authorization: Bearer <token>`
Returns the current authenticated user profile.

---

## 2. Dynamic Home Configuration Endpoints

### `GET /api/config`
Returns active home screen layout configuration, colors, and section items.
Query Params: `?festival=true` (preview festival layout).

### `POST /api/admin/config`
Saves updated section layout order, background colors, and titles.
Role Required: `admin`

### `POST /api/admin/config/toggle-festival`
Toggles runtime festival theme mode on/off.
- **Request Body**: `{ "enable_festival": true }`

---

## 3. Doctors & Availability Endpoints

### `GET /api/doctors`
Returns list of verified doctors. Query parameters: `specialty`, `search`.

### `GET /api/doctors/:id/slots?date=YYYY-MM-DD`
Returns time slots and booking status for a given doctor and date.

---

## 4. Bookings & Conflict Management

### `POST /api/bookings`
Books an appointment atomically.
- **Request Body**:
  ```json
  {
    "doctor_id": "d-1",
    "booking_date": "2026-10-05",
    "time_slot": "10:00 AM",
    "reason": "Routine Checkup"
  }
  ```
- **Error Response (Slot Conflict)**: HTTP `409 Conflict`

---

## 5. Prescriptions & Dose Logs

### `GET /api/prescriptions`
Returns digital prescriptions with medicine timings (Morning, Afternoon, Night).

### `POST /api/dose-logs`
Logs dose completion (`taken` / `pending`).
