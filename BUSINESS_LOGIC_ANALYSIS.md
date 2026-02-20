# Business Logic Analysis & Weaknesses

## 🔴 CRITICAL ISSUES

### 1. **NO SCORING ENGINE EXISTS** ⚠️ HIGHEST PRIORITY

**Location**: `backend/src/services/faculty.service.ts:162`

```typescript
// Current code:
calculatedPoints: 0,  // ❌ ALWAYS ZERO!
```

**Problem**: The entire scoring system described in README.md (Q1=14pts, Q2=10pts, authorship multipliers, expectation multipliers, student bonuses) **IS NOT IMPLEMENTED**.

**What Dean Asked For** (from README):
- Q1 Journal: 14 points (first author) × rank multiplier
- Middle author: ×0.7
- Corresponding author: ×1.2
- Student co-author: ×1.1
- Expectation multipliers by rank (Lecturer: ×1.5, Assistant Prof: ×1.4, etc.)

**What Actually Happens**:
- Faculty submits → calculatedPoints = 0
- Admin manually enters points
- No automation whatsoever

**Impact**:
- Manual scoring is error-prone
- Inconsistent across faculty
- Not scalable
- Defeats the purpose of a "transparent, fair, measurable system"

---

### 2. **WRONG OUTCOME THRESHOLDS** ⚠️ CRITICAL

**Location**: `backend/src/services/admin.service.ts:12-16`

```typescript
// Current code (WRONG):
if (finalScore >= 80) return 'outstanding'
if (finalScore >= 60) return 'satisfactory'
if (finalScore >= 40) return 'improvement_plan'  // ❌ Should be 50
return 'contract_risk'
```

**What Dean Asked For** (from README):
- Outstanding: 80-100
- Satisfactory: 60-79
- Improvement Plan: **50-59** (not 40!)
- Contract Risk: **< 50** (not < 40!)

**Impact**: Faculty with 40-49 points are incorrectly classified as "improvement_plan" instead of "contract_risk".

---

### 3. **HARDCODED CEILINGS INSTEAD OF CONFIG** ⚠️ HIGH

**Location**: `backend/src/services/admin.service.ts:640-646`

```typescript
// Hardcoded:
const ceilings = {
  research: 40,
  teaching: 30,
  admin: 20,
  outreach: 10,
}
```

**Problem**: Config system exists (`Configuration` model) with ceiling values, but `recalculateScore()` ignores them and uses hardcoded values.

**Impact**: Admin changes to ceilings in `/admin/scoring` page have NO EFFECT.

---

### 4. **NO ACADEMIC YEAR FILTER ON SUBMISSIONS** ⚠️ HIGH

**Location**: `backend/src/services/admin.service.ts:625-629`

```typescript
// Current code:
const submissions = await Submission.find({
  userId,
  status: 'approved',
}).lean()
// ❌ No academic year filter!
```

**Problem**: When calculating scores, it pulls ALL approved submissions from ALL years.

**Impact**:
- A professor's 2023 publications are counted again in 2024
- Scores are inflated
- Can't have year-by-year evaluation

**Fix Needed**: Add `academicYear` field to Submission model and filter by current year.

---

### 5. **NO DUPLICATE SUBMISSION CHECKING**

**Problem**: Nothing prevents faculty from submitting the same publication 5 times.

**Impact**: Gaming the system is trivial.

---

### 6. **EXPECTATION MULTIPLIERS NOT APPLIED**

**What Dean Asked For**: Different expectations by rank
- Lecturer: ×1.5 (research is "Below Average" expectation)
- Assistant Prof: ×1.4
- Associate Prof: ×1.2
- Professor: ×1.1
- Head: ×1.0

**Current Code**: Multipliers are in config DB but NEVER used in score calculation.

---

### 7. **AUTHORSHIP MULTIPLIERS NOT APPLIED**

**What Dean Asked For**:
- First/last author: ×1.0 (full points)
- Middle author: ×0.7
- Corresponding author: ×1.2
- Student co-author: ×1.1

**Current Code**: Not implemented. No fields to capture authorship position.

---

### 8. **NO PENALTY VALIDATION**

**Location**: `backend/src/services/admin.service.ts:481-517`

**Problems**:
- No limits on penalty amounts
- No validation of evidence
- No expiry dates
- Penalties from 2023 still counted in 2026

---

### 9. **MISSING BUSINESS RULES**

From README, these are NOT implemented:

**Meeting Penalties**:
- Faculty can miss 2 meetings with valid reason
- Each additional: -2 points
- **Missing**: No tracking of meeting attendance at all

