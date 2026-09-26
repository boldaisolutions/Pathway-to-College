/**
 * Hand-written Supabase types mirroring schema.sql. (Regenerate with
 * `supabase gen types typescript` once the project is linked, if preferred.)
 */

export type UserRole = "student" | "parent" | "counselor" | "mentor" | "admin";
export type RigorLevel = "none" | "some" | "many";
export type TestingState = "notyet" | "psat" | "taken";
export type LeadershipLevel = "none" | "member" | "leader";
export type CourseLevel = "Reg" | "Honors" | "AP" | "IB" | "Dual";
export type EssayStatus = "Idea" | "Outline" | "Drafting" | "In review" | "Done";
export type ProjectStage = "Idea" | "Planning" | "Building" | "Launched";
export type CollegeFit = "Reach" | "Target" | "Safety";
export type PipelineStage = "Researching" | "Shortlisted" | "Applying" | "Submitted";
export type MilestoneStatus = "todo" | "doing" | "done";
export type RelationKind = "parent" | "counselor" | "mentor";
export type RelationStatus = "invited" | "pending" | "connected";

/** One of the 9 pathway categories (stored as jsonb in pathway_scores). */
export type Category = {
  name: string;
  short: string;
  score: number;
  note: string;
}

export type Profile = {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  avatar_initials: string;
  created_at: string;
  updated_at: string;
}

export type Student = {
  id: string;
  grade: number;
  class_of: number | null;
  school: string;
  intended_major: string;
  location: string;
  gpa: number;
  rigor: RigorLevel;
  testing: TestingState;
  leadership: LeadershipLevel;
  service_hours: number;
  research: boolean;
  awards_count: number;
  interests: string[];
  help_with: string[];
  narrative: string | null;
  created_at: string;
  updated_at: string;
}

export type PathwayScore = {
  id: string;
  student_id: string;
  overall: number;
  tier: string;
  percentile: number | null;
  categories: Category[];
  strengths: string[];
  improvements: string[];
  computed_at: string;
}

export type Activity = {
  id: string;
  student_id: string;
  name: string;
  role: string;
  category: string;
  hours: string;
  since: string;
  description: string;
  created_at: string;
}

export type Recommendation = {
  id: string;
  student_id: string;
  title: string;
  why: string;
  impact: string;
  category: string;
  icon: string;
  dismissed: boolean;
  created_at: string;
}

export type Task = {
  id: string;
  student_id: string;
  body: string;
  tag: string;
  done: boolean;
  due_date: string | null;
  created_at: string;
}

export type Deadline = {
  id: string;
  student_id: string | null;
  title: string;
  org: string;
  kind: string;
  due_date: string;
  urgent: boolean;
}

export type Essay = {
  id: string;
  student_id: string;
  title: string;
  status: EssayStatus;
  prompt: string;
  body: string;
  word_target: number;
  ai_origin: boolean;
  updated_at: string;
  created_at: string;
}

export type EssayFeedback = {
  id: string;
  essay_id: string;
  tag: string;
  color: string;
  body: string;
  created_at: string;
}

export type Project = {
  id: string;
  student_id: string;
  name: string;
  stage: ProjectStage;
  progress: number;
  description: string;
  impact: string;
  ai_origin: boolean;
  created_at: string;
}

export type ProjectMilestone = {
  id: string;
  project_id: string;
  body: string;
  done: boolean;
  position: number;
}

export type Scholarship = {
  id: string;
  name: string;
  amount: string;
  deadline: string | null;
  tags: string[];
  url: string;
}

export type College = {
  id: string;
  name: string;
  abbr: string;
  location: string;
  acceptance_rate: string;
}

export type RoadmapMilestone = {
  id: string;
  student_id: string;
  grade: number;
  term: string;
  title: string;
  detail: string;
  status: MilestoneStatus;
  position: number;
}

/**
 * Minimal Database shape for @supabase/ssr generics. We keep Row/Insert/Update
 * loose (Partial) where the trigger/defaults fill columns.
 */
// Insert/Update are intersected with an index signature so they satisfy
// supabase-js's `Record<string, unknown>` constraint (a bare `Partial<Row>`
// mapped type lacks an implicit index signature and resolves the table to never).
type Writable<Row> = Partial<Row> & Record<string, unknown>;

type Table<Row> = {
  Row: Row;
  Insert: Writable<Row>;
  Update: Writable<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile>;
      students: Table<Student>;
      pathway_scores: Table<PathwayScore>;
      activities: Table<Activity>;
      recommendations: Table<Recommendation>;
      tasks: Table<Task>;
      deadlines: Table<Deadline>;
      essays: Table<Essay>;
      essay_feedback: Table<EssayFeedback>;
      projects: Table<Project>;
      project_milestones: Table<ProjectMilestone>;
      scholarships: Table<Scholarship>;
      colleges: Table<College>;
      roadmap_milestones: Table<RoadmapMilestone>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
