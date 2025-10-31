import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Profile() {
  const { user } = useAuth();
  const [doctorData, setDoctorData] = useState({
    specialization: '',
    description: '',
    qualifications: '',
    experience_years: 0,
    license_number: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  const fetchDoctorProfile = async () => {
    if (!user) return;
    
    // First fetch user to check if doctor exists
    try {
      const userResponse = await api.get('/auth/me');
      const currentUser = userResponse.data.user;
      
      if (!currentUser.doctor) {
        // No doctor profile yet
        return;
      }
      
      const response = await api.get(`/doctors/${currentUser.doctor.id}`);
      const doctor = response.data;
      setDoctorData({
        specialization: doctor.specialization || '',
        description: doctor.description || '',
        qualifications: doctor.qualifications || '',
        experience_years: doctor.experience_years || 0,
        license_number: doctor.license_number || '',
      });
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.doctor) return;

    setLoading(true);
    setMessage('');
    try {
      await api.patch(`/doctors/${user.doctor.id}`, {
        doctor: doctorData,
      });
      setMessage('Profile updated successfully!');
    } catch (error: any) {
      setMessage(error.response?.data?.errors?.[0] || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Please login to view your profile.</p>
      </div>
    );
  }

  if (!user.doctor) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ color: '#2c3e50' }}>No Doctor Profile Found</h2>
        <p style={{ color: '#7f8c8d', marginBottom: '2rem' }}>
          You need to register as a doctor to access the doctor dashboard.
        </p>
        <button
          onClick={() => window.location.href = '/register-doctor'}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Register as Doctor
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', color: '#2c3e50' }}>My Profile</h1>

      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>Personal Information</h3>
        <p style={{ margin: '0.5rem 0', color: '#7f8c8d' }}>Name: {user.full_name}</p>
        <p style={{ margin: '0.5rem 0', color: '#7f8c8d' }}>Email: {user.email}</p>
        {user.phone && (
          <p style={{ margin: '0.5rem 0', color: '#7f8c8d' }}>Phone: {user.phone}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 1.5rem 0', color: '#2c3e50' }}>Doctor Information</h3>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2c3e50' }}>
            Specialization *
          </label>
          <input
            type="text"
            value={doctorData.specialization}
            onChange={(e) => setDoctorData({ ...doctorData, specialization: e.target.value })}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2c3e50' }}>
            Description
          </label>
          <textarea
            value={doctorData.description}
            onChange={(e) => setDoctorData({ ...doctorData, description: e.target.value })}
            rows={4}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2c3e50' }}>
            Qualifications
          </label>
          <input
            type="text"
            value={doctorData.qualifications}
            onChange={(e) => setDoctorData({ ...doctorData, qualifications: e.target.value })}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2c3e50' }}>
            Experience (Years)
          </label>
          <input
            type="number"
            value={doctorData.experience_years}
            onChange={(e) => setDoctorData({ ...doctorData, experience_years: parseInt(e.target.value) || 0 })}
            min="0"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2c3e50' }}>
            License Number
          </label>
          <input
            type="text"
            value={doctorData.license_number}
            onChange={(e) => setDoctorData({ ...doctorData, license_number: e.target.value })}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          />
        </div>

        {message && (
          <div style={{
            padding: '1rem',
            marginBottom: '1rem',
            backgroundColor: message.includes('success') ? '#d4edda' : '#f8d7da',
            color: message.includes('success') ? '#155724' : '#721c24',
            borderRadius: '4px'
          }}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
}

