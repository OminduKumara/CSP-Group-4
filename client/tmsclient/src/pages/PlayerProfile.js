import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import '../styles/PlayerProfile.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9\s-]{7,15}$/;

export default function PlayerProfile() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [form, setForm] = useState({
    username: '',
    email: '',
    identityNumber: '',
    contactNumber: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    if (!auth.token) return;

    let isMounted = true;
    async function loadProfile() {
      setLoading(true);
      setFeedback({ type: '', message: '' });
      try {
        const response = await fetch(`${API_ENDPOINTS.AUTH}/me`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.message || 'Failed to load profile');
        }

        if (!isMounted) return;
        const user = data.user || {};
        setForm({
          username: user.username || '',
          email: user.email || '',
          identityNumber: user.identityNumber || '',
          contactNumber: user.contactNumber || '',
          address: user.address || ''
        });
      } catch (error) {
        if (isMounted) {
          setFeedback({ type: 'error', message: error.message || 'Unable to load profile details.' });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [auth.token]);

  const isDirty = useMemo(() => {
    const current = auth.user || {};
    return (
      form.username !== (current.username || '') ||
      form.email !== (current.email || '') ||
      form.contactNumber !== (current.contactNumber || '') ||
      form.address !== (current.address || '')
    );
  }, [auth.user, form]);

  function validate() {
    const nextErrors = {};
    if (!form.username.trim()) nextErrors.username = 'Name is required';
    if (!form.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (form.contactNumber.trim() && !PHONE_REGEX.test(form.contactNumber.trim())) {
      nextErrors.contactNumber = 'Enter a valid phone number';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function onFieldChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setFeedback({ type: '', message: '' });
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (!validate()) {
      setFeedback({ type: 'error', message: 'Please fix the highlighted fields and try again.' });
      return;
    }

    try {
      setSaving(true);
      setFeedback({ type: '', message: '' });
      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        contactNumber: form.contactNumber.trim(),
        address: form.address.trim()
      };

      const response = await fetch(`${API_ENDPOINTS.AUTH}/me`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      const updatedUser = data.user || {};
      setForm((prev) => ({
        ...prev,
        username: updatedUser.username || prev.username,
        email: updatedUser.email || prev.email,
        contactNumber: updatedUser.contactNumber || '',
        address: updatedUser.address || ''
      }));

      auth.updateUser({
        username: updatedUser.username || payload.username,
        email: updatedUser.email || payload.email,
        contactNumber: updatedUser.contactNumber || payload.contactNumber,
        address: updatedUser.address || payload.address
      });

      setFeedback({ type: 'success', message: data.message || 'Profile updated successfully.' });
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Unable to update profile now.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="profile-page-container">
      <nav className="navbar">
        <div className="nav-content">
          <h1>Personal Profile</h1>
          <div className="nav-right">
            <button className="back-btn" onClick={() => navigate('/dashboard')}>Dashboard</button>
          </div>
        </div>
      </nav>

      <div className="profile-card">
        {loading ? <p className="loading-text">Loading profile details...</p> : (
          <form onSubmit={onSubmit} noValidate>
            {feedback.message ? (
              <div className={feedback.type === 'success' ? 'success-message' : 'error-message'}>
                {feedback.message}
              </div>
            ) : null}

            <label htmlFor="username">Name</label>
            <input id="username" name="username" value={form.username} onChange={onFieldChange} />
            {errors.username ? <div className="field-error">{errors.username}</div> : null}

            <label htmlFor="email">Email</label>
            <input id="email" name="email" value={form.email} onChange={onFieldChange} />
            {errors.email ? <div className="field-error">{errors.email}</div> : null}

            <label htmlFor="identityNumber">Identity Number (read-only)</label>
            <input id="identityNumber" name="identityNumber" value={form.identityNumber} readOnly disabled />

            <label htmlFor="contactNumber">Contact Number</label>
            <input id="contactNumber" name="contactNumber" value={form.contactNumber} onChange={onFieldChange} placeholder="+94 77 1234567" />
            {errors.contactNumber ? <div className="field-error">{errors.contactNumber}</div> : null}

            <label htmlFor="address">Address</label>
            <textarea id="address" name="address" value={form.address} onChange={onFieldChange} rows={3} />

            <button type="submit" className="save-btn" disabled={saving || !isDirty}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
