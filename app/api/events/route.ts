import { Event } from "@/database";
import dbConnect from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    try{

        await dbConnect();
        const formdata = await req.formData();

        let event;

        try{

            event = Object.fromEntries(formdata.entries());
        }
        catch(err){
            return NextResponse.json({
                message:'Invalid JSON data format'
            },{status:400})
        }

        if (!event.slug && typeof event.title === 'string' && event.title.trim()) {
            event.slug = event.title
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '') || 'event';
        }

        const createdEvent = await Event.create(event);
        
        return NextResponse.json({
            message:'Event created successfully',
            event:createdEvent
        },{status:201})
    }
    catch(err){
        console.log(err);
        return NextResponse.json({
            message:'Event creation failed',
            error:err instanceof Error? err.message:'unknown'
        },{status:500})
    }
}


