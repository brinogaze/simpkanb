import { v4 as uuid } from 'uuid'
import { getDb } from '../db'

export function getCards(projectId: string) {
  return getDb()
    .prepare('SELECT * FROM cards WHERE project_id = ? ORDER BY column_id, position ASC')
    .all(projectId)
}

export function createCard(data: Record<string, unknown>) {
  const db = getDb()
  const id = uuid()
  const maxPos = (db.prepare(
    'SELECT MAX(position) as m FROM cards WHERE column_id = ?'
  ).get(data.column_id) as { m: number | null }).m ?? -1

  db.prepare(`
    INSERT INTO cards (
      id, column_id, project_id, title, description, card_type,
      severity, cvss_score, cvss_vector, cwe_id, owasp_category,
      affected_url, affected_parameter, proof_of_concept, remediation,
      notes, tags, references, attachments, checklist, position
    ) VALUES (
      @id, @column_id, @project_id, @title, @description, @card_type,
      @severity, @cvss_score, @cvss_vector, @cwe_id, @owasp_category,
      @affected_url, @affected_parameter, @proof_of_concept, @remediation,
      @notes, @tags, @references, @attachments, @checklist, @position
    )
  `).run({
    id,
    column_id: data.column_id,
    project_id: data.project_id,
    title: data.title,
    description: data.description || null,
    card_type: data.card_type || 'task',
    severity: data.severity || null,
    cvss_score: data.cvss_score || null,
    cvss_vector: data.cvss_vector || null,
    cwe_id: data.cwe_id || null,
    owasp_category: data.owasp_category || null,
    affected_url: data.affected_url || null,
    affected_parameter: data.affected_parameter || null,
    proof_of_concept: data.proof_of_concept || null,
    remediation: data.remediation || null,
    notes: data.notes || null,
    tags: JSON.stringify(data.tags || []),
    references: JSON.stringify(data.references || []),
    attachments: JSON.stringify(data.attachments || []),
    checklist: JSON.stringify(data.checklist || []),
    position: maxPos + 1,
  })

  return db.prepare('SELECT * FROM cards WHERE id = ?').get(id)
}

export function updateCard(id: string, data: Record<string, unknown>) {
  const db = getDb()
  const jsonFields = ['tags', 'references', 'attachments', 'checklist']
  const processed: Record<string, unknown> = { ...data }
  jsonFields.forEach(f => {
    if (Array.isArray(processed[f])) {
      processed[f] = JSON.stringify(processed[f])
    }
  })

  const fields = Object.keys(processed)
    .filter(k => k !== 'id')
    .map(k => `${k} = @${k}`)
    .join(', ')

  db.prepare(`UPDATE cards SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = @id`)
    .run({ ...processed, id })
  return db.prepare('SELECT * FROM cards WHERE id = ?').get(id)
}

export function deleteCard(id: string) {
  getDb().prepare('DELETE FROM cards WHERE id = ?').run(id)
  return { success: true }
}

export function moveCard(id: string, columnId: string, position: number) {
  const db = getDb()
  db.prepare(
    'UPDATE cards SET column_id = ?, position = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).run(columnId, position, id)
  return db.prepare('SELECT * FROM cards WHERE id = ?').get(id)
}
