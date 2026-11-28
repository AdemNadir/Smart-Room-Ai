import { useState, useMemo, useRef } from "react";
import {
  Users, Building2, Calendar, TrendingUp, TrendingDown, Activity,
  Target, Zap, Brain, Sparkles, ArrowUpRight, Minus, Clock, CheckCircle, AlertTriangle, XCircle, RefreshCw,
  BarChart3, LineChart, Database, GraduationCap
} from "lucide-react";
import { Surface } from "@/components/ui/Surface";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { StatusPill } from "@/components/ui/StatusPill";
import { PageHeader } from "@/components/PageHeader";
import { useI18n } from "@/lib/i18n";
import { cx } from "@/lib/cx";
import styles from "./AdminStatisticsPage.module.css";

// Types
interface KPICard {
  id: string;
  label: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: React.ComponentType<{ size?: number }>;
  trend: "up" | "down" | "neutral";
  color: "primary" | "success" | "warning" | "error" | "info";
}


interface RoomUtilization {
  roomId: string;
  roomName: string;
  building: string;
  capacity: number;
  totalHours: number;
  bookedHours: number;
  utilization: number;
  bookingsCount: number;
}

interface TimeSeriesData {
  date: string;
  bookings: number;
  hours: number;
  uniqueRooms: number;
  uniqueProfessors: number;
}

interface AIInsight {
  id: string;
  type: "optimization" | "anomaly" | "prediction" | "recommendation";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  action?: string;
  confidence: number;
}

// Mock data generators
function generateTimeSeriesData(days: number): TimeSeriesData[] {
  const data: TimeSeriesData[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const baseBookings = 45 + Math.floor(Math.random() * 20);
    const variation = Math.floor(Math.random() * 15) - 7;

    data.push({
      date: date.toISOString().split("T")[0],
      bookings: Math.max(10, baseBookings + variation),
      hours: Math.max(20, (baseBookings + variation) * 1.5),
      uniqueRooms: Math.max(5, 12 + Math.floor(Math.random() * 5)),
      uniqueProfessors: Math.max(8, 18 + Math.floor(Math.random() * 8)),
    });
  }

  return data;
}

function generateRoomUtilization(): RoomUtilization[] {
  const rooms = [
    { roomId: "r1", roomName: "Room 101", building: "Building A", capacity: 30 },
    { roomId: "r2", roomName: "Room 102", building: "Building A", capacity: 45 },
    { roomId: "r3", roomName: "Room 201", building: "Building B", capacity: 60 },
    { roomId: "r4", roomName: "Room 202", building: "Building B", capacity: 35 },
    { roomId: "r5", roomName: "Lab 1", building: "Building C", capacity: 25 },
    { roomId: "r6", roomName: "Lab 2", building: "Building C", capacity: 25 },
    { roomId: "r7", roomName: "Auditorium", building: "Building D", capacity: 150 },
    { roomId: "r8", roomName: "Seminar Room 1", building: "Building A", capacity: 20 },
    { roomId: "r9", roomName: "Seminar Room 2", building: "Building B", capacity: 20 },
    { roomId: "r10", roomName: "Conference Room", building: "Building D", capacity: 40 },
  ];

  return rooms.map(room => {
    const totalHours = 168; // 7 days * 24 hours (or business hours)
    const bookedHours = Math.floor(Math.random() * 80) + 40;
    return {
      ...room,
      totalHours,
      bookedHours,
      utilization: Math.round((bookedHours / totalHours) * 100),
      bookingsCount: Math.floor(Math.random() * 30) + 10,
    };
  }).sort((a, b) => b.utilization - a.utilization);
}

