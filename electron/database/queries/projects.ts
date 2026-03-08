import { v4 as uuid } from 'uuid'
import { getDb } from '../db'

const DEFAULT_COLUMNS: Record<string, string[]> = {
  web:     ['Recon', 'Testing', 'Exploiting', 'Documenting', 'Done'],
  mobile:  ['Recon', 'Testing', 'Exploiting', 'Documenting', 'Done'],
  api:     ['Recon', 'Testing', 'Exploiting', 'Documenting', 'Done'],
  network: ['Recon', 'Scanning', 'Exploitation', 'Post-Exploit', 'Done'],
  cloud:   ['Recon', 'Enum', 'Misconfig', 'Exploitation', 'Done'],
  red_team:['Planning', 'Initial Access', 'Persistence', 'Exfil', 'Reported'],
  generic: ['Backlog', 'In Progress', 'Review', 'Done'],
}

export function getProjects() {
  const db = getDb()
  return db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all()
}

export function createProject(data: Record<string, unknown>) {
  const db = getDb()
  const id = uuid()
  const projectType = (data.type as string) || 'web'

  db.prepare(`
    INSERT INTO projects (id, name, client, type, status, color, description, scope, start_date, end_date)
    VALUES (@id, @name, @client, @type, @status, @color, @description, @scope, @start_date, @end_date)
  `).run({
    id,
    name: data.name,
    client: data.client || null,
    type: projectType,
    status: data.status || 'active',
    color: data.color || '#58a6ff',
    description: data.description || null,
    scope: JSON.stringify(data.scope || []),
    start_date: data.start_date || null,
    end_date: data.end_date || null,
  })

  // Create default columns
  const cols = DEFAULT_COLUMNS[projectType] || DEFAULT_COLUMNS.generic
  const insertCol = db.prepare(
    'INSERT INTO columns (id, project_id, title, position) VALUES (?, ?, ?, ?)'
  )
  cols.forEach((title, i) => insertCol.run(uuid(), id, title, i))

  return db.prepare('SELECT * FROM projects WHERE id = ?').get(id)
}

export function updateProject(id: string, data: Record<string, unknown>) {
  const db = getDb()
  const fields = Object.keys(data)
    .filter(k => k !== 'id')
    .map(k => `${k} = @${k}`)
    .join(', ')
  db.prepare(`UPDATE projects SET ${fields} WHERE id = @id`).run({ ...data, id })
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(id)
}

export function deleteProject(id: string) {
  getDb().prepare('DELETE FROM projects WHERE id = ?').run(id)
  return { success: true }
}
