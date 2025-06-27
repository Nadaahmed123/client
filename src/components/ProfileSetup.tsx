import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function ProfileSetup() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const createProfile = useMutation(api.userProfiles.createUserProfile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error("يرجى إدخال اسم المستخدم");
      return;
    }

    setLoading(true);
    try {
      await createProfile({ username: username.trim() });
      toast.success("تم إنشاء ملف المستخدم بنجاح!");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء إنشاء ملف المستخدم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl p-8 shadow-lg border border-orange-200">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">👤</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            إعداد ملف المستخدم
          </h2>
          <p className="text-gray-600">
            يرجى إدخال اسم المستخدم لإكمال إعداد حسابك
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم المستخدم
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="أدخل اسم المستخدم"
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "جاري الإنشاء..." : "إنشاء ملف المستخدم"}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <span>💡</span>
            <span>
              المستخدم الأول سيحصل على صلاحيات المدير تلقائياً
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
