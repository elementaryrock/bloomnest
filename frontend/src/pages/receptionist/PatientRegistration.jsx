import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FiUser, FiPhone, FiMail, FiMapPin, FiCalendar, FiActivity, FiCheck, FiChevronRight, FiChevronLeft, FiUpload } from 'react-icons/fi';
import api from '../../services/api';

const steps = [
    { id: 1, title: 'Child Information', icon: FiUser },
    { id: 2, title: 'Parent Details', icon: FiPhone },
    { id: 3, title: 'Medical Information', icon: FiActivity },
];

const PatientRegistration = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [generatedId, setGeneratedId] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        trigger,
        getValues,
        watch
    } = useForm({
        defaultValues: {
            diagnosis: []
        }
    });

    const selectedDiagnosis = watch('diagnosis') || [];

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const nextStep = async () => {
        let fieldsToValidate = [];

        if (currentStep === 1) {
            fieldsToValidate = ['childName', 'dateOfBirth', 'gender'];
        } else if (currentStep === 2) {
            fieldsToValidate = ['parentName', 'parentPhone', 'parentEmail', 'relationship'];
        }

        const isValid = await trigger(fieldsToValidate);
        if (isValid) {
            setCurrentStep(prev => Math.min(prev + 1, 3));
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const response = await api.post('/patients/register', {
                ...data,
                photoUrl: photoPreview // In real app, upload to Cloudinary first
            });

            if (response.data.success) {
                setGeneratedId(response.data.data.specialId);
                toast.success('Patient registered successfully!');
            } else {
                toast.error(response.data.error?.message || 'Registration failed');
            }
        } catch (error) {
            toast.error(error.response?.data?.error?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    // Success Screen
    if (generatedId) {
        return (
            <div className="max-w-lg mx-auto">
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <FiCheck className="text-green-600" size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h2>
                    <p className="text-gray-600 mb-6">The patient has been registered successfully.</p>

                    <div className="bg-green-50 rounded-lg p-6 mb-6">
                        <p className="text-sm text-gray-600 mb-2">Special ID</p>
                        <p className="text-3xl font-bold text-green-600">{generatedId}</p>
                        <p className="text-xs text-gray-500 mt-2">Please share this ID with the parent</p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                setGeneratedId(null);
                                setCurrentStep(1);
                                setPhotoPreview(null);
                            }}
                            className="flex-1 py-3 border border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-50 transition"
                        >
                            Register Another
                        </button>
                        <button
                            onClick={() => navigate('/receptionist/dashboard')}
                            className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Register New Patient</h1>
                <p className="text-gray-600">Fill in the patient details to complete registration</p>
            </div>

            {/* Progress Steps */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                        <React.Fragment key={step.id}>
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= step.id
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-200 text-gray-500'
                                        }`}
                                >
                                    {currentStep > step.id ? <FiCheck /> : <step.icon />}
                                </div>
                                <div className="hidden sm:block">
                                    <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-green-600' : 'text-gray-500'}`}>
                                        Step {step.id}
                                    </p>
                                    <p className="text-xs text-gray-500">{step.title}</p>
                                </div>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`flex-1 h-1 mx-4 rounded ${currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white rounded-xl shadow-md p-6">
                    {/* Step 1: Child Information */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Child Information</h3>

                            {/* Photo Upload */}
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <FiUser size={32} />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block">
                                        <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition inline-flex items-center gap-2">
                                            <FiUpload />
                                            Upload Photo
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handlePhotoChange}
                                        />
                                    </label>
                                    <p className="text-xs text-gray-500 mt-2">Optional. Max 5MB.</p>
                                </div>
                            </div>

                            {/* Child Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Child's Full Name *</label>
                                <input
                                    type="text"
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.childName ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter child's name"
                                    {...register('childName', { required: 'Child name is required' })}
                                />
                                {errors.childName && <p className="text-red-500 text-sm mt-1">{errors.childName.message}</p>}
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                                <input
                                    type="date"
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    {...register('dateOfBirth', { required: 'Date of birth is required' })}
                                />
                                {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>}
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                                <div className="flex gap-4">
                                    {['Male', 'Female', 'Other'].map((gender) => (
                                        <label key={gender} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                value={gender}
                                                className="w-4 h-4 text-green-600"
                                                {...register('gender', { required: 'Gender is required' })}
                                            />
                                            <span className="text-gray-700">{gender}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Parent Details */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Parent/Guardian Details</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Parent/Guardian Name *</label>
                                <input
                                    type="text"
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.parentName ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter parent's name"
                                    {...register('parentName', { required: 'Parent name is required' })}
                                />
                                {errors.parentName && <p className="text-red-500 text-sm mt-1">{errors.parentName.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Relationship *</label>
                                <select
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.relationship ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    {...register('relationship', { required: 'Relationship is required' })}
                                >
                                    <option value="">Select relationship</option>
                                    <option value="Mother">Mother</option>
                                    <option value="Father">Father</option>
                                    <option value="Guardian">Guardian</option>
                                </select>
                                {errors.relationship && <p className="text-red-500 text-sm mt-1">{errors.relationship.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                                <input
                                    type="tel"
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.parentPhone ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="10-digit phone number"
                                    {...register('parentPhone', {
                                        required: 'Phone number is required',
                                        pattern: { value: /^\d{10}$/, message: 'Enter valid 10-digit number' }
                                    })}
                                />
                                {errors.parentPhone && <p className="text-red-500 text-sm mt-1">{errors.parentPhone.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                                <input
                                    type="email"
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.parentEmail ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="email@example.com"
                                    {...register('parentEmail', {
                                        required: 'Email is required',
                                        pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' }
                                    })}
                                />
                                {errors.parentEmail && <p className="text-red-500 text-sm mt-1">{errors.parentEmail.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                <textarea
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    rows={3}
                                    placeholder="Enter full address"
                                    {...register('address')}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Medical Information */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Medical Information</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis *</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { value: 'ASD', label: 'Autism Spectrum Disorder (ASD)' },
                                        { value: 'SLD', label: 'Specific Learning Disability (SLD)' },
                                        { value: 'ID', label: 'Intellectual Disability (ID)' },
                                        { value: 'CP', label: 'Cerebral Palsy (CP)' },
                                    ].map((diagnosis) => (
                                        <label
                                            key={diagnosis.value}
                                            className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition ${selectedDiagnosis.includes(diagnosis.value)
                                                ? 'border-green-600 bg-green-50'
                                                : 'border-gray-200 hover:border-green-300'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                value={diagnosis.value}
                                                className="w-5 h-5 text-green-600 rounded"
                                                {...register('diagnosis', { required: 'Select at least one diagnosis' })}
                                            />
                                            <span className="text-sm text-gray-700">{diagnosis.label}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.diagnosis && <p className="text-red-500 text-sm mt-1">{errors.diagnosis.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                                <select
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    {...register('severity')}
                                >
                                    <option value="">Select severity level</option>
                                    <option value="Mild">Mild</option>
                                    <option value="Moderate">Moderate</option>
                                    <option value="Severe">Severe</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Presenting Problems</label>
                                <textarea
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    rows={3}
                                    placeholder="Describe the main concerns or challenges"
                                    {...register('presentingProblems')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Referred By</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Doctor, school, or other referral source"
                                    {...register('referredBy')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Medical History</label>
                                <textarea
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    rows={3}
                                    placeholder="Any relevant medical history"
                                    {...register('medicalHistory')}
                                />
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8 pt-6 border-t">
                        <button
                            type="button"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${currentStep === 1
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <FiChevronLeft />
                            Previous
                        </button>

                        {currentStep < 3 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                            >
                                Next
                                <FiChevronRight />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                        Registering...
                                    </>
                                ) : (
                                    <>
                                        <FiCheck />
                                        Complete Registration
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PatientRegistration;
