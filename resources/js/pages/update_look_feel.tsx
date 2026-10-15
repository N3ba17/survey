import React, { useState, useEffect } from 'react';
import {
  Building2,
  Factory,
  ShieldCheck,
  Award,
  Globe2,
  Wrench,
  DollarSign,
  Upload,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  FileText,
  Trash2,
  Eye,
  Save,
  Info,
  X,
  Check,
  HelpCircle
} from 'lucide-react';

const FORM_SECTIONS = [
  { id: 'company', title: 'Company Overview', icon: Building2, shortTitle: 'Company' },
  { id: 'manufacturing', title: 'Manufacturing Capacity', icon: Factory, shortTitle: 'Capacity' },
  { id: 'quality', title: 'Quality Control', icon: ShieldCheck, shortTitle: 'Quality' },
  { id: 'certifications', title: 'Certifications & Standards', icon: Award, shortTitle: 'Certifications' },
  { id: 'regional', title: 'Regional Experience', icon: Globe2, shortTitle: 'Regional' },
  { id: 'warranty', title: 'After-Sales & Warranty', icon: Wrench, shortTitle: 'Warranty' },
  { id: 'commercial', title: 'Commercial & Logistics', icon: DollarSign, shortTitle: 'Commercial' },
];

const INITIAL_DATA = {
  companyName: '',
  contactPerson: '',
  contactEmail: '',
  contactPhone: '',
  country: '',
  companyType: 'manufacturer',
  yearsManufacturing: '',
  yearsExporting: '',
  businessLicense: null,

  monthlyCapacity: '',
  sampleLeadTime: '',
  containerLeadTime: '',
  factoryProfileDoc: null,
  factoryAreaSqM: '',
  totalEmployees: '',

  qcSteps: '',
  qcReportDoc: null,
  acceptsThirdPartyInspection: 'yes',

  certificationsList: '',
  certificationDocs: [],
  complianceStandards: '',
  productTestReports: [],

  regionalProjects: '',
  regionalProjectsDoc: null,
  shippedToDjibouti: 'yes',
  forwarderDetails: '',

  warrantyPeriod: '',
  warrantyCoverageDetails: '',
  warrantyDoc: null,
  localSupportAvailable: 'no',

  moq: '',
  acceptsTrialOrder: 'yes',
  paymentTerms: [],
  proformaInvoiceDoc: null,
  preferredIncoterms: 'FOB',
  notesAndComments: ''
};

const validateField = (name, value, formData) => {
  switch (name) {
    case 'companyName':
      if (!value || !value.trim()) return 'Company legal name is required';
      if (value.trim().length < 2) return 'Company name must be at least 2 characters';
      return '';
    case 'country':
      if (!value || !value.trim()) return 'Country of origin is required';
      return '';
    case 'contactEmail':
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
      return '';
    case 'contactPhone':
      if (value && !/^[0-9+\s-()]{6,20}$/.test(value)) return 'Please enter a valid phone number';
      return '';
    case 'yearsManufacturing':
      if (value !== '' && (isNaN(value) || Number(value) < 0 || Number(value) > 150)) return 'Please enter a realistic number of years';
      return '';
    case 'yearsExporting':
      if (value !== '' && (isNaN(value) || Number(value) < 0 || Number(value) > 150)) return 'Please enter a realistic number of years';
      return '';
    case 'businessLicense':
      if (!value) return 'Business license document is required';
      return '';
    case 'monthlyCapacity':
      if (!value || !value.trim()) return 'Monthly production capacity is required';
      return '';
    case 'qcReportDoc':
      if (!value) return 'Sample QC/Inspection report is required';
      return '';
    case 'certificationDocs':
      if (!value || value.length === 0) return 'At least one certification document is required';
      return '';
    case 'productTestReports':
      if (!value || value.length === 0) return 'At least one product test report is required';
      return '';
    case 'regionalProjectsDoc':
      if (!value) return 'Project reference list/photos document is required';
      return '';
    case 'warrantyPeriod':
      if (!value || !value.trim()) return 'Warranty period is required';
      return '';
    case 'warrantyDoc':
      if (!value) return 'Written warranty certificate is required';
      return '';
    case 'moq':
      if (!value || !value.trim()) return 'Minimum order quantity (MOQ) is required';
      return '';
    default:
      return '';
  }
};

