import React, { useState, useMemo } from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock, BookOpen, Building2, Users } from "lucide-react";
import { Surface } from "@/components/ui/Surface";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/PageHeader";
import { useI18n } from "@/lib/i18n";
import { cx } from "@/lib/cx";
import styles from "./SchedulingPage.module.css";

// Types
interface Promotion {
  id: string;
  name: string;
  year: string; // e.g., "L1", "L2", "M1", "M2"
  department: string;
}

interface Module {
  id: string;
  code: string;
  name: string;
  promotionId: string;
  color: string; // for visual distinction
}

interface Classroom {
  id: string;
  name: string;
  building: string;
  capacity: number;
  type: "lecture" | "classroom" | "lab" | "amphitheatre";
}

interface OfficialSession {
  id: string;
  moduleId: string;
  classroomId: string;
  promotionId: string;
  dayOfWeek: number; // 0 = Monday, 6 = Sunday (but we use 0-4 for Mon-Fri)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  weekPattern: "all" | "odd" | "even"; // for alternating weeks
}

// Mock data
const MOCK_PROMOTIONS: Promotion[] = [
  { id: "promo-l1-cs", name: "Computer Science", year: "L1", department: "Computer Science" },
  { id: "promo-l2-cs", name: "Computer Science", year: "L2", department: "Computer Science" },
  { id: "promo-l3-cs", name: "Computer Science", year: "L3", department: "Computer Science" },
  { id: "promo-m1-ai", name: "Artificial Intelligence", year: "M1", department: "Computer Science" },
  { id: "promo-m2-ai", name: "Artificial Intelligence", year: "M2", department: "Computer Science" },
  { id: "promo-l1-math", name: "Mathematics", year: "L1", department: "Mathematics" },
  { id: "promo-l2-math", name: "Mathematics", year: "L2", department: "Mathematics" },
];

const MOCK_MODULES: Module[] = [
  { id: "mod-cs101", code: "CS101", name: "Introduction to Programming", promotionId: "promo-l1-cs", color: "#3B82F6" },
  { id: "mod-cs102", code: "CS102", name: "Data Structures", promotionId: "promo-l1-cs", color: "#06B6D4" },
  { id: "mod-cs103", code: "CS103", name: "Computer Architecture", promotionId: "promo-l1-cs", color: "#8B5CF6" },
  { id: "mod-cs201", code: "CS201", name: "Algorithms & Complexity", promotionId: "promo-l2-cs", color: "#3B82F6" },
  { id: "mod-cs202", code: "CS202", name: "Database Systems", promotionId: "promo-l2-cs", color: "#06B6D4" },
  { id: "mod-cs203", code: "CS203", name: "Operating Systems", promotionId: "promo-l2-cs", color: "#8B5CF6" },
  { id: "mod-cs301", code: "CS301", name: "Machine Learning", promotionId: "promo-l3-cs", color: "#3B82F6" },
  { id: "mod-cs302", code: "CS302", name: "Software Engineering", promotionId: "promo-l3-cs", color: "#06B6D4" },
  { id: "mod-cs303", code: "CS303", name: "Distributed Systems", promotionId: "promo-l3-cs", color: "#8B5CF6" },
  { id: "mod-ai401", code: "AI401", name: "Deep Learning", promotionId: "promo-m1-ai", color: "#EC4899" },
  { id: "mod-ai402", code: "AI402", name: "Natural Language Processing", promotionId: "promo-m1-ai", color: "#F97316" },
  { id: "mod-ai501", code: "AI501", name: "Advanced ML Research", promotionId: "promo-m2-ai", color: "#EC4899" },
  { id: "mod-math101", code: "MATH101", name: "Calculus I", promotionId: "promo-l1-math", color: "#22C55E" },
  { id: "mod-math102", code: "MATH102", name: "Linear Algebra", promotionId: "promo-l1-math", color: "#84CC16" },
  { id: "mod-math201", code: "MATH201", name: "Real Analysis", promotionId: "promo-l2-math", color: "#22C55E" },
];

