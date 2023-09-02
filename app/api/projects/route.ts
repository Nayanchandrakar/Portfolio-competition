import { ProjectValidation } from "@lib/ZodValidation"
import { db } from "@lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

export const GET = async (req: Request) => {
  try {
    const fetchProjects = await db?.projects?.findMany()
    if (fetchProjects) {
      return NextResponse.json({ data: fetchProjects, status: 200 })
    }
    return new Response("No data present", { status: 404 })
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 })
  }
}

export const POST = async (req: Request) => {
  try {
    const body = await req.json()
    const { image, projectLink, projectName } = ProjectValidation.parse(body)

    //  checking already an image or projectLink exist in db or not

    const projectExist = await db?.projects?.findFirst({
      where: {
        image,
        projectLink,
      },
    })

    if (projectExist) {
      return new Response("Project Already Exists!", { status: 409 })
    }

    const createProject = await db?.projects?.create({
      data: {
        image,
        projectLink,
        projectName,
      },
    })

    return NextResponse.json({ data: createProject, status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid data", { status: 400 })
    }
    return new Response("Internal Server Error", { status: 500 })
  }
}
