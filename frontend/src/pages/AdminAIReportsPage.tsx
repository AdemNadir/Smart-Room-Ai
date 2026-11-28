import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send, MicOff, Bot, User, Copy,
  RotateCcw, Sparkles, Brain, Zap, X,
  TrendingUp, ChevronDown, ChevronUp, FileText, BarChart2,
  Settings, History, Plus, Trash2, GraduationCap, Upload
} from "lucide-react";
import { Surface } from "@/components/ui/Surface";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/PageHeader";
import { StatusPill } from "@/components/ui/StatusPill";
import { useI18n } from "@/lib/i18n";
import { cx } from "@/lib/cx";
import styles from "./AdminAIReportsPage.module.css";

// Types
interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  metadata?: {
    type?: "insight" | "chart" | "table" | "recommendation" | "analysis";
    data?: any;
    citations?: string[];
    confidence?: number;
  };
  isStreaming?: boolean;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number }>;
  prompt: string;
  category: "utilization" | "planning" | "optimization" | "financial" | "academic";
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  templateId?: string;
}

// Mock report templates
const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: "weekly-utilization",
    name: "Weekly Utilization Report",
    description: "Comprehensive room usage analysis with trends and anomalies",
    icon: BarChart2,
    prompt: "Generate a weekly utilization report for all rooms. Include occupancy rates, peak hours, underutilized spaces, and comparison with previous week.",
    category: "utilization",
  },
  {
    id: "capacity-planning",
    name: "Capacity Planning Forecast",
    description: "Predict future room demand based on enrollment trends and scheduling patterns",
    icon: TrendingUp,
    prompt: "Forecast room capacity needs for the next semester based on current booking patterns, enrollment projections, and historical trends. Identify potential bottlenecks.",
    category: "planning",
  },
  {
    id: "optimization-opportunities",
    name: "Space Optimization Opportunities",
    description: "AI-identified opportunities to improve room allocation and utilization",
    icon: Zap,
    prompt: "Analyze current room usage and identify specific optimization opportunities: room consolidation, schedule reshuffling, equipment reallocation, and policy changes.",
    category: "optimization",
  },
  {
    id: "cost-analysis",
    name: "Operational Cost Analysis",
    description: "Energy, maintenance, and operational cost breakdown by building and room type",
    icon: FileText,
    prompt: "Provide a detailed cost analysis of room operations including energy consumption, maintenance costs, and cost per booking hour. Compare across buildings.",
    category: "financial",
  },
  {
    id: "academic-alignment",
    name: "Academic Schedule Alignment",
    description: "How well room assignments match course requirements and department needs",
    icon: GraduationCap,
    prompt: "Evaluate how well current room assignments align with academic requirements: course sizes, equipment needs, department proximity, and accessibility requirements.",
    category: "academic",
  },
  {
    id: "custom-analysis",
    name: "Custom Analysis",
    description: "Define your own analysis parameters and questions",
    icon: Settings,
    prompt: "",
    category: "utilization",
  },
];

