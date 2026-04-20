import { redirect, notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ItemForm } from "@/components/items/ItemForm"

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/signin")

  const [item, user] = await Promise.all([
    prisma.item.findUnique({
      where: { id },
      include: { tags: { select: { name: true } } },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isCtlStaff: true },
    }),
  ])

  if (!item) notFound()
  if (item.authorId !== session.user.id) redirect(`/items/${id}`)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Item</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ItemForm
          mode="edit"
          isCtlStaff={user?.isCtlStaff ?? false}
          initialData={{
            id: item.id,
            title: item.title,
            description: item.description,
            type: item.type,
            externalLink: item.externalLink ?? "",
            tags: item.tags.map((t) => t.name),
            fileUrl: item.fileUrl ?? "",
            fileKey: item.fileKey ?? "",
            lastReviewedAt: item.lastReviewedAt?.toISOString().split("T")[0] ?? "",
          }}
        />
      </div>
    </div>
  )
}
