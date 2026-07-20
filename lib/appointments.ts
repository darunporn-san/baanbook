type Appointment = {
  appointment_date: string | null;
  appointment_time: string | null;
};

export function getAppointmentDateTime(appointment: Appointment) {
  if (!appointment.appointment_date) return null;

  const time = appointment.appointment_time?.slice(0, 5) || "23:59";
  return new Date(`${appointment.appointment_date}T${time}:00`);
}

export function isAppointmentDone(appointment: Appointment, now = new Date()) {
  const dateTime = getAppointmentDateTime(appointment);
  return dateTime ? dateTime.getTime() < now.getTime() : false;
}
