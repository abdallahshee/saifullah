import { createSelectSchema } from "drizzle-zod";
import { events } from "../schema/events";
import z from "zod"



const Schema = createSelectSchema(events, {
    title: z
        .string()
        .min(10, { message: "Title must be at least 10 characters" })
        .max(25, { message: "Title must be at most 25 characters" }),
    eventDate: z.string().nonempty(),
    description: z
        .string()
        .min(400, { message: "Description must be at least 400 characters" })
        .max(800, { message: "Description must be at most 800 characters" }),
    venue: z.string().min(1, { message: "Venue is required" }),
    imageUrls: z.array(z.url({ message: "Each image must be a valid URL" })),
})

export const eventSchema=Schema.pick({
    title:true,
    eventDate:true,
    description:true,
    venue:true,
    imageUrls:true
})
export type EventRequest = z.infer<typeof eventSchema>;


export type Event = z.infer<typeof Schema>;