import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { Button, Input, LoadingSpinner } from '../../common';
import { useTheme } from '../../../contexts/ThemeContext';
import { clinicsAPI } from '../../../services/api';

const AvailableTreatmentsManager = ({ clinicId, onUpdate }) => {
  const { isDarkMode } = useTheme();
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTreatments();
  }, [clinicId]);

  const fetchTreatments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await clinicsAPI.getAvailableTreatments(clinicId);
      setTreatments(response.data || []);
    } catch (err) {
      setError('Failed to load treatments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTreatment = () => {
    setTreatments([...treatments, { name: '', cost: 0 }]);
    setEditingIndex(treatments.length);
  };

  const handleRemoveTreatment = (index) => {
    const updated = treatments.filter((_, i) => i !== index);
    setTreatments(updated);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const handleUpdateTreatment = (index, field, value) => {
    const updated = [...treatments];
    updated[index] = {
      ...updated[index],
      [field]: field === 'cost' ? parseFloat(value) || 0 : value
    };
    setTreatments(updated);
  };

  const handleSave = async () => {
    // Validate
    const validTreatments = treatments.filter(t => t.name.trim() !== '');
    
    if (validTreatments.length === 0) {
      setError('Please add at least one treatment');
      return;
    }

    // Check for duplicate names
    const names = validTreatments.map(t => t.name.toLowerCase());
    const hasDuplicates = names.some((name, index) => names.indexOf(name) !== index);
    
    if (hasDuplicates) {
      setError('Treatment names must be unique');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      await clinicsAPI.updateAvailableTreatments({ availableTreatments: validTreatments });
      setSuccess('Treatments updated successfully!');
      setEditingIndex(null);
      
      if (onUpdate) {
        onUpdate(validTreatments);
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update treatments');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    fetchTreatments(); // Reload to discard changes
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Available Treatments
        </h3>
        <Button
          variant="primary"
          onClick={handleAddTreatment}
          className="flex items-center gap-2"
        >
          <FaPlus /> Add Treatment
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-100 border border-red-400 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded bg-green-100 border border-green-400 text-green-700">
          {success}
        </div>
      )}

      <div className="space-y-3">
        {treatments.length === 0 ? (
          <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No treatments added yet. Click "Add Treatment" to get started.
          </div>
        ) : (
          treatments.map((treatment, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Treatment name (e.g., Root Canal)"
                    value={treatment.name}
                    onChange={(e) => handleUpdateTreatment(index, 'name', e.target.value)}
                    disabled={editingIndex !== null && editingIndex !== index}
                    className="mb-0"
                  />
                </div>
                <div className="w-40">
                  <Input
                    type="number"
                    placeholder="Cost"
                    value={treatment.cost}
                    onChange={(e) => handleUpdateTreatment(index, 'cost', e.target.value)}
                    disabled={editingIndex !== null && editingIndex !== index}
                    min="0"
                    step="0.01"
                    className="mb-0"
                  />
                </div>
                <div className="flex gap-2">
                  {editingIndex === index ? (
                    <Button
                      variant="ghost"
                      onClick={() => setEditingIndex(null)}
                      className="p-2"
                      title="Done editing"
                    >
                      <FaTimes className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                    </Button>
                  ) : editingIndex === null && (
                    <Button
                      variant="ghost"
                      onClick={() => handleEdit(index)}
                      className="p-2"
                      title="Edit treatment"
                    >
                      <FaEdit className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => handleRemoveTreatment(index)}
                    className="p-2"
                    title="Remove treatment"
                    disabled={editingIndex !== null && editingIndex !== index}
                  >
                    <FaTrash className={isDarkMode ? 'text-red-400' : 'text-red-600'} />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {treatments.length > 0 && (
        <div className="mt-6 flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={handleCancelEdit}
            disabled={saving}
          >
            <FaTimes className="mr-2" /> Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            {saving ? (
              <>
                <LoadingSpinner size="sm" /> Saving...
              </>
            ) : (
              <>
                <FaSave /> Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AvailableTreatmentsManager;
