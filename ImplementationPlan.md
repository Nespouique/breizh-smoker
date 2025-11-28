Implementation Plan - Breizh Smoker
This plan outlines the steps to build the "Breizh Smoker" application, a tool to track the meat/fish smoking process.

User Review Required
IMPORTANT

Supabase Project Creation: I will create a new Supabase project named "Smoker" to store your data. Please confirm if you prefer to use an existing project instead.

NOTE

Tech Stack:

Frontend: React (Vite) + Tailwind CSS
UI Library: Shadcn UI + Lucide Icons
Backend: Supabase (Database & Auth if needed, though we'll start with public/anon access for simplicity unless specified)
Proposed Changes
Project Initialization
[NEW] 
package.json
Initialize a new Vite project with React and TypeScript.
Install dependencies: lucide-react, @supabase/supabase-js, react-router-dom, date-fns, recharts (for the weight graph).
Database Schema (Supabase)
I will apply the following schema to the Supabase project:

years: id, year (integer, unique), notes (text).
items: id, year_id (FK), name (text), type (enum: meat, fish), cut (text), initial_weight (float), diameter (float), target_weight (float), curing_method (enum: vacuum, traditional), status (enum: prep, curing, drying, smoking, aging, done), created_at.
item_events (or columns in items): To track dates for each stage (curing_start, drying_start, etc.).
weight_logs: id, item_id (FK), date, weight (float).
Frontend Implementation
[NEW] 
src/lib/supabase.ts
Supabase client initialization.
[NEW] 
src/components/ui/...
Install necessary Shadcn components: button, card, input, select, form, table, dialog, tabs, stepper (custom or composed).
[NEW] 
src/App.tsx
Main layout with Year Selector.
Navigation between years.
[NEW] 
src/features/dashboard/YearView.tsx
Display list of items for the selected year.
"Add Item" button.
Global notes for the year.
[NEW] 
src/features/wizard/ItemWizard.tsx
Multi-step form for adding/editing an item.
Step 1: Prep: Input weight/diameter. Auto-calc target weight (30-40% loss).
Step 2: Curing: Select method.
Vacuum: Auto-calc Salt (4%), Sugar (2%), Pepper (1%). Input spices. Auto-calc duration.
Traditional: Instructions.
Step 3-7: Tracking status updates (Rinsing, Drying, Smoking, Aging).
[NEW] 
src/features/tracking/WeightGraph.tsx
Visual graph of weight loss during aging.
Verification Plan
Automated Tests
I will run the build to ensure no type errors.
Manual Verification
Project Setup: Verify the app runs locally.
Data Entry:
Create the year "2025".
Add a "Filet Mignon" (Porc) with 291g initial weight (from 
2025.md
).
Verify the calculated salt is ~11.64g (4%) and sugar ~5.82g (2%).
Verify the calculated curing time for a 6cm diameter is 4 days (3 days + 24h).
Workflow:
Move the item through the stages (Salaison -> Rinçage -> Séchage -> Fumage -> Affinage).
Add a weight log in the Affinage stage and check the graph.