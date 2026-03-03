import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiCalendar,
  FiActivity,
  FiArrowLeft,
  FiFileText,
  FiClipboardList,
} from "react-icons/fi";
import api from "../../services/api";

const TherapistPatientDetails = () => {
  const { specialId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [assessments, setAssessments] = useState([]);

  useEffect(() => {
    fetchPatient();
    fetchPatientSessions();
    fetchPatientAssessments();
  }, [specialId]);

  const fetchPatient = async () => {
    try {
      const res = await api.get(`/patients/${specialId}`);
      if (res.data.success) {
        setPatient(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load patient details");
      navigate("/therapist/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientSessions = async () => {
    try {
      const res = await api.get(`/sessions/patient/${specialId}`);
      if (res.data.success) {
        setSessions(res.data.data || []);
      }
    } catch (error) {
      console.error("Failed to load sessions:", error);
    }
  };

  const fetchPatientAssessments = async () => {
    try {
      const res = await api.get(`/assessments/patient/${specialId}`);
      if (res.data.success) {
        setAssessments(res.data.data || []);
      }
    } catch (error) {
      console.error("Failed to load assessments:", error);
    }
  };

  const handleStartSession = () => {
    navigate("/therapist/sessions");
  };

  const handleViewAssessment = (assessmentId) => {
    navigate(`/therapist/assessment/${assessmentId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <FiUser className="mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-gray-500">Patient not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/therapist/dashboard")}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Patient Details
            </h1>
            <p className="text-purple-600 font-medium">{specialId}</p>
          </div>
        </div>
        <button
          onClick={handleStartSession}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
        >
          <FiFileText />
          New Session
        </button>
      </div>

      {/* Child Information */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FiUser className="text-purple-600" />
          Child Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Child Name
            </label>
            <p className="font-medium text-gray-800">{patient.childName}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Date of Birth
            </label>
            <p className="font-medium text-gray-800">
              {new Date(patient.dateOfBirth).toLocaleDateString("en-IN")}
            </p>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Age</label>
            <p className="font-medium text-gray-800">{patient.age} years</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Gender</label>
            <p className="font-medium text-gray-800">{patient.gender}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Diagnosis
            </label>
            <div className="flex flex-wrap gap-2">
              {patient.diagnosis?.map((d) => (
                <span
                  key={d}
                  className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Severity</label>
            <p className="font-medium text-gray-800">
              {patient.severity || "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Parent/Guardian Information */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FiPhone className="text-purple-600" />
          Parent/Guardian Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Parent Name
            </label>
            <p className="font-medium text-gray-800">{patient.parentName}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Relationship
            </label>
            <p className="font-medium text-gray-800">
              {patient.relationship || "-"}
            </p>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Phone Number
            </label>
            <p className="font-medium text-gray-800">{patient.parentPhone}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Email</label>
            <p className="font-medium text-gray-800">{patient.parentEmail}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-500 mb-1">Address</label>
            <p className="font-medium text-gray-800">
              {patient.address || "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Medical Information */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FiActivity className="text-purple-600" />
          Medical Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Referred By
            </label>
            <p className="font-medium text-gray-800">
              {patient.referredBy || "-"}
            </p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-500 mb-1">
              Presenting Problems
            </label>
            <p className="font-medium text-gray-800">
              {patient.presentingProblems || "-"}
            </p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-500 mb-1">
              Medical History
            </label>
            <p className="font-medium text-gray-800">
              {patient.medicalHistory || "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FiFileText className="text-purple-600" />
          Recent Sessions ({sessions.length})
        </h3>
        {sessions.length > 0 ? (
          <div className="space-y-3">
            {sessions.slice(0, 5).map((session) => (
              <div
                key={session.id || session._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {new Date(session.date).toLocaleDateString("en-IN")}
                  </p>
                  <p className="text-sm text-gray-500">
                    {session.timeSlot} • {session.therapyType}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    session.status === "completed"
                      ? "bg-green-100 text-green-600"
                      : session.status === "in-progress"
                        ? "bg-amber-100 text-amber-600"
                        : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {session.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No sessions found</p>
        )}
      </div>

      {/* Assessments */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FiClipboardList className="text-purple-600" />
          Assessments ({assessments.length})
        </h3>
        {assessments.length > 0 ? (
          <div className="space-y-3">
            {assessments.slice(0, 5).map((assessment) => (
              <button
                key={assessment._id}
                onClick={() => handleViewAssessment(assessment._id)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-purple-50 transition text-left"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {assessment.assessmentType}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(assessment.date).toLocaleDateString("en-IN")} •{" "}
                    {assessment.therapist?.name}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    assessment.status === "completed"
                      ? "bg-green-100 text-green-600"
                      : "bg-amber-100 text-amber-600"
                  }`}
                >
                  {assessment.status}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No assessments found</p>
        )}
      </div>
    </div>
  );
};

export default TherapistPatientDetails;
