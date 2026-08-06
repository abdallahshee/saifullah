import { CreateParentForm } from '@/components/forms/CreateParentForm'
import { requireRole } from '@/lib/auth/current-profile'

export default async function page() {
    await requireRole("admin","secretary")
  return (
    <div><CreateParentForm/></div>
  )
}
