import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
import { increasedApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const instructionMessage: ChatCompletionMessageParam = {
  role:"system",
  content : "You are a code generator, You must answer only in markdown code snippets.Use code comments for explanations"
}


export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { messages } = body;
    if (!userId) {
      return new NextResponse("Please Login In First", { status: 401 });
    }
    if (!messages) {
      return new NextResponse("Messages Are Requrired", { status: 400 });
    }
    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();
    if (!freeTrial && !isPro) {
      return new NextResponse("Free Trial has Expired", { status: 403 });
    }
    const completion = await openai.chat.completions.create({
      messages: [instructionMessage, ...messages],
      model: "gpt-3.5-turbo",
    });
   if(!isPro){
     await increasedApiLimit();
    }
    console.log(completion.choices[0]);

    return NextResponse.json(completion.choices[0].message);
  } catch (error) {
    console.log("[CONVERSATION ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
