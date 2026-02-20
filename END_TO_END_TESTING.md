# 🧪 END-TO-END TESTING CHECKLIST

**Date**: 2026-02-12
**Pre-Demo Testing**
**Time Required**: 30-45 minutes

---

## 🚀 **PRE-TEST SETUP**

### Start Services:
```bash
cd D:\final-year-project
docker-compose up -d

# Verify all services running
docker-compose ps

# Check logs
docker-compose logs -f backend
# Wait for: "✅ Database connected" and "🚀 Server running"
```

### Access URLs:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

---

## 👥 **PHASE 1: USER MANAGEMENT** (5 min)

### Test 1.1: Admin Registration
- [ ] Navigate to http://localhost:3000/register
- [ ] Register admin user:
  - Email: admin@cau.edu
  - Password: Admin123!
  - First Name: Admin
  - Last Name: User
  - Role: Admin
- [ ] ✅ Success: Redirects to login
- [ ] ✅ Success: Shows success toast

### Test 1.2: Admin Login
- [ ] Login with admin@cau.edu / Admin123!
- [ ] ✅ Success: Redirects to /admin dashboard
- [ ] ✅ Success: Shows admin sidebar
- [ ] ✅ Success: Dark mode toggle works

### Test 1.3: Faculty Registration (via Admin)
- [ ] Navigate to /admin/users
- [ ] Create 3 faculty users:

**Faculty 1 - Associate Professor:**
```
Email: john.doe@cau.edu
Password: John123!
First Name: John
Last Name: Doe
Rank: Associate Professor
Department: Computer Science
```

**Faculty 2 - Assistant Professor:**
```
Email: jane.smith@cau.edu
Password: Jane123!
First Name: Jane
Last Name: Smith
Rank: Assistant Professor
Department: Computer Science
```

**Faculty 3 - Full Professor:**
```
Email: bob.johnson@cau.edu
Password: Bob123!
First Name: Bob
Last Name: Johnson
Rank: Full Professor
Department: Physics
```

- [ ] ✅ Success: All 3 users created
- [ ] ✅ Success: Users appear in /admin/users list

---

## 📝 **PHASE 2: SUBMISSION CREATION** (10 min)

### Test 2.1: Faculty Login & Dashboard
- [ ] Logout from admin
- [ ] Login as john.doe@cau.edu / John123!
- [ ] ✅ Success: Redirects to /dashboard
- [ ] ✅ Success: Shows faculty sidebar
- [ ] ✅ Success: Dashboard shows 0 scores initially

### Test 2.2: Create Research Submissions
**Submission 1 - Q1 Journal:**
- [ ] Click "New Submission"
- [ ] Fill form:
  - Category: Research
  - Subcategory: journal_q1
  - Title: "Machine Learning in Healthcare Diagnostics"
  - Description: "Published in Nature Medicine"
  - Evidence Type: Link
  - Evidence: https://nature.com/articles/example
  - Metadata:
    - Author Position: first
    - Corresponding Author: Yes
    - Student Co-author: Yes
- [ ] Click Submit
- [ ] ✅ Success: Shows calculated points (~22-24)
- [ ] ✅ Success: Status = pending
- [ ] ✅ Success: Redirects to submissions list

**Submission 2 - Conference:**
- [ ] Create another submission:
  - Category: Research
  - Subcategory: conference_international
  - Title: "Neural Network Optimization"
  - Description: "Presented at IEEE ICML 2024"
  - Evidence Type: Link
  - Evidence: https://ieeexplore.ieee.org/doc/123
  - Metadata:
    - Author Position: middle
    - Corresponding Author: No
    - Student Co-author: No
- [ ] ✅ Success: Shows calculated points (~4-6)
- [ ] ✅ Success: Appears in list

### Test 2.3: Create Teaching Submissions
**Submission 3 - Course Development:**
- [ ] Create submission:
  - Category: Teaching
  - Subcategory: course_new
  - Title: "Advanced Machine Learning Course"
  - Description: "New graduate course development"
  - Evidence Type: Text
  - Evidence: "Course syllabus and materials prepared"
- [ ] ✅ Success: Shows calculated points (~3-4)

