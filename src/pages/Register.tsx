import { useState } from 'react';
import { UserPlus, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'TUTOR'>('STUDENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Register user
      await authApi.register({ fullName, email, password, role });
      // 2. Auto-login after registration
      const { data } = await authApi.login({ email, password });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Error al registrar. Puede que el email ya esté en uso.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in">
      <div className="auth-container glass-card" style={{ maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <UserPlus size={48} color="#a855f7" style={{ marginBottom: '1rem' }} />
          <h2>Crear cuenta</h2>
          <p style={{ color: 'var(--text-muted)' }}>Únete a la comunidad SkillVibes</p>
        </div>

        {error && (
          <div style={{
            display: 'flex', gap: '0.75rem', alignItems: 'center',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)',
            borderRadius: '8px', padding: '0.875rem 1rem', marginBottom: '1.5rem', color: '#f87171'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">Nombre completo</label>
            <input
              type="text"
              id="fullName"
              className="form-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tu nombre completo"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email</label>
            <input
              type="email"
              id="reg-email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Contraseña</label>
            <input
              type="password"
              id="reg-password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label className="form-label">¿Cómo participarás?</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{
                flex: 1, padding: '0.75rem', borderRadius: '8px', cursor: 'pointer',
                border: `2px solid ${role === 'STUDENT' ? '#a855f7' : 'var(--border-color)'}`,
                background: role === 'STUDENT' ? 'rgba(168,85,247,0.1)' : 'transparent',
                textAlign: 'center', transition: 'all 0.2s ease'
              }}>
                <input
                  type="radio" value="STUDENT" name="role"
                  checked={role === 'STUDENT'}
                  onChange={() => setRole('STUDENT')}
                  style={{ display: 'none' }}
                />
                🎓 Estudiante
              </label>
              <label style={{
                flex: 1, padding: '0.75rem', borderRadius: '8px', cursor: 'pointer',
                border: `2px solid ${role === 'TUTOR' ? '#a855f7' : 'var(--border-color)'}`,
                background: role === 'TUTOR' ? 'rgba(168,85,247,0.1)' : 'transparent',
                textAlign: 'center', transition: 'all 0.2s ease'
              }}>
                <input
                  type="radio" value="TUTOR" name="role"
                  checked={role === 'TUTOR'}
                  onChange={() => setRole('TUTOR')}
                  style={{ display: 'none' }}
                />
                👨‍🏫 Tutor
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Creando cuenta...' : 'Registrarme'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: '#a855f7', textDecoration: 'none' }}>Iniciar sesión</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
