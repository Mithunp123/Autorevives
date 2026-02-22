import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui';
import { vehicleService } from '@/services';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function VehicleForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEdit = Boolean(id);
  const isAdmin = user?.role === 'admin';

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingImage, setExistingImage] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: (files) => {
      if (files[0]) {
        setImage(files[0]);
        setPreview(URL.createObjectURL(files[0]));
      }
    },
  });

  // Load existing vehicle data in edit mode
  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    vehicleService.getById(id)
      .then(({ data }) => {
        const v = data.vehicle || data;
        setValue('name', v.name || '');
        setValue('category', v.category || '');
        setValue('starting_price', v.starting_price || '');
        setValue('quoted_price', v.quoted_price || '');
        setValue('description', v.description || '');
        if (isAdmin) {
          setValue('status', v.status || 'pending');
        }
        if (v.image_path) {
          setExistingImage(`/api/uploads/${v.image_path.replace('uploads/', '')}`);
        }
      })
      .catch(() => {
        toast.error('Failed to load vehicle data');
        navigate('/vehicles');
      })
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate, setValue, isAdmin]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('category', data.category || '');
      formData.append('starting_price', data.starting_price);
      if (data.quoted_price) formData.append('quoted_price', data.quoted_price);
      formData.append('description', data.description);
      if (isAdmin && data.status) formData.append('status', data.status);
      if (image) formData.append('image', image);

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
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <button onClick={() => navigate('/vehicles')} className="btn-ghost text-sm -ml-2">
        <i className="fas fa-arrow-left text-sm"></i> Back to Vehicles
      </button>

      <div className="card p-6">
        <h1 className="text-xl font-extrabold text-slate-900 mb-6 font-display tracking-tight">
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

          {/* Category & Starting Price */}
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
          </div>

          {/* Quoted Price */}
          <div>
            <label className="label">Quoted Amount (₹) <span className="text-slate-400 font-normal">— optional</span></label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <span className="text-slate-400 text-sm font-bold">₹</span>
              </div>
              <input
                {...register('quoted_price', { min: { value: 0, message: 'Must be positive' } })}
                type="number"
                step="1"
                className="input-field pl-14"
                placeholder="350000"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">Your expected/quoted price for this vehicle. Bidding starts from the Starting Price above.</p>
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
            <label className="label">Description</label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows={4}
              className="input-field resize-none"
              placeholder="Vehicle condition, registration year, kilometers driven, features..."
            />
            {errors.description && <p className="text-xs text-danger mt-1.5 font-medium">{errors.description.message}</p>}
          </div>

          {/* Vehicle Image */}
          <div>
            <label className="label">Vehicle Image</label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-accent bg-accent/5'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <input {...getInputProps()} />
              {preview ? (
                <div className="relative inline-block">
                  <img src={preview} alt="Preview" className="w-40 h-28 object-cover rounded-xl mx-auto" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setImage(null); setPreview(null); }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-danger text-white rounded-full flex items-center justify-center"
                  >
                    <i className="fas fa-xmark text-xs"></i>
                  </button>
                  <p className="text-xs text-slate-400 mt-2">{image?.name}</p>
                </div>
              ) : existingImage ? (
                <div className="relative inline-block">
                  <img
                    src={existingImage}
                    alt="Current"
                    className="w-40 h-28 object-cover rounded-xl mx-auto"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <p className="text-xs text-slate-400 mt-2">Current image — drop a new one to replace</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center mb-1">
                    <i className="fas fa-upload text-xl text-accent"></i>
                  </div>
                  <p className="text-sm text-slate-500">
                    Drag & drop image here, or <span className="text-accent font-bold">click to browse</span>
                  </p>
                  <p className="text-xs text-slate-400">PNG, JPG up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => navigate('/vehicles')}>Cancel</Button>
            <Button type="submit" loading={submitting} icon={isEdit ? 'fa-save' : 'fa-car'}>
              {isEdit ? 'Save Changes' : 'Add Vehicle'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