**Submission 4 - Textbook:**
- [ ] Create submission:
  - Category: Teaching
  - Subcategory: textbook
  - Title: "Introduction to AI Textbook"
  - Description: "Authored textbook published by MIT Press"
  - Evidence Type: Link
  - Evidence: https://mitpress.mit.edu/books/example
- [ ] ✅ Success: Shows calculated points (~8-10)

### Test 2.4: Create Admin & Outreach
**Submission 5 - Committee:**
- [ ] Category: Admin
- [ ] Subcategory: committee_chair
- [ ] Title: "Department Curriculum Committee Chair"
- [ ] ✅ Success: Points calculated

**Submission 6 - Outreach:**
- [ ] Category: Outreach
- [ ] Subcategory: event_large
- [ ] Title: "High School STEM Workshop"
- [ ] Description: "120 students attended"
- [ ] ✅ Success: Points calculated

### Test 2.5: Create Submissions for Other Faculty
- [ ] Logout, login as jane.smith@cau.edu
- [ ] Create 5-7 submissions (mix of categories)
- [ ] Logout, login as bob.johnson@cau.edu
- [ ] Create 5-7 submissions (mix of categories)
- [ ] ✅ Success: All submissions created

---

## ✅ **PHASE 3: ADMIN REVIEW - TABLE VIEW** (8 min)

### Test 3.1: Submissions List
- [ ] Logout, login as admin@cau.edu
- [ ] Navigate to /admin/submissions
- [ ] ✅ Success: Shows all submissions (~15-20 total)
- [ ] ✅ Success: Shows metrics bar (Total, Pending, Approved, Rejected)
- [ ] ✅ Success: Shows charts (Submission Activity, Category Breakdown)

### Test 3.2: Filters & Search
**Status Tabs:**
- [ ] Click "All" tab
- [ ] ✅ Shows all submissions
- [ ] Click "Pending" tab
- [ ] ✅ Shows only pending (should be all ~15-20)
- [ ] Click "Approved" tab
- [ ] ✅ Shows 0 (none approved yet)

**Search:**
- [ ] Type "Machine" in search
- [ ] ✅ Success: Filters to matching submissions
- [ ] Clear search
- [ ] ✅ Success: Shows all again

**Category Filter:**
- [ ] Select "Research"
- [ ] ✅ Success: Shows only research submissions
- [ ] Select "All Categories"
- [ ] ✅ Success: Shows all

**Date Filter:**
- [ ] Select "Last 24h"
- [ ] ✅ Success: Shows recent submissions
- [ ] Select "All time"
- [ ] ✅ Success: Shows all

### Test 3.3: Bulk Operations
**Checkbox Selection:**
- [ ] Click "Select All" checkbox
- [ ] ✅ Success: All visible submissions selected
- [ ] ✅ Success: Floating action bar appears
- [ ] ✅ Success: Shows count (e.g., "15 submissions selected")
- [ ] Uncheck one submission
- [ ] ✅ Success: Count updates (e.g., "14 submissions selected")
- [ ] Clear selection

**Bulk Approve:**
- [ ] Select 3 pending submissions
- [ ] Click "Approve All" in floating bar
- [ ] Confirm dialog
- [ ] ✅ Success: Shows success toast
- [ ] ✅ Success: Submissions move to approved
- [ ] ✅ Success: Floating bar disappears
- [ ] ✅ Success: Approved count updates

**Bulk Reject:**
- [ ] Select 2 pending submissions
- [ ] Click "Reject All"
- [ ] Enter rejection reason: "Insufficient documentation"
- [ ] ✅ Success: Shows success toast
- [ ] ✅ Success: Submissions move to rejected
- [ ] ✅ Success: Rejected count updates

### Test 3.4: Export Functionality
**Export CSV:**
- [ ] Click Export button (download icon)
- [ ] Click "CSV"
- [ ] ✅ Success: Downloads CSV file
- [ ] Open CSV file
- [ ] ✅ Success: Contains all columns (Title, Faculty, Email, Department, Rank, Category, Points, Status, Dates, Notes)
- [ ] ✅ Success: Data is properly formatted

**Export Excel:**
- [ ] Click Export button
- [ ] Click "Excel"
- [ ] ✅ Success: Downloads CSV with UTF-8 BOM
- [ ] Open in Excel
- [ ] ✅ Success: Opens correctly with proper encoding

