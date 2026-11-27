export function validateCriteria(criteria, meta) {
  const errors = {};
  const start = criteria.start_time;
  const end = criteria.end_time;

  if (!criteria.date) errors.date = 'required';
  if (!start) errors.start_time = 'required';
  if (!end) errors.end_time = 'required';
  if (!criteria.student_count) errors.student_count = 'required';

  if (start && end && start >= end) {
    errors.end_time = 'must_be_after_start';
  }

  const count = Number(criteria.student_count);
  if (criteria.student_count && (!Number.isInteger(count) || count < 1 || count > 1000)) {
    errors.student_count = 'too_large';
  }

  if (criteria.date && meta?.today && criteria.date < meta.today) {
    errors.date = 'in_the_past';
  }

  const workStart = meta?.working_hours?.start;
  const workEnd = meta?.working_hours?.end;
  if (workStart && workEnd && start && end && (start < workStart || end > workEnd)) {
    if (!errors.start_time) errors.start_time = 'outside_working_hours';
    if (!errors.end_time) errors.end_time = 'outside_working_hours';
  }

  return errors;
}

export function validateBooking(form, studentCount) {
  const errors = {};
  if (!form.course.trim()) errors.course = 'required';
  if (!form.group_code.trim()) errors.group_code = 'required';
  if (!studentCount || Number(studentCount) < 1) errors.student_count = 'required';
  return errors;
}
