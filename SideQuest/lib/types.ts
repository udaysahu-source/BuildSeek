import { z } from "zod";

export const HackathonModeSchema = z.enum(["online", "offline", "hybrid"]);
export type HackathonMode = z.infer<typeof HackathonModeSchema>;

export const HackathonStatusSchema = z.enum([
  "closing_soon",
  "open",
  "upcoming",
  "closed",
]);
export type HackathonStatus = z.infer<typeof HackathonStatusSchema>;

export const FeeTypeSchema = z.enum(["free", "paid", "unknown"]);
export type FeeType = z.infer<typeof FeeTypeSchema>;

export const ScopeSchema = z.enum(["global", "national", "state", "city", "college"]);
export type Scope = z.infer<typeof ScopeSchema>;

export const OrganizerTypeSchema = z.enum([
  "government",
  "company",
  "college",
  "community",
  "nonprofit",
  "other",
]);
export type OrganizerType = z.infer<typeof OrganizerTypeSchema>;

export const DataConfidenceSchema = z.enum([
  "verified_primary",
  "platform_listed",
  "unverified",
]);
export type DataConfidence = z.infer<typeof DataConfidenceSchema>;

export const EligibilitySchema = z.object({
  students_only: z.boolean().default(true),
  min_year: z.number().optional(),
  regions: z.array(z.string()).optional(),
  colleges: z.array(z.string()).optional(),
});
export type Eligibility = z.infer<typeof EligibilitySchema>;

export const HackathonSchema = z.object({
  id: z.string().uuid(),
  source: z.string(),
  source_id: z.string(),
  title: z.string().min(1),
  organizer: z.string().min(1),
  organizer_type: OrganizerTypeSchema.optional(),
  scope: ScopeSchema.optional(),
  fee_type: FeeTypeSchema.optional(),
  fee_amount_inr: z.number().int().nonnegative().optional().nullable(),
  description: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
  mode: HackathonModeSchema,
  country: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  venue: z.string().optional().nullable(),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  reg_start: z.string().optional().nullable(),
  reg_deadline: z.string().optional().nullable(),
  deadline_note: z.string().optional().nullable(),
  prize_text: z.string().optional().nullable(),
  prize_amount: z.number().optional().nullable(),
  prize_currency: z.string().optional().nullable(),
  prize_amount_inr: z.number().int().nonnegative().optional().nullable(),
  team_min: z.number().int().min(1).default(1),
  team_max: z.number().int().min(1).nullable().optional(),
  team_note: z.string().optional().nullable(),
  eligibility: EligibilitySchema.optional().nullable(),
  eligibility_text: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  source_url: z.string().url(),
  official_page: z.string().url().optional().nullable(),
  apply_url: z.string().url().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  canonical_id: z.string().uuid().optional().nullable(),
  verified: z.boolean().default(false),
  data_confidence: DataConfidenceSchema.optional(),
  last_verified_at: z.string().optional().nullable(),
  needs_review: z.boolean().optional(),
  is_user_submitted: z.boolean().default(false),
  deadline_precision: z.enum(["date", "exact"]).optional(),
  scope_assumed: z.boolean().optional(),
  hidden: z.boolean().optional(),
  rounds: z.array(z.any()).optional().nullable(),
  tracks: z.array(z.any()).optional().nullable(),
  prizes_breakdown: z.array(z.any()).optional().nullable(),
  submission_guidelines: z.array(z.string()).optional().nullable(),
  rules: z.array(z.string()).optional().nullable(),
  judging_criteria: z.array(z.any()).optional().nullable(),
  created_at: z.string().optional().default(() => new Date().toISOString()),
  updated_at: z.string().optional().default(() => new Date().toISOString()),
  last_seen_at: z.string().optional().default(() => new Date().toISOString()),
});
export type Hackathon = z.infer<typeof HackathonSchema>;

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  skills: z.array(z.string()).default([]),
  year: z.number().optional().nullable(),
  city: z.string().optional().nullable(),
  calendar_token: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Profile = z.infer<typeof ProfileSchema>;

export const BookmarkSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  hackathon_id: z.string().uuid(),
  created_at: z.string().datetime(),
});
export type Bookmark = z.infer<typeof BookmarkSchema>;

export const AlertRuleSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  filters: z.record(z.any()).default({}),
  channel: z.enum(["telegram", "email", "both"]),
  telegram_chat_id: z.string().optional().nullable(),
  active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type AlertRule = z.infer<typeof AlertRuleSchema>;

export const NotificationLogSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  hackathon_id: z.string().uuid(),
  kind: z.enum(["new_match", "deadline_48h", "deadline_24h", "digest"]),
  sent_at: z.string().datetime(),
});
export type NotificationLog = z.infer<typeof NotificationLogSchema>;

export const SubmissionSchema = z.object({
  id: z.string().uuid(),
  payload: z.record(z.any()),
  status: z.enum(["pending", "approved", "rejected"]).default("pending"),
  rejection_reason: z.string().optional().nullable(),
  submitted_by: z.string().uuid().optional().nullable(),
  reviewed_by: z.string().uuid().optional().nullable(),
  reviewed_at: z.string().datetime().optional().nullable(),
  created_at: z.string().datetime(),
});
export type Submission = z.infer<typeof SubmissionSchema>;

export const ScrapeRunSchema = z.object({
  id: z.string().uuid(),
  source: z.string(),
  started_at: z.string().datetime(),
  finished_at: z.string().datetime().optional().nullable(),
  fetched: z.number().int().default(0),
  inserted: z.number().int().default(0),
  updated: z.number().int().default(0),
  error: z.string().optional().nullable(),
});
export type ScrapeRun = z.infer<typeof ScrapeRunSchema>;
