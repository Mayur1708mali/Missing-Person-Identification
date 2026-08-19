import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reportSchema, ReportFormData } from '../schemas/reportSchema';
import { uploadPhoto, createMissingPerson } from '../api/missingPersons';
import PhotoUpload from '../components/PhotoUpload';

export default function Report() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
  });

  const onSubmit = async (data: ReportFormData) => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Upload the photo
      const { url } = await uploadPhoto(data.photo);

      // 2. Create the missing person record
      const personData = {
        full_name: data.full_name,
        age: data.age || undefined,
        date_of_birth: data.date_of_birth || undefined,
        gender: data.gender,
        last_seen_location: data.last_seen_location,
        last_seen_date: data.last_seen_date,
        height: data.height || undefined,
        weight: data.weight || undefined,
        distinguishing_marks: data.distinguishing_marks || undefined,
        reporter_contact: data.reporter_contact,
      };

      const person = await createMissingPerson(personData, url);
      navigate(`/person/${person.id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setSubmitError(error.response?.data?.detail || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Report a Missing Person</h1>
        <p className="text-gray-600 mb-8">
          Fill in the details below to report a missing person. A photo is required for facial recognition matching.
        </p>

        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo <span className="text-red-500">*</span>
            </label>
            <PhotoUpload
              onFileSelect={(file) => setValue('photo', file, { shouldValidate: true })}
              error={errors.photo?.message}
            />
          </div>

          {/* Name & Gender */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="full_name"
                type="text"
                {...register('full_name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter full name"
              />
              {errors.full_name && <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>}
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                id="gender"
                {...register('gender')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>}
            </div>
          </div>

          {/* Age & DOB */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <input
                id="age"
                type="number"
                {...register('age', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Age"
              />
              {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>}
            </div>
            <div>
              <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                id="date_of_birth"
                type="date"
                {...register('date_of_birth')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.date_of_birth && <p className="mt-1 text-sm text-red-600">{errors.date_of_birth.message}</p>}
            </div>
          </div>

          {/* Last Seen */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="last_seen_location" className="block text-sm font-medium text-gray-700 mb-1">
                Last Seen Location <span className="text-red-500">*</span>
              </label>
              <input
                id="last_seen_location"
                type="text"
                {...register('last_seen_location')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Central Park, New York"
              />
              {errors.last_seen_location && <p className="mt-1 text-sm text-red-600">{errors.last_seen_location.message}</p>}
            </div>
            <div>
              <label htmlFor="last_seen_date" className="block text-sm font-medium text-gray-700 mb-1">
                Last Seen Date <span className="text-red-500">*</span>
              </label>
              <input
                id="last_seen_date"
                type="date"
                {...register('last_seen_date')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.last_seen_date && <p className="mt-1 text-sm text-red-600">{errors.last_seen_date.message}</p>}
            </div>
          </div>

          {/* Physical Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                Height
              </label>
              <input
                id="height"
                type="text"
                {...register('height')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., 5'8&quot; or 173cm"
              />
            </div>
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                Weight
              </label>
              <input
                id="weight"
                type="text"
                {...register('weight')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., 150lbs or 68kg"
              />
            </div>
          </div>

          {/* Distinguishing Marks */}
          <div>
            <label htmlFor="distinguishing_marks" className="block text-sm font-medium text-gray-700 mb-1">
              Distinguishing Marks
            </label>
            <textarea
              id="distinguishing_marks"
              {...register('distinguishing_marks')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Scars, tattoos, birthmarks, etc."
            />
          </div>

          {/* Reporter Contact */}
          <div>
            <label htmlFor="reporter_contact" className="block text-sm font-medium text-gray-700 mb-1">
              Your Contact Email <span className="text-red-500">*</span>
            </label>
            <input
              id="reporter_contact"
              type="email"
              {...register('reporter_contact')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="your.email@example.com"
            />
            {errors.reporter_contact && <p className="mt-1 text-sm text-red-600">{errors.reporter_contact.message}</p>}
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
