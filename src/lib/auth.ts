import { NextAuthOptions } from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

const isDev = process.env.NODE_ENV === "development" || process.env.PROTOTYPE_MODE === "true"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    // Instant dev login — no external service needed
    ...(isDev
      ? [
          CredentialsProvider({
            name: "Dev Login",
            credentials: {
              name: { label: "Your name", type: "text", placeholder: "e.g. Jane Smith" },
            },
            async authorize(credentials) {
              if (!credentials?.name) return null
              const email = `${credentials.name.toLowerCase().replace(/\s+/g, ".")}@dev.local`
              // Upsert a dev user in the DB
              const user = await prisma.user.upsert({
                where: { email },
                update: { name: credentials.name },
                create: { name: credentials.name, email },
              })
              return { id: user.id, name: user.name, email: user.email }
            },
          }),
        ]
      : []),
    // Azure AD for production (Duke SSO)
    ...(process.env.AZURE_AD_CLIENT_ID
      ? [
          AzureADProvider({
            clientId: process.env.AZURE_AD_CLIENT_ID,
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
            tenantId: process.env.AZURE_AD_TENANT_ID!,
            authorization: {
              params: { scope: "openid profile email User.Read" },
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token, user }) {
      if (session.user) {
        session.user.id = (token?.id ?? user?.id) as string
      }
      return session
    },
    async signIn({ user }) {
      // Skip domain check in development
      if (isDev) return true
      if (user.email && !user.email.endsWith("@duke.edu")) return false
      return true
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  session: {
    strategy: isDev ? "jwt" : "database",
  },
}
