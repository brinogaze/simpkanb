export type ProjectType =
  // Pentest
  | 'web' | 'mobile' | 'api' | 'network' | 'cloud' | 'red_team'
  // General
  | 'personal' | 'gaming' | 'work' | 'study' | 'other'

export const PENTEST_TYPES: ProjectType[] = ['web', 'mobile', 'api', 'network', 'cloud', 'red_team']
export const isPentestProject = (type: ProjectType) => PENTEST_TYPES.includes(type)

export type ProjectStatus = 'active' | 'completed' | 'paused'
export type CardType = 'task' | 'finding' | 'recon' | 'exploit' | 'note'
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export interface Project {
  id: string
  name: string
  client: string | null
  type: ProjectType
  status: ProjectStatus
  color: string
  description: string | null
  scope: string[]
  start_date: string | null
  end_date: string | null
  created_at: string
}

export interface Column {
  id: string
  project_id: string
  title: string
  position: number
  color: string | null
}

export interface ChecklistItem {
  id: string
  text: string
  done: boolean
}

export interface CardAttachment {
  id: string
  name: string
  mime: string
  size: number
  kind: 'image' | 'text' | 'file'
  data_url: string
  preview_text?: string
  created_at: string
}

export interface Card {
  id: string
  column_id: string
  project_id: string
  created_by: string | null
  title: string
  description: string | null
  card_type: CardType
  severity: Severity | null
  cvss_score: number | null
  cvss_vector: string | null
  cwe_id: string | null
  owasp_category: string | null
  affected_url: string | null
  affected_parameter: string | null
  proof_of_concept: string | null
  remediation: string | null
  notes: string | null
  tags: string[]
  references: string[]
  attachments: CardAttachment[]
  checklist: ChecklistItem[]
  position: number
  created_at: string
  updated_at: string
}

export interface CardRow extends Omit<Card, 'tags' | 'references' | 'attachments' | 'checklist' | 'scope'> {
  tags: string
  references: string
  attachments: string
  checklist: string
}

export interface CvssMetrics {
  AV: 'N' | 'A' | 'L' | 'P'
  AC: 'L' | 'H'
  PR: 'N' | 'L' | 'H'
  UI: 'N' | 'R'
  S: 'U' | 'C'
  C: 'N' | 'L' | 'H'
  I: 'N' | 'L' | 'H'
  A: 'N' | 'L' | 'H'
}

export interface FindingTemplate {
  id: string
  name: string
  card_type: CardType
  severity: Severity
  cwe_id: string
  owasp_category: string
  description: string
  remediation: string
  references: string[]
}
