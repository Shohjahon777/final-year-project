# Scoring Logic Documentation

**Faculty Evaluation System - Detailed Calculation Formulas**

This document provides comprehensive details on how scores are calculated across all categories, including worked examples and edge cases.

---

## Table of Contents

- [Research Scoring](#research-scoring)
- [Teaching Scoring](#teaching-scoring)
- [Administrative Scoring](#administrative-scoring)
- [Outreach Scoring](#outreach-scoring)
- [Expectation Multipliers](#expectation-multipliers)
- [Penalty Calculations](#penalty-calculations)
- [Final Score Calculation](#final-score-calculation)
- [Category Ceiling Enforcement](#category-ceiling-enforcement)

---

## Research Scoring

### Base Points by Journal Tier

| Journal Tier | Base Points (1st/Last Author) |
|--------------|-------------------------------|
| Q1 | 10 |
| Q2 | 8 |
| Q3 | 6 |
| Q4 | 4 |

### Authorship Multipliers

| Author Position | Multiplier |
|----------------|------------|
| 1st or Last Author | ×1.0 |
| Middle Author | ×0.7 |
| Corresponding Author (any position) | ×1.1 |
| Student Co-Author (bonus) | ×1.1 |

### Calculation Formula

```
Step 1: Start with base points (based on journal tier and author position)
Step 2: Apply authorship multiplier if middle author
Step 3: Apply corresponding author multiplier if applicable
Step 4: Apply student co-author bonus if applicable
Step 5: Apply expectation multiplier based on faculty rank
Step 6: Apply category ceiling (max 40 points)
```

### Worked Examples

#### Example 1: Assistant Professor - Q2 Paper
**Scenario**: Assistant Professor publishes Q2 paper as 1st author, corresponding, with student coauthor

```
Base: 8 (Q2, 1st author)
Corresponding: 8 × 1.1 = 8.8
Student bonus: 8.8 × 1.1 = 9.68
Expectation multiplier (Average = ×1.4): 9.68 × 1.4 = 13.55 points
```

#### Example 2: Associate Professor - Q1 Paper
**Scenario**: Associate Professor publishes Q1 paper as 3rd author (middle), corresponding, with student coauthor

```
Base: 10 (Q1)
Middle author: 10 × 0.7 = 7
Corresponding: 7 × 1.1 = 7.7
Student bonus: 7.7 × 1.1 = 8.47
Expectation multiplier (Good = ×1.2): 8.47 × 1.2 = 10.16 points
```

#### Example 3: Professor - Q1 Paper
**Scenario**: Professor publishes Q1 paper as 1st author, corresponding

```
Base: 10 (Q1, 1st author)
Corresponding: 10 × 1.1 = 11
Expectation multiplier (Great = ×1.0): 11 × 1.0 = 11 points
```

### Conferences (Scopus/CAU-Approved)

**Base Points**: 3 (1st/last author), 2.1 (middle author)

**Calculation**: Same multiplier logic as journals

### Books & Chapters

| Type | Points |
|------|--------|
| Book (1st author/editor) | 8 |
| Book Chapter (1st author) | 2 |

**Note**: Expectation multiplier applies to books and chapters.

### Patents

**Genuine Verified Patent**: 15 points
- Must be primary inventor
- Accepted registries: USPTO, WIPO, EPO, UKIPO
- Expectation multiplier applies

**Fake/Low-Quality Patents**: 0 points + Academic Dishonesty penalty (-20)

### Research Groups

| Activity | Points |
|----------|--------|
| Initiating research group | 3 (one-time) |
| Running group (active semester) | 5 |
| Student produces publication as 1st author | +3 |

**Note**: Expectation multiplier applies.

### Research Funding

| Funding Amount | Role | Points |
|----------------|------|--------|
| > $20,000 | PI | 25 |
| < $20,000 | PI | 10 |
| Any amount | Co-PI | PI score × 0.3 |

**Note**: Expectation multiplier applies.

---

## Teaching Scoring

### Student Feedback

| Satisfaction Rate | Points |
|-------------------|--------|
| 80%+ | +3 |
| 70-79% | +1 |
| 60-69% | 0 |
| <60% | -2 (penalty) |

### Course Preparation

| Course Type | Points |
|-------------|--------|
| Previously taught | +1 |
| New course | +2.5 |

### Teaching Materials (EduPlus)

**Upload complete materials in CAU format**: +2 points per course

### Syllabus Creation

| Item | Points |
|------|--------|
| Per module | +1 |
| Missing checkpoints | -0.5 |

### Failure Rate Penalty

**If >40% of students fail the course**: -2 points

### Calculation Formula

```
Teaching Score = Student Feedback + Course Prep + Materials + Syllabus - Fail Rate Penalty
Max: 30 points
```

### Worked Example

**Scenario**: Faculty teaches 2 courses (1 new, 1 previously taught), uploads materials for both, creates syllabus for both modules, 85% student satisfaction, 25% fail rate

```
Student Feedback: +3 (85% satisfaction)
Course Prep: +2.5 (new) + 1 (previously taught) = 3.5
Materials: +2 × 2 = 4
Syllabus: +1 × 2 = 2
Fail Rate Penalty: 0 (25% < 40%)

Total: 3 + 3.5 + 4 + 2 = 12.5 points
```

---

## Administrative Scoring

### Major Tasks

| Task | Points |
|------|--------|
| Accreditation leadership | 20 |
| Program revision committee | 20 |

**Note**: These tasks are typically one-time or annual. Points are awarded once per occurrence.

### Medium Tasks

| Task | Points |
|------|--------|
| Running a club | 5 per semester |
| Initiating club | 3 (one-time) |
| Event with 100+ students | 4 per event |
| Event 50-99 students | 1.5 per event |

### Minor Tasks

| Task | Points |
|------|--------|
| Reviewing exam questions | 3 per semester |
| Committee member | 3-5 (varies by committee) |
| Volunteering | 0.1 per hour |

**Volunteering Requirements**: Must post reminder in telegram ≥5 hours before session.

### Calculation Formula

```
Admin Score = Major Tasks + Medium Tasks + Minor Tasks
Max: 20 points
```

### Worked Example

**Scenario**: Faculty runs coding club (2 semesters), organizes 1 event with 120 students, reviews exam questions (1 semester), volunteers 20 hours

```
Running club: 5 × 2 = 10
Event (100+): 4
Exam review: 3
Volunteering: 0.1 × 20 = 2

Total: 10 + 4 + 3 + 2 = 19 points
```

---

## Outreach Scoring

### Event Participation

| Participants | Points |
|--------------|--------|
| ~100 participants | 3 |
| 50-99 participants | 1.5 |
| <50 participants | 0.5-2 (varies) |

**Note**: Must be representing CAU in the event.

### Examples of Outreach Activities

- School visits
- STEM fairs
- Public lectures
- Workshops
- University exhibitions

### Calculation Formula

```
Outreach Score = Sum of all outreach event points
Max: 10 points
```

### Worked Example

**Scenario**: Faculty participates in 2 STEM fairs (100 participants each), 1 public lecture (80 participants)

```
STEM Fair 1: 3 points
STEM Fair 2: 3 points
Public Lecture: 1.5 points (80 participants)

Total: 3 + 3 + 1.5 = 7.5 points
```

---

## Expectation Multipliers

### Multiplier Values

| Expectation Level | Multiplier |
|-------------------|------------|
| Great | ×1.0 |
| Good | ×1.2 |
| Average | ×1.4 |
| Below Average | ×1.5 |

### Expectation Profile by Rank

| Rank | Research Expectation | Admin Expectation | Student Satisfaction |
|------|---------------------|-------------------|---------------------|
| Head | Average (×1.4) | Great (×1.0) | Great (×1.0) |
| Professor | Great (×1.0) | Great (×1.0) | Good (×1.2) |
| Associate Professor | Good (×1.2) | Good (×1.2) | Good (×1.2) |
| Assistant Professor | Average (×1.4) | Average (×1.4) | Great (×1.0) |
| Lecturer | Below Average (×1.5) | Average (×1.4) | Great (×1.0) |

### Application

**Research Category**: Expectation multiplier applies to all research activities (publications, conferences, books, patents, research groups, funding).

**Teaching Category**: Student satisfaction expectation applies to student feedback component.

**Admin Category**: Admin expectation applies to administrative tasks.

**Outreach Category**: No expectation multiplier (same for all ranks).

---

## Penalty Calculations

### Meeting Attendance

**Rule**: Faculty can miss only 2 meetings with valid reason.

**Penalty**: -2 points for each additional meeting missed.

**Calculation**:
```
If meetings_missed > 2:
    penalty = (meetings_missed - 2) × (-2)
Else:
    penalty = 0
```

**Example**: Faculty misses 5 meetings (3 beyond the allowed 2)
```
Penalty = (5 - 2) × (-2) = -6 points
```

### Deadline Violations

**Rule**: Deadline must be announced at least 7 days earlier.

**Penalties**:

| Lateness | Points |
|----------|--------|
| <24 hours | -1 |
| 24-48 hours | -2 |
| 48-72 hours | -3 |
| >72 hours | -10 (major violation) |

**Calculation**:
```
If late_by < 24 hours:
    penalty = -1
Else if late_by < 48 hours:
    penalty = -2
Else if late_by < 72 hours:
    penalty = -3
Else:
    penalty = -10
```

### Academic Dishonesty

**Automatic Penalty**: -20 points

**Violations Include**:
- Plagiarism
- Data fabrication
- Fake patents
- Manipulated student evaluations
- Ghost/gift authorship
- Cheating in documentation/evidence

**Note**: This is a severe violation and may result in additional consequences beyond point deduction.

---

## Final Score Calculation

### Step-by-Step Process

1. **Calculate Category Scores**
   - Research: Sum all research activities (max 40)
   - Teaching: Sum all teaching components (max 30)
   - Admin: Sum all admin tasks (max 20)
   - Outreach: Sum all outreach events (max 10)

2. **Apply Category Ceilings**
   - Ensure no category exceeds its maximum

3. **Calculate Subtotal**
   ```
   Subtotal = Research + Teaching + Admin + Outreach
   ```

4. **Apply Penalties**
   ```
   Total Penalties = Meeting Penalties + Deadline Penalties + Academic Dishonesty Penalties
   ```

5. **Calculate Final Score**
   ```
   Final Score = Subtotal + Total Penalties
   ```
   **Note**: Penalties are negative, so they reduce the score.

6. **Determine Outcome**
   ```
   If Final Score >= 80:
       Outcome = "Outstanding"
   Else if Final Score >= 60:
       Outcome = "Satisfactory"
   Else if Final Score >= 50:
       Outcome = "Improvement Plan"
   Else:
       Outcome = "Contract Risk"
   ```

### Complete Worked Example

**Faculty Profile**: Assistant Professor (Average Research Expectation = ×1.4)

**Research Activities**:
- Q2 paper, 1st author, corresponding, with student: 13.55 points
- Q3 paper, middle author: 6 × 0.7 × 1.4 = 5.88 points
- Running research group (1 semester): 5 × 1.4 = 7 points
- **Research Total**: 13.55 + 5.88 + 7 = 26.43 points (within 40 max)

**Teaching Activities**:
- Student feedback (85%): +3 points
- New course: +2.5 points
- Materials uploaded (1 course): +2 points
- Syllabus (1 module): +1 point
- Fail rate (30%): 0 penalty
- **Teaching Total**: 3 + 2.5 + 2 + 1 = 8.5 points (within 30 max)

**Admin Activities**:
- Running club (1 semester): 5 points
- Event (100+ students): 4 points
- **Admin Total**: 5 + 4 = 9 points (within 20 max)

**Outreach Activities**:
- STEM fair (100 participants): 3 points
- **Outreach Total**: 3 points (within 10 max)

**Penalties**:
- Missed 3 meetings (1 beyond allowed): -2 points
- Late submission (36 hours): -2 points
- **Total Penalties**: -4 points

**Final Calculation**:
```
Subtotal = 26.43 + 8.5 + 9 + 3 = 46.93 points
Final Score = 46.93 + (-4) = 42.93 points
Outcome = "Contract Risk" (below 50)
```

---

## Category Ceiling Enforcement

### Purpose

Category ceilings prevent "gaming the system" by over-performing in one category to compensate for weaknesses in others.

### Rules

- **Research**: Maximum 40 points (even with 10 Q1 papers)
- **Teaching**: Maximum 30 points
- **Admin**: Maximum 20 points
- **Outreach**: Maximum 10 points
- **Total**: Maximum 100 points (before penalties)

### Implementation

```typescript
function applyCategoryCeiling(category: string, score: number): number {
  const ceilings = {
    research: 40,
    teaching: 30,
    admin: 20,
    outreach: 10
  };
  
  return Math.min(score, ceilings[category] || Infinity);
}
```

### Example

**Scenario**: Faculty has 50 points worth of research activities

```
Raw Research Score: 50
Applied Ceiling: min(50, 40) = 40
Final Research Score: 40
```

---

## Edge Cases & Special Rules

### Multiple Authorships

If a faculty member has multiple roles (e.g., both corresponding and student co-author), all applicable multipliers are applied sequentially.

### Semester-Based Activities

Activities like "running a club" or "reviewing exam questions" are awarded per semester. If a faculty member does this for multiple semesters, points are cumulative.

### One-Time vs. Recurring

- **One-time**: Accreditation leadership, Program revision, Initiating club, Initiating research group
- **Recurring**: Running club (per semester), Events (per event), Volunteering (per hour)

### Evidence Requirements

All submissions require evidence:
- **Research**: DOI, publication link, or official confirmation
- **Teaching**: Student feedback reports, material uploads, syllabus files
- **Admin**: Meeting minutes, event photos, sign-in sheets
- **Outreach**: Event photos, official invitations, participant lists

### Validation Rules

- Submissions can only be edited before admin review
- Once approved, submissions cannot be modified (admin can adjust)
- Rejected submissions can be resubmitted with corrections
- Penalties cannot be removed once applied (admin can add notes)

---

## Testing Scenarios

### Test Case 1: Maximum Scores
- Research: 40 points
- Teaching: 30 points
- Admin: 20 points
- Outreach: 10 points
- **Expected**: 100 points (before penalties)

### Test Case 2: Over-Ceiling Research
- Research activities total: 60 points
- **Expected**: Capped at 40 points

### Test Case 3: Negative Final Score
- Subtotal: 25 points
- Penalties: -30 points
- **Expected**: Final score = -5, Outcome = "Contract Risk"

### Test Case 4: Expectation Multiplier Edge Cases
- Lecturer (Below Average) with Q1 paper: Should get ×1.5 multiplier
- Professor (Great) with Q4 paper: Should get ×1.0 multiplier

---

**Last Updated**: 2025  
**Version**: 1.0.0

