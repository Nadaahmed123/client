import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface DayViewProps {
  date: string;
  onBack: () => void;
  userId: Id<"users">;
  isAdmin: boolean;
}

export function DayView({ date, onBack, userId, isAdmin }: DayViewProps) {
  const entries = useQuery(api.dailyEntries.getDailyEntries, { targetUserId: userId });
  const userProfile = useQuery(api.userProfiles.getUserProfile, { targetUserId: userId });
  const upsertEntry = useMutation(api.dailyEntries.upsertDailyEntry);
  const deleteEntry = useMutation(api.dailyEntries.deleteDailyEntry);
  
  const entry = entries?.find(e => e.date === date);
  const yearMonth = date.substring(0, 7);
  const monthlyAdvances = useQuery(api.dailyEntries.getMonthlyAdvances, {
    yearMonth,
    targetUserId: userId
  });

  const [formData, setFormData] = useState({
    cashAmount: 0,
    networkAmount: 0,
    purchasesAmount: 0,
    advanceAmount: 0,
    notes: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (entry) {
      setFormData({
        cashAmount: entry.cashAmount || 0,
        networkAmount: entry.networkAmount || 0,
        purchasesAmount: entry.purchasesAmount || 0,
        advanceAmount: entry.advanceAmount || 0,
        notes: entry.notes || '',
      });
    }
  }, [entry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await upsertEntry({
        date,
        ...formData,
        targetUserId: userId,
      });
      
      toast.success(entry ? "تم تحديث البيانات بنجاح" : "تم إضافة البيانات بنجاح");
      setIsEditing(false);
    } catch (error) {
      toast.error("حدث خطأ أثناء حفظ البيانات");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!entry || !isAdmin) return;
    
    if (!confirm("هل أنت متأكد من حذف هذا المدخل؟")) return;

    setLoading(true);
    try {
      await deleteEntry({ entryId: entry._id });
      toast.success("تم حذف المدخل بنجاح");
      onBack();
    } catch (error) {
      toast.error("حدث خطأ أثناء حذف المدخل");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const total = formData.cashAmount + formData.networkAmount;
  const deductions = userProfile?.deductions || 0;
  const remaining = total - formData.purchasesAmount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md border border-orange-200 hover:border-orange-400 transition-colors"
          >
            <span>←</span>
            <span>العودة</span>
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              📅 {formatDate(date)}
            </h2>
            {userProfile && (
              <p className="text-sm text-gray-600 mt-1">
                👤 {userProfile.username}
                {userProfile.isAdmin && <span className="text-red-600 mr-2">👑</span>}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {entry && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              disabled={!isAdmin}
            >
              ✏️ تعديل
            </button>
          )}
          
          {entry && isAdmin && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              disabled={loading}
            >
              🗑️ حذف
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* نموذج الإدخال */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            💰 البيانات المالية
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  💵 مبلغ الكاش
                </label>
                <input
                  type="number"
                  value={formData.cashAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, cashAmount: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  disabled={entry && !isEditing}
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  💳 مبلغ الشبكة
                </label>
                <input
                  type="number"
                  value={formData.networkAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, networkAmount: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  disabled={entry && !isEditing}
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🛒 مبلغ المشتريات
                </label>
                <input
                  type="number"
                  value={formData.purchasesAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchasesAmount: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  disabled={entry && !isEditing}
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  💸 مبلغ السلفيات
                </label>
                <input
                  type="number"
                  value={formData.advanceAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, advanceAmount: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  disabled={entry && !isEditing}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* عرض الخصميات الثابتة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📉 الخصميات الثابتة
              </label>
              <div className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                {deductions.toLocaleString()} ر.س
              </div>
              <p className="text-xs text-gray-500 mt-1">
                * يتم خصم هذا المبلغ من مرتبكم يستطيع تعديله المدير الكريم فقط
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📝 ملاحظات إضافية
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                rows={3}
                disabled={entry && !isEditing}
                placeholder="أضف أي ملاحظات هنا..."
              />
            </div>

            {(isEditing || !entry) && (
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "جاري الحفظ..." : (entry ? "💾 حفظ التعديلات" : "➕ إضافة البيانات")}
                </button>
                
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    ❌ إلغاء
                  </button>
                )}
              </div>
            )}
          </form>
        </div>

        {/* ملخص الحسابات */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              📊 ملخص الحسابات
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium text-gray-700">💰 المجموع الكلي</span>
                <span className="text-xl font-bold text-blue-600">
                  {total.toLocaleString()} ر.س
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="font-medium text-gray-700">🛒 المشتريات</span>
                <span className="text-xl font-bold text-orange-600">
                  -{formData.purchasesAmount.toLocaleString()} ر.س
                </span>
              </div>

              <div className="border-t-2 border-gray-200 pt-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-gray-700">💵 المتبقي النهائي</span>
                  <span className={`text-xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {remaining.toLocaleString()} ر.س
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="font-medium text-gray-700">📈 السلفيات التراكمية</span>
                <span className="text-xl font-bold text-purple-600">
                  {monthlyAdvances?.toLocaleString() || 0} ر.س
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="font-medium text-gray-700">📉 الخصميات الثابتة</span>
                <span className="text-xl font-bold text-red-600">
                  -{deductions.toLocaleString()} ر.س
                </span>
              </div>
            </div>
          </div>

          {/* معلومات إضافية */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
            <h4 className="font-semibold text-gray-800 mb-2">💡 معلومات مفيدة</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>• المجموع = الكاش + الشبكة</div>
              <div>• المتبقي = المجموع - المشتريات</div>
              <div>• الخصميات الثابتة يحددها المدير</div>
              <div>• السلفيات تراكمية على مدار الشهر</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