export default function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('supplier_survey_draft');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  // Real-time error state per field & tracking touched fields
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    localStorage.setItem('supplier_survey_draft', JSON.stringify(formData));
  }, [formData]);

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errorMsg = validateField(field, formData[field], formData);
    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (touched[field]) {
        const errorMsg = validateField(field, value, updated);
        setErrors((prevErr) => ({ ...prevErr, [field]: errorMsg }));
      }
      return updated;
    });
  };

  const handleFileUpload = (field, file) => {
    if (!file) return;
    const fileObj = {
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: file.type,
      uploadedAt: new Date().toLocaleTimeString()
    };

    setFormData((prev) => {
      let updated;
      if (Array.isArray(prev[field])) {
        updated = { ...prev, [field]: [...prev[field], fileObj] };
      } else {
        updated = { ...prev, [field]: fileObj };
      }

      // Auto-validate attachment fields on change
      setTouched((t) => ({ ...t, [field]: true }));
      const errorMsg = validateField(field, updated[field], updated);
      setErrors((e) => ({ ...e, [field]: errorMsg }));

      return updated;
    });
  };

  const removeFile = (field, index = null) => {
    setFormData((prev) => {
      let updated;
      if (index !== null && Array.isArray(prev[field])) {
        updated = {
          ...prev,
          [field]: prev[field].filter((_, i) => i !== index)
        };
      } else {
        updated = { ...prev, [field]: null };
      }

      setTouched((t) => ({ ...t, [field]: true }));
      const errorMsg = validateField(field, updated[field], updated);
      setErrors((e) => ({ ...e, [field]: errorMsg }));

      return updated;
    });
  };

  const getFieldsForStep = (stepIdx) => {
    switch (stepIdx) {
      case 0:
        return ['companyName', 'country', 'contactEmail', 'contactPhone', 'yearsManufacturing', 'yearsExporting', 'businessLicense'];
      case 1:
        return ['monthlyCapacity'];
      case 2:
        return ['qcReportDoc'];
      case 3:
        return ['certificationDocs', 'productTestReports'];
      case 4:
        return ['regionalProjectsDoc'];
      case 5:
        return ['warrantyPeriod', 'warrantyDoc'];
      case 6:
        return ['moq'];
      default:
        return [];
    }
  };

  const isStepValid = (stepIdx) => {
    const stepFields = getFieldsForStep(stepIdx);
    for (let field of stepFields) {
      const err = validateField(field, formData[field], formData);
      if (err) return false;
    }
    return true;
  };

  const validateStepAndMarkTouched = (stepIdx) => {
    const stepFields = getFieldsForStep(stepIdx);
    let hasError = false;
    const newErrors = { ...errors };
    const newTouched = { ...touched };

    stepFields.forEach((field) => {
      newTouched[field] = true;
      const err = validateField(field, formData[field], formData);
      newErrors[field] = err;
      if (err) hasError = true;
    });

    setTouched(newTouched);
    setErrors(newErrors);
    return !hasError;
  };

  const handleNextStep = () => {
    if (validateStepAndMarkTouched(activeStep)) {
      if (activeStep < FORM_SECTIONS.length - 1) {
        setActiveStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleTabClick = (idx) => {
    // Check if previous steps had errors to highlight them
    if (idx > activeStep) {
      validateStepAndMarkTouched(activeStep);
    }
    setActiveStep(idx);
  };

  const handleManualSave = () => {
    localStorage.setItem('supplier_survey_draft', JSON.stringify(formData));
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const calculateProgress = () => {
    let requiredFields = [
      'companyName',
      'country',
      'businessLicense',
      'monthlyCapacity',
      'qcReportDoc',
      'certificationDocs',
      'productTestReports',
      'regionalProjectsDoc',
      'warrantyPeriod',
      'warrantyDoc',
      'moq'
    ];
    let filled = 0;
    requiredFields.forEach((f) => {
      const val = formData[f];
      if (Array.isArray(val)) {
        if (val.length > 0) filled++;
      } else if (val) {
        filled++;
      }
    });
    return Math.round((filled / requiredFields.length) * 100);
  };

  const renderFileUploadArea = (field, label, isRequired = false, isMultiple = false, hint = '') => {
    const value = formData[field];
    const hasFiles = isMultiple ? value && value.length > 0 : value !== null;
    const error = touched[field] && errors[field];

    return (
      <div className="mt-2">
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            {label} {isRequired ? <span className="text-red-500">*</span> : <span className="text-slate-400 font-normal text-xs">(Optional)</span>}
          </label>
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${isRequired ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
            {isRequired ? 'Attachment Required' : 'Optional Attachment'}
          </span>
        </div>

        {hint && <p className="text-xs text-slate-500 mb-2">{hint}</p>}

        {/* Upload Dropzone */}
        <div
          className={`border-2 border-dashed transition-all rounded-xl p-4 text-center relative ${
            error
              ? 'border-red-400 bg-red-50/40 dark:bg-red-950/20'
              : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 bg-slate-50/50 dark:bg-slate-800/50'
          }`}
        >
          <input
            type="file"
            multiple={isMultiple}
            onChange={(e) => {
              const files = Array.from(e.target.files);
              files.forEach((f) => handleFileUpload(field, f));
            }}
            onBlur={() => handleBlur(field)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
          />
          <div className="flex flex-col items-center justify-center gap-1.5">
            <div className={`p-2 rounded-full ${error ? 'bg-red-100 text-red-600' : 'bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400'}`}>
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Click to upload or drag & drop file
            </p>
            <p className="text-xs text-slate-400">PDF, PNG, JPG or DOCX (Max 15MB)</p>
          </div>
        </div>

        {/* Real-time Inline Error Message */}
        {error && (
          <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5" /> {error}
          </p>
        )}

        {/* File List / Preview */}
        {hasFiles && (
          <div className="mt-3 space-y-2">
            {!isMultiple && value && (
              <div className="flex items-center justify-between p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="font-medium truncate text-slate-700 dark:text-slate-200">{value.name}</span>
                  <span className="text-xs text-slate-400">({value.size})</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(field)}
                  className="text-slate-400 hover:text-red-500 p-1 rounded-md transition-colors"
                  title="Remove file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {isMultiple &&
              value.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="font-medium truncate text-slate-700 dark:text-slate-200">{file.name}</span>
                    <span className="text-xs text-slate-400">({file.size})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(field, idx)}
                    className="text-slate-400 hover:text-red-500 p-1 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Company Details & Profile
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Provide general information regarding your business entity and licensing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Company Legal Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Company Legal Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  onBlur={() => handleBlur('companyName')}
                  placeholder="e.g. Acme Manufacturing Ltd."
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none transition-all ${
                    touched.companyName && errors.companyName
                      ? 'border-red-500 focus:ring-2 focus:ring-red-400'
                      : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
                {touched.companyName && errors.companyName && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.companyName}
                  </p>
                )}
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Country / Region of Origin <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  onBlur={() => handleBlur('country')}
                  placeholder="e.g. China, Turkey, India, Vietnam"
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none transition-all ${
                    touched.country && errors.country
                      ? 'border-red-500 focus:ring-2 focus:ring-red-400'
                      : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
                {touched.country && errors.country && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.country}
                  </p>
                )}
              </div>

              {/* Contact Person */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Contact Person Name
                </label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  placeholder="Sales Manager / Key Account Representative"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Official Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Official Email Address
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  onBlur={() => handleBlur('contactEmail')}
                  placeholder="sales@company.com"
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none transition-all ${
                    touched.contactEmail && errors.contactEmail
                      ? 'border-red-500 focus:ring-2 focus:ring-red-400'
                      : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
                {touched.contactEmail && errors.contactEmail && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.contactEmail}
                  </p>
                )}
              </div>
            </div>

            {/* Q1: Manufacturer or Trading Company */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  1. Are you the manufacturer or a trading company? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'manufacturer', label: 'Direct Manufacturer' },
                    { id: 'trading', label: 'Trading Company' },
                    { id: 'both', label: 'Manufacturer with Trading Subsidiary' }
                  ].map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${
                        formData.companyType === option.id
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="companyType"
                          value={option.id}
                          checked={formData.companyType === option.id}
                          onChange={(e) => handleInputChange('companyType', e.target.value)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{option.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {renderFileUploadArea(
                'businessLicense',
                'Business License (showing production scope)',
                true,
                false,
                'Please attach your valid official business registration/license showing production capability and legal representative.'
              )}
            </div>

            {/* Q2: Years in Manufacturing & Export */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  How many years have you been manufacturing this product?
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.yearsManufacturing}
                  onChange={(e) => handleInputChange('yearsManufacturing', e.target.value)}
                  onBlur={() => handleBlur('yearsManufacturing')}
                  placeholder="e.g. 12"
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none transition-all ${
                    touched.yearsManufacturing && errors.yearsManufacturing
                      ? 'border-red-500 focus:ring-2 focus:ring-red-400'
                      : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
                {touched.yearsManufacturing && errors.yearsManufacturing && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.yearsManufacturing}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  How many years have you been exporting this product?
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.yearsExporting}
                  onChange={(e) => handleInputChange('yearsExporting', e.target.value)}
                  onBlur={() => handleBlur('yearsExporting')}
                  placeholder="e.g. 8"
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none transition-all ${
                    touched.yearsExporting && errors.yearsExporting
                      ? 'border-red-500 focus:ring-2 focus:ring-red-400'
                      : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
                {touched.yearsExporting && errors.yearsExporting && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.yearsExporting}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Factory className="w-5 h-5 text-blue-600" />
                Manufacturing Capacity & Lead Times
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Detail your production capabilities, facility size, and turnaround expectations.
              </p>
            </div>

            {/* Q3: Monthly Capacity */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  What is your monthly production capacity for this product? <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.monthlyCapacity}
                  onChange={(e) => handleInputChange('monthlyCapacity', e.target.value)}
                  onBlur={() => handleBlur('monthlyCapacity')}
                  placeholder="e.g., 50,000 units / month or 10,000 meters / month"
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none transition-all ${
                    touched.monthlyCapacity && errors.monthlyCapacity
                      ? 'border-red-500 focus:ring-2 focus:ring-red-400'
                      : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
                {touched.monthlyCapacity && errors.monthlyCapacity && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.monthlyCapacity}
                  </p>
                )}
              </div>

              {renderFileUploadArea(
                'factoryProfileDoc',
                'Factory profile / production capacity statement',
                false,
                false,
                'Upload factory overview deck, photos, layout plan, or equipment audit logs.'
              )}
            </div>

            {/* Q4: Lead times */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                What is the lead time for sample and for bulk order?
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Sample Lead Time (Days)
                  </label>
                  <input
                    type="text"
                    value={formData.sampleLeadTime}
                    onChange={(e) => handleInputChange('sampleLeadTime', e.target.value)}
                    placeholder="e.g. 5 - 7 business days"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Lead time for a 40' Container Order (Days)
                  </label>
                  <input
                    type="text"
                    value={formData.containerLeadTime}
                    onChange={(e) => handleInputChange('containerLeadTime', e.target.value)}
                    placeholder="e.g. 25 - 30 calendar days"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Facility Specs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Factory Surface Area (sq. meters)
                </label>
                <input
                  type="text"
                  value={formData.factoryAreaSqM}
                  onChange={(e) => handleInputChange('factoryAreaSqM', e.target.value)}
                  placeholder="e.g. 15,000 sqm"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Total Factory Workers / QA Engineers
                </label>
                <input
                  type="text"
                  value={formData.totalEmployees}
                  onChange={(e) => handleInputChange('totalEmployees', e.target.value)}
                  placeholder="e.g. 150 workers, 15 QA engineers"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                Quality Control (QC) Systems
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Detail your quality assurance methodologies and inspection willingness.
              </p>
            </div>

            {/* Q5: QC Steps & Report */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  What QC steps do you perform (incoming raw materials, in-process testing, final inspection)?
                </label>
                <textarea
                  rows={3}
                  value={formData.qcSteps}
                  onChange={(e) => handleInputChange('qcSteps', e.target.value)}
                  placeholder="Describe your testing protocols at incoming, manufacturing line, and pre-packing stages..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {renderFileUploadArea(
                'qcReportDoc',
                'Sample QC / Inspection Report',
                true,
                false,
                'Attach a recent real-world QC test report / inspection checklist for verification.'
              )}
            </div>

            {/* Q6: Third Party Inspection */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  Do you accept third-party pre-shipment inspection (SGS, BV, Intertek, QIMA)?
                </label>
                <div className="flex flex-wrap gap-4">
                  {['yes', 'no', 'conditional'].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer capitalize text-sm font-medium text-slate-700 dark:text-slate-300">
                      <input
                        type="radio"
                        name="acceptsThirdPartyInspection"
                        value={type}
                        checked={formData.acceptsThirdPartyInspection === type}
                        onChange={(e) => handleInputChange('acceptsThirdPartyInspection', e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      {type === 'yes' ? 'Yes, Fully Supported' : type === 'no' ? 'No' : 'Conditional (On Buyer Account)'}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                Certifications & International Standards
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Upload safety, management, and product specific conformity certificates.
              </p>
            </div>

            {/* Q7: Certifications hold */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Which certifications do you hold? (ISO 9001, ISO 14001, CE, IEC/CB, UL, RoHS, etc.)
                </label>
                <input
                  type="text"
                  value={formData.certificationsList}
                  onChange={(e) => handleInputChange('certificationsList', e.target.value)}
                  placeholder="List ISO 9001, CE, UL, etc."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {renderFileUploadArea(
                'certificationDocs',
                'Copies of ISO / CE / IEC / UL certificates',
                true,
                true,
                'Upload valid PDF/Image files for all specified certifications.'
              )}
            </div>

            {/* Q8: Standards compliance */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Which international standards does the product comply with? (EN, BS, ASTM, IEC, DIN, etc.)
                </label>
                <input
                  type="text"
                  value={formData.complianceStandards}
                  onChange={(e) => handleInputChange('complianceStandards', e.target.value)}
                  placeholder="e.g., IEC 61439, ASTM A36, EN 1090"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {renderFileUploadArea(
                'productTestReports',
                'Product Test Reports (TÜV, SGS, Intertek, etc.)',
                true,
                true,
                'Attach third-party lab test certificates proving compliance.'
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-blue-600" />
                Regional Experience (Ethiopia & East Africa)
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Demonstrate track record and familiarity with East African customs and logistics.
              </p>
            </div>

            {/* Q9: Project references */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Which projects in Ethiopia or East Africa have used your products?
                </label>
                <textarea
                  rows={3}
                  value={formData.regionalProjects}
                  onChange={(e) => handleInputChange('regionalProjects', e.target.value)}
                  placeholder="Provide client names, project locations, order sizes, and completion years in Ethiopia, Kenya, Tanzania, Djibouti, etc."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {renderFileUploadArea(
                'regionalProjectsDoc',
                'Project Reference List with Photos',
                true,
                false,
                'Upload reference documents with photos, client reference contacts, or completion certificates.'
              )}
            </div>

            {/* Q11: Logistics Experience */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  Have you shipped to Djibouti Port for delivery into Ethiopia?
                </label>
                <div className="flex gap-6 mb-3">
                  {['yes', 'no'].map((ans) => (
                    <label key={ans} className="flex items-center gap-2 cursor-pointer uppercase text-sm font-medium text-slate-700 dark:text-slate-300">
                      <input
                        type="radio"
                        name="shippedToDjibouti"
                        value={ans}
                        checked={formData.shippedToDjibouti === ans}
                        onChange={(e) => handleInputChange('shippedToDjibouti', e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      {ans}
                    </label>
                  ))}
                </div>
              </div>

              {formData.shippedToDjibouti === 'yes' && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Which shipping forwarder / sea line did you utilize?
                  </label>
                  <input
                    type="text"
                    value={formData.forwarderDetails}
                    onChange={(e) => handleInputChange('forwarderDetails', e.target.value)}
                    placeholder="e.g., Ethiopian Shipping Lines (ESLSE), Maersk, MSC"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-600" />
                After-Sales Support & Warranty
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Define warranty duration, replacement policy, and technical assistance options.
              </p>
            </div>

            {/* Q10: Warranty Period & Terms */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Warranty Period <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.warrantyPeriod}
                    onChange={(e) => handleInputChange('warrantyPeriod', e.target.value)}
                    onBlur={() => handleBlur('warrantyPeriod')}
                    placeholder="e.g. 24 Months / 2 Years"
                    className={`w-full px-3 py-2 border rounded-lg dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none transition-all ${
                      touched.warrantyPeriod && errors.warrantyPeriod
                        ? 'border-red-500 focus:ring-2 focus:ring-red-400'
                        : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500'
                    }`}
                  />
                  {touched.warrantyPeriod && errors.warrantyPeriod && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.warrantyPeriod}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    What exactly does the warranty cover?
                  </label>
                  <input
                    type="text"
                    value={formData.warrantyCoverageDetails}
                    onChange={(e) => handleInputChange('warrantyCoverageDetails', e.target.value)}
                    placeholder="e.g. Free replacement of defective parts, technical support, factory repair"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {renderFileUploadArea(
                'warrantyDoc',
                'Written Warranty Certificate / Guarantee Terms',
                true,
                false,
                'Upload official stamped warranty commitment document.'
              )}
            </div>

            {/* Local representation */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                Do you have local technical support or authorized repair agent in East Africa?
              </label>
              <div className="flex gap-6">
                {['yes', 'no'].map((ans) => (
                  <label key={ans} className="flex items-center gap-2 cursor-pointer uppercase text-sm font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      name="localSupportAvailable"
                      value={ans}
                      checked={formData.localSupportAvailable === ans}
                      onChange={(e) => handleInputChange('localSupportAvailable', e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    {ans}
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                Commercial Terms & Payment Options
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Specify minimum order quantity (MOQ) and preferred payment methods.
              </p>
            </div>

            {/* Q12: MOQ */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    What is your Minimum Order Quantity (MOQ)? <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.moq}
                    onChange={(e) => handleInputChange('moq', e.target.value)}
                    onBlur={() => handleBlur('moq')}
                    placeholder="e.g. 500 units or 1x20ft Container"
                    className={`w-full px-3 py-2 border rounded-lg dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none transition-all ${
                      touched.moq && errors.moq
                        ? 'border-red-500 focus:ring-2 focus:ring-red-400'
                        : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500'
                    }`}
                  />
                  {touched.moq && errors.moq && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.moq}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Can you accept a smaller trial order?
                  </label>
                  <div className="flex gap-6 mt-2">
                    {['yes', 'no', 'negotiable'].map((val) => (
                      <label key={val} className="flex items-center gap-2 cursor-pointer capitalize text-sm font-medium text-slate-700 dark:text-slate-300">
                        <input
                          type="radio"
                          name="acceptsTrialOrder"
                          value={val}
                          checked={formData.acceptsTrialOrder === val}
                          onChange={(e) => handleInputChange('acceptsTrialOrder', e.target.value)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        {val}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Q13: Payment terms */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  What payment terms do you accept?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'LC at Sight (Irrevocable Letter of Credit)',
                    'CAD (Cash Against Documents)',
                    'T/T 30% Deposit / 70% Before Shipment',
                    'T/T 30% Deposit / 70% Against BL Copy',
                    'Deferred Payment / Usance LC'
                  ].map((term) => {
                    const isChecked = formData.paymentTerms.includes(term);
                    return (
                      <label key={term} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData((p) => ({ ...p, paymentTerms: [...p.paymentTerms, term] }));
                            } else {
                              setFormData((p) => ({
                                ...p,
                                paymentTerms: p.paymentTerms.filter((t) => t !== term)
                              }));
                            }
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        {term}
                      </label>
                    );
                  })}
                </div>
              </div>

              {renderFileUploadArea(
                'proformaInvoiceDoc',
                'Proforma Invoice showing payment terms',
                false,
                false,
                'Sample proforma invoice demonstrating commercial breakdown and standard terms.'
              )}
            </div>

            {/* IncoTerms */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Preferred Incoterms
              </label>
              <div className="flex flex-wrap gap-4">
                {['FOB', 'CIF Djibouti', 'CFR', 'EXW', 'DDP'].map((term) => (
                  <label key={term} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="preferredIncoterms"
                      value={term}
                      checked={formData.preferredIncoterms === term}
                      onChange={(e) => handleInputChange('preferredIncoterms', e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    {term}
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Remarks */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Additional Comments / Special Conditions
              </label>
              <textarea
                rows={3}
                value={formData.notesAndComments}
                onChange={(e) => handleInputChange('notesAndComments', e.target.value)}
                placeholder="Any special notes regarding custom packaging, OEM branding capability, or pricing flexibility..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold">Survey Submitted!</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Thank you for completing the Supplier Qualification Evaluation. Our procurement team will review your submitted documents and credentials.
          </p>
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-center gap-3">
            <button
              onClick={() => {
                setSubmitted(false);
                setActiveStep(0);
              }}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              Back to Form
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Print Response
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans pb-12">
      {/* Top Header Banner */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">Supplier Qualification Survey</h1>
              <p className="text-xs text-slate-400">Vendor Verification & Compliance</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isSavedNotice && (
              <span className="text-xs text-green-400 flex items-center gap-1 bg-green-950/50 border border-green-800 px-2.5 py-1 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5" /> Draft Saved
              </span>
            )}
            <button
              onClick={handleManualSave}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg transition-colors"
            >
              <Save className="w-3.5 h-3.5" /> Save Draft
            </button>
            <button
              onClick={() => setShowPreviewModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
            >
              <Eye className="w-3.5 h-3.5" /> Preview
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

        {/* Progress Bar Container */}
        <div className="mb-6 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Survey Completion Progress
            </span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{calculateProgress()}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300 ease-out"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
        </div>

        {/* TOP HORIZONTAL TAB NAVIGATION BAR */}
        <div className="mb-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-2 overflow-x-auto">
          <div className="flex items-center min-w-max space-x-2">
            {FORM_SECTIONS.map((section, idx) => {
              const Icon = section.icon;
              const isActive = activeStep === idx;
              const valid = isStepValid(idx);

              // Determine tab styling state
              let statusBadge = null;
              if (valid) {
                statusBadge = (
                  <span className="p-0.5 bg-green-500 text-white rounded-full">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                );
              } else if (activeStep > idx) {
                statusBadge = (
                  <span className="p-0.5 bg-red-500 text-white rounded-full" title="Incomplete required fields">
                    <AlertCircle className="w-3 h-3" />
                  </span>
                );
              }

              return (
                <button
                  key={section.id}
                  onClick={() => handleTabClick(idx)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold'
                      : valid
                      ? 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700'
                      : 'bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-blue-500'}`} />
                  <span className="whitespace-nowrap">{section.shortTitle}</span>
                  {statusBadge}
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN CONTENT CARD */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
          {/* Active Step Content */}
          {renderStepContent()}

          {/* BOTTOM NAVIGATION BUTTONS & TAB CONTROLS */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">

            {/* Step Counter Indicator */}
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Step {activeStep + 1} of {FORM_SECTIONS.length}: <span className="text-slate-800 dark:text-slate-200 font-semibold">{FORM_SECTIONS[activeStep].title}</span>
            </div>

            {/* Previous & Next Controls */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                disabled={activeStep === 0}
                onClick={handlePrevStep}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                  activeStep === 0
                    ? 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400'
                    : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                <ChevronLeft className="w-4 h-4" /> Previous Tab
              </button>

              {activeStep < FORM_SECTIONS.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-md shadow-blue-500/20"
                >
                  Next Tab <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (validateStepAndMarkTouched(activeStep)) {
                      setSubmitted(true);
                    }
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-semibold bg-green-600 hover:bg-green-500 text-white transition-colors shadow-md shadow-green-600/20"
                >
                  Submit Qualification <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" /> Survey Response Summary
              </h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <h4 className="font-semibold text-blue-600 mb-2">Company Details</h4>
                <p><strong>Name:</strong> {formData.companyName || 'N/A'}</p>
                <p><strong>Country:</strong> {formData.country || 'N/A'}</p>
                <p><strong>Email:</strong> {formData.contactEmail || 'N/A'}</p>
                <p><strong>Business License Attached:</strong> {formData.businessLicense ? formData.businessLicense.name : 'No'}</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <h4 className="font-semibold text-blue-600 mb-2">Capacity & Lead Times</h4>
                <p><strong>Monthly Capacity:</strong> {formData.monthlyCapacity || 'N/A'}</p>
                <p><strong>Sample Lead Time:</strong> {formData.sampleLeadTime || 'N/A'}</p>
                <p><strong>40ft Container Lead Time:</strong> {formData.containerLeadTime || 'N/A'}</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <h4 className="font-semibold text-blue-600 mb-2">QC & Certifications</h4>
                <p><strong>QC Report Attached:</strong> {formData.qcReportDoc ? formData.qcReportDoc.name : 'No'}</p>
                <p><strong>Certifications:</strong> {formData.certificationsList || 'N/A'}</p>
                <p><strong>Third Party QC Accepted:</strong> {formData.acceptsThirdPartyInspection}</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <h4 className="font-semibold text-blue-600 mb-2">Regional Experience & Commercial</h4>
                <p><strong>East Africa Projects:</strong> {formData.regionalProjects || 'N/A'}</p>
                <p><strong>Warranty Period:</strong> {formData.warrantyPeriod || 'N/A'}</p>
                <p><strong>MOQ:</strong> {formData.moq || 'N/A'}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 border rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
