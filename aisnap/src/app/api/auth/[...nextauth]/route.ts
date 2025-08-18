import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "../../../../generated/prisma";
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "凭据",
      credentials: {
        authenticator: { label: "邮箱或用户名", type: "text", placeholder: "your@example.com 或 username" },
        password: { label: "密码", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.authenticator || !credentials?.password) {
          throw new Error("请填写所有必填字段");
        }

        let user;
        
        // 检查authenticator是邮箱还是用户名
        if (credentials.authenticator.includes('@')) {
          // 通过邮箱查找用户
          user = await prisma.user.findUnique({
            where: {
              email: credentials.authenticator
            }
          })
        } else {
          // 通过用户名查找用户
          user = await prisma.user.findUnique({
            where: {
              username: credentials.authenticator
            }
          })
        }

        // 如果用户不存在
        if (!user) {
          throw new Error("用户不存在，请检查邮箱或用户名是否正确");
        }

        // 如果用户没有密码（可能通过其他方式创建的用户）
        if (!user.password) {
          throw new Error("账户验证方式不正确，请联系管理员");
        }

        // 验证密码
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        
        if (!isPasswordValid) {
          throw new Error("密码错误，请重新输入");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.nickname,
          image: user.avatar
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt"
  },
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }