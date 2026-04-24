import { useState, useEffect } from 'react';
import { Search, Calendar, Clock, User, Filter, LogOut, BookOpen, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { tutoriasApi, type Tutoria } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tutorias, setTutorias] = useState<Tutoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchBoard = async () => {
      try {
        setLoading(true);
        const { data } = await tutoriasApi.getMyBoard(user.id);
        setTutorias(data);
      } catch {
        setError('No se pudo cargar el tablero. Verifica que el backend esté corriendo.');
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleFinalize = async (id: number) => {
    try {
      const { data } = await tutoriasApi.finalize(id);
      setTutorias((prev) => prev.map((t) => (t.id === id ? data : t)));
    } catch {
      alert('No tienes permisos para finalizar esta tutoría.');
    }
  };

  const filtered = tutorias.filter((t) =>
    t.materia.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const estadoColor: Record<string, string> = {
    PROGRAMADA: '#6366f1',
    EN_CURSO: '#f59e0b',
    FINALIZADA: '#10b981',
  };

  return (
    <div className="container animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>¡Hola, {user?.fullName ?? 'Usuario'}! 👋</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Rol: <span style={{ color: '#a855f7', fontWeight: 600 }}>{user?.role}</span>
            &nbsp;·&nbsp; Balance:{' '}
            <span style={{ color: '#10b981', fontWeight: 600 }}>
              ${user?.balance?.toFixed(2) ?? '0.00'}
            </span>
          </p>
        </div>
        <button className="btn" onClick={handleLogout}
          style={{ display: 'flex', gap: '0.5rem', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)' }}>
          <LogOut size={18} /> Cerrar sesión
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <BookOpen size={28} color="#a855f7" />
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Tutorías</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 700 }}>{tutorias.length}</p>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <DollarSign size={28} color="#10b981" />
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Balance</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 700 }}>${user?.balance?.toFixed(2) ?? '0.00'}</p>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Calendar size={28} color="#f59e0b" />
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Programadas</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 700 }}>
              {tutorias.filter((t) => t.estado === 'PROGRAMADA').length}
            </p>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '280px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Buscar por materia o descripción..."
            style={{ paddingLeft: '3rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn" style={{ padding: '0.75rem 1.25rem', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)', display: 'flex', gap: '0.5rem' }}>
          <Filter size={18} /> Filtros
        </button>
      </div>

      {/* States */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          Cargando tus tutorías...
        </div>
      )}

      {error && !loading && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)',
          borderRadius: '12px', padding: '2rem', textAlign: 'center', color: '#f87171'
        }}>
          ⚠️ {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid">
            {filtered.map((tutoria) => (
              <div key={tutoria.id} className="glass-card item-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className="item-badge">{tutoria.materia}</span>
                  <span style={{
                    fontSize: '0.8rem', fontWeight: 600, padding: '0.2rem 0.6rem',
                    borderRadius: '9999px', background: `${estadoColor[tutoria.estado] ?? '#64748b'}22`,
                    color: estadoColor[tutoria.estado] ?? '#94a3b8',
                    border: `1px solid ${estadoColor[tutoria.estado] ?? '#64748b'}44`
                  }}>
                    {tutoria.estado}
                  </span>
                </div>

                <h3 style={{ margin: '0.5rem 0' }}>{tutoria.descripcion}</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={15} />
                    <span>Tutor: {tutoria.tutor?.fullName ?? '—'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={15} />
                    <span>{new Date(tutoria.fechaHora).toLocaleDateString('es-CO', { dateStyle: 'medium' })}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={15} />
                    <span>{new Date(tutoria.fechaHora).toLocaleTimeString('es-CO', { timeStyle: 'short' })}</span>
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#10b981', fontWeight: 700, fontSize: '1.1rem' }}>
                    ${tutoria.precio?.toFixed(2)}
                  </span>
                  {user?.role === 'TUTOR' && tutoria.estado !== 'FINALIZADA' && (
                    <button
                      className="btn btn-primary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                      onClick={() => handleFinalize(tutoria.id)}
                    >
                      Finalizar
                    </button>
                  )}
                  {tutoria.meetingLink && (
                    <a
                      href={tutoria.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', textDecoration: 'none' }}
                    >
                      Unirse
                    </a>
                  )}
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
                No tienes tutorías aún. ¡Es hora de empezar!
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
