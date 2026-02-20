# Admin UI – Incomplete / Not Fully Finished Sections

Analysis of all admin pages and sections. **Wired** = uses real API; **Mock fallback** = uses mock data only when API fails; **Bug** = logic error; **Missing** = feature not implemented.

---

## 1. Admin Dashboard (`/admin`)

| Item | Status | Notes |
|------|--------|------|
| Data source | **Wired** | `adminApi.getDashboard()`; fallback to mock on error |
| Stats (faculty, pending, avg score, at risk) | **Wired** | From API |
| Outcome distribution chart | **Wired** | From API |
| Recent submissions / penalties | **Wired** | From API |
| Academic year display | **Wired** | Backend returns `academicYear` |
| "Generate Report" button | **Done** | Navigates to `/admin/reports` |
| "View all users" link | **Done** | Navigates to `/admin/users` |

**Verdict:** Fully wired; mock only on API failure. No incomplete sections.

---

## 2. Admin Submissions (`/admin/submissions`)

| Item | Status | Notes |
|------|--------|------|
| List data | **Wired** | `adminApi.getSubmissions(filters)`; fallback to mock on error |
| Tab counts (All / Pending / Approved / Rejected) | **Bug** | Uses `mockSubmissions` and `stats` derived from mock, so when API succeeds the tab counts and stats are **wrong** (always show mock totals). Should use `submissions` state and derive counts from it. |
| Search filter | **Done** | Client-side over `submissions` |
| Drawer: Approve | **Wired** | `adminApi.approveSubmission(id, { notes, adjustedPoints })` |
| Drawer: Reject | **Wired** | `adminApi.rejectSubmission(id, notes)` |
| Drawer: Adjust points | **Done** | Passed with Approve; no separate "Save points only" (would need `adminApi.adjustPoints` for already-approved). |
| Other submissions by same user | **Wired** | Fetches via `adminApi.getSubmissions({ userId })`; "View all" → `?userId=xxx` |
| Charts (submissions over time) | **UI only** | Uses current `submissions`; no dedicated API. |

**Fixes needed:**
- **Stats / tab counts:** Compute from `submissions` (and optionally from pagination total), not from `mockSubmissions`. E.g. `pending: submissions.filter(s => s.status === 'pending').length` and same for approved/rejected; for "All" use `result.pagination.total` when from API.

---

## 3. Admin Penalties (`/admin/penalties`)

| Item | Status | Notes |
|------|--------|------|
| List data | **Wired** | `adminApi.getPenalties({ type, page, limit })`; fallback to mock on error |
| Faculty dropdown (create penalty) | **Wired** | `adminApi.getFaculty({ limit: 100 })`; fallback to mock list on error |
| Create penalty | **Wired** | `adminApi.createPenalty(data)` |
| Update penalty | **Wired** | `adminApi.updatePenalty(id, data)` |
| Delete penalty | **Wired** | `adminApi.deletePenalty(id)` |
| Search (client-side) | **Done** | Over current `penalties` |

**Verdict:** Fully wired; mock only on API failure. No incomplete sections.

---

## 4. Admin Reports (`/admin/reports`)

| Item | Status | Notes |
|------|--------|------|
| Scores list | **Wired** | `adminApi.getScores({ academicYear, outcome, limit })`; fallback to mock on error |
| Filters (year, outcome) | **Done** | Sent as API params |
| Search (client-side) | **Done** | Over `filteredScores` |
| Export CSV | **Done** | Client-side from current filtered scores |
| Stats (total, avg, outcome counts) | **Done** | Derived from `filteredScores` |

**Verdict:** Fully wired; mock only on API failure. No incomplete sections.

---

## 5. Admin Scoring / Config (`/admin/scoring`)

| Item | Status | Notes |
|------|--------|------|
| Load config | **Wired** | `configApi.getAll()`; fallback to mock config on error |
| Save changes | **Wired** | `configApi.update(key, value)` per key |
| Config shape | **Check** | Backend returns grouped by category; frontend expects `config[section.key][key].value`. If backend keys differ (e.g. flat keys like `research.journal_q1`), mapping may need adjustment. |

**Verdict:** Wired; ensure backend config key structure matches what the UI expects (ceilings, research, teaching, admin, outreach, multipliers, penalties).

---

## 6. Admin Users (`/admin/users`)

| Item | Status | Notes |
|------|--------|------|
| List data | **Wired** | `adminApi.getFaculty({ search, department, rank, page, limit })`; fallback to mock on error |
| Search / department / rank filters | **Done** | Sent to API; `handleSearch` refetches |
| Pagination | **Done** | Uses API pagination |
| "Add Faculty" button | **Not finished** | No `onClick`; does not navigate to `/register`. Should go to register (admin-only) page. |
| "View" (Eye) button | **Not finished** | Navigates to `/admin/users/${f._id}` but **there is no `/admin/users/[id]` page**, so this will 404 or show wrong content. Need either a faculty detail page or remove/repurpose the button. |
| Mail button | **Placeholder** | No action. |
| Alert (penalties) button | **Done** | Navigates to `/admin/penalties?userId=...` |
| More (⋯) button | **Placeholder** | No action. |

**Fixes needed:**
- **Add Faculty:** e.g. `onClick={() => router.push('/register')}`.
- **View faculty:** Add `/admin/users/[id]/page.tsx` (e.g. show faculty detail + scores + submissions + penalties via `adminApi.getFacultyById(id)`), or change View to another action (e.g. open penalties filtered by user).

---

## 7. Cross-cutting

| Item | Status | Notes |
|------|--------|------|
| Mock data | **Fallback only** | All pages prefer API; mock used only on catch. |
| Loading / error states | **Present** | Loading spinners and try/catch with fallback or toast. |
| Dark mode | **Partial** | Many components use `dark:`; worth a quick pass for any missed areas. |

---

## Summary: What to fix

1. **Submissions page – tab counts / stats:** Derive from `submissions` (and API pagination total), not `mockSubmissions`.
2. **Users page – "Add Faculty":** Link to `/register` (e.g. button `onClick` → `router.push('/register')`).
3. **Users page – "View" (Eye):** Either add `/admin/users/[id]` (faculty detail) or remove/repurpose the button.
4. **Users page – Mail / More:** Either implement (e.g. mailto, dropdown menu) or remove to avoid dead UI.
5. **Scoring page:** Confirm config key structure from backend matches `config[section.key][key]` (and mockConfig shape).

No other admin pages have clearly unfinished core flows; the main gaps are submissions stats bug and users page actions.
