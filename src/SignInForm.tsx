"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="w-full">
      <form
        className="flex flex-col gap-form-field"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitting(true);
          const formData = new FormData(e.target as HTMLFormElement);
          formData.set("flow", flow);
          void signIn("password", formData).catch((error) => {
            console.log("Auth error:", error);
            console.log("Error message:", error.message);
            let toastTitle = "";
            
            if (error.message.includes("Invalid password")) {
              toastTitle = flow === "signIn" 
                ? "كلمة المرور غير صحيحة."
                : "كلمة المرور يجب أن تكون 6 أحرف على الأقل.";
            } else if (error.message.includes("User not found")) {
              toastTitle = "المستخدم غير موجود. جرب إنشاء حساب جديد.";
            } else if (error.message.includes("User already exists") || error.message.includes("already exists")) {
              toastTitle = "الحساب موجود بالفعل. جرب تسجيل الدخول أو استخدم إيميل آخر.";
            } else {
              toastTitle = flow === "signIn"
                ? "خطأ في تسجيل الدخول. تحقق من البيانات."
                : `خطأ في إنشاء الحساب: ${error.message}`;
            }
            toast.error(toastTitle);
            setSubmitting(false);
          });
        }}
      >
        <input
          className="auth-input-field"
          type="email"
          name="email"
          placeholder="Email"
          required
        />
        <input
          className="auth-input-field"
          type="password"
          name="password"
          placeholder="Password (minimum 6 characters)"
          required
          minLength={6}
        />
        <button className="auth-button" type="submit" disabled={submitting}>
          {flow === "signIn" ? "Sign in" : "Sign up"}
        </button>
        <div className="text-center text-sm text-secondary">
          <span>
            {flow === "signIn"
              ? "Don't have an account? "
              : "Already have an account? "}
          </span>
          <button
            type="button"
            className="text-primary hover:text-primary-hover hover:underline font-medium cursor-pointer"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
          </button>
        </div>
      </form>
      <div className="flex items-center justify-center my-3">
        <hr className="my-4 grow border-gray-200" />
        <span className="mx-4 text-secondary">or</span>
        <hr className="my-4 grow border-gray-200" />
      </div>
      <button className="auth-button" onClick={() => void signIn("anonymous")}>
        دخول مجهول (تجربة سريعة)
      </button>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-sm text-blue-700">
          <div className="font-medium mb-1">💡 تعليمات التسجيل:</div>
          <div>• كلمة المرور: 6 أحرف على الأقل</div>
          <div>• للتجربة السريعة: استخدم "دخول مجهول"</div>
          <div>• مثال: test@example.com / 123456</div>
        </div>
      </div>
    </div>
  );
}