function generateAIInsights(): AIInsight[] {
  return [
    {
      id: "ai-1",
      type: "optimization",
      title: "Room 101 Underutilized on Fridays",
      description: "Room 101 shows only 12% utilization on Fridays. Consider scheduling recurring Friday seminars or making it available for student group bookings.",
      impact: "high",
      action: "View scheduling suggestions",
      confidence: 0.92,
    },
    {
      id: "ai-2",
      type: "anomaly",
      title: "Unusual Booking Spike Detected",
      description: "Building C labs showed 340% increase in bookings last Tuesday. Correlates with CS101 midterm prep. Verify if this is expected seasonal demand.",
      impact: "medium",
      action: "Investigate",
      confidence: 0.87,
    },
    {
      id: "ai-3",
      type: "prediction",
      title: "Exam Period Capacity Shortfall Predicted",
      description: "Based on historical patterns, weeks 12-14 will exceed large room capacity by ~40%. Recommend opening Auditorium for overflow or adding virtual options.",
      impact: "high",
      action: "Plan capacity expansion",
      confidence: 0.94,
    },
    {
      id: "ai-4",
      type: "recommendation",
      title: "Consolidate Low-Utilization Rooms",
      description: "Rooms 202 and Seminar Room 2 average <25% utilization. Could be repurposed as flexible study spaces or merged into larger configurable space.",
      impact: "medium",
      action: "Review space allocation",
      confidence: 0.78,
    },
    {
      id: "ai-5",
      type: "optimization",
      title: "Prime Time Slot Optimization",
      description: "10:00-12:00 slots are 89% booked while 14:00-16:00 are only 45% booked. Incentivize afternoon scheduling with priority booking for morning slots.",
      impact: "high",
      action: "Adjust booking policies",
      confidence: 0.85,
    },
    {
      id: "ai-6",
      type: "prediction",
      title: "New Professor Onboarding Impact",
      description: "3 new professors joining next semester. Predicted 15% increase in booking demand. Pre-allocate preferred rooms based on department affinity.",
      impact: "low",
      action: "Prepare allocations",
      confidence: 0.72,
    },
  ];
}

const TIME_RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "1y", label: "Last year" },
] as const;

