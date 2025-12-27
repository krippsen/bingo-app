import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'Password',
      credentials: {
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const adminPassword = process.env.ADMIN_PASSWORD

        if (!adminPassword) {
          console.error('ADMIN_PASSWORD environment variable is not set')
          return null
        }

        if (credentials?.password === adminPassword) {
          // Return a user object on successful auth
          return {
            id: 'admin',
            name: 'Admin',
            email: 'admin@bingo.local',
          }
        }

        return null
      },
    }),
  ],
  pages: {
    signIn: '/admin',
    error: '/admin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
  },
  trustHost: true,
})