// Mock AI responses for demo
const MOCK_RESPONSES: Record<string, string> = {
  "weekly-utilization": `## Weekly Utilization Report (Week of Nov 18-24)

### Executive Summary
Overall campus utilization averaged **67.3%** this week, a **+4.2% increase** from the previous week. The Auditorium and Building C labs drove most of the growth.

### Key Metrics
| Metric | This Week | Last Week | Change |
|--------|-----------|-----------|--------|
| Total Bookings | 1,247 | 1,156 | +7.9% |
| Total Hours | 2,834 | 2,598 | +9.1% |
| Unique Rooms Used | 42/48 | 39/48 | +7.7% |
| Peak Concurrent Usage | 89% | 82% | +7 pp |

### Top Utilized Rooms
1. **Auditorium (Building D)** - 94% utilization, 156 hours
2. **Lab 1 (Building C)** - 89% utilization, 148 hours
3. **Room 201 (Building B)** - 87% utilization, 144 hours
4. **Room 102 (Building A)** - 82% utilization, 136 hours

### Underutilized Spaces (Action Required)
- **Seminar Room 2 (Building B)** - 18% utilization → Consider repurposing
- **Conference Room (Building D)** - 22% utilization → Open for student groups
- **Room 202 (Building B)** - 24% utilization → Merge with adjacent space

### Anomalies Detected
⚠️ **Tuesday 14:00-16:00 spike**: Building C labs saw 340% increase (CS101 midterm prep)
⚠️ **Friday afternoons**: Only 12% utilization campus-wide

### Recommendations
1. **Immediate**: Open Seminar Room 2 for student bookings on Fridays
2. **Short-term**: Adjust Lab 1/Lab 2 scheduling to balance load
3. **Strategic**: Convert Conference Room to flexible coworking space`,

  "capacity-planning": `## Capacity Planning Forecast - Spring Semester 2025

### Demand Projections
Based on enrollment trends (+12% YoY) and current booking patterns:

| Period | Projected Bookings | Required Rooms | Capacity Gap |
|--------|-------------------|----------------|--------------|
| Weeks 1-4 | 1,420/week | 45 | -3 rooms |
| Weeks 5-8 (Midterms) | 1,680/week | 52 | -10 rooms |
| Weeks 9-12 | 1,350/week | 43 | -1 room |
| Weeks 13-16 (Finals) | 1,890/week | 58 | -16 rooms |

### Bottleneck Analysis
**Critical Period**: Finals weeks (13-16)
- Large rooms (>100 capacity): **Deficit of 4 rooms**
- Medium rooms (40-80 capacity): **Deficit of 6 rooms**
- Labs with computers: **Deficit of 3 rooms**

### Mitigation Strategies
1. **Hybrid Options**: Move 20% of lectures to hybrid format (saves ~8 large room slots)
2. **Evening Expansion**: Extend booking hours to 22:00 (adds 15% capacity)
3. **Weekend Utilization**: Saturday 9:00-17:00 for exams (adds 8 room-days/week)
4. **Room Partitioning**: Auditorium can be divided into 2x 75-seat spaces
5. **External Partnerships**: Nearby conference center has 3 large rooms available

### Department-Level Breakdown
- **Computer Science**: +35% demand → Need 2 additional labs
- **Business**: +18% demand → Need 1 large lecture hall
- **Engineering**: +22% demand → Need 2 medium rooms with equipment
- **Arts/Humanities**: Stable → Current allocation sufficient

### Investment Recommendations
| Priority | Investment | Cost | Capacity Added | ROI Timeline |
|----------|------------|------|----------------|--------------|
| 1 | Partition Auditorium | $45K | 75 seats | 1 semester |
| 2 | Upgrade Room 202 to Lab | $78K | 25 stations | 2 semesters |
| 3 | Lease External Space | $120K/yr | 200 seats | Immediate |`,

  "optimization-opportunities": `## Space Optimization Opportunities

### High-Impact Opportunities (Quick Wins)

#### 1. **Friday Afternoon Liberation** 🎯
- **Current**: 12% utilization 13:00-17:00 Fridays
- **Opportunity**: Open all rooms for student clubs, study groups, events
- **Impact**: +400 booking hours/week, improved student satisfaction
- **Effort**: Policy change only (1 week)

#### 2. **Lab Load Balancing** ⚖️
- **Current**: Lab 1 at 89%, Lab 2 at 45% utilization
- **Opportunity**: Implement smart scheduling algorithm
- **Impact**: Better resource distribution, reduced wait times
- **Effort**: Software update (2 weeks)

#### 3. **Room Consolidation** 📦
- **Targets**: Seminar Room 1 (22%), Seminar Room 2 (18%), Room 202 (24%)
- **Opportunity**: Merge into 1 large flexible space (60 seats) + 1 medium (30 seats)
- **Impact**: +15% overall utilization, modern collaborative space
- **Effort**: Renovation (8 weeks, $180K)

### Medium-Term Opportunities

#### 4. **Equipment Right-Sizing** 🖥️
- 12 rooms have projectors used <10% of time
- 8 rooms lack video conferencing but have high demand
- **Action**: Audit and redistribute equipment
- **Savings**: $25K/year maintenance

#### 5. **Dynamic Pricing for Prime Slots** 💰
- 10:00-12:00 slots: 89% booked, high demand
- 14:00-16:00 slots: 45% booked, low demand
- **Action**: Priority points system for morning slots
- **Impact**: Redistribute 15% of bookings to afternoon

### Long-Term Strategic Opportunities

#### 6. **Smart Building Integration** 🏢
- IoT sensors for real-time occupancy
- Automated climate control based on bookings
- Predictive maintenance scheduling
- **Investment**: $350K | **Annual Savings**: $85K

#### 7. **Virtual Room Twin** 🌐
- Digital twin for scenario planning
- Simulate schedule changes before implementation
- Integration with SIS and LMS
- **Investment**: $200K | **Value**: Prevents costly scheduling errors

### Implementation Roadmap
| Quarter | Initiatives | Expected Utilization Gain |
|---------|-------------|---------------------------|
| Q1 2025 | Friday policy, Lab balancing, Equipment audit | +8% |
| Q2 2025 | Room consolidation, Dynamic scheduling | +12% |
| Q3 2025 | Smart building pilot (Building A) | +5% |
| Q4 2025 | Virtual twin, Full smart building | +10% |

**Total Projected Gain**: **+35% utilization improvement** over 12 months`,

  "cost-analysis": `## Operational Cost Analysis - Q4 2024

### Cost Breakdown by Category
| Category | Monthly Cost | % of Total | YoY Change |
|----------|-------------|------------|------------|
| Energy (HVAC, Lighting) | $42,300 | 48% | +5.2% |
| Maintenance & Repairs | $18,700 | 21% | -2.1% |
| Cleaning Services | $12,400 | 14% | +3.8% |
| Equipment Leasing | $8,900 | 10% | +12.5% |
| Software Licenses | $4,200 | 5% | +8.3% |
| Staffing | $1,800 | 2% | 0% |
| **Total** | **$88,300** | **100%** | **+4.1%** |

### Cost per Building
| Building | Monthly Cost | Cost/sq ft | Cost/Booking Hour | Utilization |
|----------|-------------|------------|-------------------|-------------|
| Building A | $24,100 | $4.20 | $18.50 | 71% |
| Building B | $19,800 | $3.85 | $16.20 | 68% |
| Building C | $28,500 | $5.10 | $22.80 | 79% |
| Building D | $15,900 | $3.45 | $14.10 | 62% |

### Cost per Room Type
| Room Type | Avg Monthly Cost | Cost/Hour | Bookings/Month | Efficiency Score |
|-----------|-----------------|-----------|----------------|------------------|
| Large Lecture (>100) | $3,200 | $15.80 | 185 | 92/100 |
| Medium (40-80) | $1,850 | $19.20 | 88 | 78/100 |
| Small (<40) | $950 | $21.50 | 42 | 65/100 |
| Computer Lab | $2,400 | $24.80 | 92 | 71/100 |
| Specialized Lab | $2,800 | $28.40 | 78 | 68/100 |

### Energy Deep Dive
- **HVAC**: 65% of energy cost → Smart scheduling could save 15-20%
- **Lighting**: 25% → LED retrofit (Building B, D) saves 40%
- **Equipment**: 10% → Power management policies

### Savings Opportunities
1. **Immediate** (0-3 months): $8,500/month
   - HVAC scheduling alignment with bookings: $4,200
   - Lighting motion sensors (low-util rooms): $2,800
   - Equipment sleep policies: $1,500

2. **Short-term** (3-12 months): $15,200/month
   - LED retrofit Buildings B & D: $6,800
   - Smart thermostats Building A: $4,500
   - Consolidate cleaning contracts: $3,900

3. **Strategic** (12+ months): $22,000/month
   - Building management system: $12,000
   - Solar offset (Building C roof): $10,000

### Benchmarking
- **Industry Average**: $5.20/sq ft | **Campus**: $4.15/sq ft ✓
- **Industry Average**: $22.50/booking hour | **Campus**: $17.90/booking hour ✓
- **Peer Institutions**: 15-20% higher cost per booking hour`,

  "academic-alignment": `## Academic Schedule Alignment Analysis

### Overall Alignment Score: **73/100** (Good - Room for Improvement)

### Department-Level Alignment

#### Computer Science ⭐⭐⭐⭐☆ (82/100)
- **Strengths**: Labs well-matched to course sizes, equipment alignment 94%
- **Gaps**: 3 courses (CS301, CS410, CS450) need video conferencing not available in assigned labs
- **Action**: Move CS301/CS410 to Lab 1/2, upgrade Room 202 for CS450

#### Engineering ⭐⭐⭐☆☆ (71/100)
- **Strengths**: Large lecture halls match enrollment
- **Gaps**:
  - MECH201 (85 students) in Room 102 (45 capacity) → **OVERCAPACITY**
  - ELEC320 needs oscilloscopes - assigned room lacks equipment
  - CIVL101 split across 3 buildings → Student travel time 15+ min
- **Action**: Move MECH201 to Auditorium, equip Room 201 for ELEC320, cluster CIVL in Building B

#### Business ⭐⭐⭐⭐☆ (79/100)
- **Strengths**: Case study rooms well-utilized, good tech setup
- **Gaps**:
  - BUS401 (Capstone) needs flexible furniture - in fixed lecture room
  - Executive Ed weekends conflict with regular scheduling
- **Action**: Designate Room 101 as flexible furniture pilot, block weekends for Exec Ed

#### Arts & Humanities ⭐⭐⭐☆☆ (68/100)
- **Strengths**: Seminar rooms match small class sizes
- **Gaps**:
  - ART200 (Studio) in standard classroom - no sinks, ventilation
  - MUS101 needs acoustic treatment - in Room 202
  - Language labs (3) underutilized at 31% - could serve more departments
- **Action**: Convert Room 202 to music studio, repurpose language labs for general use

#### Sciences ⭐⭐⭐⭐☆ (77/100)
- **Strengths**: Lab assignments match course requirements well
- **Gaps**:
  - CHEM101/102 back-to-back in same lab - 15 min turnover insufficient
  - BIOL300 needs greenhouse access - not considered in room assignment
- **Action**: Add 20 min buffer between lab sessions, map greenhouse-accessible rooms

### Accessibility Compliance
- **Fully Accessible**: 38/48 rooms (79%)
- **Partial**: 7 rooms (need automatic doors, adjustable podiums)
- **Non-Compliant**: 3 rooms (Building D basement - no elevator)
- **Action Required**: Priority renovation for 3 non-compliant rooms

### Equipment Requirement Fulfillment
| Equipment | Courses Needing | Rooms Equipped | Fulfillment |
|-----------|----------------|----------------|-------------|
| Projector | 142 | 45 | 96% |
| Video Conference | 28 | 12 | 43% ⚠️ |
| Document Camera | 35 | 18 | 51% |
| Smart Board | 22 | 8 | 36% ⚠️ |
| Lab Equipment | 45 | 10 | 89% |
| Recording | 15 | 6 | 40% ⚠️ |

### Recommendations Priority Matrix
| Priority | Action | Effort | Impact | Dept Affected |
|----------|--------|--------|--------|---------------|
| P0 | Fix MECH201 overcapacity | Low | High | Engineering |
| P0 | Add video conference to 6 rooms | Medium | High | CS, Business, Sci |
| P1 | Convert Room 202 to music studio | Medium | Medium | Arts |
| P1 | Cluster CIVL courses in Building B | Low | Medium | Engineering |
| P2 | Flexible furniture pilot (Room 101) | Medium | Medium | Business |
| P2 | Language lab repurposing | Low | Medium | Arts, General |
| P3 | Accessibility renovations (3 rooms) | High | High | All |
| P3 | Greenhouse-accessible room mapping | Low | Low | Sciences |`,

  "custom-analysis": `I'm ready to perform a custom analysis for you. Please describe what you'd like me to analyze, for example:

- **Specific time period**: "Analyze last month's utilization for Building A only"
- **Specific rooms**: "Compare Lab 1 vs Lab 2 usage patterns"
- **Specific questions**: "Which rooms have the highest cancellation rates?"
- **Comparative analysis**: "How does fall semester compare to spring?"
- **Predictive**: "Forecast next month's demand for computer labs"
- **Policy impact**: "What if we extend hours to 10 PM?"
- **Cost-focused**: "Show cost per department for room usage"
- **Academic-focused**: "Alignment for Engineering department only"

What would you like me to analyze?`,
};