### Test 3.5: Enhanced Drawer - CRITICAL FEATURE!
**Open Drawer:**
- [ ] Click on any submission by John Doe
- [ ] ✅ Success: Drawer opens from right
- [ ] ✅ Success: Shows submission details

**Faculty Activity Overview:**
- [ ] Scroll to "Faculty Activity Overview" section
- [ ] ✅ Success: Shows Quick Stats Summary:
  - Total submissions count
  - Approved count
  - Pending count
  - Rejected count
- [ ] ✅ Success: Shows Category Breakdown:
  - Research with progress bar
  - Teaching with progress bar
  - Admin with progress bar
  - Outreach with progress bar
  - Percentages calculated correctly
- [ ] ✅ Success: Shows Recent Submissions List:
  - Shows latest 5 submissions
  - Each shows: Title, Category, Points, Status
  - Hover effects work
- [ ] ✅ Success: "View All X Submissions" button visible
- [ ] Click "View All" button
- [ ] ✅ Success: Navigates to /admin/submissions?userId=...
- [ ] ✅ Success: Shows only that user's submissions
- [ ] ✅ Success: Shows filter banner
- [ ] Click "Clear filter"
- [ ] ✅ Success: Returns to all submissions

**Drawer Actions:**
- [ ] Open a pending submission
- [ ] Enter review notes
- [ ] Click "Approve"
- [ ] ✅ Success: Shows success toast
- [ ] ✅ Success: Drawer closes
- [ ] ✅ Success: Submission updates to approved
- [ ] Open another pending submission
- [ ] Enter review notes: "Need more details"
- [ ] Click "Reject"
- [ ] ✅ Success: Rejected successfully
- [ ] Open a pending submission
- [ ] Enter notes: "Please add DOI link"
- [ ] Click "Request Changes"
- [ ] ✅ Success: Status changes to changes_requested

---

## 🎨 **PHASE 4: KANBAN VIEW** (10 min)

### Test 4.1: View Toggle
- [ ] On /admin/submissions page
- [ ] Click "Kanban" view toggle (icon-only button)
- [ ] ✅ Success: Switches to Kanban view
- [ ] ✅ Success: Shows 4 columns:
  - To Review
  - Approved
  - Rejected
  - Needs Changes
- [ ] ✅ Success: All columns are GRAY (not colorful)
- [ ] ✅ Success: No horizontal scroll

### Test 4.2: Kanban Cards
**Card Design:**
- [ ] Check a card appearance
- [ ] ✅ Success: Clean, minimal design
- [ ] ✅ Success: Gray color scheme (not rainbow)
- [ ] ✅ Success: Shows emoji icon (📚/👨‍🏫/📋/🤝)
- [ ] ✅ Success: Shows category name
- [ ] ✅ Success: Shows points (gray badge)
- [ ] ✅ Success: Shows title
- [ ] ✅ Success: Shows subcategory
- [ ] ✅ Success: Shows faculty initials (gray avatar)
- [ ] ✅ Success: Shows faculty name
- [ ] ✅ Success: Shows time ago

**Hover Effects:**
- [ ] Hover over a card
- [ ] ✅ Success: Shadow increases
- [ ] ✅ Success: Card lifts slightly
- [ ] ✅ Success: Drag handle appears (left side)
- [ ] ✅ Success: Quick action button appears (top-right, eye icon)
- [ ] Click eye icon
- [ ] ✅ Success: Opens drawer (with Faculty Activity Overview!)

### Test 4.3: Drag and Drop
**Drag Pending → Approved:**
- [ ] Find a submission in "To Review" column
- [ ] Grab the card (drag handle or anywhere on card)
- [ ] ✅ Success: Card follows cursor
- [ ] ✅ Success: Card shows opacity/scale effect
- [ ] Drag over "Approved" column
- [ ] ✅ Success: Column highlights/changes
- [ ] Drop the card
- [ ] ✅ Success: Shows success toast "Submission approved"
- [ ] ✅ Success: Card moves to Approved column
- [ ] ✅ Success: Counts update
- [ ] ✅ Success: Card appears in new column

**Drag Pending → Rejected:**
- [ ] Drag a card from "To Review" to "Rejected"
- [ ] ✅ Success: Browser prompt appears: "Enter rejection reason:"
- [ ] Enter: "Missing evidence"
- [ ] ✅ Success: Shows success toast
- [ ] ✅ Success: Card moves to Rejected
- [ ] ✅ Success: Counts update

