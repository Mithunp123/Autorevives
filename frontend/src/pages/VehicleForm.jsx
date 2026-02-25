import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui';
import { vehicleService } from '@/services';
import { useAuth } from '@/context/AuthContext';
import { getImageUrl, getImageUrls } from '@/utils';
import toast from 'react-hot-toast';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra',
  'Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim',
  'Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
];

export default function VehicleForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEdit = Boolean(id);
  const isAdmin = user?.role === 'admin';

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, label: '' });

  // RC & Insurance
  const [rcAvailable, setRcAvailable] = useState(false);
  const [rcImage, setRcImage] = useState(null);
  const [rcPreview, setRcPreview] = useState(null);
  const [existingRcImage, setExistingRcImage] = useState(null);
  const [insuranceAvailable, setInsuranceAvailable] = useState(false);
  const [insuranceImage, setInsuranceImage] = useState(null);
  const [insurancePreview, setInsurancePreview] = useState(null);
  const [existingInsuranceImage, setExistingInsuranceImage] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 10,
    onDrop: (files) => {
      const validFiles = files.slice(0, 10 - images.length);
      if (validFiles.length > 0) {
        setImages(prev => [...prev, ...validFiles].slice(0, 10));
        setPreviews(prev => [...prev, ...validFiles.map(f => URL.createObjectURL(f))].slice(0, 10));
      }
      if (files.length > validFiles.length) {
        toast.error('Maximum 10 images allowed');
      }
    },
  });

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  // Load existing vehicle data in edit mode
  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    vehicleService.getById(id)
      .then(({ data }) => {
        const v = data.vehicle || data;
        setValue('name', v.name || '');
        setValue('category', v.category || '');
        setValue('state', v.state || '');
        setValue('vehicle_year', v.vehicle_year || '');
        setValue('mileage', v.mileage || '');
        setValue('fuel_type', v.fuel_type || '');
        setValue('transmission', v.transmission || '');
        setValue('owner_name', v.owner_name || '');
        setValue('registration_number', v.registration_number || '');
        setValue('starting_price', v.starting_price || '');
        setValue('quoted_price', v.quoted_price || '');
        setValue('bid_end_date', v.bid_end_date ? new Date(v.bid_end_date).toISOString().slice(0, 16) : '');
        setValue('description', v.description || '');
        if (isAdmin) {
          setValue('status', v.status || 'pending');
        }
        if (v.image_path) {
          const urls = getImageUrls(v.image_path);
          setExistingImages(urls);
        }
        // RC & Insurance
        setRcAvailable(!!v.rc_available);
        if (v.rc_image) setExistingRcImage(getImageUrl(v.rc_image));
        setInsuranceAvailable(!!v.insurance_available);
        if (v.insurance_image) setExistingInsuranceImage(getImageUrl(v.insurance_image));
      })
      .catch(() => {
        toast.error('Failed to load vehicle data');
        navigate('/vehicles');
      })
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate, setValue, isAdmin]);

  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  const onSubmit = async (data) => {
    // Validate at least 1 image
    const totalImages = images.length + existingImages.length;
    if (totalImages === 0) {
      toast.error('Please upload at least 1 image');
      return;
    }

    setSubmitting(true);
    const category = data.category || '';

    try {
      // -- Step 1: Upload images one-by-one (1 s gap) --
      const totalUploads = images.length + (rcAvailable && rcImage ? 1 : 0) + (insuranceAvailable && insuranceImage ? 1 : 0);
      let completed = 0;
      setUploadProgress({ current: 0, total: totalUploads, label: '' });

      // Vehicle images
      const uploadedPaths = [];
      for (let i = 0; i < images.length; i++) {
        setUploadProgress({ current: completed + 1, total: totalUploads, label: `Uploading image ${i + 1} of ${images.length}...` });
        const res = await vehicleService.uploadImage(images[i], category, 'vehicle');
        uploadedPaths.push(res.data.path);
        completed++;
        if (i < images.length - 1 || (rcAvailable && rcImage) || (insuranceAvailable && insuranceImage)) {
          await delay(1000);
        }
      }

      // RC image
      let uploadedRcPath = '';
      if (rcAvailable && rcImage) {
        setUploadProgress({ current: completed + 1, total: totalUploads, label: 'Uploading RC image...' });
        const res = await vehicleService.uploadImage(rcImage, category, 'rc');
        uploadedRcPath = res.data.path;
        completed++;
        if (insuranceAvailable && insuranceImage) await delay(1000);
      }

      // Insurance image
      let uploadedInsPath = '';
      if (insuranceAvailable && insuranceImage) {
        setUploadProgress({ current: completed + 1, total: totalUploads, label: 'Uploading insurance image...' });
        const res = await vehicleService.uploadImage(insuranceImage, category, 'insurance');
        uploadedInsPath = res.data.path;
        completed++;
      }

      setUploadProgress({ current: totalUploads, total: totalUploads, label: 'Saving vehicle details...' });

      // -- Step 2: Combine existing + newly uploaded paths --
      const allImagePaths = [
        ...existingImages.map((url) => {
          // Convert full URL back to relative path (uploads/...)
          const match = url.match(/uploads\/.*/);
          return match ? match[0] : url;
        }),
        ...uploadedPaths,
      ];

      // -- Step 3: Submit form data (no files, just paths) --
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('category', category);
      formData.append('state', data.state || '');
      if (data.vehicle_year) formData.append('vehicle_year', data.vehicle_year);
      if (data.mileage) formData.append('mileage', data.mileage);
      if (data.fuel_type) formData.append('fuel_type', data.fuel_type);
      if (data.transmission) formData.append('transmission', data.transmission);
      if (data.owner_name) formData.append('owner_name', data.owner_name);
      if (data.registration_number) formData.append('registration_number', data.registration_number);
      formData.append('starting_price', data.starting_price);
      formData.append('quoted_price', data.quoted_price);
      if (data.bid_end_date) formData.append('bid_end_date', data.bid_end_date);
      if (data.description) formData.append('description', data.description);
      if (isAdmin && data.status) formData.append('status', data.status);

      // RC & Insurance
      formData.append('rc_available', rcAvailable ? 'true' : 'false');
      formData.append('insurance_available', insuranceAvailable ? 'true' : 'false');

      // Paths instead of files
      formData.append('uploaded_image_paths', JSON.stringify(allImagePaths));
      if (uploadedRcPath) formData.append('uploaded_rc_path', uploadedRcPath);
      if (uploadedInsPath) formData.append('uploaded_insurance_path', uploadedInsPath);

      if (isEdit) {
        await vehicleService.update(id, formData);
        toast.success('Vehicle updated successfully');
      } else {
        await vehicleService.create(formData);
        toast.success('Vehicle added successfully');
      }
      navigate('/vehicles');
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to ${isEdit ? 'update' : 'add'} vehicle`);
    } finally {
      setSubmitting(false);
      setUploadProgress({ current: 0, total: 0, label: '' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      <button onClick={() => navigate('/vehicles')} className="btn-ghost text-sm -ml-2">
        <i className="fas fa-arrow-left text-sm"></i> Back to Vehicles
      </button>

      <div className="card p-4 sm:p-6">
        <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-4 sm:mb-6 font-display tracking-tight">
          {isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Vehicle Name */}
          <div>
            <label className="label">Vehicle Name / Model</label>
            <input
              {...register('name', { required: 'Vehicle name is required' })}
              className="input-field"
              placeholder="e.g., Honda City 2022 V CVT"
            />
            {errors.name && <p className="text-xs text-danger mt-1.5 font-medium">{errors.name.message}</p>}
          </div>

          {/* Category & State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select {...register('category', { required: 'Required' })} className="select-field">
                <option value="">Select type</option>
                <option value="2W">2 Wheeler</option>
                <option value="3W">3 Wheeler</option>
                <option value="4W">4 Wheeler</option>
                <option value="Commercial">Commercial Vehicle</option>
              </select>
              {errors.category && <p className="text-xs text-danger mt-1.5 font-medium">{errors.category.message}</p>}
            </div>
            <div>
              <label className="label">State</label>
              <select {...register('state', { required: 'State is required' })} className="select-field">
                <option value="">Select state</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.state && <p className="text-xs text-danger mt-1.5 font-medium">{errors.state.message}</p>}
            </div>
          </div>

          {/* Vehicle Specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Manufacturing Year</label>
              <input
                {...register('vehicle_year', { required: 'Manufacturing year is required', min: { value: 1980, message: 'Min 1980' }, max: { value: new Date().getFullYear(), message: 'Invalid year' } })}
                type="number"
                className="input-field"
                placeholder="2022"
              />
              {errors.vehicle_year && <p className="text-xs text-danger mt-1.5 font-medium">{errors.vehicle_year.message}</p>}
            </div>
            <div>
              <label className="label">Mileage (KM)</label>
              <input
                {...register('mileage', { required: 'Mileage is required', min: { value: 0, message: 'Must be positive' } })}
                type="number"
                className="input-field"
                placeholder="45000"
              />
              {errors.mileage && <p className="text-xs text-danger mt-1.5 font-medium">{errors.mileage.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Fuel Type</label>
              <select {...register('fuel_type', { required: 'Fuel type is required' })} className="select-field">
                <option value="">Select fuel type</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="CNG">CNG</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
              {errors.fuel_type && <p className="text-xs text-danger mt-1.5 font-medium">{errors.fuel_type.message}</p>}
            </div>
            <div>
              <label className="label">Transmission</label>
              <select {...register('transmission', { required: 'Transmission is required' })} className="select-field">
                <option value="">Select transmission</option>
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
                <option value="AMT">AMT</option>
                <option value="CVT">CVT</option>
              </select>
              {errors.transmission && <p className="text-xs text-danger mt-1.5 font-medium">{errors.transmission.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Owner Name <span className="text-slate-400 font-normal">— optional</span></label>
              <input
                {...register('owner_name')}
                className="input-field"
                placeholder="Previous owner name"
              />
            </div>
            <div>
              <label className="label">Registration Number <span className="text-slate-400 font-normal">— optional</span></label>
              <input
                {...register('registration_number')}
                className="input-field"
                placeholder="TN01AB1234"
              />
            </div>
          </div>

          {/* Bid End Date & Time */}
          <div>
            <label className="label">Auction End Date & Time</label>
            <input
              {...register('bid_end_date', { required: 'Bid end date is required' })}
              type="datetime-local"
              className="input-field"
              min={new Date().toISOString().slice(0, 16)}
            />
            {errors.bid_end_date && <p className="text-xs text-danger mt-1.5 font-medium">{errors.bid_end_date.message}</p>}
            <p className="text-xs text-slate-400 mt-1">Set when the bidding will close for this vehicle</p>
          </div>

          {/* Starting Price & Quoted Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Bid Starting Price (₹)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <span className="text-slate-400 text-sm font-bold">₹</span>
                </div>
                <input
                  {...register('starting_price', { required: 'Price is required', min: { value: 1000, message: 'Min ₹1,000' } })}
                  type="number"
                  step="1"
                  className="input-field pl-14"
                  placeholder="200000"
                />
              </div>
              {errors.starting_price && <p className="text-xs text-danger mt-1.5 font-medium">{errors.starting_price.message}</p>}
              <p className="text-xs text-slate-400 mt-1">The price at which bidding will start</p>
            </div>
            <div>
              <label className="label">Bid Increase Amount (₹)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <span className="text-slate-400 text-sm font-bold">₹</span>
                </div>
                <input
                  {...register('quoted_price', { required: 'Bid increase amount is required', min: { value: 100, message: 'Min ₹100' } })}
                  type="number"
                  step="1"
                  className="input-field pl-14"
                  placeholder="1000"
                />
              </div>
              {errors.quoted_price && <p className="text-xs text-danger mt-1.5 font-medium">{errors.quoted_price.message}</p>}
              <p className="text-xs text-slate-400 mt-1">Users can only increase bids by this amount (e.g., ₹1000 increments)</p>
            </div>
          </div>

          {/* Admin: Status */}
          {isAdmin && isEdit && (
            <div>
              <label className="label">Status</label>
              <select {...register('status')} className="select-field">
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="label">Description <span className="text-slate-400 font-normal">— optional</span></label>
            <textarea
              {...register('description')}
              rows={4}
              className="input-field resize-none"
              placeholder="Vehicle condition, registration year, kilometers driven, features..."
            />
          </div>

          {/* RC Availability */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="label mb-0">RC (Registration Certificate) Available?</label>
              <button
                type="button"
                onClick={() => { setRcAvailable(!rcAvailable); if (rcAvailable) { setRcImage(null); setRcPreview(null); } }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  rcAvailable ? 'bg-accent' : 'bg-slate-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  rcAvailable ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            {rcAvailable && (
              <div className="pl-1">
                <label className="label text-sm">Upload RC Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files[0];
                    if (f) { setRcImage(f); setRcPreview(URL.createObjectURL(f)); }
                  }}
                  className="input-field text-sm"
                />
                {(rcPreview || existingRcImage) && (
                  <img src={rcPreview || existingRcImage} alt="RC" className="mt-2 h-24 rounded-lg border object-cover" />
                )}
              </div>
            )}
          </div>

          {/* Insurance Availability */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="label mb-0">Insurance Available?</label>
              <button
                type="button"
                onClick={() => { setInsuranceAvailable(!insuranceAvailable); if (insuranceAvailable) { setInsuranceImage(null); setInsurancePreview(null); } }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  insuranceAvailable ? 'bg-accent' : 'bg-slate-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  insuranceAvailable ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            {insuranceAvailable && (
              <div className="pl-1">
                <label className="label text-sm">Upload Insurance Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files[0];
                    if (f) { setInsuranceImage(f); setInsurancePreview(URL.createObjectURL(f)); }
                  }}
                  className="input-field text-sm"
                />
                {(insurancePreview || existingInsuranceImage) && (
                  <img src={insurancePreview || existingInsuranceImage} alt="Insurance" className="mt-2 h-24 rounded-lg border object-cover" />
                )}
              </div>
            )}
          </div>

          {/* Vehicle Images (1-10) */}
          <div>
            <label className="label">Vehicle Images <span className="text-slate-400 font-normal">— minimum 1, maximum 10</span></label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-accent bg-accent/5'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-100 to-gold-50 flex items-center justify-center mb-1">
                  <i className="fas fa-upload text-xl text-accent"></i>
                </div>
                <p className="text-sm text-slate-500">
                  Drag & drop images here, or <span className="text-accent font-bold">click to browse</span>
                </p>
                <p className="text-xs text-slate-400">PNG, JPG up to 10MB each — {10 - images.length - existingImages.length} slots remaining</p>
              </div>
            </div>

            {/* Image Previews Grid */}
            {(previews.length > 0 || existingImages.length > 0) && (
              <div className="mt-4 grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                {/* Existing images */}
                {existingImages.map((img, idx) => (
                  <div key={`existing-${idx}`} className="relative group">
                    <img 
                      src={img} 
                      alt={`Existing ${idx + 1}`} 
                      className="w-full h-24 object-cover rounded-xl border border-slate-200"
                      onError={(e) => { e.target.src = '/images/placeholder-vehicle.svg'; }}
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(idx)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-danger text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <i className="fas fa-xmark text-xs"></i>
                    </button>
                    <span className="absolute bottom-1 left-1 text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded">
                      Saved
                    </span>
                  </div>
                ))}
                {/* New images */}
                {previews.map((preview, idx) => (
                  <div key={`new-${idx}`} className="relative group">
                    <img 
                      src={preview} 
                      alt={`Preview ${idx + 1}`} 
                      className="w-full h-24 object-cover rounded-xl border-2 border-accent/30"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-danger text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <i className="fas fa-xmark text-xs"></i>
                    </button>
                    <span className="absolute bottom-1 left-1 text-[10px] bg-accent text-white px-1.5 py-0.5 rounded">
                      New
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {(images.length + existingImages.length === 0) && (
              <p className="text-xs text-danger mt-2">At least 1 image is required</p>
            )}
          </div>

          {/* Upload Progress */}
          {submitting && uploadProgress.total > 0 && (
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 space-y-2">
              <div className="flex items-center justify-between text-sm font-medium">
                <span className="text-slate-700">{uploadProgress.label}</span>
                <span className="text-accent font-bold">{uploadProgress.current}/{uploadProgress.total}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.round((uploadProgress.current / uploadProgress.total) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => navigate('/vehicles')} disabled={submitting}>Cancel</Button>
            <Button type="submit" loading={submitting} icon={isEdit ? 'fa-save' : 'fa-car'}>
              {submitting && uploadProgress.total > 0
                ? `Uploading ${uploadProgress.current}/${uploadProgress.total}...`
                : isEdit ? 'Save Changes' : 'Add Vehicle'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
