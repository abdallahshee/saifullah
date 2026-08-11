import { CreateParentForm } from '@/components/forms/create-parent-form'
import { requireRole } from '@/lib/auth/current-profile'

export default async function page() {
    await requireRole("admin","secretary")
  return (
    <div><CreateParentForm/></div>
  )
}
