import { PrismaClient } from ".prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Authentication-related database operations
export class AuthDatabaseService {
  // User related operations
  static async createUser(data: {
    email: string
    name: string
    password: string
  }) {
    return await prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        language: true,
        notifications: true,
        theme: true,
      },
    })
  }

  static async findUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
      },
    })
  }

  static async findUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
      },
    })
  }

  static async updateUserProfile(userId: string, profileData: any) {
    return await prisma.userProfile.upsert({
      where: { userId },
      update: profileData,
      create: {
        userId,
        ...profileData,
      },
    })
  }

  // Refresh Token 相关方法
  static async updateRefreshToken(userId: string, refreshToken: string, expiresAt: Date) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken,
        refreshTokenExpiresAt: expiresAt,
      },
    })
  }

  static async validateRefreshToken(userId: string, refreshToken: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        refreshToken: true,
        refreshTokenExpiresAt: true,
      },
    })

    if (!user || !user.refreshToken || !user.refreshTokenExpiresAt) {
      return null
    }

    // 检查 token 是否匹配
    if (user.refreshToken !== refreshToken) {
      return null
    }

    // 检查是否过期
    if (user.refreshTokenExpiresAt < new Date()) {
      // 清除过期的 refresh token
      await this.clearRefreshToken(userId)
      return null
    }

    return user
  }

  static async clearRefreshToken(userId: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: null,
        refreshTokenExpiresAt: null,
      },
    })
  }

  // Application related operations
  static async createApplication(data: {
    userId: string
    schoolId: string
    programId?: string
    deadline?: Date
  }) {
    return await prisma.application.create({
      data,
      include: {
        school: true,
        program: true,
      },
    })
  }

  static async getUserApplications(userId: string) {
    return await prisma.application.findMany({
      where: { userId },
      include: {
        school: true,
        program: true,
        essays: true,
      },
      orderBy: { createdAt: "desc" },
    })
  }

  // School and program related operations
  static async searchSchools(query: string, country?: string) {
    return await prisma.school.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { city: { contains: query, mode: "insensitive" } },
            ],
          },
          country ? { country } : {},
        ],
      },
      include: {
        programs: true,
      },
      take: 20,
    })
  }

  // Essay related operations
  static async createEssay(data: {
    userId: string
    applicationId?: string
    title: string
    type: string
    content: string
    prompt?: string
    isAIGenerated?: boolean
  }) {
    return await prisma.essay.create({
      data: {
        ...data,
        type: data.type as any,
      },
    })
  }

  static async getUserEssays(userId: string) {
    return await prisma.essay.findMany({
      where: { userId },
      include: {
        application: {
          include: {
            school: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    })
  }
}