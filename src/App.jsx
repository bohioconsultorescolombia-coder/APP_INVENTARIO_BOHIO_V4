import React, { useState, useEffect } from 'react';
import { Camera, Plus, Trash2, Printer, Home, FileText, Zap, Droplets, Flame, CheckCircle, Building, Mic, MicOff, User as UserIcon, X, Image as ImageIcon, LogIn, LogOut, UserPlus, Mail, Key, ChevronDown, ChevronUp } from 'lucide-react';
import './App.css';
import { supabase } from './supabase';

const LOGO_URL = "https://i.postimg.cc/k47By9mJ/logo-bohio.jpg";

const VoiceInput = ({ value, onChange, placeholder, type = 'text', rows = 4, className = '', min, style }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState(null);

  const toggleListen = () => {
    if (isListening && recognitionInstance) {
      recognitionInstance.stop();
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta entrada por voz.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-CO';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const newValue = value ? `${value} ${transcript}` : transcript;
      onChange(newValue);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    setRecognitionInstance(recognition);
    recognition.start();
  };

  return (
    <div className={`voice-input-container ${className} no-print`} style={style}>
      {type === 'textarea' ? (
        <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input type={type} min={min} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      )}
      <button type="button" className={`mic-button ${isListening ? 'listening' : ''}`} onClick={toggleListen}>
        {isListening ? <MicOff size={16} /> : <Mic size={16} />}
      </button>
    </div>
  );
};

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      alert("Error de acceso: " + (error.error_description || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ background: '#fee2e2', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Building size={32} color="var(--primary)" />
          </div>
          <h1 style={{ color: '#1e293b', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Bienvenido</h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '0.95rem' }}>Ingresa tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleAuth} style={{ textAlign: 'left' }}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              <Mail size={16} /> Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="admin@bohio.com"
              style={{ padding: '0.875rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              <Key size={16} /> Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{ padding: '0.875rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', height: '54px', borderRadius: '12px', fontSize: '1rem' }} disabled={loading}>
            {loading ? 'Verificando...' : 'INICIAR SESIÓN'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.5' }}>
            Acceso restringido. <br />
            Inventario Digital Bohío © 2026
          </p>
        </div>
      </div>
    </div>
  );
};

const CameraModal = ({ onCapture, onClose }) => {
  const [stream, setStream] = useState(null);
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    async function startCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false
        });
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch (err) {
        alert("No se pudo acceder a la cámara: " + err.message);
        onClose();
      }
    }
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');
    onCapture(dataUrl);
    stop();
  };

  const stop = () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    onClose();
  };

  return (
    <div className="camera-modal no-print">
      <div className="camera-content">
        <video ref={videoRef} autoPlay playsInline />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <div className="camera-controls">
          <button className="btn-primary" onClick={capture}><Camera /> Capturar</button>
          <button className="btn-danger" onClick={stop}><X /> Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [session, setSession] = useState(null);
  const [cameraConfig, setCameraConfig] = useState(null);
  const [savedProperties, setSavedProperties] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedMeter, setExpandedMeter] = useState('luz');
  const [activeSpaceId, setActiveSpaceId] = useState(null);
  const [activeElementId, setActiveElementId] = useState(null);
  const [activePropertyId, setActivePropertyId] = useState(null);
  const [expandedSections, setExpandedSections] = useState({ ficha: true, fachada: false, partes: false });
  const [printMode, setPrintMode] = useState('BOTH'); // 'PROPIETARIO', 'ARRENDATARIO', 'BOTH'

  const toggleSection = (sec) => setExpandedSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  const toggleMeter = (tipo) => setExpandedMeter(expandedMeter === tipo ? null : tipo);
  const toggleSpace = (id) => {
    setActiveSpaceId(activeSpaceId === id ? null : id);
    setActiveElementId(null); // Reset element when changing space
  };
  const toggleElement = (id) => setActiveElementId(activeElementId === id ? null : id);

  const [data, setData] = useState({
    contrato: '', propiedad: '', arrendador: '', arrendadorTel: '', arrendatario: '', arrendatarioTel: '',
    direccion: '', fechaRecibo: '', fechaEntrega: '', tipoInmueble: '', telefonoGral: '',
    imagenPropiedad: '',
    contadores: {
      luz: { contrato: '', contador: '', lectura: '', imagenes: [] },
      agua: { contrato: '', contador: '', lectura: '', imagenes: [] },
      gas: { contrato: '', contador: '', lectura: '', imagenes: [] },
    },
    espacios: []
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if (session) fetchProperties();
  }, [session]);

  const fetchProperties = async () => {
    const { data: props, error } = await supabase
      .from('propiedades')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error('Error fetching:', error);
    else setSavedProperties(props);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const compressImage = async (base64Str, maxWidth = 600) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.5));
      };
    });
  };

  const uploadImage = async (fileOrDataUrl, path) => {
    let base64;
    if (typeof fileOrDataUrl === 'string') {
      base64 = fileOrDataUrl;
    } else {
      base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(fileOrDataUrl);
      });
    }

    // Comprimir antes de enviar si es necesario
    const compressedBase64 = await compressImage(base64);

    const payload = {
      folderId: import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID,
      propiedad: data.propiedad || "Sin_Nombre",
      seccion: path,
      filename: `foto_${Date.now()}.jpg`,
      image: compressedBase64
    };

    console.log("🚀 Enviando a Google Drive...");

    try {
      await fetch(import.meta.env.VITE_GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.warn("Fallo sincronización individual:", e);
    }

    return compressedBase64;
  };

  const handleProcessImage = async (fileOrUrl, path, callback) => {
    try {
      const publicUrl = await uploadImage(fileOrUrl, path);
      callback(publicUrl);
    } catch (err) {
      console.error(err);
      alert("Error subiendo imagen: " + err.message);
    }
  };

  const handleSave = async () => {
    const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
    if (!scriptUrl || scriptUrl === 'undefined') {
      return alert('⚠️ ERROR DE CONFIGURACIÓN:\nNo se detectó la URL de Google Script en Vercel.\n\nPor favor, ve al panel de Vercel > Settings > Environment Variables y añade VITE_GOOGLE_SCRIPT_URL.');
    }

    if (!data.propiedad) return alert('Dale un nombre a la propiedad antes de guardar.');
    setIsSaving(true);
    try {
      const payload = {
        user_id: session.user.id,
        nombre: data.propiedad,
        direccion: data.direccion,
        contrato: data.contrato,
        tipo_inmueble: data.tipoInmueble,
        telefono: data.telefonoGral,
        data: data
      };

      let error;
      if (activePropertyId) {
        const { error: err } = await supabase.from('propiedades').update(payload).eq('id', activePropertyId);
        error = err;
      } else {
        const { data: newProp, error: err } = await supabase.from('propiedades').insert(payload).select();
        error = err;
        if (newProp) setActivePropertyId(newProp[0].id);
      }

      if (error) throw error;

      console.log("📂 Sincronizando con Google Drive...");

      // Sanitización para éxito en móviles y creación de PDF en carpeta 'general'
      const sanitizeData = (obj) => {
        const copy = JSON.parse(JSON.stringify(obj));
        if (copy.imagenPropiedad) copy.imagenPropiedad = "SENT";
        if (copy.contadores) {
          Object.keys(copy.contadores).forEach(k => {
            copy.contadores[k].imagenes = copy.contadores[k].imagenes.map(() => "SENT");
          });
        }
        if (copy.espacios) {
          copy.espacios.forEach(sp => {
            sp.elementos.forEach(el => {
              el.imagenes = el.imagenes.map(() => "SENT");
            });
          });
        }
        return copy;
      };

      const cleanData = sanitizeData(data);

      await fetch(import.meta.env.VITE_GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          action: "save_data",
          folderId: import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID,
          propiedad: data.propiedad,
          content: cleanData
        })
      });

      alert('✅ ¡Guardado Exitoso!\n\n1. Supabase: Sincronizado\n2. Google Drive: Estructura de carpetas lista.\n3. PDF: Generándose en la carpeta "general".');
      fetchProperties();
    } catch (error) {
      alert('Error al guardar: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const loadProperty = (prop) => {
    setData(prop.data);
    setActivePropertyId(prop.id);
    setActiveSpaceId(null);
    setExpandedMeter(null);
  };

  const handleDeleteProperty = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta propiedad? Esta acción no se puede deshacer en la base de datos.")) return;

    try {
      const { error } = await supabase.from('propiedades').delete().eq('id', id);
      if (error) throw error;

      if (activePropertyId === id) createNew();
      fetchProperties();
      alert("Propiedad eliminada con éxito de la base de datos.");
    } catch (error) {
      alert("Error al eliminar: " + error.message);
    }
  };

  const createNew = () => {
    setActivePropertyId(null);
    setActiveSpaceId(null);
    setExpandedMeter('luz');
    setData({
      contrato: '', propiedad: '', arrendador: '', arrendadorTel: '', arrendatario: '', arrendatarioTel: '',
      direccion: '', fechaRecibo: '', fechaEntrega: '', tipoInmueble: '', telefonoGral: '',
      imagenPropiedad: '',
      contadores: {
        luz: { contrato: '', contador: '', lectura: '', imagenes: [] },
        agua: { contrato: '', contador: '', lectura: '', imagenes: [] },
        gas: { contrato: '', contador: '', lectura: '', imagenes: [] },
      },
      espacios: []
    });
  };

  const handleDataChange = (field, value) => setData(prev => ({ ...prev, [field]: value }));
  const handleContadorChange = (tipo, field, value) => {
    setData(prev => ({ ...prev, contadores: { ...prev.contadores, [tipo]: { ...prev.contadores[tipo], [field]: value } } }));
  };

  const addFotoContador = (tipo, fotoUrl) => {
    setData(prev => ({
      ...prev,
      contadores: {
        ...prev.contadores,
        [tipo]: { ...prev.contadores[tipo], imagenes: [...prev.contadores[tipo].imagenes, fotoUrl] }
      }
    }));
  };

  const removeFotoContador = (tipo, index) => {
    setData(prev => ({
      ...prev,
      contadores: {
        ...prev.contadores,
        [tipo]: {
          ...prev.contadores[tipo],
          imagenes: prev.contadores[tipo].imagenes.filter((_, i) => i !== index)
        }
      }
    }));
  };

  const addEspacio = () => {
    const newId = Date.now();
    setData(prev => ({
      ...prev,
      espacios: [...prev.espacios, { id: newId, nombre: '', descripcion: '', elementos: [] }]
    }));
    setActiveSpaceId(newId);
    setActiveElementId(null);
  };

  const updateEspacio = (id, field, value) => {
    setData(prev => ({ ...prev, espacios: prev.espacios.map(e => e.id === id ? { ...e, [field]: value } : e) }));
  };

  const addElemento = (espacioId) => {
    const newElId = Date.now();
    setData(prev => ({
      ...prev,
      espacios: prev.espacios.map(e => e.id === espacioId ? {
        ...e, elementos: [...e.elementos, { id: newElId, nombre: '', cantidad: 1, imagenes: [], estado: 'BUENO', descripcion: '' }]
      } : e)
    }));
    setActiveElementId(newElId);
  };

  const updateElemento = (espacioId, elementoId, field, value) => {
    setData(prev => ({
      ...prev,
      espacios: prev.espacios.map(e => e.id === espacioId ? {
        ...e, elementos: e.elementos.map(el => el.id === elementoId ? { ...el, [field]: value } : el)
      } : e)
    }));
  };

  const addFotoElemento = (espacioId, elementoId, fotoUrl) => {
    setData(prev => ({
      ...prev,
      espacios: prev.espacios.map(e => e.id === espacioId ? {
        ...e, elementos: e.elementos.map(el => el.id === elementoId ? { ...el, imagenes: [...el.imagenes, fotoUrl] } : el)
      } : e)
    }));
  };

  const InventarioDocument = ({ type }) => (
    <div className="pdf-page">
      <div className="print-header">
        <h1>INVENTARIO INMUEBLE</h1>
        <p style={{ fontWeight: '800', fontSize: '12pt', color: '#e31e24', marginBottom: '4px' }}>
          BOHIO CONSULTORES INMOBILIARIOS SAS - NIT 900 479883-8
        </p>
        <p style={{ fontWeight: '700', fontSize: '10pt', letterSpacing: '2px', color: '#555' }}>
          ACTA ORIGINAL: {type === 'ARRENDADOR' ? 'PROPIETARIO' : 'ARRENDATARIO'}
        </p>
      </div>

      <table className="print-table">
        <tbody>
          <tr>
            <td colSpan="2" style={{ background: '#f9f9f9' }}><strong>INFORMACIÓN DE LA PROPIEDAD</strong></td>
          </tr>
          <tr>
            <td style={{ width: '50%' }}><strong>PROPIEDAD:</strong> {data.propiedad}</td>
            <td style={{ width: '50%' }}><strong>CONTRATO N°:</strong> {data.contrato}</td>
          </tr>
          <tr>
            <td colSpan="2"><strong>DIRECCIÓN:</strong> {data.direccion}</td>
          </tr>
          <tr>
            <td><strong>TIPO DE INMUEBLE:</strong> {data.tipoInmueble}</td>
            <td><strong>TELÉFONO PROPIEDAD:</strong> {data.telefonoGral}</td>
          </tr>
          <tr>
            <td><strong>FECHA RECIBO:</strong> {data.fechaRecibo}</td>
            <td><strong>FECHA ENTREGA:</strong> {data.fechaEntrega}</td>
          </tr>
          <tr>
            <td colSpan="2" style={{ background: '#f9f9f9' }}>
              <strong>DATOS DEL {type === 'ARRENDADOR' ? 'PROPIETARIO' : 'ARRENDATARIO'}</strong>
            </td>
          </tr>
          <tr>
            <td><strong>NOMBRE:</strong> {type === 'ARRENDADOR' ? data.arrendador : data.arrendatario}</td>
            <td><strong>TELÉFONO DE CONTACTO:</strong> {type === 'ARRENDADOR' ? data.arrendadorTel : data.arrendatarioTel}</td>
          </tr>
        </tbody>
      </table>

      {['luz', 'agua', 'gas'].map(tipo => (
        <table key={tipo} className="print-table">
          <thead>
            <tr>
              <th style={{ background: '#f8fafc', color: '#1e293b', fontWeight: '900', fontSize: '11pt', border: '1px solid #000', letterSpacing: '1px', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>MEDIDOR {tipo.toUpperCase()}</th>
              <th>N° CONTRATO</th>
              <th>N° CONTADOR</th>
              <th>LECTURA</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ height: '35px', textAlign: 'center', fontSize: '8pt', color: '#999' }}>(Espacio para Notas)</td>
              <td>{data.contadores[tipo].contrato}</td>
              <td>{data.contadores[tipo].contador}</td>
              <td>{data.contadores[tipo].lectura}</td>
            </tr>
          </tbody>
        </table>
      ))}

      <div className="section-title">DETALLE DE INVENTARIO POR ZONAS</div>
      {data.espacios.length > 0 ? data.espacios.map(espacio => (
        <div key={espacio.id} style={{ marginBottom: '1.5rem', breakInside: 'avoid' }}>
          <table className="print-table" style={{ marginBottom: '0' }}>
            <thead>
              <tr>
                <th style={{ background: 'transparent', color: '#000', border: '1px solid #000', width: '30%' }}>ZONA / ESPACIO</th>
                <th style={{ background: '#f8fafc', color: '#1e293b' }}>ESTADO GENERAL Y DESCRIPCIÓN DE LA ZONA</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: '800', fontSize: '11pt', verticalAlign: 'top' }}>{espacio.nombre || 'Sin nombre'}</td>
                <td style={{ fontSize: '9pt', color: '#334155' }}>{espacio.descripcion || 'Sin descripción general registrada.'}</td>
              </tr>
            </tbody>
          </table>
          
          <table className="print-table">
            <thead>
              <tr>
                <th style={{ width: '40%', background: '#f1f5f9', fontSize: '8pt' }}>ELEMENTO</th>
                <th style={{ width: '10%', background: '#f1f5f9', fontSize: '8pt', textAlign: 'center' }}>CANT.</th>
                <th style={{ width: '15%', background: '#f1f5f9', fontSize: '8pt' }}>ESTADO</th>
                <th style={{ width: '35%', background: '#f1f5f9', fontSize: '8pt' }}>DETALLES ESPECÍFICOS DEL ELEMENTO</th>
              </tr>
            </thead>
            <tbody>
              {espacio.elementos.length > 0 ? espacio.elementos.map(el => (
                <tr key={el.id}>
                  <td style={{ fontWeight: '600' }}>{el.nombre}</td>
                  <td style={{ textAlign: 'center' }}>{el.cantidad}</td>
                  <td style={{ fontWeight: '700', color: el.estado === 'MALO' ? '#e31e24' : 'inherit' }}>{el.estado}</td>
                  <td style={{ fontSize: '8.5pt' }}>{el.descripcion || '-'}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: '#94a3b8', fontSize: '8pt', fontStyle: 'italic' }}>
                    No se registraron elementos detallados en esta zona.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )) : (
        <div style={{ textAlign: 'center', padding: '2rem', border: '1px solid #eee', color: '#94a3b8' }}>
          No hay espacios registrados en este inventario.
        </div>
      )}

      <div style={{ marginTop: '2rem', fontSize: '8pt', color: '#444', border: '1px solid #ddd', padding: '10px' }}>
        <p><strong>Nota 1:</strong> Registro fotográfico obligatorio solo para zonas en mal estado o por ausencia del propietario.</p>
        <p><strong>Nota 2:</strong> Los arrendatarios se comprometen a conservar el inmueble en el mismo estado recibido, salvo deterioro natural por uso adecuado.</p>
        <p style={{ marginTop: '0.5rem' }}>Acepto y firmo en conformidad el presente inventario que forma parte integral del contrato de arrendamiento.</p>
      </div>

      <div style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', breakInside: 'avoid' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ borderBottom: '2px solid #000', marginBottom: '8px', minHeight: '40px' }}></div>
          <p style={{ fontSize: '8.5pt', fontWeight: '700' }}>
            {type === 'ARRENDADOR' ? (data.arrendador.toUpperCase() || '____________________') : (data.arrendatario.toUpperCase() || '____________________')}
          </p>
          <p style={{ fontSize: '8pt' }}>FIRMA {type === 'ARRENDADOR' ? 'PROPIETARIO' : 'ARRENDATARIO'}</p>
          <p style={{ fontSize: '8pt' }}>C.C. ____________________</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ borderBottom: '2px solid #000', marginBottom: '8px', minHeight: '40px' }}></div>
          <p style={{ fontSize: '8.5pt', fontWeight: '800' }}>INVENTARIO INMUEBLE, BOHIO CONSULTORES INMOBILIARIOS SAS NIT-900479883-8</p>
        </div>
      </div>
    </div>
  );

  if (!session) return <Auth />;

  return (
    <div className="main-layout">
      {/* SIDEBAR DE PROPIEDADES */}
      <aside className="sidebar no-print">
        <div className="sidebar-header">
          <Building size={20} />
          <span style={{ flex: 1 }}>MIS PROPIEDADES</span>
        </div>

        {/* Info de Usuario y Cerrar Sesión */}
        <div className="user-profile-sidebar">
          <div className="user-info">
            <UserIcon size={16} />
            <span>{session.user.email}</span>
          </div>
          <button className="btn-logout-sidebar" onClick={handleLogout}>
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>

        <button className="btn-new-prop" onClick={createNew}>+ NUEVA PROPIEDAD</button>
        <div className="prop-list">
          {savedProperties.map(p => (
            <div key={p.id} className={`prop-item ${activePropertyId === p.id ? 'active' : ''}`} onClick={() => loadProperty(p)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="prop-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nombre}</p>
                <p className="prop-info" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.direccion || 'Sin dirección'}</p>
              </div>
              <button
                className="btn-delete-prop"
                onClick={(e) => handleDeleteProperty(e, p.id)}
                title="Eliminar Propiedad"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {savedProperties.length === 0 && <p style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.8rem' }}>No hay propiedades guardadas.</p>}
        </div>

        <div className="sidebar-footer">
          <button className="btn-save-sidebar" onClick={handleSave} disabled={isSaving}>
            <FileText size={20} /> {isSaving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
          </button>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
            <p style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700', marginBottom: '0' }}>OPCIONES DE IMPRESIÓN:</p>
            <button className="btn-print-sidebar" onClick={() => { setPrintMode('PROPIETARIO'); setTimeout(() => window.print(), 100); }}>
              <UserIcon size={16} /> ACTA PROPIETARIO
            </button>
            <button className="btn-print-sidebar" onClick={() => { setPrintMode('ARRENDATARIO'); setTimeout(() => window.print(), 100); }}>
              <UserIcon size={16} /> ACTA ARRENDATARIO
            </button>
            <button className="btn-print-sidebar" onClick={() => { setPrintMode('BOTH'); setTimeout(() => window.print(), 100); }} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569' }}>
              <Printer size={16} /> AMBAS ACTAS
            </button>
          </div>
        </div>
      </aside>

      <div className="app-container">
        <div className="no-print">
          <header style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <button className="btn-logout-mobile no-print" onClick={handleLogout} title="Cerrar Sesión">
              <LogOut size={20} />
            </button>
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ color: 'var(--primary)', fontWeight: '800', letterSpacing: '-1px', margin: 0 }}>INVENTARIO DIGITAL BOHÍO <span style={{ fontSize: '0.8rem', verticalAlign: 'middle', background: '#e31e24', color: 'white', padding: '2px 8px', borderRadius: '4px' }}>V2</span></h1>
              <p style={{ color: 'var(--text-muted)' }}>Capture y Gestión Profesional</p>
            </div>
          </header>

          {/* Selector para Móviles */}
          <div className="mobile-selector">
            <select
              value={activePropertyId || ""}
              onChange={(e) => {
                const prop = savedProperties.find(p => p.id === e.target.value);
                if (prop) loadProperty(prop);
                else createNew();
              }}
            >
              <option value="">+ NUEVA PROPIEDAD</option>
              {savedProperties.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>

          <div className="mobile-actions no-print" style={{ gridTemplateColumns: '1fr', gap: '0.5rem' }}>
            <button className="btn-save" onClick={handleSave} disabled={isSaving} style={{ width: '100%' }}>
              <FileText size={20} /> {isSaving ? 'GUARDANDO...' : 'GUARDAR'}
            </button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button className="btn-primary" onClick={() => { setPrintMode('PROPIETARIO'); setTimeout(() => window.print(), 100); }} style={{ fontSize: '0.75rem' }}>
                <Printer size={18} /> PROPIETARIO
              </button>
              <button className="btn-primary" onClick={() => { setPrintMode('ARRENDATARIO'); setTimeout(() => window.print(), 100); }} style={{ fontSize: '0.75rem' }}>
                <Printer size={18} /> ARRENDATARIO
              </button>
            </div>
          </div>

          <div className={`card collapsible-card ${expandedSections.ficha ? 'expanded' : ''}`}>
            <div className="collapsible-header" onClick={() => toggleSection('ficha')}>
              <h2 className="card-title" style={{ border: 'none', marginBottom: 0, paddingBottom: 0 }}>
                <Home size={28} /> FICHA DE LA PROPIEDAD
                {!expandedSections.ficha && data.propiedad && <span className="header-summary">: {data.propiedad}</span>}
              </h2>
              {expandedSections.ficha ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </div>
            {expandedSections.ficha && (
              <div className="collapsible-content" style={{ marginTop: '1.5rem' }}>
                <div className="grid-2">
                  <div className="form-group"><label>Nombre Propiedad</label><VoiceInput value={data.propiedad} onChange={v => handleDataChange('propiedad', v)} /></div>
                  <div className="form-group"><label>Contrato N°</label><VoiceInput value={data.contrato} onChange={v => handleDataChange('contrato', v)} /></div>
                  <div className="form-group"><label>Dirección Física</label><VoiceInput value={data.direccion} onChange={v => handleDataChange('direccion', v)} /></div>
                  <div className="form-group"><label>Tipo de Inmueble</label><VoiceInput value={data.tipoInmueble} onChange={v => handleDataChange('tipoInmueble', v)} /></div>
                  <div className="form-group"><label>Teléfono Propiedad</label><VoiceInput value={data.telefonoGral} onChange={v => handleDataChange('telefonoGral', v)} /></div>
                </div>

                {activePropertyId && (
                  <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', textAlign: 'center' }} className="no-print">
                    <button
                      className="btn-text-danger"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '1rem',
                        background: '#fff1f2',
                        border: '1px solid #fecaca',
                        color: '#e31e24',
                        borderRadius: '12px',
                        fontWeight: 700,
                        fontSize: '0.9rem'
                      }}
                      onClick={(e) => handleDeleteProperty(e, activePropertyId)}
                    >
                      <Trash2 size={18} /> ELIMINAR PROPIEDAD DEL SISTEMA
                    </button>
                    <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.8rem' }}>
                      Al borrarla, la propiedad se removerá permanentemente de tu lista.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={`card collapsible-card ${expandedSections.fachada ? 'expanded' : ''}`}>
            <div className="collapsible-header" onClick={() => toggleSection('fachada')}>
              <h2 className="card-title" style={{ border: 'none', marginBottom: 0, paddingBottom: 0 }}>
                <Camera size={28} /> REGISTRO FOTOGRÁFICO FACHADA
                {!expandedSections.fachada && data.imagenPropiedad && <span className="header-summary"> (1 Foto)</span>}
              </h2>
              {expandedSections.fachada ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </div>
            {expandedSections.fachada && (
              <div className="collapsible-content" style={{ marginTop: '1.5rem' }}>
                <div className="form-group">
                  <div className={`image-upload-area ${data.imagenPropiedad ? 'has-image' : ''}`} style={{ minHeight: '200px', cursor: 'default' }}>
                    {data.imagenPropiedad ? (
                      <img src={data.imagenPropiedad} alt="Propiedad" />
                    ) : (
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn-outline" onClick={() => setCameraConfig({ onCapture: (url) => handleProcessImage(url, 'FACHADA', (pUrl) => handleDataChange('imagenPropiedad', pUrl)) })}>
                          <Camera /> Usar Cámara
                        </button>
                        <label className="btn-outline" style={{ cursor: 'pointer' }}>
                          <ImageIcon /> Subir Archivo
                          <input type="file" hidden accept="image/*" onChange={e => handleProcessImage(e.target.files[0], 'FACHADA', (pUrl) => handleDataChange('imagenPropiedad', pUrl))} />
                        </label>
                      </div>
                    )}
                    {data.imagenPropiedad && (
                      <button className="btn-danger no-print" style={{ position: 'absolute', top: '10px', right: '10px' }} onClick={() => handleDataChange('imagenPropiedad', '')}>
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={`card collapsible-card ${expandedSections.partes ? 'expanded' : ''}`}>
            <div className="collapsible-header" onClick={() => toggleSection('partes')}>
              <h2 className="card-title" style={{ border: 'none', marginBottom: 0, paddingBottom: 0 }}>
                <UserIcon size={28} /> PARTES INTERESADAS
                {!expandedSections.partes && data.arrendatario && <span className="header-summary">: {data.arrendatario}</span>}
              </h2>
              {expandedSections.partes ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </div>
            {expandedSections.partes && (
              <div className="collapsible-content" style={{ marginTop: '1.5rem' }}>
                <div className="grid-2">
                  <div style={{ border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '12px' }}>
                    <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '0.9rem' }}>PROPIETARIO</h3>
                    <div className="form-group" style={{ marginBottom: '1rem' }}><label>Nombre</label><VoiceInput value={data.arrendador} onChange={v => handleDataChange('arrendador', v)} /></div>
                    <div className="form-group"><label>Teléfono</label><VoiceInput value={data.arrendadorTel} onChange={v => handleDataChange('arrendadorTel', v)} /></div>
                  </div>
                  <div style={{ border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '12px' }}>
                    <h3 style={{ color: '#444', marginBottom: '1rem', fontSize: '0.9rem' }}>ARRENDATARIO</h3>
                    <div className="form-group" style={{ marginBottom: '1rem' }}><label>Nombre</label><VoiceInput value={data.arrendatario} onChange={v => handleDataChange('arrendatario', v)} /></div>
                    <div className="form-group"><label>Teléfono</label><VoiceInput value={data.arrendatarioTel} onChange={v => handleDataChange('arrendatarioTel', v)} /></div>
                  </div>
                </div>
                <div className="grid-2" style={{ marginTop: '1rem' }}>
                  <div className="form-group"><label>Fecha Recibo</label><VoiceInput type="date" value={data.fechaRecibo} onChange={v => handleDataChange('fechaRecibo', v)} /></div>
                  <div className="form-group"><label>Fecha Entrega</label><VoiceInput type="date" value={data.fechaEntrega} onChange={v => handleDataChange('fechaEntrega', v)} /></div>
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="card-title"><FileText size={28} /> ESTADO DE MEDIDORES</h2>
            <div className="grid-2">
              {['luz', 'agua', 'gas'].map(t => (
                <div key={t} className={`collapsible-card ${expandedMeter === t ? 'expanded' : ''}`}>
                  <div className="collapsible-header" onClick={() => toggleMeter(t)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                      <h4 style={{ textTransform: 'uppercase', color: 'var(--primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                        {t === 'luz' ? <Zap size={18} /> : t === 'agua' ? <Droplets size={18} /> : <Flame size={18} />} {t}
                      </h4>
                      {expandedMeter !== t && data.contadores[t].lectura && (
                        <span className="header-summary" style={{ fontSize: '0.8rem' }}>• {data.contadores[t].lectura} kw/m3</span>
                      )}
                    </div>
                    {expandedMeter === t ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>

                  {expandedMeter === t && (
                    <div className="collapsible-content">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <VoiceInput placeholder="N° Contrato" value={data.contadores[t].contrato} onChange={v => handleContadorChange(t, 'contrato', v)} />
                        <VoiceInput placeholder="N° Medidor/Serie" value={data.contadores[t].contador} onChange={v => handleContadorChange(t, 'contador', v)} />
                        <VoiceInput placeholder="Lectura Actual" value={data.contadores[t].lectura} onChange={v => handleContadorChange(t, 'lectura', v)} />

                        <div className="image-gallery" style={{ marginTop: '0.5rem' }}>
                          {data.contadores[t].imagenes.map((img, idx) => (
                            <div key={idx} className="gallery-item">
                              <img src={img} alt={`${t} ${idx}`} />
                              <button className="remove-img-btn no-print" onClick={() => removeFotoContador(t, idx)}><X size={14} /></button>
                            </div>
                          ))}
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="add-photo-btn" onClick={() => setCameraConfig({ onCapture: (url) => handleProcessImage(url, 'SERVICIOS PUBLICOS', (pUrl) => addFotoContador(t, pUrl)) })}>
                              <Camera size={20} />
                            </button>
                            <label className="add-photo-btn" style={{ cursor: 'pointer' }}>
                              <ImageIcon size={20} />
                              <input type="file" hidden accept="image/*" onChange={evt => handleProcessImage(evt.target.files[0], 'SERVICIOS PUBLICOS', (pUrl) => addFotoContador(t, pUrl))} />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 className="card-title" style={{ margin: 0, padding: 0, border: 'none' }}><Building size={28} /> INVENTARIO FÍSICO</h2>
              <button className="btn-primary" onClick={addEspacio}>+ AGREGAR ZONA / ESPACIO</button>
            </div>
            {data.espacios.map((e, idx) => (
              <div key={e.id} className={`space-card ${activeSpaceId === e.id ? 'expanded' : ''}`} style={{ marginBottom: '1.5rem' }}>
                <div className="collapsible-header space-header-main" onClick={() => toggleSpace(e.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    <div className="space-badge">{idx + 1}</div>
                    <span style={{ fontWeight: 800, color: '#1e293b' }}>{e.nombre || 'NUEVA ZONA'}</span>
                    {activeSpaceId !== e.id && e.elementos.length > 0 && <span className="header-summary" style={{ color: '#64748b' }}> ({e.elementos.length} ítems)</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="btn-icon-danger no-print" onClick={(e_stop) => { e_stop.stopPropagation(); setData(prev => ({ ...prev, espacios: prev.espacios.filter(sp => sp.id !== e.id) })); }}><Trash2 size={18} /></button>
                    {activeSpaceId === e.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </div>
                </div>

                {activeSpaceId === e.id && (
                  <div className="collapsible-content" style={{ padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--primary)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Editar Nombre de Zona</label>
                      <VoiceInput placeholder="Ej: Sala Comedor, Baño Social..." value={e.nombre} onChange={v => updateEspacio(e.id, 'nombre', v)} />
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                      <label>Descripción General de la Zona</label>
                      <VoiceInput type="textarea" placeholder="Estado de paredes, techos, pisos..." value={e.descripcion} onChange={v => updateEspacio(e.id, 'descripcion', v)} />
                    </div>

                    <div className="elements-section">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #edf2f7', paddingBottom: '0.5rem' }}>
                        <h4 style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 800 }}>ELEMENTOS INDIVIDUALES</h4>
                        <button className="btn-outline" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }} onClick={() => addElemento(e.id)}>+ Añadir Ítem</button>
                      </div>

                      {e.elementos.map(el => (
                        <div key={el.id} className={`element-card-v2 ${activeElementId === el.id ? 'active' : ''}`}>
                          <div className="element-header-mini" onClick={() => toggleElement(el.id)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                              <CheckCircle size={14} color={el.nombre ? 'var(--primary)' : '#cbd5e1'} />
                              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>{el.nombre || 'NUEVO ÍTEM'}</span>
                              {activeElementId !== el.id && <span className="header-summary" style={{ fontSize: '0.75rem' }}>• {el.estado}</span>}
                            </div>
                            {activeElementId === el.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>

                          {activeElementId === el.id && (
                            <div className="element-body-expanded" style={{ marginTop: '1rem' }}>
                              <div className="grid-2" style={{ gap: '1rem' }}>
                                <div className="form-group">
                                  <label style={{ fontSize: '0.7rem' }}>Nombre del Elemento</label>
                                  <VoiceInput placeholder="Ej: Cerradura Principal" value={el.nombre} onChange={v => updateElemento(e.id, el.id, 'nombre', v)} />
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <div className="form-group" style={{ flex: 2 }}>
                                    <label style={{ fontSize: '0.7rem' }}>Estado</label>
                                    <select value={el.estado} onChange={evt => updateElemento(e.id, el.id, 'estado', evt.target.value)}>
                                      <option>EXCELENTE</option><option>BUENO</option><option>REGULAR</option><option>MALO</option>
                                    </select>
                                  </div>
                                  <div className="form-group" style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.7rem' }}>Cant.</label>
                                    <VoiceInput type="number" min="1" value={el.cantidad} onChange={v => updateElemento(e.id, el.id, 'cantidad', v)} />
                                  </div>
                                </div>
                                <div className="form-group" style={{ marginTop: '1rem' }}>
                                  <label style={{ fontSize: '0.7rem' }}>Descripción Adicional (Reflejada en PDF)</label>
                                  <VoiceInput
                                    placeholder="Ej: Rayones leves, pintura saltada..."
                                    value={el.descripcion}
                                    onChange={v => updateElemento(e.id, el.id, 'descripcion', v)}
                                  />
                                </div>
                              </div>
                              <div className="image-gallery" style={{ marginTop: '1rem' }}>
                                {el.imagenes.map((img, iidx) => <div key={iidx} className="gallery-item"><img src={img} alt="Detalle" /></div>)}
                                <div style={{ display: 'flex', gap: '10px' }}>
                                  <button className="add-photo-btn" onClick={() => setCameraConfig({ onCapture: (url) => handleProcessImage(url, e.nombre || 'Zona_Sin_Nombre', (pUrl) => addFotoElemento(e.id, el.id, pUrl)) })}>
                                    <Camera size={20} />
                                  </button>
                                  <label className="add-photo-btn" style={{ cursor: 'pointer' }}>
                                    <ImageIcon size={20} />
                                    <input type="file" hidden accept="image/*" onChange={evt => handleProcessImage(evt.target.files[0], e.nombre || 'Zona_Sin_Nombre', (pUrl) => addFotoElemento(e.id, el.id, pUrl))} />
                                  </label>
                                </div>
                              </div>
                              <button className="btn-text-danger" style={{ marginTop: '1rem', fontSize: '0.7rem' }} onClick={() => setData(prev => ({ ...prev, espacios: prev.espacios.map(sp => sp.id === e.id ? { ...sp, elementos: sp.elementos.filter(item => item.id !== el.id) } : sp) }))}>Eliminar Ítem</button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="print-only">
          {(printMode === 'PROPIETARIO' || printMode === 'BOTH') && (
            <InventarioDocument type="ARRENDADOR" />
          )}
          
          {printMode === 'BOTH' && <div className="page-break"></div>}
          
          {(printMode === 'ARRENDATARIO' || printMode === 'BOTH') && (
            <InventarioDocument type="ARRENDATARIO" />
          )}
        </div>

        {cameraConfig && (
          <CameraModal
            onCapture={cameraConfig.onCapture}
            onClose={() => setCameraConfig(null)}
          />
        )}
      </div>
    </div>
  );
}