const MOCK_CLASSROOMS: Classroom[] = [
  { id: "room-a101", name: "A101", building: "Building A", capacity: 80, type: "amphitheatre" },
  { id: "room-a102", name: "A102", building: "Building A", capacity: 45, type: "classroom" },
  { id: "room-a103", name: "A103", building: "Building A", capacity: 35, type: "classroom" },
  { id: "room-b201", name: "B201", building: "Building B", capacity: 120, type: "amphitheatre" },
  { id: "room-b202", name: "B202", building: "Building B", capacity: 50, type: "lecture" },
  { id: "room-b203", name: "B203", building: "Building B", capacity: 30, type: "classroom" },
  { id: "room-c101", name: "C101", building: "Building C", capacity: 25, type: "lab" },
  { id: "room-c102", name: "C102", building: "Building C", capacity: 25, type: "lab" },
  { id: "room-d-aud", name: "Auditorium", building: "Building D", capacity: 200, type: "amphitheatre" },
];

const MOCK_OFFICIAL_SESSIONS: OfficialSession[] = [
  // L1 Computer Science
  { id: "sess-1", moduleId: "mod-cs101", classroomId: "room-a101", promotionId: "promo-l1-cs", dayOfWeek: 0, startTime: "08:00", endTime: "09:30", weekPattern: "all" },
  { id: "sess-2", moduleId: "mod-cs102", classroomId: "room-a102", promotionId: "promo-l1-cs", dayOfWeek: 0, startTime: "09:45", endTime: "11:15", weekPattern: "all" },
  { id: "sess-3", moduleId: "mod-cs103", classroomId: "room-b202", promotionId: "promo-l1-cs", dayOfWeek: 1, startTime: "08:00", endTime: "09:30", weekPattern: "all" },
  { id: "sess-4", moduleId: "mod-cs101", classroomId: "room-c101", promotionId: "promo-l1-cs", dayOfWeek: 1, startTime: "13:15", endTime: "14:45", weekPattern: "odd" }, // Lab session
  { id: "sess-5", moduleId: "mod-cs102", classroomId: "room-a103", promotionId: "promo-l1-cs", dayOfWeek: 2, startTime: "11:30", endTime: "13:00", weekPattern: "all" },
  { id: "sess-6", moduleId: "mod-cs103", classroomId: "room-a102", promotionId: "promo-l1-cs", dayOfWeek: 3, startTime: "08:00", endTime: "09:30", weekPattern: "even" },
  { id: "sess-7", moduleId: "mod-cs101", classroomId: "room-a101", promotionId: "promo-l1-cs", dayOfWeek: 4, startTime: "15:00", endTime: "16:30", weekPattern: "all" },

  // L2 Computer Science
  { id: "sess-8", moduleId: "mod-cs201", classroomId: "room-b201", promotionId: "promo-l2-cs", dayOfWeek: 0, startTime: "08:00", endTime: "09:30", weekPattern: "all" },
  { id: "sess-9", moduleId: "mod-cs202", classroomId: "room-b202", promotionId: "promo-l2-cs", dayOfWeek: 0, startTime: "13:15", endTime: "14:45", weekPattern: "all" },
  { id: "sess-10", moduleId: "mod-cs203", classroomId: "room-a103", promotionId: "promo-l2-cs", dayOfWeek: 1, startTime: "09:45", endTime: "11:15", weekPattern: "all" },
  { id: "sess-11", moduleId: "mod-cs201", classroomId: "room-c101", promotionId: "promo-l2-cs", dayOfWeek: 2, startTime: "08:00", endTime: "09:30", weekPattern: "odd" }, // Lab
  { id: "sess-12", moduleId: "mod-cs202", classroomId: "room-a102", promotionId: "promo-l2-cs", dayOfWeek: 3, startTime: "11:30", endTime: "13:00", weekPattern: "all" },
  { id: "sess-13", moduleId: "mod-cs203", classroomId: "room-b203", promotionId: "promo-l2-cs", dayOfWeek: 4, startTime: "08:00", endTime: "09:30", weekPattern: "all" },

  // L3 Computer Science
  { id: "sess-14", moduleId: "mod-cs301", classroomId: "room-b202", promotionId: "promo-l3-cs", dayOfWeek: 0, startTime: "11:30", endTime: "13:00", weekPattern: "all" },
  { id: "sess-15", moduleId: "mod-cs302", classroomId: "room-a103", promotionId: "promo-l3-cs", dayOfWeek: 1, startTime: "08:00", endTime: "09:30", weekPattern: "all" },
  { id: "sess-16", moduleId: "mod-cs303", classroomId: "room-b201", promotionId: "promo-l3-cs", dayOfWeek: 2, startTime: "13:15", endTime: "14:45", weekPattern: "all" },
  { id: "sess-17", moduleId: "mod-cs301", classroomId: "room-c102", promotionId: "promo-l3-cs", dayOfWeek: 3, startTime: "08:00", endTime: "09:30", weekPattern: "even" }, // Lab
  { id: "sess-18", moduleId: "mod-cs302", classroomId: "room-a102", promotionId: "promo-l3-cs", dayOfWeek: 4, startTime: "15:00", endTime: "16:30", weekPattern: "all" },

  // M1 AI
  { id: "sess-19", moduleId: "mod-ai401", classroomId: "room-b201", promotionId: "promo-m1-ai", dayOfWeek: 0, startTime: "09:45", endTime: "11:15", weekPattern: "all" },
  { id: "sess-20", moduleId: "mod-ai402", classroomId: "room-c101", promotionId: "promo-m1-ai", dayOfWeek: 1, startTime: "13:15", endTime: "16:30", weekPattern: "all" }, // Long lab
  { id: "sess-21", moduleId: "mod-ai401", classroomId: "room-a101", promotionId: "promo-m1-ai", dayOfWeek: 3, startTime: "08:00", endTime: "09:30", weekPattern: "all" },
  { id: "sess-22", moduleId: "mod-ai402", classroomId: "room-c102", promotionId: "promo-m1-ai", dayOfWeek: 4, startTime: "11:30", endTime: "13:00", weekPattern: "odd" },

  // M2 AI
  { id: "sess-23", moduleId: "mod-ai501", classroomId: "room-d-aud", promotionId: "promo-m2-ai", dayOfWeek: 1, startTime: "08:00", endTime: "11:15", weekPattern: "all" },
  { id: "sess-24", moduleId: "mod-ai501", classroomId: "room-b202", promotionId: "promo-m2-ai", dayOfWeek: 3, startTime: "13:15", endTime: "16:30", weekPattern: "all" },

  // L1 Math
  { id: "sess-25", moduleId: "mod-math101", classroomId: "room-a101", promotionId: "promo-l1-math", dayOfWeek: 0, startTime: "11:30", endTime: "13:00", weekPattern: "all" },
  { id: "sess-26", moduleId: "mod-math102", classroomId: "room-a102", promotionId: "promo-l1-math", dayOfWeek: 2, startTime: "08:00", endTime: "09:30", weekPattern: "all" },
  { id: "sess-27", moduleId: "mod-math101", classroomId: "room-b203", promotionId: "promo-l1-math", dayOfWeek: 4, startTime: "09:45", endTime: "11:15", weekPattern: "all" },

  // L2 Math
  { id: "sess-28", moduleId: "mod-math201", classroomId: "room-a103", promotionId: "promo-l2-math", dayOfWeek: 1, startTime: "11:30", endTime: "13:00", weekPattern: "all" },
  { id: "sess-29", moduleId: "mod-math201", classroomId: "room-b202", promotionId: "promo-l2-math", dayOfWeek: 3, startTime: "08:00", endTime: "09:30", weekPattern: "all" },
];

