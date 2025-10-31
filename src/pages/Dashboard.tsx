import { useEffect, useState } from 'react';
import api from '../services/api';

interface Appointment {
  id: number;
  user: {
    id: number;
    full_name: string;
    email: string;
    phone?: string;
  };
  appointment_date: string;
  status: string;
  notes?: string;
  rejection_reason?: string;
}

export default function Dashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments');
      const data = response.data;
      setAppointments(data);
      
      setStats({
        pending: data.filter((a: Appointment) => a.status === 'pending').length,
        approved: data.filter((a: Appointment) => a.status === 'approved').length,
        rejected: data.filter((a: Appointment) => a.status === 'rejected').length,
      });
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appointmentId: number) => {
    try {
      await api.post(`/appointments/${appointmentId}/approve`);
      fetchAppointments();
      alert('Appointment approved successfully!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to approve appointment');
    }
  };

  const handleReject = async (appointmentId: number) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      await api.post(`/appointments/${appointmentId}/reject`, {
        rejection_reason: reason,
      });
      fetchAppointments();
      alert('Appointment rejected successfully!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to reject appointment');
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  const pendingAppointments = appointments.filter((a) => a.status === 'pending');

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem', color: '#2c3e50' }}>Dashboard</h1>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          backgroundColor: '#fff',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #f39c12'
        }}>
          <h3 style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9rem' }}>Pending</h3>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 'bold', color: '#f39c12' }}>
            {stats.pending}
          </p>
        </div>
        <div style={{
          backgroundColor: '#fff',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #27ae60'
        }}>
          <h3 style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9rem' }}>Approved</h3>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 'bold', color: '#27ae60' }}>
            {stats.approved}
          </p>
        </div>
        <div style={{
          backgroundColor: '#fff',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #e74c3c'
        }}>
          <h3 style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9rem' }}>Rejected</h3>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 'bold', color: '#e74c3c' }}>
            {stats.rejected}
          </p>
        </div>
      </div>

      {/* Pending Appointments */}
      <h2 style={{ marginBottom: '1rem', color: '#2c3e50' }}>New Bookings</h2>
      {pendingAppointments.length === 0 ? (
        <p style={{ color: '#7f8c8d', padding: '2rem', textAlign: 'center' }}>
          No pending appointments
        </p>
      ) : (
        <div style={{
          display: 'grid',
          gap: '1rem'
        }}>
          {pendingAppointments.map((appointment) => (
            <div
              key={appointment.id}
              style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: '1px solid #ddd'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#2c3e50' }}>{appointment.user.full_name}</h3>
                  <p style={{ margin: '0.5rem 0', color: '#7f8c8d' }}>
                    Email: {appointment.user.email}
                  </p>
                  {appointment.user.phone && (
                    <p style={{ margin: '0.5rem 0', color: '#7f8c8d' }}>
                      Phone: {appointment.user.phone}
                    </p>
                  )}
                  <p style={{ margin: '0.5rem 0', color: '#7f8c8d' }}>
                    Date: {new Date(appointment.appointment_date).toLocaleString()}
                  </p>
                  {appointment.notes && (
                    <p style={{ margin: '0.5rem 0', color: '#555' }}>
                      Notes: {appointment.notes}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => handleApprove(appointment.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#27ae60',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(appointment.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


