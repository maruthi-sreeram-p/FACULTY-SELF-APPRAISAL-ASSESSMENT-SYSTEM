export const ACCEPT = '.pdf,.png,.jpg,.jpeg,.doc,.docx'
export const MAX_MB = 10

/** Split a selection into acceptable files and human-readable problems. */
export function validateFiles(list: FileList | File[], accept = ACCEPT, maxMB = MAX_MB) {
  const allowed = accept.split(',').map((s) => s.trim().toLowerCase())
  const ok: File[] = []
  const problems: string[] = []
  for (const f of Array.from(list)) {
    const ext = '.' + f.name.split('.').pop()?.toLowerCase()
    if (!allowed.includes(ext)) problems.push(`"${f.name}" is not an accepted file type.`)
    else if (f.size > maxMB * 1048576) problems.push(`"${f.name}" is larger than ${maxMB} MB.`)
    else ok.push(f)
  }
  return { ok, problems }
}