const TIME_SLOTS = [
  { start: "08:00", end: "09:30", label: "08:00–09:30" },
  { start: "09:45", end: "11:15", label: "09:45–11:15" },
  { start: "11:30", end: "13:00", label: "11:30–13:00" },
  { start: "13:15", end: "14:45", label: "13:15–14:45" },
  { start: "15:00", end: "16:30", label: "15:00–16:30" },
  { start: "16:45", end: "18:15", label: "16:45–18:15" },
];

const DAYS_OF_WEEK = [
  { key: 0, short: "Mon", long: "Monday" },
  { key: 1, short: "Tue", long: "Tuesday" },
  { key: 2, short: "Wed", long: "Wednesday" },
  { key: 3, short: "Thu", long: "Thursday" },
  { key: 4, short: "Fri", long: "Friday" },
];

function getModule(moduleId: string): Module | undefined {
  return MOCK_MODULES.find(m => m.id === moduleId);
}

function getClassroom(classroomId: string): Classroom | undefined {
  return MOCK_CLASSROOMS.find(c => c.id === classroomId);
}

function getPromotion(promotionId: string): Promotion | undefined {
  return MOCK_PROMOTIONS.find(p => p.id === promotionId);
}

function getSessionsForPromotion(promotionId: string): OfficialSession[] {
  return MOCK_OFFICIAL_SESSIONS.filter(s => s.promotionId === promotionId);
}