**Deadline Penalties**:
- Late <24h: -1 point
- Late 24-48h: -2 points
- Late 48-72h: -3 points
- Late >72h: -10 points
- **Missing**: No deadline tracking, no late submission detection

**Patent Validation**:
- Must verify USPTO, WIPO, EPO, UKIPO registries
- Fake patents: -20 points (academic dishonesty)
- **Missing**: No patent verification

**Research Group Rules**:
- Initiating group: 3 points (one-time)
- Running group (active semester): 5 points
- Student publishes as 1st author: +3 points
- **Missing**: No research group tracking

**Teaching Feedback**:
- 80%+ satisfaction: +3 points
- 70-79%: +1 point
- <60%: -2 penalty
- **Missing**: No feedback data integration

**Failure Rate Penalty**:
- If >40% students fail: -2 points
- **Missing**: No grade data integration

---

## 📊 ADMIN VIEW ISSUES

### Strengths ✅
- Professional UI with charts
- Good drawer UX for submission review
- Status tabs and filtering
- Category visualization

### Weaknesses ❌

1. **Charts Use Mock Data**:
   - `trendData` is hardcoded (lines 199-208)
   - `categoryDistribution` is hardcoded (lines 211-216)
   - Real data aggregation exists but not used properly

2. **No Bulk Operations**:
   - Can't approve/reject multiple submissions at once
   - No batch point adjustment

3. **No Export**:
   - No CSV export
   - No PDF reports
   - Can't export scores for HR

4. **No Audit Trail**:
   - Who changed what points?
   - History of submission reviews?
   - Track admin actions?

5. **No Academic Year Filter**:
   - Can't view submissions by academic year
   - Can't compare year-over-year

6. **No Scoring Configuration UI**:
   - `/admin/scoring` page exists but multipliers aren't used
   - Can change values but has no effect

7. **No Workflow Management**:
   - Can't assign reviewers
   - No SLA tracking (time to review)
   - No escalation

---

## 🎯 WHAT DEAN ACTUALLY NEEDS

Based on README requirements, the dean needs:

### Research Scoring (MISSING):
1. Automatic point calculation:
   - Journal tier (Q1/Q2/Q3/Q4) → base points
   - Authorship position → multiplier
   - Corresponding author → bonus
   - Student involvement → bonus
   - Faculty rank → expectation multiplier

2. Example calculation:
   ```
   Assistant Prof publishes Q2 paper as 3rd author, corresponding, with student:
   Base: 10 (Q2)
   Middle author: 10 × 0.7 = 7
   Corresponding: 7 × 1.2 = 8.4
   Student bonus: 8.4 × 1.1 = 9.24
   Expectation (Average): 9.24 × 1.4 = 12.94 points
   ```

### Teaching Scoring (MISSING):
- Student feedback integration
- Course development tracking
- Material upload verification
- Syllabus completeness

### Admin Scoring (MISSING):
- Committee membership tracking
- Event organization
- Accreditation work

### Penalty System (PARTIAL):
- Meeting attendance tracking
- Deadline monitoring with auto-penalties
- Academic dishonesty workflow

---

## 🔧 RECOMMENDED FIXES (Priority Order)

### Phase 1: Critical Fixes (1 week)
1. ✅ Implement scoring engine for Research
2. ✅ Fix outcome thresholds (40→50)
3. ✅ Add academic year to submissions
4. ✅ Use config ceilings instead of hardcoded
5. ✅ Apply expectation multipliers

### Phase 2: Core Features (1 week)
1. ✅ Add authorship position fields
2. ✅ Implement Teaching/Admin/Outreach scoring
3. ✅ Add duplicate detection
4. ✅ Implement penalty types properly
5. ✅ Add deadline tracking

### Phase 3: Admin Enhancements (1 week)
1. ✅ Fix charts to use real data
2. ✅ Add bulk operations
3. ✅ Add export (CSV/PDF)
4. ✅ Add audit logging
5. ✅ Add academic year filtering

### Phase 4: Advanced Features (1 week)
1. ✅ Research group management
2. ✅ Teaching feedback integration
3. ✅ Meeting attendance tracking
4. ✅ Patent verification
5. ✅ Workflow assignment

---

## 📝 CONCLUSION

**The current system is a UI shell without the core business logic.**

The dean's requirements for a "transparent, fair, measurable point-based system" are not met because:
- Points are manually entered, not calculated
- Complex multipliers are not applied
- Academic year tracking is missing
- Penalties are not automated
- Integration with external systems (student feedback, grades) is missing

**The system needs a complete scoring engine implementation to match the README specifications.**
