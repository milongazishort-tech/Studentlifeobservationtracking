Student Life Progress & Self-Improvement Tracker
Project Proposal · Android Mobile Application
Course: Android App Development (CSE 3210)
Department of Computer Science & Engineering, Shanto-Mariam University of Creative Technology (SMUCT)
Prepared by: Md. Mahfuzur Rahman Milon (241071019) and Sumaia Abrar (241071010)
Date: November 2026
1. Project Idea in Brief
The Student Life Progress & Self-Improvement Tracker is an Android app in which a university student creates an account, starts a 30-day self-observation cycle, and completes a short daily checklist covering wake-up time, university attendance, learning, exercise, skill development, sleep and more. Every day the app turns the checklist into a Daily Score. After each week the student can open a Weekly Result, and after Day 30 a Monthly Result that shows a Life Score, one of 10 Life Stages, strengths and weaknesses, and a personalised lifestyle insight.
The student understands their life through their own data, not through another person’s judgment.
Observe Yourself → Understand Yourself → Improve Yourself
2. Problem Statement
University students spend their days on classes, study, friends, social media, sports, work and personal routines, but many have no clear picture of where their time actually goes. Common to-do and habit apps usually track single tasks or single habits. They rarely show one balanced picture of a student’s academic, physical, social, personal and skill-development life. Without feedback based on real data, it is hard to notice weak habits, stay consistent, or decide what to improve next.
3. Proposed Solution
A standalone Android application, built with Kotlin and Firebase, that:
• lets each student register and receive a unique User ID;
• gives every student a private 30-day tracking cycle;
• presents a 12-item daily life checklist and calculates a Daily Score from it;
• summarises progress every week (Weekly Result) and at the end of the cycle (Monthly Result);
• classifies the student into one of 10 Life Stages and generates rule-based improvement suggestions.
The “prediction” is presented only as a data-based lifestyle insight, never as a guaranteed prediction of the future.
4. Objectives
• Help students see how they spend their daily time.
• Encourage positive habits and consistency over 30 days.
• Measure daily, weekly and monthly improvement with a simple scoring system.
• Identify each student’s strongest and weakest life areas.
• Provide personalised suggestions based on the student’s own recorded data.
• Protect the privacy of every student’s personal records.
5. Target Users
• Primary: university students who want to improve their routine, discipline and skills.
• Secondary: college students who want to build better daily habits.
• Future: an admin role to manage activity categories and view anonymous statistics.
6. How the System Works (User Journey)
Step
Student does
System does
1. Register / Login
Creates an account with email and password
Firebase Authentication creates the account and a unique User ID is assigned
2. Start cycle
Chooses start date and target wake-up and sleep times
Creates a 30-day cycle (Day 1 to Day 30)
3. Daily check-in
Completes the checklist and writes a short reflection
Saves the record to Firestore and calculates the Daily Score instantly
4. Daily result
Views today’s score and streak
Shows completed and missed tasks
5. Weekly result
Opens the report after Day 7, 14, 21 and 28
Calculates the weekly average, category breakdown, change from the previous week and one focus tip
6. Monthly result
Opens the report after Day 30
Calculates the Life Score, assigns the Life Stage, finds strengths and weaknesses and generates the insight
7. Next cycle
Optionally starts a new 30-day cycle
Keeps the old history and compares months
7. Daily Checklist and Scoring
The formula from the SRS is kept: Daily Score (%) = (Points Achieved ÷ Maximum Available Points) × 100. The point weights below are a proposed starting point and can be tuned during testing.
#
Life area
How it is recorded
Points
1
Early Morning
Yes/No against the target wake-up time
8
2
University Attendance
Yes/No (or Off day)
10
3
Class Participation
Classes attended out of total classes (e.g. 4/5)
8
4
Religious / Personal Discipline
Yes/No
8
5
Social Interaction
Number of meaningful interactions
6
6
Daily Learning
Short note on what was learned
10
7
Physical Activity
Yes/No plus minutes
10
8
Earning / Skill Development
Minutes spent
10
9
Class Work Recap
Yes/No
10
10
Social Media / News Control
Controlled, useful or excessive
6
11
Self-Reflection
Short journal entry
8
12
Sleeping on Time
Yes/No against the target sleep time
6

Total

