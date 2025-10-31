import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
  reschedule_requested_date?: string;
  reschedule_reason?: string;
  reschedule_status?: string | null;
  created_at: string;
}

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [reschedulingAppointment, setReschedulingAppointment] = useState<number | null>(null);
  const [newAppointmentDate, setNewAppointmentDate] = useState<Date | null>(null);
  const [newAppointmentTime, setNewAppointmentTime] = useState<string>('09:00');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments');
      setAppointments(response.data);
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
      toast.success('Appointment approved successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to approve appointment');
    }
  };

  const handleReject = async (appointmentId: number) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason || reason.trim() === '') {
      toast.error('Rejection reason is required');
      return;
    }

    try {
      await api.post(`/appointments/${appointmentId}/reject`, {
        rejection_reason: reason,
      });
      fetchAppointments();
      toast.success('Appointment rejected successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reject appointment');
    }
  };

  const handleRescheduleClick = (appointment: Appointment) => {
    setReschedulingAppointment(appointment.id);
    const currentDate = new Date(appointment.appointment_date);
    setNewAppointmentDate(currentDate);
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');
    setNewAppointmentTime(`${hours}:${minutes}`);
  };

  const handleRescheduleSubmit = async (appointmentId: number) => {
    if (!newAppointmentDate) {
      toast.error('Please select a date');
      return;
    }

    // Combine date and time
    const [hours, minutes] = newAppointmentTime.split(':');
    const combinedDate = new Date(newAppointmentDate);
    combinedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Check if the new date is in the future
    if (combinedDate <= new Date()) {
      toast.error('Please select a date and time in the future');
      return;
    }

    setRescheduleLoading(true);
    try {
      await api.post(`/appointments/${appointmentId}/reschedule`, {
        appointment_date: combinedDate.toISOString()
      });
      toast.success('Appointment rescheduled successfully');
      setReschedulingAppointment(null);
      setNewAppointmentDate(null);
      setNewAppointmentTime('09:00');
      fetchAppointments();
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.response?.data?.errors?.[0] || 'Failed to reschedule appointment');
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handleApproveRescheduleRequest = async (appointmentId: number) => {
    try {
      await api.post(`/appointments/${appointmentId}/approve_reschedule_request`);
      toast.success('Reschedule request approved. Appointment status changed to pending.');
      fetchAppointments();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to approve reschedule request');
    }
  };

  const handleRejectRescheduleRequest = async (appointmentId: number) => {
    try {
      await api.post(`/appointments/${appointmentId}/reject_reschedule_request`);
      toast.success('Reschedule request rejected');
      fetchAppointments();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reject reschedule request');
    }
  };

  const canReschedule = (appointment: Appointment) => {
    // Doctor can directly reschedule if appointment is pending and not in the past
    return appointment.status === 'pending' && 
           new Date(appointment.appointment_date) > new Date();
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  const filteredAppointments = filter === 'all'
    ? appointments
    : appointments.filter((a) => a.status === filter);

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem', color: '#2c3e50' }}>All Appointments</h1>

      {/* Filter */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: filter === 'all' ? '#3498db' : '#ecf0f1',
            color: filter === 'all' ? 'white' : '#2c3e50',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          All
        </button>
        <button
          onClick={() => setFilter('pending')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: filter === 'pending' ? '#f39c12' : '#ecf0f1',
            color: filter === 'pending' ? 'white' : '#2c3e50',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('approved')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: filter === 'approved' ? '#27ae60' : '#ecf0f1',
            color: filter === 'approved' ? 'white' : '#2c3e50',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Approved
        </button>
        <button
          onClick={() => setFilter('rejected')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: filter === 'rejected' ? '#e74c3c' : '#ecf0f1',
            color: filter === 'rejected' ? 'white' : '#2c3e50',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Rejected
        </button>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <p style={{ color: '#7f8c8d', padding: '2rem', textAlign: 'center' }}>
          No appointments found
        </p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filteredAppointments.map((appointment) => (
            <div
              key={appointment.id}
              style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                borderLeft: `4px solid ${
                  appointment.status === 'approved' ? '#27ae60' :
                  appointment.status === 'rejected' ? '#e74c3c' : '#f39c12'
                }`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
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
                  <p style={{ margin: '0.5rem 0' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      backgroundColor:
                        appointment.status === 'approved' ? '#d4edda' :
                        appointment.status === 'rejected' ? '#f8d7da' : '#fff3cd',
                      color:
                        appointment.status === 'approved' ? '#155724' :
                        appointment.status === 'rejected' ? '#721c24' : '#856404'
                    }}>
                      {appointment.status.toUpperCase()}
                    </span>
                  </p>
                  {appointment.notes && (
                    <p style={{ margin: '0.5rem 0', color: '#555' }}>
                      Notes: {appointment.notes}
                    </p>
                  )}
                  {appointment.rejection_reason && (
                    <p style={{ margin: '0.5rem 0', color: '#e74c3c' }}>
                      Rejection Reason: {appointment.rejection_reason}
                    </p>
                  )}
                  {appointment.reschedule_status === 'pending' && (
                    <div style={{ 
                      margin: '0.5rem 0', 
                      padding: '0.75rem', 
                      backgroundColor: '#fff3cd', 
                      borderRadius: '4px',
                      border: '1px solid #f39c12'
                    }}>
                      <p style={{ margin: '0 0 0.5rem 0', color: '#856404', fontWeight: 'bold' }}>
                        ⏳ Reschedule Request Pending
                      </p>
                      {appointment.reschedule_requested_date && (
                        <p style={{ margin: '0.25rem 0', color: '#856404' }}>
                          Requested New Date: {new Date(appointment.reschedule_requested_date).toLocaleString()}
                        </p>
                      )}
                      {appointment.reschedule_reason && (
                        <p style={{ margin: '0.25rem 0', color: '#856404' }}>
                          Reason: {appointment.reschedule_reason}
                        </p>
                      )}
                    </div>
                  )}
                  <p style={{ margin: '0.5rem 0', color: '#95a5a6', fontSize: '0.85rem' }}>
                    Booked: {new Date(appointment.created_at).toLocaleString()}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                  {appointment.reschedule_status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApproveRescheduleRequest(appointment.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#27ae60',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        Approve Reschedule
                      </button>
                      <button
                        onClick={() => handleRejectRescheduleRequest(appointment.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        Reject Reschedule
                      </button>
                    </>
                  )}
                  {canReschedule(appointment) && (
                    <button
                      onClick={() => handleRescheduleClick(appointment)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      Reschedule
                    </button>
                  )}
                  {appointment.status === 'pending' && appointment.reschedule_status !== 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(appointment.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#27ae60',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.9rem'
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
                          cursor: 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>

              {reschedulingAppointment === appointment.id && (
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#f8f9fa'
                }}>
                  <h4 style={{ marginTop: 0, color: '#2c3e50' }}>Reschedule Appointment</h4>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2c3e50' }}>
                      Select New Date
                    </label>
                    <div style={{ width: '100%' }}>
                      <DatePicker
                        selected={newAppointmentDate}
                        onChange={(date: Date | null) => setNewAppointmentDate(date)}
                        minDate={new Date()}
                        dateFormat="MMMM d, yyyy"
                        wrapperClassName="date-picker-wrapper"
                        className="date-picker-input"
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2c3e50' }}>
                      Select New Time
                    </label>
                    <input
                      type="time"
                      value={newAppointmentTime}
                      onChange={(e) => setNewAppointmentTime(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '1rem',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleRescheduleSubmit(appointment.id)}
                      disabled={rescheduleLoading}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: rescheduleLoading ? 'not-allowed' : 'pointer',
                        fontSize: '1rem',
                        opacity: rescheduleLoading ? 0.6 : 1
                      }}
                    >
                      {rescheduleLoading ? 'Rescheduling...' : 'Confirm Reschedule'}
                    </button>
                    <button
                      onClick={() => {
                        setReschedulingAppointment(null);
                        setNewAppointmentDate(null);
                        setNewAppointmentTime('09:00');
                      }}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#95a5a6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '1rem'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

