import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import TransText from '../components/TransText';
import { 
  FaUser, 
  FaEdit, 
  FaSave, 
  FaTimes,
  FaPhone,
  FaMapMarkerAlt,
  FaTint,
  FaHeart,
  FaCamera,
  FaUpload,
  FaUserCircle,
  FaBirthdayCake,
  FaVenusMars,
  FaRuler,
  FaWeight,
  FaIdCard
} from 'react-icons/fa';

const Profile = () => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  
  // Dummy patient profile data
  const [profileData, setProfileData] = useState({
    name: 'Rajesh Kumar',
    age: 35,
    gender: 'Male',
    phone: '+91 98765 43210',
    address: 'House No. 123, Sector 4, Chandigarh, Punjab - 160012',
    emergency_contact: '+91 87654 32109',
    emergency_contact_name: 'Sunita Kumar (Wife)',
    blood_group: 'B+',
    height: '5\'8"',
    weight: '72 kg',
    medical_history: 'Hypertension (2020), Diabetes Type 2 (2019)',
    insurance_number: 'HLTH123456789',
    date_of_birth: '1988-03-15'
  });

  // Dummy recent appointments
  const recentAppointments = [
    {
      id: 'APT001',
      doctor: 'Dr. Priya Sharma',
      specialty: 'Cardiology',
      date: '2024-01-15',
      time: '10:30 AM',
      status: 'Completed',
      diagnosis: 'Regular checkup - Normal'
    },
    {
      id: 'APT002', 
      doctor: 'Dr. Harpreet Singh',
      specialty: 'General Medicine',
      date: '2024-01-08',
      time: '02:00 PM',
      status: 'Completed',
      diagnosis: 'Fever, prescribed medication'
    },
    {
      id: 'APT003',
      doctor: 'Dr. Sunita Devi',
      specialty: 'Dermatology',
      date: '2024-01-20',
      time: '11:00 AM',
      status: 'Upcoming',
      diagnosis: 'Scheduled'
    }
  ];

  // Dummy medical conditions
  const medicalConditions = [
    {
      condition: 'Hypertension',
      diagnosed: '2020-06-15',
      status: 'Managed',
      medication: 'Amlodipine 5mg daily'
    },
    {
      condition: 'Type 2 Diabetes',
      diagnosed: '2019-11-20',
      status: 'Controlled',
      medication: 'Metformin 500mg twice daily'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // In a real app, this would save to the backend
    console.log('Profile saved:', profileData);
  };

  return (
    <div className="min-h-screen bg-bg-secondary">
      {/* Header - Matching Home Page Style */}
      <div className="bg-gradient-to-r from-primary-color to-primary-dark text-white py-6 md:py-12">
        <div className="px-4 md:px-6 lg:px-8 text-left max-w-7xl mx-auto">
          <h1 className="text-xl md:text-4xl font-black mb-2 md:mb-4 tracking-tight leading-tight">
            {t('patient')} <span className="text-primary-light">{t('profile')}</span>
          </h1>
          <p className="text-sm md:text-xl text-primary-light font-medium break-words leading-relaxed">
            <TransText text={profileData.name} /> • {t('age')} {profileData.age} {t('years_suffix')} • <TransText text={profileData.gender} />
          </p>
          <p className="text-primary-light mt-2 text-xs md:text-base leading-relaxed">
            {t('manage_personal_medical_info')}
          </p>
        </div>
      </div>

      <div className="px-3 md:px-6 lg:px-8 py-4 md:py-8 pb-24 md:pb-40 max-w-7xl mx-auto">
        <div className="w-full space-y-4 md:space-y-6">
          
          {/* Personal Information Card - Clean Layout */}
          <div className="card-elevated p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 md:mb-6">
              <h3 className="text-base md:text-xl font-bold text-text-primary">
                {t('personal_information')}
              </h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`btn text-xs md:text-base px-3 py-2 md:px-4 md:py-2 ${
                  isEditing 
                    ? 'btn-secondary' 
                    : 'btn-primary'
                } w-full sm:w-auto`}
              >
                {isEditing ? <FaTimes className="mr-1 md:mr-2 text-xs md:text-sm" /> : <FaEdit className="mr-1 md:mr-2 text-xs md:text-sm" />}
                {isEditing ? t('cancel') : t('edit')}
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
              
              {/* Fixed Dummy Photo - Top/Left Side */}
              <div className="flex-shrink-0 mx-auto md:mx-0">
                <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center border-2 border-border-light overflow-hidden shadow-sm">
                  <img 
                    src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjQ4IiBjeT0iMzIiIHI9IjE2IiBmaWxsPSIjOUI5QjlCIi8+CjxwYXRoIGQ9Ik0xNiA4MEMxNiA2OC45NTQzIDI0Ljk1NDMgNjAgMzYgNjBINjBDNzEuMDQ1NyA2MCA4MCA2OC45NTQzIDgwIDgwVjk2SDE2VjgwWiIgZmlsbD0iIzlCOUI5QiIvPgo8L3N2Zz4K"
                    alt="Patient Photo" 
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
              </div>

              {/* Personal Details - Right Side */}
              <div className="flex-grow w-full min-w-0">
                <div className="space-y-3 md:space-y-4">
                  
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-text-primary mb-1">
                      {t('full_name')}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleInputChange}
                        className="input w-full text-sm md:text-base"
                      />
                    ) : (
                      <p className="text-text-primary bg-bg-secondary px-3 py-2 md:px-4 md:py-3 rounded-lg border border-border-light text-sm md:text-base break-words overflow-wrap-anywhere"><TransText text={profileData.name} /></p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-text-primary mb-1">
                      {t('age')}
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="age"
                        value={profileData.age}
                        onChange={handleInputChange}
                        className="input w-full text-sm md:text-base"
                      />
                    ) : (
                      <p className="text-text-primary bg-bg-secondary px-3 py-2 md:px-4 md:py-3 rounded-lg border border-border-light text-sm md:text-base">{profileData.age} {t('years_suffix')}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-text-primary mb-1">
                      {t('gender')}
                    </label>
                    {isEditing ? (
                      <select
                        name="gender"
                        value={profileData.gender}
                        onChange={handleInputChange}
                        className="input w-full text-sm md:text-base"
                      >
                        <option value="Male">{t('male')}</option>
                        <option value="Female">{t('female')}</option>
                        <option value="Other">{t('other')}</option>
                      </select>
                    ) : (
                      <p className="text-text-primary bg-bg-secondary px-3 py-2 md:px-4 md:py-3 rounded-lg border border-border-light text-sm md:text-base break-words overflow-wrap-anywhere"><TransText text={profileData.gender} /></p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-text-primary mb-1">
                      {t('phone_number')}
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleInputChange}
                        className="input w-full text-sm md:text-base"
                      />
                    ) : (
                      <p className="text-text-primary bg-bg-secondary px-3 py-2 md:px-4 md:py-3 rounded-lg border border-border-light text-sm md:text-base break-words overflow-wrap-anywhere">{profileData.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-text-primary mb-1">
                      {t('address')}
                    </label>
                    {isEditing ? (
                      <textarea
                        name="address"
                        value={profileData.address}
                        onChange={handleInputChange}
                        rows="3"
                        className="input resize-none w-full text-sm md:text-base"
                      />
                    ) : (
                      <p className="text-text-primary bg-bg-secondary px-3 py-2 md:px-4 md:py-3 rounded-lg border border-border-light text-sm md:text-base break-words overflow-wrap-anywhere leading-relaxed"><TransText text={profileData.address} /></p>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-4 md:mt-6 text-center md:text-right">
                    <button
                      onClick={handleSave}
                      className="btn btn-success w-full md:w-auto text-xs md:text-base px-3 py-2 md:px-4 md:py-2"
                    >
                      <FaSave className="mr-1 md:mr-2 text-xs md:text-sm" />
                      {t('save_changes')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Medical Information Card - Text Only Layout */}
          <div className="card-elevated p-4 md:p-6">
            <h3 className="text-base md:text-xl font-bold text-text-primary mb-4 md:mb-6">
              {t('medical_information')}
            </h3>

            <div className="space-y-3 md:space-y-4">
              
              {/* Blood Group */}
              <div>
                <label className="block text-xs md:text-sm font-semibold text-text-primary mb-1">
                  {t('blood_group')}
                </label>
                <p className="text-text-primary bg-red-50 px-3 py-2 md:px-4 md:py-3 rounded-lg border border-red-200 font-bold text-base md:text-lg">{profileData.blood_group}</p>
              </div>

              {/* Height */}
              <div>
                <label className="block text-xs md:text-sm font-semibold text-text-primary mb-1">
                  {t('height')}
                </label>
                <p className="text-text-primary bg-bg-secondary px-3 py-2 md:px-4 md:py-3 rounded-lg border border-border-light font-semibold text-sm md:text-base">{profileData.height}</p>
              </div>

              {/* Weight */}
              <div>
                <label className="block text-xs md:text-sm font-semibold text-text-primary mb-1">
                  {t('weight')}
                </label>
                <p className="text-text-primary bg-bg-secondary px-3 py-2 md:px-4 md:py-3 rounded-lg border border-border-light font-semibold text-sm md:text-base">{profileData.weight}</p>
              </div>

              {/* Insurance */}
              <div>
                <label className="block text-xs md:text-sm font-semibold text-text-primary mb-1">
                  {t('insurance')}
                </label>
                <p className="text-text-primary bg-bg-secondary px-3 py-2 md:px-4 md:py-3 rounded-lg border border-border-light text-xs md:text-sm font-semibold break-words overflow-wrap-anywhere">{profileData.insurance_number}</p>
              </div>

              {/* Emergency Contact */}
              <div>
                <label className="block text-xs md:text-sm font-semibold text-text-primary mb-1">
                  {t('emergency_contact')}
                </label>
                <p className="text-text-primary bg-orange-50 px-3 py-2 md:px-4 md:py-3 rounded-lg border border-orange-200 break-words text-sm md:text-base overflow-wrap-anywhere leading-relaxed">
                  <TransText text={profileData.emergency_contact_name} /> - {profileData.emergency_contact}
                </p>
              </div>
            </div>
          </div>

          {/* Current Medical Conditions - Text Only */}
          <div className="card-elevated p-4 md:p-6">
            <h3 className="text-base md:text-xl font-bold text-text-primary mb-4 md:mb-6">
              {t('current_medical_conditions')}
            </h3>

            <div className="space-y-3 md:space-y-4">
              {medicalConditions.map((condition, index) => (
                <div key={index} className="border border-border-light rounded-lg p-3 md:p-4 hover:shadow-md transition-all duration-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-text-secondary mb-1">{t('condition')}</p>
                      <p className="text-text-primary font-medium text-sm md:text-base break-words overflow-wrap-anywhere"><TransText text={condition.condition} /></p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-text-secondary mb-1">{t('diagnosed')}</p>
                      <p className="text-text-primary text-sm md:text-base">{condition.diagnosed}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-text-secondary mb-1">{t('status')}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        condition.status === 'Controlled' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        <TransText text={condition.status} />
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-text-secondary mb-1">{t('current_medication')}</p>
                      <p className="text-text-primary text-xs md:text-sm break-words overflow-wrap-anywhere leading-relaxed"><TransText text={condition.medication} /></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;