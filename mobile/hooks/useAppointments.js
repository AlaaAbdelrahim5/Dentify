import { useState, useMemo } from 'react';
import { useDataFetch } from './useDataFetch';
import { appointmentsAPI } from '../services/api';
import { filterTodayAppointments, filterUpcomingAppointments } from '../utils/filterUtils';
import { filterAppointments } from '../utils/appointmentHandlers';

/**
 * Custom hook for managing appointments with filtering and categorization
 * @param {string} role - The role of the user ('dentist', 'secretary', 'patient')
 * @param {Function} fetchFunction - Optional custom fetch function
 * @returns {Object} Appointment data and management functions
 */
export const useAppointments = (role, fetchFunction = null) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDentist, setSelectedDentist] = useState('all');
  const [activeView, setActiveView] = useState(role === 'patient' ? 'upcoming' : 'today');

  // Determine the appropriate fetch function based on role
  const defaultFetchFunction = async () => {
    let response;
    switch (role) {
      case 'dentist':
        response = await appointmentsAPI.getDentistAppointments();
        break;
      case 'secretary':
        response = await appointmentsAPI.getClinicAppointments();
        break;
      case 'patient':
        response = await appointmentsAPI.getMyAppointments();
        break;
      default:
        throw new Error(`Invalid role: ${role}`);
    }
    return response.appointments || [];
  };

  const { data: appointments, loading, refreshing, refetch, onRefresh } = useDataFetch(
    fetchFunction || defaultFetchFunction,
    { errorMessage: 'Failed to load appointments' }
  );

  // Categorize appointments
  const todayAppointments = useMemo(() => 
    filterTodayAppointments(appointments || []), 
    [appointments]
  );

  const upcomingAppointments = useMemo(() => 
    filterUpcomingAppointments(appointments || [], role), 
    [appointments, role]
  );

  const pendingAppointments = useMemo(() => {
    if (!appointments) return [];
    return appointments
      .filter(apt => apt.status === 'PENDING')
      .sort((a, b) => new Date(a.startTime || a.appointmentDate) - new Date(b.startTime || b.appointmentDate));
  }, [appointments]);

  const pastAppointments = useMemo(() => {
    if (!appointments) return [];
    const now = new Date();
    return appointments
      .filter(apt => {
        const aptEndTime = new Date(apt.endTime || apt.startTime || apt.appointmentDate);
        return aptEndTime < now || apt.status === 'COMPLETED' || apt.status === 'CANCELLED';
      })
      .sort((a, b) => new Date(b.startTime || b.appointmentDate) - new Date(a.startTime || a.appointmentDate));
  }, [appointments]);

  const allAppointments = useMemo(() => {
    if (!appointments) return [];
    return [...appointments].sort((a, b) => 
      new Date(b.startTime || b.appointmentDate) - new Date(a.startTime || a.appointmentDate)
    );
  }, [appointments]);

  // Determine which appointments to display based on active view
  const displayAppointments = useMemo(() => {
    switch (activeView) {
      case 'today':
        return todayAppointments;
      case 'upcoming':
        return upcomingAppointments;
      case 'pending':
        return pendingAppointments;
      case 'past':
        return pastAppointments;
      case 'all':
        return allAppointments;
      default:
        return todayAppointments;
    }
  }, [activeView, todayAppointments, upcomingAppointments, pendingAppointments, pastAppointments, allAppointments]);

  // Apply filters
  const filteredAppointments = useMemo(() => {
    let filtered = filterAppointments(displayAppointments, searchTerm, selectedStatus, role);
    
    // Additional dentist filter for secretary
    if (role === 'secretary' && selectedDentist !== 'all') {
      filtered = filtered.filter(appointment => 
        appointment.dentist?.userId?.toString() === selectedDentist ||
        appointment.dentist?._id?.toString() === selectedDentist
      );
    }
    
    return filtered;
  }, [displayAppointments, searchTerm, selectedStatus, selectedDentist, role]);

  // Stats
  const stats = useMemo(() => {
    if (role === 'patient') {
      return [
        { label: 'Upcoming', value: upcomingAppointments.length, color: 'bg-teal-500' },
        { label: 'Confirmed', value: upcomingAppointments.filter(a => a.status === 'CONFIRMED').length, color: 'bg-green-500' },
        { label: 'Pending', value: upcomingAppointments.filter(a => a.status === 'PENDING').length, color: 'bg-yellow-500' },
        { label: 'Total Visits', value: pastAppointments.filter(a => a.status === 'COMPLETED').length, color: 'bg-blue-500' }
      ];
    }
    
    return [
      { label: 'Today', value: todayAppointments.length },
      { label: 'Pending', value: pendingAppointments.length },
      { label: 'Upcoming', value: upcomingAppointments.length },
      { label: 'Past', value: pastAppointments.length },
      { label: 'All', value: allAppointments.length }
    ];
  }, [role, todayAppointments, upcomingAppointments, pendingAppointments, pastAppointments, allAppointments]);

  // Filter tabs configuration
  const filterTabs = useMemo(() => {
    if (role === 'patient') {
      return [
        { id: 'upcoming', label: `Upcoming (${upcomingAppointments.length})` },
        { id: 'past', label: `Past (${pastAppointments.length})` }
      ];
    }
    
    return [
      { id: 'today', label: `Today (${todayAppointments.length})` },
      { id: 'pending', label: `Pending (${pendingAppointments.length})` },
      { id: 'upcoming', label: `Upcoming (${upcomingAppointments.length})` },
      { id: 'past', label: `Past (${pastAppointments.length})` },
      { id: 'all', label: `All (${allAppointments.length})` }
    ];
  }, [role, todayAppointments, upcomingAppointments, pendingAppointments, pastAppointments, allAppointments]);

  return {
    appointments: appointments || [],
    loading,
    refreshing,
    refetch,
    onRefresh,
    // Filtered and categorized data
    filteredAppointments,
    todayAppointments,
    upcomingAppointments,
    pendingAppointments,
    pastAppointments,
    allAppointments,
    displayAppointments,
    // Filter state
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    selectedDentist,
    setSelectedDentist,
    activeView,
    setActiveView,
    // UI helpers
    stats,
    filterTabs
  };
};