100
Numeric items earn partial points (for example, 4 of 5 classes earns 80% of that item’s points).
Suggested rules
• Off days: on holidays or weekends, university attendance and class participation can be marked “Not applicable”. Their points are removed from the maximum, so the student is not penalised.
• Missed days: a day with no record counts as 0% in the monthly average and lowers the consistency figure. The student may fill in yesterday’s entry as a grace option.
8. Weekly Result
After each completed week the student can view:
• weekly average score and number of days tracked (for example, 6 of 7);
• best day and lowest day;
• performance in each life area (which areas were strong or weak that week);
• change from the previous week (up or down);
• current streak of consecutive tracked days;
• one focus suggestion for the coming week.
Week structure: Week 1 is Days 1–7, Week 2 is Days 8–14, Week 3 is Days 15–21 and Week 4 is Days 22–28. Because 30 days is not a whole number of weeks, Days 29–30 appear as a short “Final Stretch” summary and are included in the Monthly Result.
9. Monthly Result (30-Day Report)
After Day 30 the app generates:
• Life Score: the average of the 30 Daily Scores.
• Habit consistency: days tracked ÷ 30.
• Life Stage: one of the 10 stages from the SRS (Stage 1, Critical / Highly Unbalanced, up to Stage 10, Exceptional Self-Development), based on the Life Score. A low consistency figure is shown alongside the stage so the student knows the score may be incomplete.
• Strengths and weaknesses: the top three and bottom three life areas by completion rate.
• Progress trend: a chart of the four weeks plus the final stretch.
• Life Insight: a personalised paragraph built from predefined rules, for example, high academic consistency combined with low physical activity.
• Improvement suggestions: two or three practical actions for the next month.
Example insight: “During the last 30 days, your academic consistency was strong, but your physical activity and skill development were comparatively low. If you improve these while keeping your academic consistency, your overall balance may improve further over the next month.”
10. Core Features and Optional Additions
Priority
Feature
Core (must build)
Registration, login, logout and password recovery; unique User ID; 30-day cycle; daily checklist; Daily Score; saved history; Weekly Result; Monthly Result; Life Stage; rule-based insight and suggestions; user-specific data protection
Recommended
Custom target times for wake-up and sleep; daily reminder notification; streak counter; charts (30-day line chart, weekly bar chart, life-area radar chart); editing yesterday’s entry; offline support with later sync; profile update
Optional / nice to have
Badges for streak milestones; one focus goal per week chosen by the student; one-tap mood tracking compared with lifestyle patterns; Bangla and English language toggle; shareable result card (the student controls what is shown); export result as PDF; dark mode; Month 1 vs Month 2 comparison
Future version
AI personal coach; smart daily routine suggestions; GPA/CGPA tracking; Pomodoro study timer; admin panel and anonymous statistics
11. Technology and Architecture
• Platform: Android 8.0 (API 26) or above
• Language and IDE: Kotlin, Android Studio
• UI: XML with Material Design (designed first in Figma)
• Backend: Firebase Authentication and Cloud Firestore
• Notifications: Android notification system
• Version control: Git and GitHub
• Suggested structure: MVVM, with the scoring and insight logic kept in separate classes so they can be unit-tested
Flow: Student → Android App → Firebase Authentication → Cloud Firestore → Scoring & Analysis → Weekly / Monthly Result
12. Data Design (Summary)
Collection
Purpose
users
Profile: userId, name, email, university, department, startDate, endDate, target times
dailyActivities
One record per day with all 12 checklist values and the reflection
dailyScores
Daily Score and per-area points for each day
weeklySummaries
Weekly average, best and lowest day, area breakdown (new in this proposal)
monthlyResults
Life Score, consistency, Life Stage, strengths, weaknesses, insight (new in this proposal)
Storing each student’s data under their own user path (for example, users/{userId}/dailyActivities) makes it simple to write Firestore security rules so that a user can read and write only their own records.
13. Main Screens
Splash, Welcome, Registration, Login, Home Dashboard (Day X / 30 with today’s score), Daily Checklist, Activity Details, Daily Score, Weekly Result, 30-Day Journey, Self-Reflection, Monthly Result and Life Stage, Lifestyle Insight, Profile and Settings.
14. Development Plan (12 Weeks)
Weeks
Work
1–2
Requirement analysis, SRS and UI/UX design
3–4
Firebase setup, authentication, profile and 30-day cycle
5–6
Daily activity tracking and scoring system
7–8
Progress dashboard, weekly result and Life Stage system
9
Monthly result and lifestyle insight system
10–11
Testing, bug fixing, UI improvement and optimisation
12
Documentation and final presentation
Testing covers unit tests for scoring, functional, UI, database and authentication tests, performance checks and user acceptance testing with sample university students.
15. Privacy, Ethics and Limitations
• Only the information needed for progress analysis is collected, and it is never displayed publicly or shared with other students.
• Each student can access only their own records, enforced by Firebase security rules.
• The app does not provide medical or psychological diagnosis, and it does not guarantee future results.
• Life Stages are for self-awareness and motivation, not for judging a student’s worth.
• The results depend on the student recording their activities honestly and regularly.
16. Expected Outcome
A working Android app that lets a student answer five questions about their own life: What did I do? How consistent was I? Where did my time go? What am I improving? What should I improve next? Students receive daily feedback, a weekly checkpoint and a complete 30-day report to guide better habits. For the course, the project demonstrates Kotlin, Android Studio, Firebase Authentication, Cloud Firestore, UI/UX design, data management, notifications and rule-based analysis in one practical application.
17. Conclusion
The Student Life Progress & Self-Improvement Tracker goes beyond an ordinary task list. By combining daily tracking, scoring, weekly and monthly results, self-reflection and a 10-stage classification, it gives university students a simple, private and motivating way to understand and improve their own lifestyle. It is both a suitable academic project and a potentially useful real-world tool.
Your life. Your data. Your progress.