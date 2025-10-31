import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div style={{
      width: '250px',
      height: '100vh',
      backgroundColor: '#2c3e50',
      color: 'white',
      paddingTop: '2rem',
      paddingBottom: '1rem',
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      zIndex: 1000,
      boxSizing: 'border-box'
    }}>
      <div style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Doctor Portal</h2>
        {user && (
          <p style={{ marginTop: '0.5rem', color: '#95a5a6', fontSize: '0.9rem' }}>
            {user.full_name}
          </p>
        )}
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <Link
          to="/dashboard"
          style={{
            display: 'block',
            padding: '1rem 1.5rem',
            color: isActive('/dashboard') ? '#3498db' : 'white',
            textDecoration: 'none',
            backgroundColor: isActive('/dashboard') ? '#34495e' : 'transparent',
            borderLeft: isActive('/dashboard') ? '4px solid #3498db' : '4px solid transparent'
          }}
        >
          Dashboard
        </Link>
        <Link
          to="/appointments"
          style={{
            display: 'block',
            padding: '1rem 1.5rem',
            color: isActive('/appointments') ? '#3498db' : 'white',
            textDecoration: 'none',
            backgroundColor: isActive('/appointments') ? '#34495e' : 'transparent',
            borderLeft: isActive('/appointments') ? '4px solid #3498db' : '4px solid transparent'
          }}
        >
          New Bookings
        </Link>
        <Link
          to="/patients"
          style={{
            display: 'block',
            padding: '1rem 1.5rem',
            color: isActive('/patients') ? '#3498db' : 'white',
            textDecoration: 'none',
            backgroundColor: isActive('/patients') ? '#34495e' : 'transparent',
            borderLeft: isActive('/patients') ? '4px solid #3498db' : '4px solid transparent'
          }}
        >
          Previous Patients
        </Link>
        <Link
          to="/profile"
          style={{
            display: 'block',
            padding: '1rem 1.5rem',
            color: isActive('/profile') ? '#3498db' : 'white',
            textDecoration: 'none',
            backgroundColor: isActive('/profile') ? '#34495e' : 'transparent',
            borderLeft: isActive('/profile') ? '4px solid #3498db' : '4px solid transparent'
          }}
        >
          My Profile
        </Link>
      </nav>

      <div style={{ 
        padding: '1rem 1.5rem',
        marginTop: 'auto',
        borderTop: '1px solid #34495e',
        flexShrink: 0
      }}>
        <button
          onClick={logout}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c0392b'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e74c3c'}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

