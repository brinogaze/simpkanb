import { v4 as uuid } from 'uuid'
import { getDb } from '../db'

export function getColumns(projectId: string) {
  return getDb()
    .prepare('SELECT * FROM columns WHERE project_id = ? ORDER BY position ASC')
    .all(projectId)
}

export function createColumn(data: Record<string, unknown>) {
  const db = getDb()
  const id = uuid()
  const maxPos = (db.prepare(
    'SELECT MAX(position) as m FROM columns WHERE project_id = ?'
  ).get(data.project_id) as { m: number | null }).m ?? -1

  db.prepare(`
    INSERT INTO columns (id, project_id, title, position, color)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, data.project_id, data.title, maxPos + 1, data.color || null)

  return db.prepare('SELECT * FROM columns WHERE id = ?').get(id)
}

export function updateColumn(id: string, data: Record<string, unknown>) {
  const db = getDb()
  const fields = Object.keys(data)
    .filter(k => k !== 'id')
    .map(k => `${k} = @${k}`)
    .join(', ')
  db.prepare(`UPDATE columns SET ${fields} WHERE id = @id`).run({ ...data, id })
  return db.prepare('SELECT * FROM columns WHERE id = ?').get(id)
}

export function deleteColumn(id: string) {
  getDb().prepare('DELETE FROM columns WHERE id = ?').run(id)
  return { success: true }
}

export function reorderColumns(projectId: string, ids: string[]) {
  const db = getDb()
  const update = db.prepare('UPDATE columns SET position = ? WHERE id = ? AND project_id = ?')
  const reorder = db.transaction(() => {
    ids.forEach((id, i) => update.run(i, id, projectId))
  })
  reorder()
  return getColumns(projectId)
}