**Drag Pending → Needs Changes:**
- [ ] Drag a card to "Needs Changes"
- [ ] ✅ Success: Browser prompt: "Describe the requested changes:"
- [ ] Enter: "Please add publication DOI"
- [ ] ✅ Success: Shows success toast
- [ ] ✅ Success: Card moves to Needs Changes
- [ ] ✅ Success: Status = changes_requested

**Cancel Rejection:**
- [ ] Drag a card to Rejected
- [ ] When prompt appears, click Cancel
- [ ] ✅ Success: Card returns to original column
- [ ] ✅ Success: No status change
- [ ] ✅ Success: No error

### Test 4.4: Filters in Kanban View
- [ ] Use search box
- [ ] ✅ Success: Filters cards across all columns
- [ ] Use category dropdown
- [ ] ✅ Success: Shows only selected category
- [ ] Use date filter
- [ ] ✅ Success: Filters work in Kanban view

### Test 4.5: Switch Back to Table
- [ ] Click "Table" view toggle
- [ ] ✅ Success: Switches back to table view
- [ ] ✅ Success: All changes persisted
- [ ] ✅ Success: Filters preserved
- [ ] ✅ Success: Updated counts visible

---

## 📊 **PHASE 5: SCORING & DASHBOARDS** (5 min)

### Test 5.1: Faculty Dashboard
- [ ] Logout, login as john.doe@cau.edu
- [ ] Navigate to /dashboard
- [ ] ✅ Success: Shows score breakdown:
  - Research score
  - Teaching score
  - Admin score
  - Outreach score
  - Final score
  - Outcome (Outstanding/Satisfactory/etc.)
- [ ] ✅ Success: Shows submission counts:
  - Pending
  - Approved
  - Rejected
- [ ] ✅ Success: Sparkline charts visible
- [ ] ✅ Success: Dark mode works

**Navigate to Submissions:**
- [ ] Click "View Submissions" or navigate to /dashboard/submissions
- [ ] ✅ Success: Shows only John's submissions
- [ ] ✅ Success: Shows status badges
- [ ] ✅ Success: Can create new submission

**Navigate to Scores:**
- [ ] Navigate to /dashboard/scores
- [ ] ✅ Success: Shows detailed score breakdown
- [ ] ✅ Success: Shows category ceilings
- [ ] ✅ Success: Shows calculation details

### Test 5.2: Admin Dashboard
- [ ] Logout, login as admin@cau.edu
- [ ] Navigate to /admin (dashboard)
- [ ] ✅ Success: Shows admin metrics:
  - Total faculty
  - Pending submissions
  - Average score
  - At-risk count
- [ ] ✅ Success: Shows outcome distribution
- [ ] ✅ Success: Shows recent submissions
- [ ] ✅ Success: Shows recent penalties (if any)

### Test 5.3: Admin Scoring Page
- [ ] Navigate to /admin/scoring
- [ ] ✅ Success: Shows configuration table
- [ ] ✅ Success: Shows category ceilings
- [ ] ✅ Success: Shows base points
- [ ] ✅ Success: Shows multipliers
- [ ] Try to edit a value (if feature exists)
- [ ] ✅ Success: Can update configuration

---

## 🔒 **PHASE 6: SECURITY & EDGE CASES** (5 min)

### Test 6.1: Authentication
**Unauthorized Access:**
- [ ] Logout
- [ ] Try to access /admin/submissions
- [ ] ✅ Success: Redirects to /login
- [ ] Try to access /dashboard
- [ ] ✅ Success: Redirects to /login

**Wrong Credentials:**
- [ ] Try login with wrong password
- [ ] ✅ Success: Shows error message
- [ ] Try 6 times quickly
- [ ] ✅ Success: Rate limited (if implemented)

### Test 6.2: Role-Based Access
**Faculty accessing Admin:**
- [ ] Login as john.doe@cau.edu
- [ ] Try to access /admin/submissions
- [ ] ✅ Success: Blocked or redirected
- [ ] Try to access /admin/users
- [ ] ✅ Success: Blocked or redirected

