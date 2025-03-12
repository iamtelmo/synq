"use server";
import { redirect } from "next/navigation";
import { createClient } from "@synq/supabase/server";
import { Provider } from "@synq/supabase/types";
import { revalidatePath } from "next/cache";

const signInWithPassword = async (formData: FormData) => {
  const supabase = await createClient();
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };
  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/auth/signup");
  }

  return redirect("/");
};

const signInWithOAuth = async (provider: Provider) => {
  const supabase = await createClient();
  const redirectUrl = `${window.location.origin}/api/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectUrl,
    },
  });

  if (error) {
    redirect("/auth/signup");
  }

  if (data?.url) {
    return redirect(data.url);
  }

  return redirect("/");
};

const signOut = async () => {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    redirect("/error");
  }

  return redirect("/auth/signin");
};

const signUpWithPassword = async (formData: FormData) => {
  const supabase = await createClient();
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };
  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  return redirect("/");
};

const getUserInfo = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.user_metadata;
};

export {
  signInWithPassword,
  signInWithOAuth,
  signUpWithPassword,
  signOut,
  getUserInfo,
};
