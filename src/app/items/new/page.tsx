import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ItemForm } from "@/components/items/ItemForm"

export default async function NewItemPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/signin")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isCtlStaff: true },
  })

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Submit to Guidance Hub</h1>
        <p className="text-gray-500 text-sm mt-1">
          Share an assignment, resource, or tool with your Duke colleagues.
        </p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ItemForm mode="create" isCtlStaff={user?.isCtlStaff ?? false} />
      </div>
    </div>
  )
}