### Test 6.3: Dark Mode
- [ ] Toggle dark mode (moon/sun icon)
- [ ] ✅ Success: All pages switch to dark
- [ ] ✅ Success: Kanban cards look good in dark mode
- [ ] ✅ Success: Drawer looks good in dark mode
- [ ] ✅ Success: Tables readable in dark mode
- [ ] Refresh page
- [ ] ✅ Success: Dark mode persists

### Test 6.4: Responsive Design
**Mobile View:**
- [ ] Open DevTools (F12)
- [ ] Switch to mobile view (iPhone)
- [ ] ✅ Success: Sidebar collapses
- [ ] ✅ Success: Tables scroll horizontally
- [ ] ✅ Success: Kanban scrolls horizontally
- [ ] ✅ Success: Filters stack properly
- [ ] ✅ Success: Drawer opens full screen

**Tablet View:**
- [ ] Switch to tablet view (iPad)
- [ ] ✅ Success: Layout adjusts properly
- [ ] ✅ Success: All features accessible

---

## 🎯 **PHASE 7: FINAL CHECKS** (2 min)

### Test 7.1: Performance
- [ ] Navigate between pages
- [ ] ✅ Success: Fast page loads (<1s)
- [ ] ✅ Success: No console errors
- [ ] ✅ Success: No console warnings (major ones)

### Test 7.2: Data Integrity
- [ ] Verify approved submissions increase faculty scores
- [ ] Check /dashboard for John Doe
- [ ] ✅ Success: Score reflects approved submissions
- [ ] ✅ Success: Score excludes rejected submissions
- [ ] ✅ Success: Pending submissions don't count toward score

### Test 7.3: Browser Compatibility
- [ ] Test in Chrome
- [ ] ✅ All features work
- [ ] Test in Firefox (if available)
- [ ] ✅ All features work
- [ ] Test in Edge (if available)
- [ ] ✅ All features work

---

## 📋 **CRITICAL FEATURES CHECKLIST**

Must work for demo:
- [ ] ✅ Admin can login
- [ ] ✅ Faculty can login
- [ ] ✅ Faculty can create submissions
- [ ] ✅ Points auto-calculate
- [ ] ✅ Admin can see all submissions in table
- [ ] ✅ **Enhanced Drawer shows Faculty Activity Overview** ⭐
- [ ] ✅ Bulk operations work (select + approve/reject)
- [ ] ✅ Export to CSV/Excel works
- [ ] ✅ Kanban view works (professional, gray design)
- [ ] ✅ Drag-and-drop works in Kanban
- [ ] ✅ Status changes via drag-and-drop
- [ ] ✅ Filters work (search, category, date)
- [ ] ✅ View toggle (table ↔ kanban) works
- [ ] ✅ Dark mode works
- [ ] ✅ No horizontal scroll on standard screens

---

## 🐛 **COMMON ISSUES & FIXES**

### Issue: Backend won't start
```bash
docker-compose restart backend
docker-compose logs backend
```

### Issue: Frontend shows API errors
- Check backend is running: http://localhost:5000/api/health
- Check CORS settings
- Check .env files

### Issue: No submissions showing
- Check database: `docker exec -it <mongodb-container> mongosh`
- Verify API calls in Network tab (F12)

### Issue: Drag-and-drop not working
- Check console for errors
- Ensure @dnd-kit packages installed
- Try refreshing page

### Issue: Kanban shows horizontal scroll
- Check screen width
- Verify column width (250px × 4 = 1000px + gaps/padding)
- Check sidebar width

---

## ✅ **SIGN-OFF**

After completing ALL tests above:

- [ ] All critical features working
- [ ] No major bugs found
- [ ] Performance acceptable
- [ ] UI looks professional
- [ ] Ready for demo

**Tested By**: _________________
**Date**: _________________
**Time**: _________________

**Issues Found**: _________________
**Issues Resolved**: _________________

**DEMO READINESS**: ☐ READY  ☐ NOT READY

---

## 🎬 **PRE-DEMO FINAL CHECK** (Tomorrow Morning)

30 minutes before demo:
1. [ ] Start Docker services
2. [ ] Run quick smoke test (login, view kanban, drag one card)
3. [ ] Clear browser cache
4. [ ] Close unnecessary apps
5. [ ] Have demo script ready
6. [ ] Laptop fully charged
7. [ ] Backup internet ready
8. [ ] Screenshots/recording ready

**YOU'RE READY! 🚀**
