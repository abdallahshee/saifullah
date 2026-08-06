import { CreateTeacherForm } from '@/components/forms/CreateTeacherForm'
import { requireRole } from '@/lib/auth/current-profile'



export default async function page() {
    await requireRole("admin")
  return (
    <div><CreateTeacherForm/></div>
  )
}

