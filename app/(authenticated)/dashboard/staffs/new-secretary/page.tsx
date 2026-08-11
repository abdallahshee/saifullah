import { CreateSecretaryForm } from '@/components/forms/create-secretary-form'
import { requireRole } from '@/lib/auth/current-profile'

export default async function page() {
  await requireRole("admin")
  return (
    <div><CreateSecretaryForm/></div>
  )
}
