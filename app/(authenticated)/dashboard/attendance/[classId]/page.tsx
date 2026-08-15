import { MarkAttendanceForm } from '@/components/forms/mark-attendance-form'
import React from 'react'


export const MarkAttendance = async({params,}:{params:Promise<{ "classId": string }>}) => {
    const {classId}=await params
  return (
    <div><MarkAttendanceForm classId={classId}/></div>
  )
}
