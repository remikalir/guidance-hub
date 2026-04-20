import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ItemForm } from "@/components/items/ItemForm"

export default async function NewGuidancePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/signin")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isCtlStaff: true },
  })

  if (!user?.isCtlStaff) redirect("/guidance")

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Submit CTL Guidance</h1>
        <p className="text-gray-500 text-sm mt-1">
          Publish vetted guidance for the Duke community.
        </p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ItemForm mode="create" isCtlStaff={true} />
      </div>
    </div>
  )
}
