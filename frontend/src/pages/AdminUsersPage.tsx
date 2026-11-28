import { useState, useMemo, useEffect, useRef } from "react";
import { MoreVertical, Trash2, Activity, Edit, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Surface } from "@/components/ui/Surface";
import { StatusPill } from "@/components/ui/StatusPill";
import { PageHeader } from "@/components/PageHeader";
import { useI18n } from "@/lib/i18n";
import styles from "./AdminUsersPage.module.css";

type UserRole = "professor" | "admin";
type UserStatus = "active" | "inactive";

interface User {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

interface UserActivity {
  id: string;
  type: "created_session" | "booked_room";
  description: string;
  date: string;
}

const MOCK_USERS: User[] = [
  { id: "u-prof-a", displayName: "Prof. A", email: "prof.a@univ.test", role: "professor", status: "active" },
  { id: "u-prof-b", displayName: "Prof. B", email: "prof.b@univ.test", role: "professor", status: "active" },
  { id: "u-admin", displayName: "Admin", email: "admin@univ.test", role: "admin", status: "active" },
  { id: "u-prof-c", displayName: "Prof. C", email: "prof.c@univ.test", role: "professor", status: "inactive" },
  { id: "u-prof-d", displayName: "Prof. D", email: "prof.d@univ.test", role: "professor", status: "active" },
  { id: "u-prof-e", displayName: "Prof. E", email: "prof.e@univ.test", role: "professor", status: "active" },
  { id: "u-prof-f", displayName: "Prof. F", email: "prof.f@univ.test", role: "professor", status: "inactive" },
  { id: "u-prof-g", displayName: "Prof. G", email: "prof.g@univ.test", role: "professor", status: "active" },
  { id: "u-prof-h", displayName: "Prof. H", email: "prof.h@univ.test", role: "professor", status: "active" },
  { id: "u-prof-i", displayName: "Prof. I", email: "prof.i@univ.test", role: "professor", status: "active" },
  { id: "u-prof-j", displayName: "Prof. J", email: "prof.j@univ.test", role: "professor", status: "active" },
  { id: "u-admin-2", displayName: "Admin 2", email: "admin2@univ.test", role: "admin", status: "active" },
];

const MOCK_ACTIVITIES: Record<string, UserActivity[]> = {
  "u-prof-a": [
    { id: "a1", type: "created_session", description: "Created additional session for Module CS101 in Room A102", date: "2024-01-15T10:30:00Z" },
    { id: "a2", type: "booked_room", description: "Booked Room B203 for 2024-01-20 14:00-16:00", date: "2024-01-18T09:15:00Z" },
    { id: "a3", type: "created_session", description: "Created additional session for Module CS102 in Room A105", date: "2024-01-22T14:00:00Z" },
  ],
  "u-prof-b": [
    { id: "b1", type: "booked_room", description: "Booked Room C301 for 2024-01-10 08:00-10:00", date: "2024-01-08T16:45:00Z" },
  ],
  "u-admin": [
    { id: "c1", type: "created_session", description: "Created additional session for Module ADMIN101 in Room Admin-1", date: "2024-01-05T11:00:00Z" },
  ],
};

const ITEMS_PER_PAGE = 10;

export function AdminUsersPage() {
  const { t, dir, locale } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [activitiesTarget, setActivitiesTarget] = useState<User | null>(null);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "professor" as UserRole });
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    return MOCK_USERS.filter((user) => {
      const matchesSearch =
        user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [searchQuery, roleFilter, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const handleDeleteClick = (user: User) => setDeleteTarget(user);
  const handleActivitiesClick = (user: User) => setActivitiesTarget(user);
  const handleEditClick = (user: User) => {
    setEditTarget(user);
    setEditForm({ name: user.displayName, email: user.email, role: user.role });
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      const index = MOCK_USERS.findIndex((u) => u.id === deleteTarget.id);
      if (index !== -1) MOCK_USERS.splice(index, 1);
      setDeleteTarget(null);
    }
  };

  const handleSaveEdit = () => {
    if (editTarget) {
      const index = MOCK_USERS.findIndex((u) => u.id === editTarget.id);
      if (index !== -1) {
        MOCK_USERS[index] = { ...MOCK_USERS[index], displayName: editForm.name, email: editForm.email, role: editForm.role };
      }
      setEditTarget(null);
    }
  };

  const getRoleLabel = (role: UserRole) => (role === "professor" ? t.user.professor : t.user.administrator);
  const getStatusLabel = (status: UserStatus) => (status === "active" ? t.users.status.active : t.users.status.inactive);

  const menuRootRef = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (openMenuId && !menuRootRef.current?.contains(event.target as Node)) {
      setOpenMenuId(null);
    }
  };

  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape") setOpenMenuId(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === "ar" ? "ar-DZ" : locale === "fr" ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openMenuId]);

  const userActivities = activitiesTarget ? MOCK_ACTIVITIES[activitiesTarget.id] || [] : [];

  return (
    <div className={styles.page} dir={dir}>
      <PageHeader title={t.headers.users.title} lead={t.headers.users.lead} />

      <Surface className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <Field
            label={t.users.searchPlaceholder}
            placeholder={t.users.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className={styles.searchField}
          />
          <div className={styles.filterGroup}>
            <select
              className={styles.filterSelect}
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value as UserRole | "all");
                setCurrentPage(1);
              }}
              aria-label={t.users.columns.role}
            >
              <option value="all">{t.common.filter} {t.users.columns.role}</option>
              <option value="professor">{t.user.professor}</option>
              <option value="admin">{t.user.administrator}</option>
            </select>
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as UserStatus | "all");
                setCurrentPage(1);
              }}
              aria-label={t.users.columns.status}
            >
              <option value="all">{t.common.filter} {t.users.columns.status}</option>
              <option value="active">{t.users.status.active}</option>
              <option value="inactive">{t.users.status.inactive}</option>
            </select>
          </div>
        </div>
        <div className={styles.toolbarRight}>
          <p className={styles.resultsCount}>
            {filteredUsers.length === 0 ? t.common.noData : `${filteredUsers.length} ${locale === "fr" ? "résultats" : locale === "ar" ? "نتيجة" : "results"}`}
          </p>
        </div>
      </Surface>

      <Surface className={styles.tableContainer}>
        {filteredUsers.length === 0 ? (
          <div className={styles.emptyState}>
            <p>{filteredUsers.length === 0 && searchQuery ? "No users match your search." : t.common.noData}</p>
          </div>
        ) : (
          <>
            <table className={styles.table} role="grid">
              <thead>
                <tr>
                  <th scope="col">{t.users.columns.name}</th>
                  <th scope="col">{t.users.columns.email}</th>
                  <th scope="col">{t.users.columns.role}</th>
                  <th scope="col">{t.users.columns.status}</th>
                  <th scope="col">{t.users.columns.actions}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className={styles.row}>
                    <td className={styles.cell}>
                      <div className={styles.userInfo}>
                        <span className={styles.userName}>{user.displayName}</span>
                        <span className={styles.userId}>#{user.id}</span>
                      </div>
                    </td>
                    <td className={styles.cell}>{user.email}</td>
                    <td className={styles.cell}>
                      <StatusPill
                        status={user.role === "professor" ? "available" : "booked"}
                        label={getRoleLabel(user.role)}
                      />
                    </td>
                    <td className={styles.cell}>
                      <StatusPill
                        status={user.status === "active" ? "available" : "inactive"}
                        label={getStatusLabel(user.status)}
                      />
                    </td>
                    <td className={styles.cellActions}>
                      <div
                        ref={menuRootRef}
                        className={styles.actionMenu}
                      >
                        <Button
                          variant="quiet"
                          size="md"
                          icon={<MoreVertical size={18} aria-hidden />}
                          aria-label={`${t.users.columns.actions} for ${user.displayName}`}
                          className={styles.actionTrigger}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(user.id === openMenuId ? null : user.id);
                          }}
                        />
                        {openMenuId === user.id && (
                          <div className={styles.dropdown} role="menu" aria-label={`${t.users.columns.actions} for ${user.displayName}`}>
                            <button
                              className={styles.dropdownItem}
                              role="menuitem"
                              onClick={() => {
                                setOpenMenuId(null);
                                handleActivitiesClick(user);
                              }}
                            >
                              <Activity size={16} aria-hidden />
                              {t.users.actions.activities}
                            </button>
                            <button
                              className={styles.dropdownItem}
                              role="menuitem"
                              onClick={() => {
                                setOpenMenuId(null);
                                handleEditClick(user);
                              }}
                            >
                              <Edit size={16} aria-hidden />
                              {t.users.actions.edit}
                            </button>
                            <button
                              className={`${styles.dropdownItem} ${styles.danger}`}
                              role="menuitem"
                              onClick={() => {
                                setOpenMenuId(null);
                                handleDeleteClick(user);
                              }}
                            >
                              <Trash2 size={16} aria-hidden />
                              {t.users.actions.delete}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <nav className={styles.pagination} aria-label="Pagination">
                <Button
                  variant="quiet"
                  size="md"
                  icon={<ChevronLeft size={18} aria-hidden />}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label={t.common.previous}
                />
                <span className={styles.pageInfo} aria-live="polite">
                  {t.common.previous} {currentPage} {t.common.next} {totalPages}
                </span>
                <Button
                  variant="quiet"
                  size="md"
                  icon={<ChevronRight size={18} aria-hidden />}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  aria-label={t.common.next}
                />
              </nav>
            )}
          </>
        )}
      </Surface>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className={styles.modalOverlay} onClick={() => setDeleteTarget(null)} role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 id="delete-modal-title" className={styles.modalTitle}>
                {t.users.deleteConfirm.title}
              </h3>
              <Button variant="quiet" icon={<X size={18} aria-hidden />} onClick={() => setDeleteTarget(null)} aria-label={t.common.close} />
            </div>
            <div className={styles.modalBody}>
              <p>{t.users.deleteConfirm.message}</p>
              <p className={styles.userNameHighlight}>{deleteTarget.displayName} ({deleteTarget.email})</p>
            </div>
            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
                {t.users.deleteConfirm.cancel}
              </Button>
              <Button variant="danger" onClick={handleDeleteConfirm}>
                {t.users.deleteConfirm.confirm}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Activities Modal */}
      {activitiesTarget && (
        <div className={styles.modalOverlay} onClick={() => setActivitiesTarget(null)} role="dialog" aria-modal="true" aria-labelledby="activities-modal-title">
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 id="activities-modal-title" className={styles.modalTitle}>
                {t.users.activities.title}: {activitiesTarget.displayName}
              </h3>
              <Button variant="quiet" icon={<X size={18} aria-hidden />} onClick={() => setActivitiesTarget(null)} aria-label={t.common.close} />
            </div>
            <div className={styles.modalBody}>
              {userActivities.length === 0 ? (
                <p className={styles.noActivities}>{t.users.activities.noActivities}</p>
              ) : (
                <div className={styles.activitiesList}>
                  {userActivities.map((activity) => (
                    <div key={activity.id} className={styles.activityItem}>
                      <div className={styles.activityIcon}>
                        {activity.type === "created_session" ? (
                          <Activity size={18} aria-hidden />
                        ) : (
                          <Activity size={18} aria-hidden />
                        )}
                      </div>
                      <div className={styles.activityContent}>
                        <p className={styles.activityDescription}>{activity.description}</p>
                        <p className={styles.activityDate}>
                          {t.users.activities.date}: {formatDate(activity.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={() => setActivitiesTarget(null)}>
                {t.common.close}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <div className={styles.modalOverlay} onClick={() => setEditTarget(null)} role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 id="edit-modal-title" className={styles.modalTitle}>
                {t.users.edit.title}
              </h3>
              <Button variant="quiet" icon={<X size={18} aria-hidden />} onClick={() => setEditTarget(null)} aria-label={t.common.close} />
            </div>
            <form className={styles.modalBody} onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}>
              <div className={styles.formGrid}>
                <Field
                  label={t.users.edit.name}
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
                <Field
                  label={t.users.edit.email}
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                />
                <div className={styles.fieldFull}>
                  <label className={styles.label}>{t.users.edit.role}</label>
                  <select
                    className={styles.select}
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                  >
                    <option value="professor">{t.user.professor}</option>
                    <option value="admin">{t.user.administrator}</option>
                  </select>
                </div>
              </div>
            </form>
            <div className={styles.modalActions}>
              <Button variant="secondary" type="button" onClick={() => setEditTarget(null)}>
                {t.users.edit.cancel}
              </Button>
              <Button variant="primary" type="submit" form={editTarget.id ? undefined : undefined} onClick={handleSaveEdit}>
                {t.users.edit.save}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}