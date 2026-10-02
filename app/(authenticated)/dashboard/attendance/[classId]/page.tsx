import { MarkAttendanceForm } from '@/components/forms/mark-attendance-form'

type PageProps = {
  params: Promise<{
    classId: string
  }>
}

export default async function MarkAttendancePage({
  params,
}: PageProps) {
  const { classId } = await params

  return (
    <div>
      <MarkAttendanceForm classId={classId} />
    </div>
  )
}