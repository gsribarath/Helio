import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doctorAPI } from '../services/api';
import { 
  FaSearch, 
  FaFilter, 
  FaStar, 
  FaStarHalfAlt, 
  FaRegStar, 
  FaVideo, 
  FaCalendar,
  FaUserMd,
  FaMapMarkerAlt,
  FaLanguage,
  FaClock,
  FaMicrophone,
  FaTimes,
  FaPhoneSlash,
  FaPhone,
  FaVolumeUp,
  FaVolumeMute,
  FaSyncAlt,
  FaComments,
  FaBell,
  FaUser,
  FaRobot,
  FaHeart,
  FaFileUpload,
  FaAmbulance,
  FaTint,
  FaBed,
  FaWalking,
  FaPills,
  FaChartLine,
  FaArrowRight,
  FaCheckCircle
} from 'react-icons/fa';

import './HomeDoctors.css';
import './AIHealthDashboard.css';
import TransText from '../components/TransText';


const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [selectedDoctorForCall, setSelectedDoctorForCall] = useState(null);
  
  // AI Health Score state
  const [healthScore, setHealthScore] = useState(78);
  const [riskLevel, setRiskLevel] = useState('moderate');
  
  // Track which doctors have accepted (status in_progress) appointments for this patient
  const PATIENT_NAME = user?.name || 'Gurpreet Singh'; // Use actual user name or demo assumption
  const [acceptedDoctorIds, setAcceptedDoctorIds] = useState(new Set());
  // Upcoming appointments count for My Appointments button
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [badgeAnimate, setBadgeAnimate] = useState(false); // triggers pop animation when count changes
  const [upcomingAppointment, setUpcomingAppointment] = useState(null);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Helper to parse date/time (shared logic with appointments pages)
  const toDate = (dateStr, timeStr) => {
    if (!dateStr) return null;
    const [hhmm, period] = (timeStr || '00:00').split(' ');
    const [hhRaw, mm] = hhmm.split(':');
    let hh = parseInt(hhRaw, 10);
    if (period) {
      const isPM = period.toUpperCase() === 'PM';
      if (isPM && hh < 12) hh += 12;
      if (!isPM && hh === 12) hh = 0;
    }
    return new Date(`${dateStr}T${String(hh).padStart(2,'0')}:${mm || '00'}:00`);
  };

  const computeUpcomingAppointments = useCallback(() => {
    try {
      const raw = localStorage.getItem('helio_appointments');
      const arr = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(arr)) { 
        setUpcomingCount(0);
        setUpcomingAppointment(null);
        return;
      }
      const now = new Date();
      let count = 0;
      let nextAppt = null;
      let closestDiff = Infinity;
      
      for (const a of arr) {
        if (!a || !a.id || !a.date || !a.time) continue;
        if (a.status === 'cancelled' || a.status === 'completed') continue;
        const d = toDate(a.date, a.time);
        if (d && d.getTime() >= now.getTime()) {
          count++;
          const diff = d.getTime() - now.getTime();
          if (diff < closestDiff) {
            closestDiff = diff;
            nextAppt = a;
          }
        }
      }
      setUpcomingCount(count);
      setUpcomingAppointment(nextAppt);
    } catch (e) {
      console.error('Failed to compute upcoming appointments:', e);
      setUpcomingCount(0);
      setUpcomingAppointment(null);
    }
  }, []);

  // Dummy data for demonstration
  const dummyDoctors = [
    {
      id: '1',
      name: 'Dr. Rajesh Kumar',
      specialty: 'Cardiology',
      qualifications: 'MBBS, MD Cardiology',
      experience_years: 15,
      consultation_fee: 500,
      is_available: true,
      languages: 'English, Hindi, Punjabi',
      rating: 4.8,
      total_consultations: 1200,
      profile_image: null
    },
    {
      id: '2',
      name: 'Dr. Priya Sharma',
      specialty: 'Pediatrics',
      qualifications: 'MBBS, MD Pediatrics',
      experience_years: 10,
      consultation_fee: 400,
      is_available: true,
      languages: 'English, Hindi',
      rating: 4.6,
      total_consultations: 800,
      profile_image: null
    },
    {
      id: '3',
      name: 'Dr. Harpreet Singh',
      specialty: 'General Medicine',
      qualifications: 'MBBS, MD Internal Medicine',
      experience_years: 12,
      consultation_fee: 350,
      is_available: false,
      languages: 'English, Hindi, Punjabi',
      rating: 4.5,
      total_consultations: 950,
      profile_image: null
    },
    {
      id: '4',
      name: 'Dr. Sunita Devi',
      specialty: 'Gynecology',
      qualifications: 'MBBS, MS Gynecology',
      experience_years: 8,
      consultation_fee: 450,
      is_available: true,
      languages: 'English, Hindi, Punjabi',
      rating: 4.7,
      total_consultations: 600,
      profile_image: null
    }
  ];

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Initial load of upcoming appointments & listener for real-time updates
  useEffect(() => {
    computeUpcomingAppointments();
    const onStorage = (e) => {
      if (e.key === 'helio_appointments') computeUpcomingAppointments();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [computeUpcomingAppointments]);

  // Trigger badge animation whenever the count transitions to a positive number or changes
  const prevCountRef = React.useRef(0);
  useEffect(() => {
    if (upcomingCount > 0 && upcomingCount !== prevCountRef.current) {
      setBadgeAnimate(true);
      const to = setTimeout(() => setBadgeAnimate(false), 600);
      return () => clearTimeout(to);
    }
    prevCountRef.current = upcomingCount;
  }, [upcomingCount]);

  const loadAcceptedAppointments = useCallback(() => {
    try {
      const raw = localStorage.getItem('helio_appointments');
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return;
      const accepted = parsed.filter(a => a.patientName === PATIENT_NAME && a.status === 'in_progress');
      const ids = new Set(accepted.map(a => a.doctorId || a.doctor?.id || a.doctorId));
      setAcceptedDoctorIds(ids);
    } catch (e) {
      console.error('Failed to load accepted appointments:', e);
    }
  }, []);

  // Initial load and listeners for real-time enabling
  useEffect(() => {
    loadAcceptedAppointments();
    const onStorage = (e) => {
      if (e.key === 'helio_appointments') {
        loadAcceptedAppointments();
        checkIncomingCall();
      }
    };
    const onFocus = () => loadAcceptedAppointments();
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
    };
  }, [loadAcceptedAppointments]);

  // Track last handled call to avoid duplicate redirects
  const handledCallIdsRef = React.useRef(new Set());

  const checkIncomingCall = useCallback(() => {
    try {
      const raw = localStorage.getItem('helio_appointments');
      const arr = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(arr)) return;
      // Find an appointment for this patient that has callType & callSessionId
      const incoming = arr.find(a => a.patientName === PATIENT_NAME && a.callType && a.callSessionId);
      if (incoming && incoming.callSessionId && !handledCallIdsRef.current.has(incoming.callSessionId)) {
        handledCallIdsRef.current.add(incoming.callSessionId);
        const doctorObj = {
          id: incoming.doctorId || '1',
          name: incoming.doctor || 'Doctor',
          specialty: incoming.specialist || 'General Medicine',
          qualifications: 'MBBS',
          languages: 'English, Hindi, Punjabi',
          experience: 12
        };
        const patientObj = { id: incoming.patientId || incoming.id, name: incoming.patientName };
        if (incoming.callType === 'video') {
          navigate('/video-call', { state: { doctor: doctorObj, patient: patientObj, callType:'video', callSessionId: incoming.callSessionId } });
        } else if (incoming.callType === 'audio') {
          navigate('/audio-call', { state: { doctor: doctorObj, patient: patientObj, callType:'audio', callSessionId: incoming.callSessionId } });
        }
      } else if (incoming && !incoming.callSessionId) {
        // Session cleared; reset handled IDs to allow future calls
        handledCallIdsRef.current = new Set();
      }
    } catch (e) {
      console.error('Failed to check incoming call:', e);
    }
  }, [navigate]);

  // Initial call check
  useEffect(() => { checkIncomingCall(); }, [checkIncomingCall]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      // For demo purposes, we'll use dummy data
      // In production, uncomment the API call below
      // const response = await doctorAPI.getAll();
      // setDoctors(response.data);
      
      // Simulate API delay
      setTimeout(() => {
        setDoctors(dummyDoctors);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Failed to load doctors');
      setDoctors(dummyDoctors); // Fallback to dummy data
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || doctor.specialty === selectedSpecialty;
    const matchesAvailability = !availableOnly || doctor.is_available;
    
    return matchesSearch && matchesSpecialty && matchesAvailability;
  });

  const specialties = [...new Set(doctors.map(doctor => doctor.specialty))];

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="star" />);
    }
    
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="star" />);
    }
    
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="star empty" />);
    }

    return stars;
  };

  const handleConsultNow = (doctorId) => {
    const doctor = filteredDoctors.find(d => d.id === doctorId);
    setSelectedDoctorForCall(doctor);
    setShowConsultModal(true);
  };

  const handleBookAppointment = (doctorId) => {
    const doctor = filteredDoctors.find(d => d.id === doctorId);
    // Navigate to appointments page with doctor data in state
    navigate('/appointments', { 
      state: { selectedDoctor: doctor }
    });
  };

  return (
    <div className="min-h-screen bg-bg-secondary">
      {/* Top Greeting Section */}
      <div className="ai-greeting-section">
        <div className="greeting-header">
          <div className="greeting-top">
            <div className="greeting-text">
              <h1>
                {getGreeting()}, {user?.name || PATIENT_NAME} 👋
              </h1>
              <p>Your AI Health Companion</p>
            </div>
            <div className="greeting-icons">
              <button className="icon-btn" onClick={() => navigate('/notifications')}>
                <FaBell />
                <span className="notif-dot"></span>
              </button>
              <div className="profile-avatar" onClick={() => navigate('/profile')}>
                <FaUser style={{ width: '100%', height: '100%', padding: '8px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Health Score Card */}
      <div className="ai-health-score-card fade-in-up">
        <div className="health-score-header">
          <div className="health-score-title">
            <FaRobot style={{ color: '#667eea' }} />
            AI Health Score
          </div>
          <span className="ai-badge">AI Powered</span>
        </div>
        
        <div className="health-score-content">
          <div className="score-circle-container">
            <svg className="score-circle" viewBox="0 0 120 120">
              <circle className="score-circle-bg" cx="60" cy="60" r="54" />
              <circle 
                className={`score-circle-progress ${
                  healthScore >= 80 ? 'excellent' : 
                  healthScore >= 60 ? 'good' : 
                  healthScore >= 40 ? 'moderate' : 'poor'
                }`}
                cx="60" 
                cy="60" 
                r="54"
                strokeDasharray={`${(healthScore / 100) * 339.292} 339.292`}
              />
            </svg>
            <div className="score-value">
              <div className="score-number">{healthScore}</div>
              <div className="score-max">/100</div>
            </div>
          </div>
          
          <div className="score-details">
            <span className={`risk-badge ${riskLevel}`}>
              {riskLevel === 'low' ? '🟢 Low Risk' : 
               riskLevel === 'moderate' ? '🟡 Moderate Risk' : 
               '🔴 High Risk'}
            </span>
            <div className="ai-insight">
              💡 Your cardiovascular risk is moderate. We recommend 30 minutes of walking daily to improve your heart health.
            </div>
            <button className="view-report-btn" onClick={() => navigate('/reports')}>
              <FaChartLine />
              View Detailed Report
              <FaArrowRight />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="quick-actions-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          <button className="quick-action-btn" onClick={() => navigate('/appointments')}>
            <div className="quick-action-icon primary">
              <FaCalendar />
            </div>
            <span className="quick-action-label">Book Appointment</span>
          </button>
          
          <button className="quick-action-btn" onClick={() => navigate('/reports')}>
            <div className="quick-action-icon success">
              <FaFileUpload />
            </div>
            <span className="quick-action-label">Upload Report</span>
          </button>
          
          <button className="quick-action-btn" onClick={() => {
            // Create a dummy AI assistant doctor
            const aiDoctor = {
              id: 'ai-assistant',
              name: 'AI Health Assistant',
              specialty: 'General Consultation',
              qualifications: 'AI-Powered',
              languages: 'All Languages',
              experience_years: 0
            };
            navigate('/video-call', { state: { doctor: aiDoctor } });
          }}>
            <div className="quick-action-icon warning">
              <FaRobot />
            </div>
            <span className="quick-action-label">Talk to AI</span>
          </button>
          
          <button className="quick-action-btn" onClick={() => navigate('/emergency-request')}>
            <div className="quick-action-icon danger">
              <FaAmbulance />
            </div>
            <span className="quick-action-label">Emergency Help</span>
          </button>
        </div>
      </div>

      {/* Upcoming Appointments Card */}
      <div className="upcoming-appointments-card">
        <div className="card-header">
          <h3 className="card-title">Upcoming Appointment</h3>
          <a className="view-all-link" onClick={() => navigate('/my-appointments')}>
            View All ({upcomingCount})
          </a>
        </div>
        
        {upcomingAppointment ? (
          <div className="appointment-item">
            <div className="appointment-avatar">
              <FaUserMd />
            </div>
            <div className="appointment-info">
              <h4>{upcomingAppointment.doctor || 'Doctor'}</h4>
              <p>{upcomingAppointment.date} at {upcomingAppointment.time}</p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                {upcomingAppointment.specialist || 'General Consultation'}
              </p>
            </div>
            {upcomingAppointment.callType && (
              <button 
                className="join-btn"
                onClick={() => {
                  const doctorObj = {
                    id: upcomingAppointment.doctorId || '1',
                    name: upcomingAppointment.doctor || 'Doctor',
                    specialty: upcomingAppointment.specialist || 'General Medicine'
                  };
                  if (upcomingAppointment.callType === 'video') {
                    navigate('/video-call', { state: { doctor: doctorObj } });
                  } else {
                    navigate('/audio-call', { state: { doctor: doctorObj } });
                  }
                }}
              >
                <FaVideo style={{ marginRight: '0.25rem' }} />
                Join Now
              </button>
            )}
          </div>
        ) : (
          <div className="no-appointments">
            <p>No upcoming appointments. Book one now!</p>
          </div>
        )}
      </div>

      {/* Smart Health Insights Section */}
      <div className="health-insights-section">
        <h2 className="section-title">Today's Health Insights</h2>
        <div className="insights-scroll">
          <div className="insight-card">
            <div className="insight-header">
              <div className="insight-icon water">
                <FaTint />
              </div>
              <span className="insight-label">Water</span>
            </div>
            <div className="insight-value">6/8</div>
            <div className="insight-progress">
              <div className="insight-progress-bar water" style={{ width: '75%' }}></div>
            </div>
            <div className="insight-subtitle">glasses today</div>
          </div>
          
          <div className="insight-card">
            <div className="insight-header">
              <div className="insight-icon sleep">
                <FaBed />
              </div>
              <span className="insight-label">Sleep</span>
            </div>
            <div className="insight-value">7.5h</div>
            <div className="insight-progress">
              <div className="insight-progress-bar sleep" style={{ width: '94%' }}></div>
            </div>
            <div className="insight-subtitle">last night</div>
          </div>
          
          <div className="insight-card">
            <div className="insight-header">
              <div className="insight-icon steps">
                <FaWalking />
              </div>
              <span className="insight-label">Steps</span>
            </div>
            <div className="insight-value">5,234</div>
            <div className="insight-progress">
              <div className="insight-progress-bar steps" style={{ width: '52%' }}></div>
            </div>
            <div className="insight-subtitle">of 10,000 goal</div>
          </div>
          
          <div className="insight-card">
            <div className="insight-header">
              <div className="insight-icon medicine">
                <FaPills />
              </div>
              <span className="insight-label">Medicines</span>
            </div>
            <div className="insight-value">
              <FaCheckCircle style={{ color: '#10b981', fontSize: '2rem' }} />
            </div>
            <div className="insight-subtitle" style={{ marginTop: '1rem' }}>All taken today</div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 pb-40">
        {/* Find Your Doctor Section - Modernized */}
        <div className="doctor-search-section">
          <h2 className="section-title">Find Your Doctor</h2>
          <div className="search-container">
            {/* Modern Search Bar */}
            <div className="modern-search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                className="modern-search-input"
                placeholder="Search doctors by name or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Chips */}
            <div className="filter-chips">
              <button 
                className={`filter-chip ${availableOnly ? 'active' : ''}`}
                onClick={() => setAvailableOnly(!availableOnly)}
              >
                Available Now
              </button>
              <button 
                className={`filter-chip ${selectedSpecialty === 'Cardiology' ? 'active' : ''}`}
                onClick={() => setSelectedSpecialty(selectedSpecialty === 'Cardiology' ? '' : 'Cardiology')}
              >
                Cardiology
              </button>
              <button 
                className={`filter-chip ${selectedSpecialty === 'Pediatrics' ? 'active' : ''}`}
                onClick={() => setSelectedSpecialty(selectedSpecialty === 'Pediatrics' ? '' : 'Pediatrics')}
              >
                Pediatrics
              </button>
              <button 
                className={`filter-chip ${selectedSpecialty === 'General Medicine' ? 'active' : ''}`}
                onClick={() => setSelectedSpecialty(selectedSpecialty === 'General Medicine' ? '' : 'General Medicine')}
              >
                General Medicine
              </button>
            </div>

            {/* Specialty Quick Tags */}
            <div className="specialty-tags">
              <span className="specialty-tag" onClick={() => setSelectedSpecialty('Gynecology')}>👶 Gynecology</span>
              <span className="specialty-tag" onClick={() => setSelectedSpecialty('Dermatology')}>🧴 Dermatology</span>
              <span className="specialty-tag" onClick={() => setSelectedSpecialty('Orthopedics')}>🦴 Orthopedics</span>
              <span className="specialty-tag" onClick={() => setSelectedSpecialty('Neurology')}>🧠 Neurology</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="loading"></div>
            <span className="ml-2">{t('loading_doctors')}</span>
          </div>
        ) : (
          <>
            {/* Doctors Grid - Centered and Consistent */}
            <div className="max-w-7xl mx-auto" style={{ marginTop: '2rem' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{gap: '0.1cm'}}>
                {filteredDoctors.map((doctor) => (
                  <div key={doctor.id} className="card hover:shadow-lg transition-all duration-300 overflow-hidden border border-border-light flex flex-col h-full">
                    {/* Doctor Header */}
                    <div className="p-6 pb-4 flex-grow">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary-color to-primary-dark rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                          {doctor.profile_image ? (
                            <img 
                              src={doctor.profile_image} 
                              alt={doctor.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <FaUserMd />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-xl text-text-primary mb-1 truncate"><TransText text={doctor.name} /></h3>
                          <p className="text-primary-color font-semibold text-lg"><TransText text={doctor.specialty} /></p>
                          <p className="text-sm text-text-secondary mb-2"><TransText text={doctor.qualifications} /></p>
                          
                          {/* Availability Status */}
                          <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            doctor.is_available 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {doctor.is_available ? t('available') : t('unavailable')}
                          </div>
                        </div>
                      </div>

                      {/* Doctor Info */}
                      <div className="doctor-details mb-6">
                        <div className="detail-row">
                          <FaClock className="detail-icon" />
                          <div className="detail-text">{doctor.experience_years} {t('years_experience_other', { count: doctor.experience_years })}</div>
                        </div>

                        <div className="detail-row">
                          <FaLanguage className="detail-icon" />
                          <div className="detail-text"><TransText text={doctor.languages} /></div>
                        </div>

                        <div className="detail-row detail-center">
                          <span className="text-lg font-bold text-success-color">{t('free_consultation')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="px-6 pb-6 mt-auto">
                      <div className="grid grid-cols-3 gap-2">
                        {/* Video Call */}
                        <button
                          onClick={() => {
                            if (!acceptedDoctorIds.has(doctor.id)) return; // guard
                            navigate('/video-call', { state: { doctor } });
                          }}
                          disabled={!acceptedDoctorIds.has(doctor.id)}
                          title={acceptedDoctorIds.has(doctor.id) ? t('start_video_call', 'Start Video Call') : t('waiting_for_doctor', 'Waiting for doctor acceptance')}
                          className={`btn btn-success py-2 px-3 text-sm ${acceptedDoctorIds.has(doctor.id) ? '' : 'opacity-60 cursor-not-allowed'}`}
                          aria-label={acceptedDoctorIds.has(doctor.id) ? `${t('video')} ${t('enabled','enabled')}` : `${t('video')} ${t('waiting','waiting')}`}
                        >
                          <FaVideo className="text-xs" />
                          {t('video')}
                        </button>

                        {/* Audio Call */}
                        <button
                          onClick={() => {
                            if (!acceptedDoctorIds.has(doctor.id)) return;
                            navigate('/audio-call', { state: { doctor } });
                          }}
                          disabled={!acceptedDoctorIds.has(doctor.id)}
                          title={acceptedDoctorIds.has(doctor.id) ? t('start_audio_call', 'Start Audio Call') : t('waiting_for_doctor', 'Waiting for doctor acceptance')}
                          className={`btn btn-secondary py-2 px-3 text-sm ${acceptedDoctorIds.has(doctor.id) ? '' : 'opacity-60 cursor-not-allowed'}`}
                          aria-label={acceptedDoctorIds.has(doctor.id) ? `${t('audio')} ${t('enabled','enabled')}` : `${t('audio')} ${t('waiting','waiting')}`}
                        >
                          <FaPhone className="text-xs" />
                          {t('audio')}
                        </button>

                        {/* Book Appointment */}
                        <button
                          onClick={() => handleBookAppointment(doctor.id)}
                          className="btn btn-outline py-2 px-3 text-sm"
                          aria-label={`${t('book_appointment')} ${doctor.name}`}
                        >
                          <FaCalendar className="text-xs" />
                          {t('book')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* No Results */}
            {filteredDoctors.length === 0 && !loading && (
              <div className="text-center py-16">
                <FaUserMd className="mx-auto text-8xl text-text-muted mb-6" />
                <h3 className="text-2xl font-bold text-text-primary mb-4">{t('no_doctors_found')}</h3>
                <p className="text-text-secondary text-lg">
                  {t('try_adjusting_filters')}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Consultation Type Modal */}
      {showConsultModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
          <div className="card w-96 max-w-95vw">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-text-primary">{t('choose_consultation_type')}</h3>
              <button
                onClick={() => setShowConsultModal(false)}
                className="text-text-muted hover:text-text-primary focus-ring p-2 rounded-lg"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            {selectedDoctorForCall && (
              <div className="mb-6 p-4 bg-bg-secondary rounded-lg">
                <h4 className="font-medium text-text-primary">{selectedDoctorForCall.name}</h4>
                <p className="text-text-secondary">{selectedDoctorForCall.specialty}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowConsultModal(false);
                  navigate('/video-call', { state: { doctor: selectedDoctorForCall } });
                }}
                className="btn btn-primary w-full"
              >
                <FaVideo className="text-xl" />
                <span className="font-medium">{t('video')}</span>
              </button>
              
              <button
                onClick={() => {
                  setShowConsultModal(false);
                  navigate('/audio-call', { state: { doctor: selectedDoctorForCall } });
                }}
                className="btn btn-success w-full"
              >
                <FaMicrophone className="text-xl" />
                <span className="font-medium">{t('audio')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;