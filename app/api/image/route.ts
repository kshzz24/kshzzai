import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { checkSubscription } from "@/lib/subscription";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
import { increasedApiLimit, checkApiLimit } from "@/lib/api-limit";
export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { prompt, amount = 1, resolution = "512x512" } = body;
    if (!userId) {
      return new NextResponse("Please Login In First", { status: 401 });
    }
    if (!prompt) {
      return new NextResponse("Prompt Is Requrired", { status: 400 });
    }
    const freeTrial = await checkApiLimit();

    const isPro = await checkSubscription();
    if (!freeTrial && !isPro) {
      return new NextResponse("Free Trial has Expired", { status: 403 });
    }
    const response = await openai.images.generate({
      model: "dall-e-2",
      prompt: prompt,
      n: parseInt(amount, 10),
      size: resolution,
    });

    if(!isPro){

      await increasedApiLimit();
    }
    return NextResponse.json(response.data);
  } catch (error) {
    console.log("[CONVERSATION ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