export function AdminStatisticsPage() {
  const { t, locale } = useI18n();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const [chartType, setChartType] = useState<"line" | "bar" | "area">("line");
  const [selectedMetric, setSelectedMetric] = useState<"bookings" | "hours" | "rooms" | "professors">("bookings");
  const chartRef = useRef<HTMLDivElement>(null);

  const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 365;
  const timeSeriesData = useMemo(() => generateTimeSeriesData(days), [days]);
  const roomUtilization = useMemo(() => generateRoomUtilization(), []);
  const aiInsights = useMemo(() => generateAIInsights(), []);

  // Calculate KPIs
  const totalBookings = timeSeriesData.reduce((sum, d) => sum + d.bookings, 0);
  const totalHours = timeSeriesData.reduce((sum, d) => sum + d.hours, 0);
  const avgUtilization = Math.round(roomUtilization.reduce((sum, r) => sum + r.utilization, 0) / roomUtilization.length);
  const activeRooms = roomUtilization.filter(r => r.utilization > 0).length;

  // Previous period comparison (mock)
  const prevTotalBookings = Math.floor(totalBookings * (0.85 + Math.random() * 0.2));
  const bookingChange = ((totalBookings - prevTotalBookings) / prevTotalBookings) * 100;

  const prevTotalHours = Math.floor(totalHours * (0.88 + Math.random() * 0.15));
  const hoursChange = ((totalHours - prevTotalHours) / prevTotalHours) * 100;

  const prevAvgUtilization = Math.max(10, avgUtilization + Math.floor(Math.random() * 10) - 5);
  const utilizationChange = ((avgUtilization - prevAvgUtilization) / prevAvgUtilization) * 100;

  const prevActiveRooms = Math.max(5, activeRooms + Math.floor(Math.random() * 3) - 1);
  const roomsChange = ((activeRooms - prevActiveRooms) / prevActiveRooms) * 100;

  const kpis: KPICard[] = [
    {
      id: "kpi-1",
      label: t.stats.totalBookings,
      value: totalBookings.toLocaleString(locale),
      change: bookingChange,
      changeLabel: t.stats.vsPrevPeriod,
      icon: Calendar,
      trend: bookingChange >= 0 ? "up" : "down",
      color: "primary",
    },
    {
      id: "kpi-2",
      label: t.stats.totalHours,
      value: totalHours.toLocaleString(locale),
      change: hoursChange,
      changeLabel: t.stats.vsPrevPeriod,
      icon: Clock,
      trend: hoursChange >= 0 ? "up" : "down",
      color: "success",
    },
    {
      id: "kpi-3",
      label: t.stats.avgUtilization,
      value: `${avgUtilization}%`,
      change: utilizationChange,
      changeLabel: t.stats.vsPrevPeriod,
      icon: TrendingUp,
      trend: utilizationChange >= 0 ? "up" : "down",
      color: "warning",
    },
    {
      id: "kpi-4",
      label: t.stats.activeRooms,
      value: `${activeRooms} / ${roomUtilization.length}`,
      change: roomsChange,
      changeLabel: t.stats.vsPrevPeriod,
      icon: Building2,
      trend: roomsChange >= 0 ? "up" : "down",
      color: "info",
    },
  ];

  // Chart data preparation
  const chartData = useMemo(() => {
    const metricMap: Record<typeof selectedMetric, keyof TimeSeriesData> = {
      bookings: "bookings",
      hours: "hours",
      rooms: "uniqueRooms",
      professors: "uniqueProfessors",
    };

    return timeSeriesData.map(d => ({
      label: new Date(d.date + "T00:00:00").toLocaleDateString(locale, { month: "short", day: "numeric" }),
      value: Number(d[metricMap[selectedMetric]]),
      date: d.date,
    }));
  }, [timeSeriesData, selectedMetric, locale]);

  const maxValue = Math.max(...chartData.map(d => d.value), 1);
  const chartHeight = 280;

  // Render SVG chart
  const renderChart = () => {
    const width = chartRef.current?.clientWidth || 800;
    const padding = { top: 20, right: 30, bottom: 40, left: 50 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = chartHeight - padding.top - padding.bottom;
    const stepX = innerWidth / (chartData.length - 1 || 1);

    const getY = (value: number) => padding.top + innerHeight - (value / maxValue) * innerHeight;
    const getX = (index: number) => padding.left + index * stepX;

    // Area path
    const areaPath = chartData.map((d, i) => `${getX(i)},${getY(d.value)}`).join(" L ") +
      ` L ${getX(chartData.length - 1)},${padding.top + innerHeight} L ${padding.left},${padding.top + innerHeight} Z`;

    // Line path
    const linePath = chartData.map((d, i) => `${getX(i)},${getY(d.value)}`).join(" L ");

    // Bar rectangles
    const barWidth = Math.max(8, stepX * 0.6);

    return (
      <div className={styles.chartContainer} ref={chartRef} role="img" aria-label={`${t.stats.chartLabel} ${selectedMetric}`}>
        <svg width="100%" height={chartHeight} viewBox={`0 0 ${width} ${chartHeight}`} className={styles.chartSvg}>
          {/* Grid lines */}
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--c-accent)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="var(--c-accent)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--c-accent)" />
              <stop offset="100%" stopColor="var(--c-accent)" stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* Y-axis grid */}
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
            <line
              key={ratio}
              x1={padding.left}
              y1={padding.top + innerHeight * ratio}
              x2={width - padding.right}
              y2={padding.top + innerHeight * ratio}
              stroke="var(--glass-border)"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          ))}

          {/* X-axis grid */}
          {chartData.map((_, i) => (
            <line
              key={i}
              x1={getX(i)}
              y1={padding.top}
              x2={getX(i)}
              y2={padding.top + innerHeight}
              stroke="var(--glass-border)"
              strokeWidth="1"
              strokeDasharray="4,4"
              opacity={i % Math.ceil(chartData.length / 10) === 0 ? 1 : 0.3}
            />
          ))}

          {/* Chart content based on type */}
          {chartType === "area" && (
            <path
              d={areaPath}
              fill="url(#areaGradient)"
              className={styles.chartArea}
            />
          )}

          {chartType !== "bar" && (
            <path
              d={linePath}
              fill="none"
              stroke="var(--c-accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.chartLine}
            />
          )}

          {chartType === "bar" && (
            <g className={styles.chartBars}>
              {chartData.map((d, i) => (
                <rect
                  key={i}
                  x={getX(i) - barWidth / 2}
                  y={getY(d.value)}
                  width={barWidth}
                  height={(d.value / maxValue) * innerHeight}
                  fill="var(--c-accent)"
                  rx={2}
                  className={styles.chartBar}
                />
              ))}
            </g>
          )}

          {/* Data points */}
          {chartType !== "bar" && chartData.map((d, i) => {
            const value = d.value;
            if (typeof value !== "number") return null;
            return (
              <circle
                key={i}
                cx={getX(i)}
                cy={getY(value)}
                r={4}
                fill="var(--c-accent)"
                stroke="var(--c-surface)"
                strokeWidth="2"
                className={styles.chartPoint}
              />
            );
          })}

          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
            <text
              key={ratio}
              x={padding.left - 10}
              y={padding.top + innerHeight * ratio + 4}
              textAnchor="end"
              fontSize="11"
              fill="var(--c-ink-3)"
              className={styles.axisLabel}
            >
              {Math.round(maxValue * (1 - ratio)).toLocaleString(locale)}
            </text>
          ))}

          {/* X-axis labels - show subset */}
          {chartData.map((d, i) =>
            i % Math.ceil(chartData.length / 8) === 0 && (
              <text
                key={i}
                x={getX(i)}
                y={padding.top + innerHeight + 20}
                textAnchor="middle"
                fontSize="11"
                fill="var(--c-ink-3)"
                className={styles.axisLabel}
              >
                {d.label}
              </text>
            )
          )}
        </svg>
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title={t.stats.title}
        lead={t.stats.subtitle}
        actions={
          <div className={styles.headerActions}>
            <Field
              type="select"
              value={timeRange}
              onChange={e => setTimeRange(e.target.value as typeof timeRange)}
              className={styles.timeRangeSelect}
              aria-label={t.stats.timeRange}
            >
              {TIME_RANGE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Field>
            <Button variant="ghost" size="sm" onClick={() => {}} aria-label={t.common.refresh}>
              <RefreshCw size={16} aria-hidden />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => {}} aria-label={t.common.export}>
              <Database size={16} aria-hidden />
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className={styles.kpiGrid} role="region" aria-label={t.stats.kpiSection}>
        {kpis.map(kpi => {
          const Icon = kpi.icon;
          const TrendIcon: React.ComponentType<{ size?: number }> =
            kpi.trend === "up" ? TrendingUp : kpi.trend === "down" ? TrendingDown : Minus;
          return (
            <Surface key={kpi.id} className={styles.kpiCard} tone="default">
              <div className={styles.kpiHeader}>
                <div className={cx(styles.kpiIcon, styles[`kpiIcon-${kpi.color}`])}>
                  <Icon size={24} aria-hidden />
                </div>
                <div className={cx(styles.kpiTrend, kpi.trend)}>
                  <TrendIcon size={14} aria-hidden />
                  <span>{Math.abs(kpi.change).toFixed(1)}%</span>
                </div>
              </div>
              <div className={styles.kpiBody}>
                <div className={styles.kpiValue}>{kpi.value}</div>
                <div className={styles.kpiLabel}>{kpi.label}</div>
                <div className={styles.kpiChangeLabel}>{kpi.changeLabel}</div>
              </div>
            </Surface>
          );
        })}
      </div>

      {/* Main Charts Area */}
      <div className={styles.mainGrid}>
        {/* Primary Chart */}
        <Surface className={styles.chartCard} tone="default">
          <div className={styles.chartCardHeader}>
            <h3 className={styles.chartCardTitle}>
              {t.stats.bookingTrends}
            </h3>
            <div className={styles.chartControls}>
              <div className={styles.metricSelector} role="radiogroup" aria-label={t.stats.selectMetric}>
                {([
                  { key: "bookings", label: t.stats.metricBookings, icon: Calendar },
                  { key: "hours", label: t.stats.metricHours, icon: Clock },
                  { key: "rooms", label: t.stats.metricRooms, icon: Building2 },
                  { key: "professors", label: t.stats.metricProfessors, icon: Users },
                ] as const).map(({ key, label, icon: MetricIcon }) => (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={selectedMetric === key}
                    className={cx(styles.metricBtn, selectedMetric === key && styles.metricBtnActive)}
                    onClick={() => setSelectedMetric(key)}
                  >
                    <MetricIcon size={14} aria-hidden />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
              <div className={styles.chartTypeSelector} role="radiogroup" aria-label={t.stats.chartType}>
                {(["line", "area", "bar"] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    role="radio"
                    aria-checked={chartType === type}
                    className={cx(styles.chartTypeBtn, chartType === type && styles.chartTypeBtnActive)}
                    onClick={() => setChartType(type)}
                    aria-label={
                      type === "line"
                        ? t.stats.chartTypeLine
                        : type === "area"
                          ? t.stats.chartTypeArea
                          : t.stats.chartTypeBar
                    }
                  >
                    {type === "line" && <LineChart size={16} aria-hidden />}
                    {type === "area" && <Activity size={16} aria-hidden />}
                    {type === "bar" && <BarChart3 size={16} aria-hidden />}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className={styles.chartWrapper}>
            {renderChart()}
          </div>
        </Surface>

        {/* Room Utilization */}
        <Surface className={styles.utilCard} tone="default">
          <div className={styles.utilHeader}>
            <h3 className={styles.utilTitle}>
              <Target size={20} aria-hidden /> {t.stats.roomUtilization}
            </h3>
            <div className={styles.utilLegend}>
              <span className={cx(styles.legendItem, styles.legendHigh)}>{t.stats.high}</span>
              <span className={cx(styles.legendItem, styles.legendMed)}>{t.stats.medium}</span>
              <span className={cx(styles.legendItem, styles.legendLow)}>{t.stats.low}</span>
            </div>
          </div>
          <div className={styles.utilList}>
            {roomUtilization.map((room, index) => (
              <div key={room.roomId} className={styles.utilRow}>
                <div className={styles.utilRank}>#{index + 1}</div>
                <div className={styles.utilInfo}>
                  <div className={styles.utilName}>{room.roomName}</div>
                  <div className={styles.utilBuilding}>{room.building} • {room.capacity} {t.stats.capacity}</div>
                </div>
                <div className={styles.utilBarContainer}>
                  <div
                    className={cx(styles.utilBar,
                      room.utilization >= 70 ? styles.utilBarHigh :
                      room.utilization >= 40 ? styles.utilBarMed : styles.utilBarLow
                    )}
                    style={{ width: `${room.utilization}%` }}
                    role="progressbar"
                    aria-valuenow={room.utilization}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${room.roomName}: ${room.utilization}% ${t.stats.utilization}`}
                  />
                </div>
                <div className={styles.utilStats}>
                  <span className={styles.utilPct}>{room.utilization}%</span>
                  <span className={styles.utilBookings}>{room.bookingsCount} {t.stats.bookings}</span>
                </div>
              </div>
            ))}
          </div>
        </Surface>
      </div>

      {/* AI Insights */}
      <Surface className={styles.aiCard} tone="default">
        <div className={styles.aiHeader}>
          <div className={styles.aiTitleWrapper}>
            <div className={cx(styles.aiIcon, styles.aiIconPulse)}>
              <Brain size={24} aria-hidden />
              <Sparkles size={16} aria-hidden className={styles.sparkle} />
            </div>
            <div>
              <h3 className={styles.aiTitle}>{t.stats.aiInsights}</h3>
              <p className={styles.aiSubtitle}>{t.stats.aiSubtitle}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => {}}>
            <RefreshCw size={16} aria-hidden /> {t.stats.refreshInsights}
          </Button>
        </div>
        <div className={styles.aiInsights}>
          {aiInsights.map(insight => {
            const typeIcons = {
              optimization: Zap,
              anomaly: AlertTriangle,
              prediction: Target,
              recommendation: CheckCircle,
            };
            const typeColors = {
              optimization: "info",
              anomaly: "warning",
              prediction: "primary",
              recommendation: "success",
            };
                        const TypeIcon = typeIcons[insight.type];

            return (
              <Surface key={insight.id} className={styles.insightCard} tone="glass">
                <div className={styles.insightHeader}>
                  <div className={cx(styles.insightTypeIcon, styles[`insightType-${typeColors[insight.type]}`])}>
                    <TypeIcon size={18} aria-hidden />
                  </div>
                  <div className={styles.insightMeta}>
                    <h4 className={styles.insightTitle}>{insight.title}</h4>
                    <div className={styles.insightBadges}>
                      <StatusPill status="available" tone="accent" size="sm" label={t.stats[`impact${insight.impact.charAt(0).toUpperCase() + insight.impact.slice(1)}` as keyof typeof t.stats] as string} />
                      <span className={styles.confidence}>{Math.round(insight.confidence * 100)}% {t.stats.confidence}</span>
                    </div>
                  </div>
                </div>
                <p className={styles.insightDescription}>{insight.description}</p>
                {insight.action && (
                  <Button variant="outline" size="sm" className={styles.insightAction} onClick={() => {}}>
                    <ArrowUpRight size={14} aria-hidden /> {insight.action}
                  </Button>
                )}
              </Surface>
            );
          })}
        </div>
      </Surface>

      {/* Summary Stats Row */}
      <div className={styles.summaryGrid} role="region" aria-label={t.stats.summarySection}>
        {[
          { label: t.stats.totalRooms, value: roomUtilization.length, icon: Building2, color: "primary" },
          { label: t.stats.totalProfessors, value: 24, icon: GraduationCap, color: "success" },
          { label: t.stats.avgBookingDuration, value: "1.8h", icon: Clock, color: "warning" },
          { label: t.stats.peakUtilization, value: "94%", icon: TrendingUp, color: "error" },
          { label: t.stats.weeklyBookings, value: Math.round(totalBookings / (days / 7)).toLocaleString(locale), icon: Calendar, color: "info" },
          { label: t.stats.cancelRate, value: "3.2%", icon: XCircle, color: "error" },
        ].map((stat, i) => (
          <Surface key={i} className={cx(styles.summaryCard, styles[`summaryCard-${stat.color}`])} tone="default">
            <div className={styles.summaryIconWrapper}>
              <stat.icon size={28} aria-hidden />
            </div>
            <div className={styles.summaryContent}>
              <div className={styles.summaryValue}>{stat.value}</div>
              <div className={styles.summaryLabel}>{stat.label}</div>
            </div>
          </Surface>
        ))}
      </div>
    </div>
  );
}