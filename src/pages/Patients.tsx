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
}

export default function Patients() {
  const [patients, setPatients] = useState<Map<number, Appointment[]>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/appointments?status=approved');
      const appointments = response.data;
      
      // Group appointments by user
      const patientsMap = new Map<number, Appointment[]>();
      appointments.forEach((appointment: Appointment) => {
        const userId = appointment.user.id;
        if (!patientsMap.has(userId)) {
          patientsMap.set(userId, []);
        }
        patientsMap.get(userId)!.push(appointment);
      });
      
      setPatients(patientsMap);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  const patientsArray = Array.from(patients.entries());

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem', color: '#2c3e50' }}>Previously Dealt Patients</h1>

      {patientsArray.length === 0 ? (
        <p style={{ color: '#7f8c8d', padding: '2rem', textAlign: 'center' }}>
          No patients yet
        </p>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {patientsArray.map(([userId, appointments]) => {
            const patient = appointments[0].user;
            return (
              <div
                key={userId}
                style={{
                  backgroundColor: 'white',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  border: '1px solid #ddd'
                }}
              >
                <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>
                  {patient.full_name}
                </h3>
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ margin: '0.5rem 0', color: '#7f8c8d' }}>
                    Email: {patient.email}
                  </p>
                  {patient.phone && (
                    <p style={{ margin: '0.5rem 0', color: '#7f8c8d' }}>
                      Phone: {patient.phone}
                    </p>
                  )}
                  <p style={{ margin: '0.5rem 0', color: '#7f8c8d' }}>
                    Total Appointments: {appointments.length}
                  </p>
                </div>
                <div>
                  <h4 style={{ margin: '1rem 0 0.5rem 0', color: '#2c3e50', fontSize: '1rem' }}>
                    Appointment History:
                  </h4>
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.75rem',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px',
                        borderLeft: '3px solid #3498db'
                      }}
                    >
                      <p style={{ margin: '0.25rem 0', color: '#555' }}>
                        {new Date(appointment.appointment_date).toLocaleString()}
                      </p>
                      {appointment.notes && (
                        <p style={{ margin: '0.25rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>
                          Notes: {appointment.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