export function AdminAIReportsPage() {
  const { t, locale } = useI18n();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Current session
  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

  // Initialize with welcome session
  useEffect(() => {
    if (sessions.length === 0) {
      const welcomeSession: ChatSession = {
        id: "welcome",
        title: t.aiReports.welcomeTitle,
        messages: [
          {
            id: "welcome-msg",
            role: "assistant",
            content: t.aiReports.welcomeMessage,
            timestamp: new Date(),
            metadata: { type: "insight" },
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setSessions([welcomeSession]);
      setCurrentSessionId("welcome");
    }
  }, [sessions.length, t.aiReports.welcomeTitle, t.aiReports.welcomeMessage]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // Handle new chat
  const handleNewChat = useCallback((template?: ReportTemplate) => {
    const sessionId = `chat-${Date.now()}`;
    const initialMessages: Message[] = [
      {
        id: `welcome-${sessionId}`,
        role: "assistant",
        content: template
          ? `${t.aiReports.templateStarted} **${template.name}**\n\n${MOCK_RESPONSES[template.id] || t.aiReports.generatingReport}`
          : t.aiReports.newChatWelcome,
        timestamp: new Date(),
        metadata: template ? { type: "analysis", confidence: 0.9 } : undefined,
      },
    ];

    const newSession: ChatSession = {
      id: sessionId,
      title: template?.name || t.aiReports.untitledChat,
      messages: initialMessages,
      createdAt: new Date(),
      updatedAt: new Date(),
      templateId: template?.id,
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(sessionId);
    setShowTemplates(false);
    setShowHistory(false);
    setSelectedTemplate(null);
  }, [t.aiReports.templateStarted, t.aiReports.generatingReport, t.aiReports.newChatWelcome, t.aiReports.untitledChat]);

  // Handle sending message
  const handleSendMessage = useCallback(async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText || !currentSessionId || isStreaming) return;

    if (currentSessionId === "welcome") {
      handleNewChat();
      return;
    }

    setInputValue("");
    setIsStreaming(true);

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    // Add user message
    setSessions(prev => prev.map(s =>
      s.id === currentSessionId
        ? { ...s, messages: [...s.messages, userMessage], updatedAt: new Date() }
        : s
    ));

    // Simulate AI response
    setTimeout(() => {
      let response = MOCK_RESPONSES[messageText.toLowerCase().replace(/\s+/g, "-")] ||
        MOCK_RESPONSES[selectedTemplate?.id || ""] ||
        `I've analyzed your request: "${messageText}".

Based on current campus data, here are the key findings:

**Summary**: Your query relates to ${messageText.toLowerCase().includes("util") ? "utilization" : messageText.toLowerCase().includes("cost") ? "costs" : messageText.toLowerCase().includes("capac") ? "capacity" : "general operations"}.

**Data Points**:
- Current campus utilization: 67.3%
- Active rooms: 42/48
- Peak hours: 10:00-12:00 (89% booked)
- Low utilization: Fridays 13:00-17:00 (12%)

**Recommendations**:
1. Consider the optimization opportunities identified in our weekly reports
2. Review Friday afternoon policies for student access
3. Plan for midterm/finals capacity increases

Would you like me to generate a detailed report on any specific aspect?`;

      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
        metadata: { type: "analysis", confidence: 0.85 },
      };

      setSessions(prev => prev.map(s =>
        s.id === currentSessionId
          ? { ...s, messages: [...s.messages, assistantMessage], updatedAt: new Date() }
          : s
      ));

      setIsStreaming(false);
    }, 1500);
  }, [inputValue, currentSessionId, isStreaming, selectedTemplate, handleNewChat]);

  // Handle file upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv" && !file.name.toLowerCase().endsWith(".csv")) {
      alert(t.aiReports.fileTypeError);
      return;
    }

    setUploadedFile(file);
    // Simulate upload processing
    setTimeout(() => {
      setInputValue(`Analyze the uploaded file: ${file.name}`);
    }, 1000);
  };

  const handleFileRemove = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle template selection
  const handleTemplateClick = (template: ReportTemplate) => {
    if (template.id === "custom-analysis") {
      setSelectedTemplate(template);
      setShowTemplates(false);
      return;
    }
    handleNewChat(template);
  };

  // Handle sidebar toggle
  const toggleSidebar = (type: "history" | "templates") => {
    if (type === "history") {
      setShowHistory(!showHistory);
      setShowTemplates(false);
    } else {
      setShowTemplates(!showTemplates);
      setShowHistory(false);
    }
  };

  // Copy message
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  // Delete session (uses in-app modal, not native confirm)
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteSessionId(sessionId);
  };

  const handleDeleteConfirm = () => {
    if (deleteSessionId) {
      setSessions(prev => prev.filter(s => s.id !== deleteSessionId));
      if (currentSessionId === deleteSessionId) {
        setCurrentSessionId(sessions.find(s => s.id !== deleteSessionId)?.id || null);
      }
      setDeleteSessionId(null);
    }
  };

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(locale, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  // Handle keyboard
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title={t.aiReports.title}
        lead={t.aiReports.subtitle}
        actions={
          <div className={styles.headerActions}>
            <Button variant="quiet" size="md" onClick={() => toggleSidebar("templates")} aria-expanded={showTemplates} aria-label={t.aiReports.templates}>
              <Sparkles size={16} aria-hidden /> {t.aiReports.templates}
            </Button>
            <Button variant="quiet" size="md" onClick={() => toggleSidebar("history")} aria-expanded={showHistory} aria-label={t.aiReports.history}>
              <History size={16} aria-hidden /> {t.aiReports.history}
            </Button>
            <Button onClick={() => handleNewChat()}>
              <Plus size={16} aria-hidden /> {t.aiReports.newChat}
            </Button>
          </div>
        }
      />

      <div className={styles.layout}>
        {/* Sidebar - Templates */}
        {showTemplates && (
          <aside className={cx(styles.sidebar, styles.sidebarTemplates)} ref={sidebarRef} role="complementary" aria-label={t.aiReports.templates}>
            <div className={styles.sidebarHeader}>
              <h3>{t.aiReports.reportTemplates}</h3>
              <Button variant="quiet" size="md" onClick={() => setShowTemplates(false)} aria-label={t.common.close}>
                <ChevronUp size={16} aria-hidden />
              </Button>
            </div>
            <div className={styles.templateList}>
              {REPORT_TEMPLATES.map(template => {
                const Icon = template.icon;
                return (
                  <Surface
                    key={template.id}
                    tone="glass"
                    className={cx(styles.templateCard, selectedTemplate?.id === template.id && styles.templateCardSelected)}
                    onClick={() => handleTemplateClick(template)}
                  >
                    <div className={styles.templateIcon}>
                      <Icon size={24} aria-hidden />
                    </div>
                    <div className={styles.templateInfo}>
                      <h4 className={styles.templateName}>{template.name}</h4>
                      <p className={styles.templateDesc}>{template.description}</p>
                    </div>
                    <ChevronDown size={18} aria-hidden className={styles.templateArrow} />
                  </Surface>
                );
              })}
            </div>
            {selectedTemplate && selectedTemplate.id === "custom-analysis" && (
              <Surface tone="default" className={styles.customPrompt}>
                <h4>{t.aiReports.customAnalysis}</h4>
                <p className={styles.customPromptDesc}>{t.aiReports.customAnalysisDesc}</p>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="custom-analysis-prompt">
                    {t.aiReports.customAnalysis}
                  </label>
                  <textarea
                    id="custom-analysis-prompt"
                    className={styles.textarea}
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    placeholder={t.aiReports.customPlaceholder}
                    rows={4}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <Button className={styles.customSubmit} onClick={() => handleSendMessage(inputValue)}>
                  <Send size={16} aria-hidden /> {t.aiReports.startAnalysis}
                </Button>
              </Surface>
            )}
          </aside>
        )}

        {/* Sidebar - History */}
        {showHistory && (
          <aside className={cx(styles.sidebar, styles.sidebarHistory)} ref={sidebarRef} role="complementary" aria-label={t.aiReports.history}>
            <div className={styles.sidebarHeader}>
              <h3>{t.aiReports.chatHistory}</h3>
              <Button variant="quiet" size="md" onClick={() => setShowHistory(false)} aria-label={t.common.close}>
                <ChevronUp size={16} aria-hidden />
              </Button>
            </div>
            <div className={styles.historyList}>
              {sessions.filter(s => s.id !== "welcome").map(session => (
                <Surface
                  key={session.id}
                  tone={currentSessionId === session.id ? "accent" : "glass"}
                  className={styles.historyItem}
                  onClick={() => setCurrentSessionId(session.id)}
                >
                  <div className={styles.historyInfo}>
                    <h4 className={styles.historyTitle}>{session.title}</h4>
                    <p className={styles.historyMeta}>
                      {session.messages.length - 1} {t.aiReports.messages} • {formatDate(session.updatedAt)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={e => handleDeleteSession(session.id, e)}
                    aria-label={t.common.delete}
                    className={styles.historyDelete}
                  >
                    <Trash2 size={16} aria-hidden />
                  </Button>
                </Surface>
              ))}
              {sessions.filter(s => s.id !== "welcome").length === 0 && (
                <div className={styles.emptyHistory}>
                  <History size={32} aria-hidden />
                  <p>{t.aiReports.noHistory}</p>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Main Chat Area */}
        <main className={styles.chatArea} role="main">
          {/* Messages */}
          <div className={styles.messagesContainer}>
            <div className={styles.messages} role="log" aria-live="polite" aria-label={t.aiReports.conversation}>
              {messages.map((message) => (
                <div key={message.id} className={cx(styles.message, styles[`message-${message.role}`])}>
                  {message.role !== "system" && (
                    <div className={styles.messageAvatar}>
                      {message.role === "assistant" ? (
                        <Bot size={20} aria-hidden />
                      ) : (
                        <User size={20} aria-hidden />
                      )}
                    </div>
                  )}
                  <div className={styles.messageContent}>
                    {message.role === "assistant" && (
                      <div className={styles.messageHeader}>
                        <span className={styles.messageRole}>
                          <Brain size={14} aria-hidden /> {t.aiReports.aiAssistant}
                        </span>
                        {message.metadata?.confidence && (
                          <StatusPill status="available" tone="accent" size="sm" label={`${Math.round(message.metadata.confidence * 100)}% ${t.aiReports.confidence}`} />
                        )}
                      </div>
                    )}
                    <div
                      className={styles.messageText}
                      dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, "<br>") }}
                    />
                    <div className={styles.messageFooter}>
                      <span className={styles.messageTime}>{formatTime(message.timestamp)}</span>
                      {message.role === "assistant" && (
                        <div className={styles.messageActions}>
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleCopy(message.content)}
                            aria-label={t.common.copy}
                            className={styles.actionBtn}
                          >
                            <Copy size={14} aria-hidden />
                          </Button>
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleSendMessage(`Follow up on: ${message.content.slice(0, 100)}...`)}
                            aria-label={t.aiReports.followUp}
                            className={styles.actionBtn}
                          >
                            <RotateCcw size={14} aria-hidden />
                          </Button>
                        </div>
                      )}
                    </div>
                    {message.metadata?.citations && message.metadata.citations.length > 0 && (
                      <div className={styles.citations}>
                        <strong>{t.aiReports.sources}:</strong>
                        <ul>
                          {message.metadata.citations.map((citation, i) => (
                            <li key={i}>{citation}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isStreaming && (
                <div className={cx(styles.message, styles["message-assistant"], styles.messageStreaming)}>
                  <div className={styles.messageAvatar}>
                    <Bot size={20} aria-hidden />
                  </div>
                  <div className={styles.messageContent}>
                    <div className={styles.messageHeader}>
                      <span className={styles.messageRole}>
                        <Brain size={14} aria-hidden /> {t.aiReports.aiAssistant}
                      </span>
                    </div>
                    <div className={styles.streamingIndicator}>
                      <span className={styles.dot}></span>
                      <span className={styles.dot}></span>
                      <span className={styles.dot}></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className={styles.inputArea}>
            <div className={styles.inputWrapper}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="chat-input">
                  {currentSessionId === "welcome" ? t.aiReports.welcomePlaceholder : t.aiReports.inputPlaceholder}
                </label>
                <textarea
                  id="chat-input"
                  ref={textareaRef}
                  className={styles.textarea}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={currentSessionId === "welcome" ? t.aiReports.welcomePlaceholder : t.aiReports.inputPlaceholder}
                  rows={1}
                  disabled={isStreaming}
                />
              </div>
              <div className={styles.inputActions}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label={t.aiReports.addFile}
                  disabled={isStreaming}
                  className={styles.voiceBtn}
                >
                  {isStreaming ? <MicOff size={20} aria-hidden /> : <Upload size={20} aria-hidden />}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".csv, .csv"
                  onChange={handleFileChange}
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isStreaming || uploadedFile !== null}
                  aria-label={t.common.send}
                  className={styles.sendBtn}
                >
                  <Send size={20} aria-hidden />
                </Button>
                {uploadedFile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFileRemove}
                    aria-label={t.common.cancel}
                  >
                    <X size={16} aria-hidden />
                  </Button>
                )}
              </div>
            </div>
            <p className={styles.inputHint}>
              {t.aiReports.inputHint}
              <kbd>Shift+Enter</kbd> {t.aiReports.newLine}
            </p>
          </div>
        </main>

        {/* Delete Confirmation Modal */}
        {deleteSessionId && (
          <div className={styles.modalOverlay} onClick={() => setDeleteSessionId(null)} role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 id="delete-modal-title" className={styles.modalTitle}>
                  {t.aiReports.confirmDelete}
                </h3>
                <Button variant="quiet" size="md" onClick={() => setDeleteSessionId(null)} aria-label={t.common.close}>
                  <X size={16} aria-hidden />
                </Button>
              </div>
              <div className={styles.modalBody}>
                <p>{t.aiReports.confirmDelete}</p>
              </div>
              <div className={styles.modalActions}>
                <Button variant="secondary" onClick={() => setDeleteSessionId(null)}>
                  {t.common.cancel}
                </Button>
                <Button variant="danger" onClick={handleDeleteConfirm}>
                  {t.common.delete}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