export function SchedulingPage() {
  const { t, dir, locale } = useI18n();
  const [selectedPromotionId, setSelectedPromotionId] = useState<string>("");
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);

  // Get assigned promotions (in real app, from user profile)
  const assignedPromotions = useMemo(() => MOCK_PROMOTIONS, []);

  // Default to first assigned promotion
  const effectivePromotionId = selectedPromotionId || assignedPromotions[0]?.id || "";

  // Week dates calculation (Mon-Fri)
  const weekDates = useMemo(() => {
    const dates: string[] = [];
    const baseDate = new Date(selectedDate + "T00:00:00");
    const dayOfWeek = baseDate.getDay(); // 0 = Sunday
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    for (let i = 0; i < 5; i++) { // Mon-Fri only
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + mondayOffset + i);
      dates.push(d.toISOString().split("T")[0]);
    }
    return dates;
  }, [selectedDate]);

  const today = new Date().toISOString().split("T")[0];

  // Navigation
  const navigateWeek = (delta: number) => {
    const base = new Date(selectedDate + "T00:00:00");
    base.setDate(base.getDate() + delta * 7);
    setSelectedDate(base.toISOString().split("T")[0]);
  };

  const navigateDay = (delta: number) => {
    const base = new Date(selectedDate + "T00:00:00");
    base.setDate(base.getDate() + delta);
    setSelectedDate(base.toISOString().split("T")[0]);
  };

  // Get sessions for current promotion and week
  const promotionSessions = useMemo(() => {
    if (!effectivePromotionId) return [];
    return getSessionsForPromotion(effectivePromotionId);
  }, [effectivePromotionId]);

  // Render day view
  const renderDayView = () => {
    const daySessions = promotionSessions.filter(s => {
      const sessionDate = weekDates.find(d => new Date(d + "T00:00:00").getDay() === (s.dayOfWeek + 1) % 7);
      return sessionDate === selectedDate;
    });

    const sessionsBySlot = useMemo(() => {
      const map = new Map<string, OfficialSession[]>();
      TIME_SLOTS.forEach(slot => map.set(slot.start, []));
      daySessions.forEach(session => {
        const slot = TIME_SLOTS.find(s => s.start === session.startTime && s.end === session.endTime);
        if (slot) {
          map.get(slot.start)?.push(session);
        }
      });
      return map;
    }, [daySessions]);

    return (
      <div className={styles.dayView}>
        <div className={styles.dayHeader}>
          <div className={styles.dayTitleWrapper}>
            <h2 className={styles.dayTitle}>
              {new Date(selectedDate + "T00:00:00").toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </h2>
            {effectivePromotionId && (
              <p className={styles.dayPromotion}>
                {t.scheduling.promotion}: {getPromotion(effectivePromotionId)?.name} {getPromotion(effectivePromotionId)?.year}
              </p>
            )}
          </div>
        </div>

        <Surface className={styles.scheduleGridWrapper}>
          <div className={styles.scheduleGrid} role="grid" aria-label={t.scheduling.timetable}>
            {/* Time column header */}
            <div className={styles.timeColumnHeader} role="columnheader">
              <span className={styles.timeHeaderLabel}>{t.scheduling.time}</span>
            </div>

            {/* Day header (single day in day view) */}
            <div className={styles.dayColumnHeader} role="columnheader">
              <div className={styles.dayNameHeader}>
                {new Date(selectedDate + "T00:00:00").toLocaleDateString(locale, { weekday: "short" })}
              </div>
              <div className={styles.dayNumberHeader}>
                {new Date(selectedDate + "T00:00:00").toLocaleDateString(locale, { day: "numeric" })}
              </div>
              {selectedDate === today && <span className={styles.todayBadge}>{t.scheduling.today}</span>}
            </div>

            {/* Time slots */}
            {TIME_SLOTS.map(slot => (
              <React.Fragment key={slot.start}>
                <div className={styles.timeSlotCell} role="rowheader">
                  <span className={styles.timeLabel}>{slot.label}</span>
                </div>
                <div className={styles.sessionCell}>
                  {sessionsBySlot.get(slot.start)?.map(session => {
                    const module = getModule(session.moduleId);
                    const classroom = getClassroom(session.classroomId);
                    if (!module || !classroom) return null;
                    return (
                      <Surface
                        key={session.id}
                        className={cx(styles.sessionCard, styles[session.weekPattern])}
                        style={{ borderLeftColor: module.color } as React.CSSProperties}
                        padding="sm"
                      >
                        <div className={styles.sessionModule}>
                          <span className={styles.moduleCode} style={{ color: module.color }}>{module.code}</span>
                          <span className={styles.moduleName}>{module.name}</span>
                        </div>
                        <div className={styles.sessionMeta}>
                          <div className={styles.metaItem}>
                            <BookOpen size={12} aria-hidden /> {module.code}
                          </div>
                          <div className={styles.metaItem}>
                            <Building2 size={12} aria-hidden /> {classroom.name}, {classroom.building}
                          </div>
                          <div className={styles.metaItem}>
                            <Users size={12} aria-hidden /> {classroom.capacity} {t.scheduling.capacity}
                          </div>
                          {session.weekPattern !== "all" && (
                            <div className={cx(styles.weekPatternBadge, styles[session.weekPattern])}>
                              {session.weekPattern === "odd" ? t.scheduling.oddWeeks : t.scheduling.evenWeeks}
                            </div>
                          )}
                        </div>
                      </Surface>
                    );
                  })}
                  {(!sessionsBySlot.get(slot.start) || sessionsBySlot.get(slot.start)!.length === 0) && (
                    <div className={styles.emptySlotIndicator} aria-hidden="true" />
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>
        </Surface>

        {daySessions.length === 0 && (
          <Surface className={styles.noSessions} tone="glass">
            <p>{t.scheduling.noSessions}</p>
            <p className={styles.officialOnlyNote}>{t.scheduling.officialSessionsOnly}</p>
          </Surface>
        )}
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => {
    return (
      <div className={styles.weekView}>
        <div className={styles.weekHeader}>
          <div className={styles.weekTitleWrapper}>
            <h2 className={styles.weekTitle}>
              {t.scheduling.weekOf} {formatDate(weekDates[0], locale)} – {formatDate(weekDates[4], locale)}
            </h2>
            {effectivePromotionId && (
              <p className={styles.weekPromotion}>
                {t.scheduling.promotion}: {getPromotion(effectivePromotionId)?.name} {getPromotion(effectivePromotionId)?.year}
              </p>
            )}
          </div>
        </div>

        <Surface className={styles.weekGridWrapper}>
          <div className={styles.weekGrid} role="grid" aria-label={t.scheduling.timetable}>
            {/* Time column header */}
            <div className={styles.weekTimeHeader} role="columnheader">
              <span>{t.scheduling.time}</span>
            </div>

            {/* Day headers */}
            {weekDates.map((date, dayIndex) => (
              <div key={date} className={styles.weekDayHeader} role="columnheader">
                <div className={styles.dayName}>
                  {DAYS_OF_WEEK[dayIndex]?.short || new Date(date + "T00:00:00").toLocaleDateString(locale, { weekday: "short" })}
                </div>
                <div className={styles.dayNumber}>
                  {new Date(date + "T00:00:00").toLocaleDateString(locale, { day: "numeric" })}
                </div>
                {date === today && <span className={styles.todayBadge}>{t.scheduling.today}</span>}
              </div>
            ))}

            {/* Time slot rows */}
            {TIME_SLOTS.map(slot => (
              <React.Fragment key={slot.start}>
                <div className={styles.weekTimeSlotHeader} role="rowheader">
                  <span className={styles.timeLabel}>{slot.label}</span>
                </div>
                {weekDates.map((date, dayIndex) => {
                  const dayOfWeek = dayIndex; // 0=Mon, 4=Fri
                  const sessionsInSlot = promotionSessions.filter(s =>
                    s.dayOfWeek === dayOfWeek &&
                    s.startTime === slot.start &&
                    s.endTime === slot.end
                  );
                  return (
                    <div key={`${slot.start}-${date}`} className={styles.weekDayCell}>
                      {sessionsInSlot.map(session => {
                        const module = getModule(session.moduleId);
                        const classroom = getClassroom(session.classroomId);
                        if (!module || !classroom) return null;
                        return (
                          <Surface
                            key={session.id}
                            className={cx(styles.weekSessionCard, styles[session.weekPattern])}
                            style={{ borderLeftColor: module.color } as React.CSSProperties}
                            padding="sm"
                          >
                            <div className={styles.weekSessionModule}>
                              <span className={styles.moduleCode} style={{ color: module.color }}>{module.code}</span>
                              <span className={styles.moduleName}>{module.name}</span>
                            </div>
                            <div className={styles.weekSessionMeta}>
                              <div className={styles.metaItem}>
                                <Building2 size={10} aria-hidden /> {classroom.name}
                              </div>
                              {session.weekPattern !== "all" && (
                                <span className={cx(styles.weekPatternBadge, styles[session.weekPattern])}>
                                  {session.weekPattern === "odd" ? t.scheduling.oddWeeks : t.scheduling.evenWeeks}
                                </span>
                              )}
                            </div>
                          </Surface>
                        );
                      })}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </Surface>

        {promotionSessions.length === 0 && (
          <Surface className={styles.noSessions} tone="glass">
            <p>{t.scheduling.noSessions}</p>
            <p className={styles.officialOnlyNote}>{t.scheduling.officialSessionsOnly}</p>
          </Surface>
        )}
      </div>
    );
  };

  return (
    <div className={styles.page} dir={dir}>
      <PageHeader
        title={t.scheduling.title}
        lead={t.scheduling.subtitle}
        actions={
          <div className={styles.headerActions}>
            <Button
              variant={viewMode === "day" ? "primary" : "quiet"}
              className={styles.viewToggle}
              onClick={() => setViewMode("day")}
              aria-pressed={viewMode === "day"}
            >
              <Calendar size={18} aria-hidden />
              <span>{t.scheduling.dayView}</span>
            </Button>
            <Button
              variant={viewMode === "week" ? "primary" : "quiet"}
              className={styles.viewToggle}
              onClick={() => setViewMode("week")}
              aria-pressed={viewMode === "week"}
            >
              <Calendar size={18} aria-hidden />
              <span>{t.scheduling.weekView}</span>
            </Button>
          </div>
        }
      />

      {/* Promotion Selector */}
      <Surface className={styles.promoSelector}>
        <div className={styles.promoSelectorContent}>
          <label className={styles.promoLabel} htmlFor="promo-select">
            {t.scheduling.selectPromo}
          </label>
          <select
            id="promo-select"
            value={selectedPromotionId || effectivePromotionId}
            onChange={e => setSelectedPromotionId(e.target.value || "")}
            aria-label={t.scheduling.selectPromo}
            className={styles.promoSelect}
          >
            {assignedPromotions.map(promo => (
              <option key={promo.id} value={promo.id}>
                {promo.name} {promo.year} — {promo.department}
              </option>
            ))}
            {assignedPromotions.length === 0 && (
              <option value="" disabled>
                {t.scheduling.noPromoAssigned}
              </option>
            )}
          </select>
        </div>
        {assignedPromotions.length === 0 && (
          <p className={styles.noPromoMessage}>{t.scheduling.noPromoAssigned}</p>
        )}
      </Surface>

      {/* Date Navigation */}
      <Surface className={styles.navBar}>
        <div className={styles.navLeft}>
          <button
            className={styles.navBtn}
            onClick={() => viewMode === "day" ? navigateDay(-1) : navigateWeek(-1)}
            aria-label={t.common.previous}
          >
            <ChevronLeft size={20} aria-hidden />
          </button>
          <div className={styles.navTitle}>
            {viewMode === "day"
              ? new Date(selectedDate + "T00:00:00").toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
              : `${t.scheduling.weekOf} ${formatDate(weekDates[0], locale)} – ${formatDate(weekDates[4], locale)}`}
          </div>
          <button
            className={styles.navBtn}
            onClick={() => viewMode === "day" ? navigateDay(1) : navigateWeek(1)}
            aria-label={t.common.next}
          >
            <ChevronRight size={20} aria-hidden />
          </button>
        </div>
        <div className={styles.navRight}>
          <Button variant="secondary" onClick={() => setSelectedDate(today)}>
            {t.scheduling.today}
          </Button>
        </div>
      </Surface>

      {viewMode === "day" ? renderDayView() : renderWeekView()}

      {/* Official Sessions Only Notice */}
      <Surface className={styles.officialNotice} tone="glass">
        <div className={styles.noticeContent}>
          <Clock size={18} aria-hidden className={styles.noticeIcon} />
          <p>{t.scheduling.officialSessionsOnly}</p>
        </div>
      </Surface>
    </div>
  );
}

function formatDate(dateStr: string, locale: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short" });
}